const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
router.post('/validate', [
  body('code').trim().notEmpty(),
  body('amount').isFloat({ min: 0 })
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

    const { code, amount } = req.body;

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired coupon code'
      });
    }

    // Check if coupon has usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        error: 'Coupon usage limit exceeded'
      });
    }

    // Check minimum amount requirement
    if (coupon.minAmount && amount < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount of $${coupon.minAmount} required`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (amount * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'FIXED_AMOUNT') {
      discount = coupon.value;
    } else if (coupon.type === 'FREE_SHIPPING') {
      discount = 0; // Will be handled separately
    }

    const finalAmount = amount - discount;

    res.json({
      success: true,
      data: {
        coupon,
        discount: parseFloat(discount.toFixed(2)),
        finalAmount: parseFloat(finalAmount.toFixed(2)),
        isFreeShipping: coupon.type === 'FREE_SHIPPING'
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
router.get('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      ...(isActive !== undefined && { isActive: isActive === 'true' })
    };

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.coupon.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
router.post('/', protect, authorize('ADMIN'), [
  body('code').trim().notEmpty(),
  body('type').isIn(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  body('value').isFloat({ min: 0 }),
  body('minAmount').optional().isFloat({ min: 0 }),
  body('maxDiscount').optional().isFloat({ min: 0 }),
  body('usageLimit').optional().isInt({ min: 1 }),
  body('startsAt').optional().isISO8601(),
  body('expiresAt').optional().isISO8601()
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
      code,
      type,
      value,
      minAmount,
      maxDiscount,
      usageLimit,
      startsAt,
      expiresAt
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code already exists'
      });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        minAmount: minAmount ? parseFloat(minAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('ADMIN'), [
  body('code').optional().trim().notEmpty(),
  body('type').optional().isIn(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  body('value').optional().isFloat({ min: 0 }),
  body('minAmount').optional().isFloat({ min: 0 }),
  body('maxDiscount').optional().isFloat({ min: 0 }),
  body('usageLimit').optional().isInt({ min: 1 }),
  body('isActive').optional().isBoolean(),
  body('startsAt').optional().isISO8601(),
  body('expiresAt').optional().isISO8601()
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

    // Check if coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    // Check if code is being updated and if it already exists
    if (updateData.code && updateData.code !== coupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: updateData.code.toUpperCase() }
      });

      if (codeExists) {
        return res.status(400).json({
          success: false,
          error: 'Coupon code already exists'
        });
      }

      updateData.code = updateData.code.toUpperCase();
    }

    // Convert numeric fields
    if (updateData.value) updateData.value = parseFloat(updateData.value);
    if (updateData.minAmount) updateData.minAmount = parseFloat(updateData.minAmount);
    if (updateData.maxDiscount) updateData.maxDiscount = parseFloat(updateData.maxDiscount);
    if (updateData.usageLimit) updateData.usageLimit = parseInt(updateData.usageLimit);

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedCoupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    await prisma.coupon.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Apply coupon to order
// @route   POST /api/coupons/apply
// @access  Private
router.post('/apply', protect, [
  body('orderId').notEmpty(),
  body('couponCode').trim().notEmpty()
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

    const { orderId, couponCode } = req.body;

    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Validate coupon
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode.toUpperCase(),
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired coupon code'
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        error: 'Coupon usage limit exceeded'
      });
    }

    // Check minimum amount
    if (coupon.minAmount && order.subtotal < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount of $${coupon.minAmount} required`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (order.subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'FIXED_AMOUNT') {
      discount = coupon.value;
    }

    const newTotal = order.subtotal + order.tax + order.shipping - discount;

    // Update order with discount
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        discount: parseFloat(discount.toFixed(2)),
        total: parseFloat(newTotal.toFixed(2))
      }
    });

    // Increment coupon usage count
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        usedCount: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      data: {
        order: updatedOrder,
        coupon,
        discount: parseFloat(discount.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 