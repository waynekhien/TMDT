const express = require('express');
const { Connection, PublicKey } = require('@solana/web3.js');
const { validateToken } = require('../middleware/auth.middleware');
const { Order } = require('../models');

const router = express.Router();

// Solana devnet connection
const connection = new Connection('https://api.devnet.solana.com');

// Merchant wallet address
const MERCHANT_WALLET = '9nx8nrbahTd1ujgt99nWAc58PGXbr2vjPSAXQWxdnqyQ';

/**
 * Verify Solana payment transaction
 * POST /api/solana/verify-payment
 */
router.post('/verify-payment', validateToken, async (req, res) => {
  try {
    const { orderId, signature, reference } = req.body;
    const userId = req.user.id;

    if (!orderId || !signature || !reference) {
      return res.status(400).json({ 
        error: 'Missing required fields: orderId, signature, reference' 
      });
    }

    // Find the order
    const order = await Order.findOne({
      where: { 
        id: orderId,
        userId: userId 
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify the transaction on Solana blockchain
    try {
      const transaction = await connection.getTransaction(signature, {
        commitment: 'confirmed'
      });

      if (!transaction) {
        return res.status(400).json({ error: 'Transaction not found on blockchain' });
      }

      if (transaction.meta && transaction.meta.err) {
        return res.status(400).json({ error: 'Transaction failed on blockchain' });
      }

      // Verify the transaction involves our merchant wallet
      const accountKeys = transaction.transaction.message.accountKeys;
      const merchantPublicKey = new PublicKey(MERCHANT_WALLET);
      
      const merchantIndex = accountKeys.findIndex(key => 
        key.equals(merchantPublicKey)
      );

      if (merchantIndex === -1) {
        return res.status(400).json({ error: 'Transaction does not involve merchant wallet' });
      }

      // Update order with payment information
      await order.update({
        paymentStatus: 'paid',
        solanaSignature: signature,
        solanaReference: reference,
        paymentMethod: 'SOLANA'
      });

      res.json({
        message: 'Payment verified successfully',
        orderId: order.id,
        signature: signature,
        status: 'verified'
      });

    } catch (blockchainError) {
      console.error('Blockchain verification error:', blockchainError);
      return res.status(500).json({ 
        error: 'Failed to verify transaction on blockchain' 
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Internal server error during payment verification' });
  }
});

/**
 * Get payment status for an order
 * GET /api/solana/payment-status/:orderId
 */
router.get('/payment-status/:orderId', validateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { 
        id: orderId,
        userId: userId 
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      solanaSignature: order.solanaSignature,
      solanaReference: order.solanaReference
    });

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Check if a Solana transaction is confirmed
 * POST /api/solana/check-transaction
 */
router.post('/check-transaction', async (req, res) => {
  try {
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Transaction signature is required' });
    }

    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed'
    });

    if (!transaction) {
      return res.json({ 
        confirmed: false, 
        message: 'Transaction not found or not confirmed yet' 
      });
    }

    if (transaction.meta && transaction.meta.err) {
      return res.json({ 
        confirmed: false, 
        error: 'Transaction failed',
        details: transaction.meta.err 
      });
    }

    res.json({
      confirmed: true,
      signature: signature,
      slot: transaction.slot,
      blockTime: transaction.blockTime
    });

  } catch (error) {
    console.error('Transaction check error:', error);
    res.status(500).json({ error: 'Failed to check transaction status' });
  }
});

/**
 * Get Solana network info
 * GET /api/solana/network-info
 */
router.get('/network-info', async (req, res) => {
  try {
    const version = await connection.getVersion();
    const slot = await connection.getSlot();
    
    res.json({
      network: 'devnet',
      version: version,
      currentSlot: slot,
      merchantWallet: MERCHANT_WALLET
    });

  } catch (error) {
    console.error('Network info error:', error);
    res.status(500).json({ error: 'Failed to get network information' });
  }
});

module.exports = router;
