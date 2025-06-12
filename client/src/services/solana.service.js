import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import QRCode from 'qrcode';
import { API_BASE_URL } from '../constants/api';
import axios from 'axios';

// Solana devnet configuration
const SOLANA_NETWORK = 'devnet';
const connection = new Connection(`https://api.${SOLANA_NETWORK}.solana.com`);

// Merchant wallet address (provided devnet address)
const MERCHANT_WALLET = '9nx8nrbahTd1ujgt99nWAc58PGXbr2vjPSAXQWxdnqyQ';

/**
 * Create a Solana Pay QR code for payment
 * @param {number} amount - Amount in USD
 * @param {string} orderId - Order ID for reference
 * @returns {Promise<{qrCode: string, paymentUrl: string, reference: string}>}
 */
export const createSolanaPayment = async (amount, orderId) => {
  try {
    console.log('Creating Solana payment for amount:', amount, 'orderId:', orderId);

    // Validate inputs
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!orderId) {
      throw new Error('Invalid order ID');
    }

    // Convert USD to SOL (simplified conversion - in production, use real-time rates)
    const solAmount = amount / 100; // Assuming 1 SOL = $100 for demo purposes
    console.log('SOL amount:', solAmount);

    // Validate merchant wallet
    let merchantPublicKey;
    try {
      merchantPublicKey = new PublicKey(MERCHANT_WALLET);
      console.log('Merchant wallet validated:', merchantPublicKey.toString());
    } catch (error) {
      throw new Error('Invalid merchant wallet address');
    }

    // Generate a unique reference keypair for this payment
    const referenceKeypair = Keypair.generate();
    const reference = referenceKeypair.publicKey;
    console.log('Generated reference:', reference.toString());

    // Create a simple Solana Pay URL manually
    const recipient = MERCHANT_WALLET;
    const paymentUrl = `solana:${recipient}?amount=${solAmount}&reference=${reference.toString()}&label=${encodeURIComponent('E-commerce Payment')}&message=${encodeURIComponent(`Payment for Order #${orderId}`)}`;

    console.log('Payment URL:', paymentUrl);

    // Generate QR code with error handling
    let qrCode;
    try {
      qrCode = await QRCode.toDataURL(paymentUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('QR code generated successfully');
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
      throw new Error(`QR code generation failed: ${qrError.message}`);
    }

    return {
      qrCode,
      paymentUrl: paymentUrl,
      reference: reference.toString(),
      solAmount,
      recipient: MERCHANT_WALLET
    };
  } catch (error) {
    console.error('Error creating Solana payment:', error);
    console.error('Error details:', error.message, error.stack);
    throw new Error(`Failed to create payment QR code: ${error.message}`);
  }
};

/**
 * Check payment status by monitoring the reference address
 * @param {string} reference - Reference public key as string
 * @param {number} expectedAmount - Expected amount in SOL
 * @returns {Promise<{confirmed: boolean, signature?: string}>}
 */
export const checkPaymentStatus = async (reference, expectedAmount) => {
  try {
    const referencePublicKey = new PublicKey(reference);
    const merchantPublicKey = new PublicKey(MERCHANT_WALLET);
    
    // Get recent transactions for the reference address
    const signatures = await connection.getSignaturesForAddress(referencePublicKey, {
      limit: 10
    });

    for (const signatureInfo of signatures) {
      const transaction = await connection.getTransaction(signatureInfo.signature, {
        commitment: 'confirmed'
      });

      if (transaction && transaction.meta && !transaction.meta.err) {
        // Check if this transaction involves our merchant wallet
        const accountKeys = transaction.transaction.message.accountKeys;
        const merchantIndex = accountKeys.findIndex(key => 
          key.equals(merchantPublicKey)
        );

        if (merchantIndex !== -1) {
          // Check the amount transferred
          const postBalance = transaction.meta.postBalances[merchantIndex];
          const preBalance = transaction.meta.preBalances[merchantIndex];
          const transferredAmount = (postBalance - preBalance) / LAMPORTS_PER_SOL;

          if (Math.abs(transferredAmount - expectedAmount) < 0.001) { // Allow small precision differences
            return {
              confirmed: true,
              signature: signatureInfo.signature,
              amount: transferredAmount
            };
          }
        }
      }
    }

    return { confirmed: false };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return { confirmed: false };
  }
};

/**
 * Verify payment with backend
 * @param {string} orderId - Order ID
 * @param {string} signature - Transaction signature
 * @param {string} reference - Payment reference
 * @returns {Promise<any>}
 */
export const verifyPaymentWithBackend = async (orderId, signature, reference) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(`${API_BASE_URL}/api/solana/verify-payment`, {
      orderId,
      signature,
      reference
    }, {
      headers: {
        'accessToken': token,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get current SOL price in USD (mock function for demo)
 * In production, integrate with a real price API
 * @returns {Promise<number>}
 */
export const getSolPrice = async () => {
  try {
    // Mock price - in production, use CoinGecko, CoinMarketCap, or similar API
    return 100; // $100 per SOL for demo
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    return 100; // Fallback price
  }
};

const solanaService = {
  createSolanaPayment,
  checkPaymentStatus,
  verifyPaymentWithBackend,
  getSolPrice
};

export default solanaService;
