const express = require('express');
const router = express.Router();
const { validateToken } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');
const { User, Product, Order, OrderItem } = require('../models');
const { Op } = require('sequelize');

// Apply authentication middleware to all admin routes
router.use(validateToken);
router.use(isAdmin);

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Helper functions
const validateAndParseInt = (value, defaultValue, max = null) => {
  const parsed = parseInt(value) || defaultValue;
  return max ? Math.min(parsed, max) : Math.max(1, parsed);
};

const createDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setDate(now.getDate() - 30);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }
  
  return { start, end: now };
};

// Check admin status
router.get('/check-status', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ 
      isAdmin: user?.role === 'admin',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Cannot check admin privileges' });
  }
});

// Admin middleware
router.use(validateToken, isAdmin);

// Lấy danh sách người dùng
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy thông tin chi tiết người dùng
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật thông tin người dùng
router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Cập nhật thông tin
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    
    await user.save();
    
    res.json({ 
      message: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa người dùng
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách sản phẩm (với phân trang và tìm kiếm)
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};

    // Search functionality
    if (search) {
      const searchTerm = search.trim();
      if (searchTerm) {
        where[Op.or] = [
          { title: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } },
          { brand: { [Op.like]: `%${searchTerm}%` } },
          { category: { [Op.like]: `%${searchTerm}%` } }
        ];
      }
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });
    
    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalProducts: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tạo sản phẩm mới
router.post('/products', async (req, res) => {
  try {
    const { 
      title, description, price, discountPercentage, 
      rating, stock, brand, category, thumbnail, images 
    } = req.body;
    
    const product = await Product.create({
      title, description, price, discountPercentage,
      rating, stock, brand, category, thumbnail,
      images: images || []
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật sản phẩm
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Cập nhật các trường
    const fields = [
      'title', 'description', 'price', 'discountPercentage',
      'rating', 'stock', 'brand', 'category', 'thumbnail', 'images'
    ];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });
    
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa sản phẩm
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách đơn hàng (với phân trang và lọc)
router.get('/orders', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      search
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};
    const userWhere = {};

    // Lọc theo trạng thái
    if (status) {
      where.status = status;
    }
      // Lọc theo ngày
    if (startDate || endDate) {
      where.created_at = {};

      if (startDate) {
        where.created_at[Op.gte] = new Date(startDate);
      }

      if (endDate) {
        where.created_at[Op.lte] = new Date(endDate);
      }
    }

    // Search functionality
    if (search) {
      const searchTerm = search.trim();
      if (searchTerm) {
        // Search by order ID or user info
        const searchConditions = [];

        // Search by order ID (if search term is numeric)
        if (!isNaN(searchTerm)) {
          where.id = parseInt(searchTerm);
        } else {
          // Search by user username or email
          userWhere[Op.or] = [
            { username: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } }
          ];
        }
      }
    }
      const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{        model: OrderItem,
        as: 'OrderItems',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['id', 'title', 'thumbnail', 'price']
        }]
      }, {
        model: User,
        as: 'User',        attributes: ['id', 'username', 'email'],
        where: Object.keys(userWhere).length > 0 ? userWhere : undefined
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalOrders: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật trạng thái đơn hàng
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        as: 'OrderItems'
      }]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Kiểm tra trạng thái hợp lệ
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const oldStatus = order.status;
    
    // Xử lý thay đổi stock khi thay đổi trạng thái
    if (oldStatus !== status) {
      // Nếu đơn hàng bị hủy, hoàn trả stock
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        for (const orderItem of order.OrderItems) {
          const product = await Product.findByPk(orderItem.productId);
          if (product) {
            await product.update({
              stock: product.stock + orderItem.quantity
            });
          }
        }
      }
      
      // Nếu đơn hàng được khôi phục từ trạng thái cancelled, trừ stock
      if (oldStatus === 'cancelled' && status !== 'cancelled') {
        for (const orderItem of order.OrderItems) {
          const product = await Product.findByPk(orderItem.productId);
          if (product) {
            // Kiểm tra stock có đủ không
            if (product.stock < orderItem.quantity) {
              return res.status(400).json({ 
                error: `Sản phẩm "${product.title}" chỉ còn ${product.stock} sản phẩm trong kho, không thể khôi phục đơn hàng` 
              });
            }
            await product.update({
              stock: product.stock - orderItem.quantity
            });
          }
        }
      }
    }
    
    order.status = status;
    await order.save();
    
    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thống kê doanh thu
