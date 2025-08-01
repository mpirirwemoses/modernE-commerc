const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            },
            category: {
              select: {
                name: true,
                slug: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating for each product
    const itemsWithRating = wishlistItems.map(item => {
      const avgRating = item.product.reviews.length > 0
        ? item.product.reviews.reduce((sum, review) => sum + review.rating, 0) / item.product.reviews.length
        : 0;

      return {
        ...item,
        product: {
          ...item.product,
          averageRating: Math.round(avgRating * 10) / 10,
          reviews: undefined
        }
      };
    });

    res.json({
      success: true,
      data: itemsWithRating
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
router.post('/', protect, [
  body('productId').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { productId } = req.body;

    // Check if product exists and is active
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if item already exists in wishlist
    const existingWishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.user.id,
        productId: productId
      }
    });

    if (existingWishlistItem) {
      return res.status(400).json({
        success: false,
        error: 'Product already in wishlist'
      });
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: req.user.id,
        productId: productId
      },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            },
            category: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: wishlistItem
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if wishlist item exists and belongs to user
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        id: id,
        userId: req.user.id
      }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist item not found'
      });
    }

    await prisma.wishlistItem.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Clear user wishlist
// @route   DELETE /api/wishlist
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.user.id,
        productId: productId
      }
    });

    res.json({
      success: true,
      data: {
        inWishlist: !!wishlistItem,
        wishlistItemId: wishlistItem?.id || null
      }
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Move wishlist item to cart
// @route   POST /api/wishlist/:id/move-to-cart
// @access  Private
router.post('/:id/move-to-cart', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    // Check if wishlist item exists and belongs to user
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        id: id,
        userId: req.user.id
      },
      include: {
        product: true
      }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist item not found'
      });
    }

    // Check if product has enough stock
    if (wishlistItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock'
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId: wishlistItem.productId
      }
    });

    if (existingCartItem) {
      // Update existing cart item
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity
        }
      });
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId: wishlistItem.productId,
          quantity: quantity
        }
      });
    }

    // Remove from wishlist
    await prisma.wishlistItem.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Item moved to cart successfully'
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 