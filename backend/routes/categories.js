const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: true
          }
        },
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                products: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ],
        isActive: true
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                products: true
              }
            }
          }
        },
        products: {
          where: { isActive: true },
          include: {
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
          take: 12
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Calculate average rating for products
    const productsWithRating = category.products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        ...product,
        averageRating: Math.round(avgRating * 10) / 10,
        reviews: undefined
      };
    });

    const categoryWithProducts = {
      ...category,
      products: productsWithRating
    };

    res.json({
      success: true,
      data: categoryWithProducts
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, authorize('ADMIN'), [
  body('name').trim().notEmpty(),
  body('slug').trim().notEmpty(),
  body('description').optional(),
  body('parentId').optional()
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

    const { name, slug, description, parentId, image } = req.body;

    // Check if category with same slug exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this slug already exists'
      });
    }

    // Check if parent category exists
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          error: 'Parent category not found'
        });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId,
        image
      },
      include: {
        parent: true,
        children: true
      }
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('ADMIN'), [
  body('name').optional().trim().notEmpty(),
  body('slug').optional().trim().notEmpty()
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

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if slug is being updated and if it already exists
    if (updateData.slug && updateData.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: updateData.slug }
      });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          error: 'Category with this slug already exists'
        });
      }
    }

    // Check if parentId is being updated and if it's valid
    if (updateData.parentId) {
      if (updateData.parentId === id) {
        return res.status(400).json({
          success: false,
          error: 'Category cannot be its own parent'
        });
      }

      const parentCategory = await prisma.category.findUnique({
        where: { id: updateData.parentId }
      });

      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          error: 'Parent category not found'
        });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true
      }
    });

    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has products
    if (category._count.products > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with products'
      });
    }

    // Check if category has children
    if (category._count.children > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with subcategories'
      });
    }

    // Soft delete - set isActive to false
    await prisma.category.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get category hierarchy
// @route   GET /api/categories/hierarchy
// @access  Public
router.get('/hierarchy', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { 
        isActive: true,
        parentId: null // Only root categories
      },
      include: {
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                products: true
              }
            }
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get category hierarchy error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 