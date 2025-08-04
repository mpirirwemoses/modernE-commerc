const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get all products with pagination and filtering
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
        videos: { orderBy: { order: 'asc' } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } }
      }
    });
    res.json({ success: true, data: { products } });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ],
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        images: {
          orderBy: { order: 'asc' }
        },
        videos: {
          orderBy: { order: 'asc' }
        },
        variants: {
          where: { isActive: true }
        },
        reviews: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    const productWithRating = {
      ...product,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: product._count.reviews,
      _count: undefined
    };

    res.json({
      success: true,
      data: productWithRating
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('ADMIN'), [
  body('name').trim().notEmpty(),
  body('slug').trim().notEmpty(),
  body('description').notEmpty(),
  body('categoryId').notEmpty(),
  body('oldPrice').isFloat({ min: 0 }),
  body('newPrice').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  body('sku').trim().notEmpty()
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

    const {
      name,
      slug,
      description,
      shortDescription,
      categoryId,
      brand,
      oldPrice,
      newPrice,
      costPrice,
      stock,
      minStock,
      weight,
      dimensions,
      isFeatured,
      isOnSale,
      saleEndDate,
      images,
      variants
    } = req.body;

    // Check if product with same slug exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: 'Product with this slug already exists'
      });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category not found'
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        categoryId,
        brand,
        oldPrice: parseFloat(oldPrice),
        newPrice: parseFloat(newPrice),
        costPrice: costPrice ? parseFloat(costPrice) : parseFloat(newPrice),
        stock: parseInt(stock),
        minStock: minStock ? parseInt(minStock) : 5,
        weight,
        dimensions,
        isFeatured: isFeatured || false,
        isOnSale: isOnSale || false,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
        ...(images && {
          images: {
            create: images.map((image, index) => ({
              url: image.url,
              alt: image.alt,
              isPrimary: image.isPrimary || index === 0,
              order: index
            }))
          }
        }),
        ...(variants && {
          variants: {
            create: variants.map(variant => ({
              name: variant.name,
              value: variant.value,
              sku: variant.sku,
              stock: variant.stock || 0,
              price: variant.price ? parseFloat(variant.price) : null
            }))
          }
        })
      },
      include: {
        category: true,
        images: true,
        variants: true
      }
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('ADMIN'), [
  body('name').optional().trim().notEmpty(),
  body('slug').optional().trim().notEmpty(),
  body('description').optional().notEmpty(),
  body('oldPrice').optional().isFloat({ min: 0 }),
  body('newPrice').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
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
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if slug is being updated and if it already exists
    if (updateData.slug && updateData.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: updateData.slug }
      });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          error: 'Product with this slug already exists'
        });
      }
    }

    // Convert price fields to numbers
    if (updateData.oldPrice) updateData.oldPrice = parseFloat(updateData.oldPrice);
    if (updateData.newPrice) updateData.newPrice = parseFloat(updateData.newPrice);
    if (updateData.costPrice) updateData.costPrice = parseFloat(updateData.costPrice);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.minStock) updateData.minStock = parseInt(updateData.minStock);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: true,
        variants: true
      }
    });

    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Soft delete - set isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        images: {
          where: { isPrimary: true },
          take: 1
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: 8
    });

    const productsWithRating = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        ...product,
        averageRating: Math.round(avgRating * 10) / 10,
        reviews: undefined
      };
    });

    res.json({
      success: true,
      data: productsWithRating
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get products on sale
// @route   GET /api/products/on-sale
// @access  Public
router.get('/on-sale', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isOnSale: true,
        OR: [
          { saleEndDate: null },
          { saleEndDate: { gt: new Date() } }
        ]
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        images: {
          where: { isPrimary: true },
          take: 1
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: 8
    });

    const productsWithRating = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        ...product,
        averageRating: Math.round(avgRating * 10) / 10,
        reviews: undefined
      };
    });

    res.json({
      success: true,
      data: productsWithRating
    });
  } catch (error) {
    console.error('Get on-sale products error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 