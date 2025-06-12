const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, Cart, CartItem } = require('../models');
const { validateToken } = require('../middleware/auth.middleware');

// Helper function to calculate order total and validate stock
const calculateOrderTotal = async (items) => {
  let totalAmount = 0;
  for (const item of items) {
    const product = await Product.findByPk(item.productId);
    if (!product) {
      throw new Error(`Sản phẩm ${item.productId} không tồn tại`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Sản phẩm "${product.title}" chỉ còn ${product.stock} sản phẩm trong kho`);
    }
    totalAmount += product.price * item.quantity;
  }
  return totalAmount;
};

// Create new order
router.post('/', validateToken, async (req, res) => {
  try {
    console.log('Creating order for user:', req.user.id);
    console.log('Request body:', req.body);

    const { items, shippingAddress, paymentMethod, solanaSignature, solanaReference } = req.body;
    const userId = req.user.id;

    // Validate items and check stock availability
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Đơn hàng phải có ít nhất một sản phẩm' });
    }

    // Calculate total and validate stock
    const totalAmount = await calculateOrderTotal(items);

    // Create order
    const order = await Order.create({
      userId,
      totalAmount,
      shippingAddress,
      paymentMethod,
      solanaSignature: solanaSignature || null,
      solanaReference: solanaReference || null,
      paymentStatus: paymentMethod === 'SOLANA' && solanaSignature ? 'paid' : 'pending'
    });

    // Create order items and reduce stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      
      // Create order item
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      });      // Reduce product stock
      await product.update({
        stock: product.stock - item.quantity
      });
    }

    // Clear user's cart after successful order
    const userCart = await Cart.findOne({ where: { userId } });
    if (userCart) {
      await CartItem.destroy({ where: { cartId: userCart.id } });
    }

    console.log('Order created successfully:', order.id);

    res.status(201).json({
      message: 'Đặt hàng thành công',
      orderId: order.id
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's orders
router.get('/', validateToken, async (req, res) => {  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'OrderItems',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['id', 'title', 'thumbnail', 'price']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by id
router.get('/:id', validateToken, async (req, res) => {
  try {
    const order = await Order.findOne({      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: OrderItem,
        as: 'OrderItems',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['id', 'title', 'thumbnail', 'price', 'stock']
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.put('/:id/cancel', validateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: OrderItem,
        as: 'OrderItems'
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' });
    }

    // Restore stock for each item when cancelling
    for (const orderItem of order.OrderItems) {
      const product = await Product.findByPk(orderItem.productId);
      if (product) {
        await product.update({
          stock: product.stock + orderItem.quantity
        });
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Đơn hàng đã được hủy thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order
router.delete('/:id', validateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: OrderItem,
        as: 'OrderItems'
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    // Only allow deletion of cancelled or pending orders
    if (order.status !== 'pending' && order.status !== 'cancelled') {
      return res.status(400).json({ 
        error: 'Chỉ có thể xóa đơn hàng đang chờ xử lý hoặc đã hủy' 
      });
    }

    // If order is pending, restore stock before deletion
    if (order.status === 'pending') {
      for (const orderItem of order.OrderItems) {
        const product = await Product.findByPk(orderItem.productId);
        if (product) {
          await product.update({
            stock: product.stock + orderItem.quantity
          });
        }
      }
    }

    // Delete order items first (due to foreign key constraint)
    await OrderItem.destroy({
      where: { orderId: order.id }
    });

    // Delete the order
    await order.destroy();

    res.json({ message: 'Đơn hàng đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
