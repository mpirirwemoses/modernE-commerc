const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+1234567890'
    }
  });

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      phone: '+1234567891'
    }
  });

  console.log('✅ Users created');

  // Create categories
  const menCategory = await prisma.category.upsert({
    where: { slug: 'men' },
    update: {},
    create: {
      name: 'Men',
      slug: 'men',
      description: 'Fashion items for men'
    }
  });

  const womenCategory = await prisma.category.upsert({
    where: { slug: 'women' },
    update: {},
    create: {
      name: 'Women',
      slug: 'women',
      description: 'Fashion items for women'
    }
  });

  const kidsCategory = await prisma.category.upsert({
    where: { slug: 'kids' },
    update: {},
    create: {
      name: 'Kids',
      slug: 'kids',
      description: 'Fashion items for kids'
    }
  });

  console.log('✅ Categories created');

  // Create products
  const products = [
    {
      name: "Men's Classic Shirt",
      slug: "mens-classic-shirt",
      description: "A comfortable and stylish classic shirt for men. Made from premium cotton fabric with a modern fit. Perfect for both casual and formal occasions.",
      shortDescription: "Premium cotton classic shirt",
      sku: "MSH001",
      categoryId: menCategory.id,
      brand: "FashionBrand",
      oldPrice: 50.00,
      newPrice: 40.00,
      costPrice: 25.00,
      stock: 100,
      isFeatured: true,
      isOnSale: true,
      images: [
        { url: "/src/assets/images/StockCake-Assorted eyeglasses display_1725943602.jpg", alt: "Men's Shirt", isPrimary: true, order: 0 }
      ]
    },
    {
      name: "Men's Jacket",
      slug: "mens-jacket",
      description: "A stylish and warm jacket perfect for cooler weather. Features a modern design with comfortable fit and durable construction.",
      shortDescription: "Stylish men's jacket",
      sku: "MJK002",
      categoryId: menCategory.id,
      brand: "FashionBrand",
      oldPrice: 100.00,
      newPrice: 80.00,
      costPrice: 50.00,
      stock: 50,
      isFeatured: true,
      images: [
        { url: "/src/assets/images/StockCake-Focused Technical Professional_1725730789.jpg", alt: "Men's Jacket", isPrimary: true, order: 0 }
      ]
    },
    {
      name: "Men's Trousers",
      slug: "mens-trousers",
      description: "Comfortable and stylish trousers for men. Made from high-quality fabric with a perfect fit for any occasion.",
      shortDescription: "Comfortable men's trousers",
      sku: "MTR003",
      categoryId: menCategory.id,
      brand: "FashionBrand",
      oldPrice: 60.00,
      newPrice: 50.00,
      costPrice: 30.00,
      stock: 75,
      images: [
        { url: "/src/assets/images/StockCake-Focused Office Workers_1725730342.jpg", alt: "Men's Trousers", isPrimary: true, order: 0 }
      ]
    },
    {
      name: "Women's Dress",
      slug: "womens-dress",
      description: "An elegant and beautiful dress for women. Features a flattering design with premium fabric and comfortable fit.",
      shortDescription: "Elegant women's dress",
      sku: "WDR004",
      categoryId: womenCategory.id,
      brand: "FashionBrand",
      oldPrice: 90.00,
      newPrice: 75.00,
      costPrice: 45.00,
      stock: 60,
      isFeatured: true,
      isOnSale: true,
      images: [
        { url: "/src/assets/images/StockCake-Futuristic Fashion Model_1725942572.jpg", alt: "Women's Dress", isPrimary: true, order: 0 }
      ]
    },
    {
      name: "Women's Top",
      slug: "womens-top",
      description: "A stylish and comfortable top for women. Perfect for everyday wear with a modern design and soft fabric.",
      shortDescription: "Stylish women's top",
      sku: "WTP005",
      categoryId: womenCategory.id,
      brand: "FashionBrand",
      oldPrice: 40.00,
      newPrice: 30.00,
      costPrice: 20.00,
      stock: 80,
      images: [
        { url: "/src/assets/images/StockCake-Urban Style Cycling_1725943255.jpg", alt: "Women's Top", isPrimary: true, order: 0 }
      ]
    },
    {
      name: "Women's Skirt",
      slug: "womens-skirt",
      description: "A beautiful and elegant skirt for women. Features a flattering design with comfortable fit and premium fabric.",
      shortDescription: "Elegant women's skirt",
      sku: "WSK006",
      categoryId: womenCategory.id,
      brand: "FashionBrand",
      oldPrice: 55.00,
      newPrice: 45.00,
      costPrice: 25.00,
      stock: 45,
      images: [
        { url: "/src/assets/images/StockCake-Colorful Boutique Shopping_1725943175.jpg", alt: "Women's Skirt", isPrimary: true, order: 0 }
      ]
    },
    {
      name: "Kids' T-Shirt",
      slug: "kids-tshirt",
      description: "A comfortable and colorful t-shirt for kids. Made from soft cotton fabric with fun designs and comfortable fit.",
      shortDescription: "Comfortable kids t-shirt",
      sku: "KTS007",
      categoryId: kidsCategory.id,
      brand: "FashionBrand",
      oldPrice: 30.00,
      newPrice: 25.00,
      costPrice: 15.00,
      stock: 120,
      isFeatured: true,
      images: [
        { url: "/src/assets/images/StockCake-Bold Fashion Statement_1725943050.jpg", alt: "Kids T-Shirt", isPrimary: true, order: 0 }
      ]
    },
    {
      name: "Kids' Shorts",
      slug: "kids-shorts",
      description: "Comfortable and durable shorts for kids. Perfect for active play with breathable fabric and comfortable fit.",
      shortDescription: "Comfortable kids shorts",
      sku: "KSH008",
      categoryId: kidsCategory.id,
      brand: "FashionBrand",
      oldPrice: 25.00,
      newPrice: 20.00,
      costPrice: 12.00,
      stock: 90,
      images: [
        { url: "/src/assets/images/StockCake-Colorful eyeglasses collection_1725943583.jpg", alt: "Kids Shorts", isPrimary: true, order: 0 }
      ]
    },
    {
      name: "Kids' Dress",
      slug: "kids-dress",
      description: "A beautiful and comfortable dress for kids. Features cute designs with soft fabric and comfortable fit.",
      shortDescription: "Beautiful kids dress",
      sku: "KDR009",
      categoryId: kidsCategory.id,
      brand: "FashionBrand",
      oldPrice: 45.00,
      newPrice: 35.00,
      costPrice: 22.00,
      stock: 70,
      isOnSale: true,
      images: [
        { url: "/src/assets/images/StockCake-Edgy Fashion Pose_1725942587.jpg", alt: "Kids Dress", isPrimary: true, order: 0 }
      ]
    },
    {
      name: "Kids' Summer Dress",
      slug: "kids-summer-dress",
      description: "A light and comfortable summer dress for kids. Perfect for warm weather with breathable fabric and cute design.",
      shortDescription: "Light summer dress for kids",
      sku: "KSD010",
      categoryId: kidsCategory.id,
      brand: "FashionBrand",
      oldPrice: 50.00,
      newPrice: 40.00,
      costPrice: 25.00,
      stock: 55,
      images: [
        { url: "/src/assets/images/StockCake-Edgy Fashion Pose_1725943075.jpg", alt: "Kids Summer Dress", isPrimary: true, order: 0 }
      ]
    },
    {
      name: "Kids' Party Dress",
      slug: "kids-party-dress",
      description: "A special party dress for kids. Features elegant design with premium fabric perfect for special occasions.",
      shortDescription: "Special party dress for kids",
      sku: "KPD011",
      categoryId: kidsCategory.id,
      brand: "FashionBrand",
      oldPrice: 55.00,
      newPrice: 45.00,
      costPrice: 28.00,
      stock: 40,
      images: [
        { url: "/src/assets/images/StockCake-Joyful Eyewear Fashion_1725943539.jpg", alt: "Kids Party Dress", isPrimary: true, order: 0 }
      ]
    }
  ];

  for (const productData of products) {
    const { images, ...productInfo } = productData;
    
    const product = await prisma.product.upsert({
      where: { sku: productInfo.sku },
      update: {},
      create: productInfo
    });

    // Create product images
    for (const imageData of images) {
      await prisma.productImage.upsert({
        where: {
          productId_url: {
            productId: product.id,
            url: imageData.url
          }
        },
        update: {},
        create: {
          productId: product.id,
          url: imageData.url,
          alt: imageData.alt,
          isPrimary: imageData.isPrimary,
          order: imageData.order
        }
      });
    }
  }

  console.log('✅ Products created');

  // Create product variants
  const sizeVariants = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorVariants = ['Red', 'Blue', 'Green', 'Black', 'White'];

  for (const product of products) {
    const dbProduct = await prisma.product.findUnique({
      where: { sku: product.sku }
    });

    if (dbProduct) {
      // Add size variants
      for (const size of sizeVariants) {
        await prisma.productVariant.upsert({
          where: {
            productId_name_value: {
              productId: dbProduct.id,
              name: 'Size',
              value: size
            }
          },
          update: {},
          create: {
            productId: dbProduct.id,
            name: 'Size',
            value: size,
            sku: `${dbProduct.sku}-${size}`,
            stock: Math.floor(Math.random() * 20) + 5
          }
        });
      }

      // Add color variants
      for (const color of colorVariants) {
        await prisma.productVariant.upsert({
          where: {
            productId_name_value: {
              productId: dbProduct.id,
              name: 'Color',
              value: color
            }
          },
          update: {},
          create: {
            productId: dbProduct.id,
            name: 'Color',
            value: color,
            sku: `${dbProduct.sku}-${color}`,
            stock: Math.floor(Math.random() * 15) + 3
          }
        });
      }
    }
  }

  console.log('✅ Product variants created');

  // Create sample reviews
  const reviewData = [
    {
      rating: 5,
      title: "Excellent Quality",
      comment: "Great product, very comfortable and stylish. Highly recommended!"
    },
    {
      rating: 4,
      title: "Good Product",
      comment: "Nice quality and good fit. Would buy again."
    },
    {
      rating: 5,
      title: "Perfect Fit",
      comment: "Exactly what I was looking for. Perfect size and color."
    },
    {
      rating: 4,
      title: "Satisfied Customer",
      comment: "Good quality for the price. Happy with my purchase."
    },
    {
      rating: 5,
      title: "Amazing Product",
      comment: "Exceeded my expectations. Great value for money."
    }
  ];

  for (const product of products.slice(0, 5)) {
    const dbProduct = await prisma.product.findUnique({
      where: { sku: product.sku }
    });

    if (dbProduct) {
      for (const review of reviewData) {
        await prisma.review.upsert({
          where: {
            userId_productId: {
              userId: customer.id,
              productId: dbProduct.id
            }
          },
          update: {},
          create: {
            userId: customer.id,
            productId: dbProduct.id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            isVerified: true
          }
        });
      }
    }
  }

  console.log('✅ Reviews created');

  // Create sample coupons
  const coupons = [
    {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10.00,
      minAmount: 50.00,
      usageLimit: 100,
      isActive: true
    },
    {
      code: 'SAVE20',
      type: 'FIXED_AMOUNT',
      value: 20.00,
      minAmount: 100.00,
      usageLimit: 50,
      isActive: true
    },
    {
      code: 'FREESHIP',
      type: 'FREE_SHIPPING',
      value: 0.00,
      minAmount: 75.00,
      usageLimit: 200,
      isActive: true
    }
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon
    });
  }

  console.log('✅ Coupons created');

  // Create sample settings
  const settings = [
    { key: 'site_name', value: 'Modern E-Commerce', type: 'string' },
    { key: 'site_description', value: 'Your one-stop shop for fashion', type: 'string' },
    { key: 'currency', value: 'USD', type: 'string' },
    { key: 'tax_rate', value: '10', type: 'number' },
    { key: 'free_shipping_threshold', value: '100', type: 'number' },
    { key: 'shipping_cost', value: '10', type: 'number' }
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }

  console.log('✅ Settings created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 