const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/auth');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');

const router = express.Router();
const prisma = new PrismaClient();

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

// @desc    Create payment intent (Stripe) - DISABLED
// @route   POST /api/payments/create-intent
// @access  Private
router.post('/create-intent', protect, [
  body('orderId').notEmpty(),
  body('amount').isFloat({ min: 0.01 })
], async (req, res) => {
  res.status(503).json({
    success: false,
    error: 'Stripe payments are temporarily disabled'
  });
});

// @desc    Process Stripe payment - DISABLED
// @route   POST /api/payments/stripe
// @access  Private
router.post('/stripe', protect, [
  body('orderId').notEmpty(),
  body('paymentIntentId').notEmpty()
], async (req, res) => {
  res.status(503).json({
    success: false,
    error: 'Stripe payments are temporarily disabled'
  });
});

// @desc    Create PayPal payment
// @route   POST /api/payments/paypal/create
// @access  Private
router.post('/paypal/create', protect, [
  body('orderId').notEmpty()
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

    const { orderId } = req.body;

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

    const createPaymentJson = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?orderId=${orderId}`
      },
      transactions: [
        {
          item_list: {
            items: order.items.map(item => ({
              name: item.product.name,
              sku: item.product.sku,
              price: item.price.toString(),
              currency: 'USD',
              quantity: item.quantity
            }))
          },
          amount: {
            currency: 'USD',
            total: order.total.toString()
          },
          description: `Payment for order ${order.orderNumber}`
        }
      ]
    };

    paypal.payment.create(createPaymentJson, (error, payment) => {
      if (error) {
        console.error('PayPal payment creation error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to create PayPal payment'
        });
      }

      // Find approval URL
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url');

      res.json({
        success: true,
        data: {
          paymentId: payment.id,
          approvalUrl: approvalUrl.href
        }
      });
    });
  } catch (error) {
    console.error('Create PayPal payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Execute PayPal payment
// @route   POST /api/payments/paypal/execute
// @access  Private
router.post('/paypal/execute', protect, [
  body('orderId').notEmpty(),
  body('paymentId').notEmpty(),
  body('payerId').notEmpty()
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

    const { orderId, paymentId, payerId } = req.body;

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

    const executePaymentJson = {
      payer_id: payerId
    };

    paypal.payment.execute(paymentId, executePaymentJson, async (error, payment) => {
      if (error) {
        console.error('PayPal payment execution error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to execute PayPal payment'
        });
      }

      if (payment.state === 'approved') {
        // Create payment record
        const paymentRecord = await prisma.payment.create({
          data: {
            orderId: orderId,
            amount: order.total,
            method: 'PAYPAL',
            status: 'COMPLETED',
            gateway: 'PAYPAL',
            transactionId: paymentId,
            gatewayData: JSON.stringify(payment)
          }
        });

        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' }
        });

        res.json({
          success: true,
          data: paymentRecord
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Payment not approved'
        });
      }
    });
  } catch (error) {
    console.error('Execute PayPal payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Process mobile money payment (MTN/Airtel)
// @route   POST /api/payments/mobile-money
// @access  Private
router.post('/mobile-money', protect, [
  body('orderId').notEmpty(),
  body('phoneNumber').notEmpty(),
  body('provider').isIn(['MTN_MONEY', 'AIRTEL_MONEY'])
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

    const { orderId, phoneNumber, provider } = req.body;

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

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: orderId,
        amount: order.total,
        method: provider === 'MTN_MONEY' ? 'MTN_MONEY' : 'AIRTEL_MONEY',
        status: 'PENDING',
        gateway: provider === 'MTN_MONEY' ? 'MTN_MOBILE_MONEY' : 'AIRTEL_MONEY',
        gatewayData: JSON.stringify({
          phoneNumber,
          provider
        })
      }
    });

    // TODO: Integrate with actual mobile money API
    // For now, simulate payment processing
    setTimeout(async () => {
      // Simulate successful payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'COMPLETED',
          transactionId: `MM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' }
      });
    }, 5000);

    res.json({
      success: true,
      data: {
        payment,
        message: 'Payment request sent. You will receive a prompt on your phone.'
      }
    });
  } catch (error) {
    console.error('Mobile money payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get payment status
// @route   GET /api/payments/:paymentId/status
// @access  Private
router.get('/:paymentId/status', protect, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        order: {
          userId: req.user.id
        }
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get payment history for user
// @route   GET /api/payments/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          order: {
            userId: req.user.id
          }
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              total: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.payment.count({
        where: {
          order: {
            userId: req.user.id
          }
        }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 