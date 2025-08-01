const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|avi|mov|wmv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});

// ==================== PRODUCT MANAGEMENT ====================

// Get all products with pagination and filters
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status } = req.query;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category) where.categoryId = category;
    if (status !== undefined) where.isActive = status === 'true';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          variants: true,
          _count: {
            select: { reviews: true, orderItems: true }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new product
router.post('/products', requireAdmin, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), async (req, res) => {
  try {
    const {
      name, description, shortDescription, sku, categoryId, brand,
      oldPrice, newPrice, costPrice, stock, minStock, weight,
      dimensions, isActive, isFeatured, isOnSale, saleEndDate
    } = req.body;

    // Validate required fields
    if (!name || !sku || !categoryId || !newPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    });
    if (existingProduct) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        shortDescription,
        sku,
        categoryId,
        brand,
        oldPrice: parseFloat(oldPrice) || 0,
        newPrice: parseFloat(newPrice),
        costPrice: parseFloat(costPrice) || 0,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 5,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        isActive: isActive === 'true',
        isFeatured: isFeatured === 'true',
        isOnSale: isOnSale === 'true',
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null
      }
    });

    // Handle uploaded images
    if (req.files && req.files.images && req.files.images.length > 0) {
      const imageData = req.files.images.map((file, index) => ({
        productId: product.id,
        url: `/uploads/products/${file.filename}`,
        alt: `${name} image ${index + 1}`,
        isPrimary: index === 0,
        order: index
      }));

      await prisma.productImage.createMany({
        data: imageData
      });
    }

    // Handle uploaded videos
    if (req.files && req.files.videos && req.files.videos.length > 0) {
      const videoData = req.files.videos.map((file, index) => ({
        productId: product.id,
        url: `/uploads/products/${file.filename}`,
        alt: `${name} video ${index + 1}`,
        order: index
      }));

      await prisma.productVideo.createMany({
        data: videoData
      });
    }

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/products/:id', requireAdmin, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, shortDescription, sku, categoryId, brand,
      oldPrice, newPrice, costPrice, stock, minStock, weight,
      dimensions, isActive, isFeatured, isOnSale, saleEndDate
    } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if SKU is being used by another product
    if (sku && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findFirst({
        where: { sku, NOT: { id } }
      });
      if (skuExists) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        shortDescription,
        sku,
        categoryId,
        brand,
        oldPrice: parseFloat(oldPrice) || 0,
        newPrice: parseFloat(newPrice),
        costPrice: parseFloat(costPrice) || 0,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 5,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        isActive: isActive === 'true',
        isFeatured: isFeatured === 'true',
        isOnSale: isOnSale === 'true',
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null
      }
    });

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const imageData = req.files.map((file, index) => ({
        productId: id,
        url: `/uploads/products/${file.filename}`,
        alt: `${name} image ${index + 1}`,
        isPrimary: false,
        order: index
      }));

      await prisma.productImage.createMany({
        data: imageData
      });
    }

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated images from filesystem
    for (const image of product.images) {
      const imagePath = path.join(__dirname, '..', image.url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete product (cascades to images and variants)
    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
        reviews: {
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ORDER MANAGEMENT ====================

// Get all orders with filters
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, dateFrom, dateTo } = req.query;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: {
            include: { product: { select: { name: true, images: true } } }
          },
          payments: true,
          shippingAddress: true,
          billingAddress: true
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    // Set shipped/delivered timestamps
    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { product: true } }
      }
    });

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cancelled orders
router.get('/orders/cancelled', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { status: 'CANCELLED' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: { include: { product: true } },
          payments: true
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where: { status: 'CANCELLED' } })
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ANALYTICS ====================

// Get dashboard analytics
router.get('/analytics/dashboard', requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get order statistics
    const [totalOrders, pendingOrders, fulfilledOrders, cancelledOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } } }),
      prisma.order.count({ where: { status: { in: ['SHIPPED', 'DELIVERED'] } } }),
      prisma.order.count({ where: { status: 'CANCELLED' } })
    ]);

    // Get revenue statistics
    const [totalRevenue, monthlyRevenue, yearlyRevenue] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: ['SHIPPED', 'DELIVERED'] } },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where: { 
          status: { in: ['SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startOfMonth }
        },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where: { 
          status: { in: ['SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startOfYear }
        },
        _sum: { total: true }
      })
    ]);

    // Get top performing products
    const topProducts = await prisma.product.findMany({
      include: {
        category: true,
        _count: { select: { orderItems: true } },
        orderItems: {
          include: { order: true },
          where: { order: { status: { in: ['SHIPPED', 'DELIVERED'] } } }
        }
      },
      orderBy: {
        orderItems: { _count: 'desc' }
      },
      take: 10
    });

    // Get recent transactions
    const recentTransactions = await prisma.order.findMany({
      where: { status: { in: ['SHIPPED', 'DELIVERED'] } },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get monthly order trends
    const monthlyTrends = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as orderCount,
        SUM(total) as revenue
      FROM orders 
      WHERE status IN ('SHIPPED', 'DELIVERED')
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
    `;

    res.json({
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        fulfilled: fulfilledOrders,
        cancelled: cancelledOrders
      },
      revenue: {
        total: totalRevenue._sum.total || 0,
        monthly: monthlyRevenue._sum.total || 0,
        yearly: yearlyRevenue._sum.total || 0
      },
      topProducts,
      recentTransactions,
      monthlyTrends
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product analytics
router.get('/analytics/products', requireAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        _count: { select: { orderItems: true, reviews: true } },
        orderItems: {
          include: { order: true },
          where: { order: { status: { in: ['SHIPPED', 'DELIVERED'] } } }
        }
      },
      orderBy: {
        orderItems: { _count: 'desc' }
      }
    });

    const productAnalytics = products.map(product => ({
      ...product,
      totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }));

    res.json(productAnalytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { orders: true, reviews: true }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.patch('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['ADMIN', 'CUSTOMER', 'MODERATOR'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle user active status
router.patch('/users/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 