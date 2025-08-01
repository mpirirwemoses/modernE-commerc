const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
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
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.newPrice) * item.quantity);
    }, 0);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        items: cartItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalItems
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', protect, [
  body('productId').notEmpty(),
  body('quantity').isInt({ min: 1 }),
  body('variantId').optional()
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

    const { productId, quantity, variantId } = req.body;

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

    // Check if product has enough stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock'
      });
    }

    // Check if variant exists if provided
    if (variantId) {
      const variant = await prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId: productId,
          isActive: true
        }
      });

      if (!variant) {
        return res.status(404).json({
          success: false,
          error: 'Product variant not found'
        });
      }

      if (variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient variant stock'
        });
      }
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId: productId,
        variantId: variantId || null
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update existing cart item
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity
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
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId: productId,
          quantity: quantity,
          variantId: variantId || null
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
    }

    res.status(201).json({
      success: true,
      data: cartItem
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
router.put('/:id', protect, [
  body('quantity').isInt({ min: 1 })
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

    const { id } = req.params;
    const { quantity } = req.body;

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: id,
        userId: req.user.id
      },
      include: {
        product: true
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    // Check if product has enough stock
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock'
      });
    }

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: id },
      data: { quantity },
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

    res.json({
      success: true,
      data: updatedCartItem
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: id,
        userId: req.user.id
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: id }
    });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Clear user's cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get cart summary (for checkout)
// @route   GET /api/cart/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            newPrice: true,
            stock: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true }
            }
          }
        }
      }
    });

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.newPrice) * item.quantity);
    }, 0);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Check stock availability
    const stockIssues = cartItems.filter(item => item.product.stock < item.quantity);

    res.json({
      success: true,
      data: {
        items: cartItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalItems,
        stockIssues: stockIssues.length > 0 ? stockIssues : null
      }
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Move items from localStorage to database cart
// @route   POST /api/cart/sync
// @access  Private
router.post('/sync', protect, [
  body('items').isArray()
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

    const { items } = req.body;

    // Clear existing cart items
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    // Add items from localStorage to database
    const cartItems = [];
    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: {
          id: item.productId || item.id,
          isActive: true
        }
      });

      if (product) {
        const cartItem = await prisma.cartItem.create({
          data: {
            userId: req.user.id,
            productId: product.id,
            quantity: item.quantity || 1
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
        cartItems.push(cartItem);
      }
    }

    res.json({
      success: true,
      data: cartItems
    });
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 