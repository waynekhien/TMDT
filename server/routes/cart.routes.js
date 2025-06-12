const express = require('express');
const router = express.Router();
const { Cart, CartItem, Product } = require('../models');
const { validateToken } = require('../middleware/auth.middleware');

// Helper function to get or create cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ where: { userId } });
  if (!cart) {
    cart = await Cart.create({ userId });
  }
  return cart;
};

// Get user's cart
router.get('/', validateToken, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
      const cartWithItems = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'CartItems',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['id', 'title', 'price', 'thumbnail', 'stock']
        }]
      }]
    });

    const result = cartWithItems?.toJSON() || { CartItems: [] };
    result.CartItems = result.CartItems || [];

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart
router.post('/items', validateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get or create cart
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      where: { 
        cartId: cart.id,
        productId: productId
      }
    });

    // Get product to check stock
    const productInStock = await Product.findByPk(productId);
    if (!productInStock) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const finalQuantity = cartItem 
      ? cartItem.quantity + quantity 
      : quantity;

    // Check if requested quantity is available
    if (finalQuantity > productInStock.stock) {
      return res.status(400).json({ 
        error: 'Số lượng yêu cầu vượt quá số lượng trong kho'
      });
    }

    if (cartItem) {
      // Update quantity if item exists
      cartItem.quantity = finalQuantity;
      await cartItem.save();
    } else {
      // Create new cart item if it doesn't exist
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId: productId,
        quantity: quantity
      });
    }

    res.status(201).json({
      message: 'Item added to cart successfully',
      cartItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart item quantity
router.put('/items/:itemId', validateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItem.findOne({
      include: [{
        model: Cart,
        as: 'Cart',
        where: { userId: req.user.id }
      }],
      where: { id: req.params.itemId }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check product stock before updating
    const product = await Product.findByPk(cartItem.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ 
        error: `Sản phẩm "${product.title}" chỉ còn ${product.stock} sản phẩm trong kho`
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      message: 'Cart item updated successfully',
      cartItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.delete('/items/:itemId', validateToken, async (req, res) => {
  try {
    const cartItem = await CartItem.findOne({
      include: [{
        model: Cart,
        as: 'Cart',
        where: { userId: req.user.id }
      }],
      where: { id: req.params.itemId }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await cartItem.destroy();

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/', validateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { userId: req.user.id }
    });

    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