router.get('/statistics/revenue', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let startDate, endDate;
    const now = new Date();
    
    // Xác định khoảng thời gian
    if (period === 'week') {
      // 7 ngày gần nhất
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      // 30 ngày gần nhất
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    } else if (period === 'year') {
      // 12 tháng gần nhất
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      return res.status(400).json({ error: 'Invalid period' });
    }
      // Lấy tổng doanh thu
    const orders = await Order.findAll({
      where: {
        created_at: { [Op.between]: [startDate, now] },
        status: { [Op.ne]: 'cancelled' }
      },      attributes: [
        'created_at',
        'total_amount'
      ]
    });
      // Tính tổng doanh thu
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      // Tính doanh thu theo ngày
    const revenueByDate = {};
    orders.forEach(order => {
      const date = order.created_at.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      revenueByDate[date] += parseFloat(order.total_amount);
    });
    
    res.json({
      totalRevenue,
      revenueByDate,
      period,
      startDate,
      endDate: now
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thống kê tổng quan cho dashboard
router.get('/dashboard/overview', async (req, res) => {
  try {
    // Tổng số users
    const totalUsers = await User.count();
    
    // Tổng số products
    const totalProducts = await Product.count();
    
    // Tổng số orders
    const totalOrders = await Order.count();
    
    // Doanh thu tháng này
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);    const thisMonthRevenue = await Order.sum('total_amount', {
      where: {
        created_at: { [Op.gte]: startOfMonth },
        status: { [Op.ne]: 'cancelled' }
      }
    });
    
    // Doanh thu tháng trước
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthRevenue = await Order.sum('total_amount', {
      where: {
        created_at: { [Op.between]: [startOfLastMonth, endOfLastMonth] },
        status: { [Op.ne]: 'cancelled' }
      }
    });
      // Đơn hàng pending
    const pendingOrders = await Order.count({
      where: { status: 'pending' }
    });
    
    // Top 5 sản phẩm bán chạy
    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [Product.sequelize.fn('SUM', Product.sequelize.col('OrderItem.quantity')), 'totalSold']
      ],
      include: [{
        model: Product,
        as: 'Product',
        attributes: ['title', 'thumbnail', 'price', 'stock']
      }],
      group: ['productId', 'Product.id'],
      order: [[Product.sequelize.fn('SUM', Product.sequelize.col('OrderItem.quantity')), 'DESC']],
      limit: 5
    });

    // Recent orders (last 10)
    const recentOrders = await Order.findAll({
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'username', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    // Tính tỷ lệ tăng trưởng doanh thu
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2)
      : 0;
    
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      thisMonthRevenue: thisMonthRevenue || 0,
      lastMonthRevenue: lastMonthRevenue || 0,
      revenueGrowth,
      pendingOrders,
      topProducts,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thống kê theo thời gian (ngày, tuần, tháng)
router.get('/statistics/orders', async (req, res) => {
  try {
    const { period = 'week', startDate, endDate } = req.query;
    let start, end;
    const now = new Date();
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Tự động tính dựa trên period
      if (period === 'week') {
        start = new Date(now);
        start.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        start = new Date(now);
        start.setDate(now.getDate() - 30);
      } else if (period === 'year') {
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
      }
      end = now;
    }
      // Thống kê đơn hàng theo trạng thái
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status',
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.between]: [start, end] }
      },
      group: ['status']
    });
    
    // Thống kê đơn hàng theo ngày
    const ordersByDate = await Order.findAll({
      attributes: [
        [Order.sequelize.fn('DATE', Order.sequelize.col('created_at')), 'date'],
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('total_amount')), 'revenue']
      ],
      where: {
        created_at: { [Op.between]: [start, end] }
      },
      group: [Order.sequelize.fn('DATE', Order.sequelize.col('created_at'))],
      order: [[Order.sequelize.fn('DATE', Order.sequelize.col('created_at')), 'ASC']]
    });
    
    res.json({
      ordersByStatus,
      ordersByDate,
      period: { start, end }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thống kê sản phẩm
router.get('/statistics/products', async (req, res) => {
  try {
    // Sản phẩm sắp hết hàng (stock < 10)
    const lowStockProducts = await Product.findAll({
      where: {
        stock: { [Op.lt]: 10 }
      },
      order: [['stock', 'ASC']],
      limit: 20
    });
    
    // Sản phẩm bán chạy trong 30 ngày
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const popularProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('quantity')), 'totalSold'],        [OrderItem.sequelize.fn('SUM', 
          OrderItem.sequelize.literal('OrderItem.quantity * OrderItem.price')), 'totalRevenue']
      ],
      include: [{
        model: Product,
        as: 'Product',
        attributes: ['title', 'thumbnail', 'stock', 'category']      }, {
        model: Order,
        as: 'Order',
        attributes: [],
        where: {
          created_at: { [Op.gte]: thirtyDaysAgo }
        }
      }],
      group: ['productId', 'Product.id'],
      order: [[OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('quantity')), 'DESC']],
      limit: 20
    });
    
    // Thống kê theo category
    const categoryStats = await Product.findAll({
      attributes: [
        'category',
        [Product.sequelize.fn('COUNT', Product.sequelize.col('id')), 'productCount'],
        [Product.sequelize.fn('AVG', Product.sequelize.col('price')), 'avgPrice'],
        [Product.sequelize.fn('SUM', Product.sequelize.col('stock')), 'totalStock']
      ],
      group: ['category'],
      order: [[Product.sequelize.fn('COUNT', Product.sequelize.col('id')), 'DESC']]
    });
    
    res.json({
      lowStockProducts,
      popularProducts,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quản lý bulk operations cho sản phẩm
router.post('/products/bulk-update', async (req, res) => {
  try {
    const { productIds, updates } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Product IDs are required' });
    }
    
    const result = await Product.update(updates, {
      where: {
        id: { [Op.in]: productIds }
      }
    });
    
    res.json({ 
      message: 'Products updated successfully',
      updatedCount: result[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/products/bulk-delete', async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Product IDs are required' });
    }
    
    const deletedCount = await Product.destroy({
      where: {
        id: { [Op.in]: productIds }
      }
    });
    
    res.json({ 
      message: 'Products deleted successfully',
      deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quản lý users nâng cao
router.get('/users/search', async (req, res) => {
  try {
    const { q, role, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    
    // Tìm kiếm theo tên hoặc email
    if (q) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } }
      ];
    }
    
    // Lọc theo role
    if (role) {
      where.role = role;
    }
    
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalUsers: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thống kê users
router.get('/statistics/users', async (req, res) => {
  try {
    // Tổng số users theo role
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: ['role']
    });
    
    // Users đăng ký trong 30 ngày gần đây
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsers = await User.count({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Recent users (last 10)
    const recentUsers = await User.findAll({
      attributes: ['id', 'username', 'email', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10
    });
      // Users có đơn hàng
    const activeUsers = await User.count({
      include: [{
        model: Order,
        as: 'Orders',
        required: true
      }]
    });    // Top customers theo số đơn hàng - compute aggregations manually
    const usersWithOrders = await User.findAll({
      attributes: [
        'id', 'username', 'email'
      ],
      include: [{
        model: Order,
        as: 'Orders',
        attributes: ['id', 'total_amount'],
        where: {
          status: { [Op.ne]: 'cancelled' }
        },
        required: true
      }]
    });    // Manually compute aggregations
    const topCustomers = usersWithOrders
      .map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        orderCount: user.Orders.length,
        totalSpent: user.Orders.reduce((sum, order) => {
          const amount = parseFloat(order.total_amount) || 0;
          return sum + amount;
        }, 0)
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);
    
    res.json({
      usersByRole,
      newUsers,
      activeUsers,
      topCustomers,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export dữ liệu
router.get('/export/orders', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const where = {};
      if (startDate && endDate) {
      where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    
    if (status) {
      where.status = status;
    }
      const orders = await Order.findAll({
      where,
      include: [{
        model: OrderItem,
        as: 'OrderItems',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['id', 'title', 'thumbnail', 'price']
        }]
      }, {
        model: User,
        as: 'User',
        attributes: ['id', 'username', 'email']      }],
      order: [['created_at', 'DESC']]
    });
    
    // Chuyển đổi dữ liệu thành format dễ xuất
    const exportData = orders.map(order => ({
      orderId: order.id,
      customerName: order.User.username,
      customerEmail: order.User.email,
      status: order.status,      totalAmount: order.total_amount,
      createdAt: order.created_at,
      items: order.OrderItems.map(item => ({
        productTitle: item.Product.title,
        quantity: item.quantity,
        price: item.price
      }))
    }));
    
    res.json({
      data: exportData,
      count: exportData.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System logs (có thể mở rộng để log các hoạt động admin)
router.get('/logs', async (req, res) => {
  try {
    // Placeholder for system logs
    // Trong thực tế, bạn sẽ cần một bảng logs riêng
    const logs = [
      {
        id: 1,
        action: 'User created',
        details: 'New user registered',
        timestamp: new Date(),
        adminId: req.user.id
      }
    ];
    
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;