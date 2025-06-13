const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db.config');
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const orderRoutes = require('./routes/orders.routes');
const cartRoutes = require('./routes/cart.routes');
const adminRoutes = require('./routes/admin.routes');
const usersRoutes = require('./routes/users.routes');
const solanaRoutes = require('./routes/solana.routes');
const commentsRoutes = require('./routes/comments.routes');
// Social media routes
const postsRoutes = require('./routes/posts.routes');
const storiesRoutes = require('./routes/stories.routes');
const socialRoutes = require('./routes/social.routes');
const socialCommentsRoutes = require('./routes/socialComments.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger middleware (only for important requests)
app.use((req, res, next) => {
  if (req.method !== 'GET' && (req.url.includes('admin') || req.url.includes('upload'))) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false, alter: false }); // Disabled alter option to prevent index issues
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/solana', solanaRoutes);
app.use('/api/comments', commentsRoutes);
// Social media routes
app.use('/api/posts', postsRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/social-comments', socialCommentsRoutes);
app.use('/api/upload', uploadRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the E-commerce API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
