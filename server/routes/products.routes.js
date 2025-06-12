const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Product } = require('../models');

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Helper function to build search conditions
const buildSearchConditions = (query) => ({
  [Op.or]: [
    { title: { [Op.like]: `%${query}%` } },
    { description: { [Op.like]: `%${query}%` } },
    { brand: { [Op.like]: `%${query}%` } },
    { category: { [Op.like]: `%${query}%` } }
  ]
});

// Helper function to validate and parse integers
const validateAndParseInt = (value, defaultValue, max = null) => {
  const parsed = parseInt(value) || defaultValue;
  return max ? Math.min(parsed, max) : Math.max(1, parsed);
};

// Get all products with pagination and search
router.get('/', async (req, res) => {
  try {
    const { 
      page = DEFAULT_PAGE, 
      limit = DEFAULT_LIMIT, 
      search = '', 
      sortBy = 'id', 
      order = 'ASC' 
    } = req.query;

    const validatedLimit = validateAndParseInt(limit, DEFAULT_LIMIT, MAX_LIMIT);
    const validatedPage = validateAndParseInt(page, DEFAULT_PAGE);
    const offset = (validatedPage - 1) * validatedLimit;
    
    const queryOptions = {
      limit: validatedLimit,
      offset,
      order: [[sortBy, order.toUpperCase()]],
      distinct: true
    };

    if (search.trim()) {
      queryOptions.where = buildSearchConditions(search.trim());
    }

    const { count, rows } = await Product.findAndCountAll(queryOptions);

    res.json({
      products: rows,
      total: count,
      page: validatedPage,
      limit: validatedLimit,
      totalPages: Math.ceil(count / validatedLimit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || req.query.keyword || '';
    
    if (!query.trim()) {
      return res.status(400).json({ 
        error: 'Search query is required' 
      });
    }
    
    const products = await Product.findAll({
      where: buildSearchConditions(query.trim())
    });

    res.json({
      products,
      total: products.length,
      query: query.trim()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category.trim()) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const products = await Product.findAll({
      where: { category: category.trim() }
    });
    
    res.json({
      products,
      total: products.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all categories with product count
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']],
      raw: true
    });

    const categoryList = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.count({
          where: { category: cat.category }
        });
        return {
          name: cat.category,
          count
        };
      })
    );

    res.json({
      categories: categoryList,
      total: categoryList.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
