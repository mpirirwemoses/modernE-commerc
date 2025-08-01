const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Format currency helper function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      ...(status && { status })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1
                  }
                }
              }
            }
          },
          payments: {
            select: {
              status: true,
              method: true,
              amount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: req.user.id
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: {
                  select: {
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        shippingAddress: true,
        billingAddress: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, [
  body('items').isArray({ min: 1 }),
  body('shippingAddressId').optional(),
  body('billingAddressId').optional(),
  body('notes').optional()
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

    const { items, shippingAddressId, billingAddressId, notes } = req.body;

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      // Check stock availability
      if (cartItem.product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${cartItem.product.name}`
        });
      }

      const itemTotal = parseFloat(cartItem.product.newPrice) * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: parseFloat(cartItem.product.newPrice),
        variantId: cartItem.variantId
      });
    }

    // Calculate tax and shipping (simplified)
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        orderNumber: generateOrderNumber(),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        shippingAddressId,
        billingAddressId,
        notes
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true
      }
    });

    // Create order items
    await prisma.orderItem.createMany({
      data: orderItems.map(item => ({
        orderId: order.id,
        ...item
      }))
    });

    // Update product stock
    for (const cartItem of cartItems) {
      await prisma.product.update({
        where: { id: cartItem.productId },
        data: {
          stock: {
            decrement: cartItem.quantity
          }
        }
      });
    }

    // Clear user's cart
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    // Get complete order with items
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true
      }
    });

    res.status(201).json({
      success: true,
      data: completeOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('ADMIN'), [
  body('status').isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  body('trackingNumber').optional()
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
    const { status, trackingNumber } = req.body;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const updateData = {
      status,
      ...(trackingNumber && { trackingNumber }),
      ...(status === 'SHIPPED' && { shippedAt: new Date() }),
      ...(status === 'DELIVERED' && { deliveredAt: new Date() })
    };

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: req.user.id
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        payments: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled at this stage'
      });
    }

    // Calculate refund information
    const hasPayment = order.payments.length > 0;
    const refundInfo = hasPayment ? {
      eligible: true,
      amount: parseFloat(order.total),
      method: order.payments[0].method,
      estimatedDelivery: order.payments[0].method === 'PAYPAL' ? '3-5 business days' : '5-10 business days',
      processTime: '1-2 business days'
    } : {
      eligible: false,
      reason: 'No payment found for this order'
    };

    // Update order status
    await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        refundInfo
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(userId && { userId })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1
                  }
                }
              }
            }
          },
          payments: {
            select: {
              status: true,
              method: true,
              amount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get cancelled orders (Admin only)
// @route   GET /api/orders/admin/cancelled
// @access  Private/Admin
router.get('/admin/cancelled', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      status: 'CANCELLED',
      ...(userId && { userId })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1
                  }
                }
              }
            }
          },
          payments: {
            select: {
              status: true,
              method: true,
              amount: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get cancelled orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Process refund for cancelled order
// @route   POST /api/orders/:id/refund
// @access  Private/Admin
router.post('/:id/refund', protect, authorize('ADMIN'), [
  body('refundAmount').isFloat({ min: 0 }),
  body('refundMethod').isIn(['ORIGINAL_PAYMENT', 'STORE_CREDIT', 'BANK_TRANSFER']),
  body('notes').optional()
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
    const { refundAmount, refundMethod, notes } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        payments: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.status !== 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: 'Order is not cancelled'
      });
    }

    // Calculate refund amount (can be partial or full)
    const refundAmountDecimal = parseFloat(refundAmount);
    const orderTotal = parseFloat(order.total);

    if (refundAmountDecimal > orderTotal) {
      return res.status(400).json({
        success: false,
        error: 'Refund amount cannot exceed order total'
      });
    }

    // Create refund payment record
    const refundPayment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: refundAmountDecimal,
        currency: order.currency,
        method: refundMethod === 'ORIGINAL_PAYMENT' ? order.payments[0]?.method : 'BANK_TRANSFER',
        status: 'REFUNDED',
        gateway: refundMethod === 'ORIGINAL_PAYMENT' ? order.payments[0]?.gateway : 'BANK',
        gatewayData: {
          refundMethod,
          notes,
          processedAt: new Date(),
          estimatedDelivery: refundMethod === 'ORIGINAL_PAYMENT' ? '3-5 business days' : '5-10 business days'
        }
      }
    });

    // Update order status to REFUNDED if full refund
    const newStatus = refundAmountDecimal >= orderTotal ? 'REFUNDED' : 'CANCELLED';
    
    await prisma.order.update({
      where: { id },
      data: { status: newStatus }
    });

    res.json({
      success: true,
      data: {
        refund: refundPayment,
        estimatedDelivery: refundPayment.gatewayData.estimatedDelivery,
        message: `Refund of ${formatCurrency(refundAmountDecimal)} processed successfully`
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 