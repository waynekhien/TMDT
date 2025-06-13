import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

/**
 * Advanced search service with multiple search strategies
 */
class SearchService {
  constructor() {
    this.searchCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Normalize text for better matching
   */
  normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s]/g, ' ') // Replace special chars with space
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Calculate similarity score between two strings
   */
  calculateSimilarity(str1, str2) {
    const s1 = this.normalizeText(str1);
    const s2 = this.normalizeText(str2);
    
    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    // Exact substring match gets high score
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Levenshtein distance for fuzzy matching
    const matrix = [];
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLength = Math.max(s1.length, s2.length);
    return 1 - matrix[s2.length][s1.length] / maxLength;
  }

  /**
   * Score a product based on search query
   */
  scoreProduct(product, query) {
    const normalizedQuery = this.normalizeText(query);
    const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
    
    let totalScore = 0;
    let maxScore = 0;

    // Fields to search with different weights
    const searchFields = [
      { field: 'title', weight: 3 },
      { field: 'brand', weight: 2 },
      { field: 'category', weight: 1.5 },
      { field: 'description', weight: 1 },
      { field: 'tags', weight: 1 }
    ];

    searchFields.forEach(({ field, weight }) => {
      const fieldValue = product[field];
      if (!fieldValue) return;

      const fieldText = Array.isArray(fieldValue) 
        ? fieldValue.join(' ') 
        : String(fieldValue);

      // Exact match bonus
      if (this.normalizeText(fieldText).includes(normalizedQuery)) {
        totalScore += weight * 2;
      }

      // Word-by-word matching
      queryWords.forEach(word => {
        const similarity = this.calculateSimilarity(fieldText, word);
        if (similarity > 0.6) {
          totalScore += similarity * weight;
        }
      });

      maxScore += weight * queryWords.length * 2;
    });

    // Price range matching (if query contains numbers)
    const priceMatch = query.match(/(\d+)/);
    if (priceMatch && product.price) {
      const queryPrice = parseInt(priceMatch[1]);
      const productPrice = product.price;
      const priceDiff = Math.abs(queryPrice - productPrice) / Math.max(queryPrice, productPrice);
      if (priceDiff < 0.3) {
        totalScore += 1;
        maxScore += 1;
      }
    }

    return maxScore > 0 ? totalScore / maxScore : 0;
  }

  /**
   * Search products with advanced scoring
   */
  async searchProducts(query, options = {}) {
    const {
      limit = 20,
      offset = 0,
      category = '',
      minPrice = 0,
      maxPrice = Infinity,
      sortBy = 'relevance',
      includeOutOfStock = true
    } = options;

    // Check cache first
    const cacheKey = JSON.stringify({ query, options });
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Get all products (in real app, this would be server-side)
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: {
          limit: 100, // Get more products for better search
          skip: 0
        }
      });

      let products = response.data.products || [];

      // Apply filters
      if (category) {
        products = products.filter(p => 
          this.normalizeText(p.category).includes(this.normalizeText(category))
        );
      }

      if (minPrice > 0 || maxPrice < Infinity) {
        products = products.filter(p => 
          p.price >= minPrice && p.price <= maxPrice
        );
      }

      if (!includeOutOfStock) {
        products = products.filter(p => p.stock > 0);
      }

      // Score and filter by relevance
      if (query.trim()) {
        products = products
          .map(product => ({
            ...product,
            _searchScore: this.scoreProduct(product, query)
          }))
          .filter(product => product._searchScore > 0.1) // Minimum relevance threshold
          .sort((a, b) => {
            if (sortBy === 'relevance') {
              return b._searchScore - a._searchScore;
            } else if (sortBy === 'price_asc') {
              return a.price - b.price;
            } else if (sortBy === 'price_desc') {
              return b.price - a.price;
            } else if (sortBy === 'rating') {
              return (b.rating || 0) - (a.rating || 0);
            } else if (sortBy === 'newest') {
              return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
            return 0;
          });
      }

      // Pagination
      const total = products.length;
      const paginatedProducts = products.slice(offset, offset + limit);

      const result = {
        products: paginatedProducts,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        query,
        suggestions: this.generateSuggestions(query, products)
      };

      // Cache result
      this.searchCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Lỗi khi tìm kiếm sản phẩm');
    }
  }

  /**
   * Generate search suggestions
   */
  generateSuggestions(query, allProducts) {
    if (!query.trim()) return [];

    const suggestions = new Set();
    const normalizedQuery = this.normalizeText(query);

    allProducts.forEach(product => {
      // Brand suggestions
      if (product.brand && this.normalizeText(product.brand).includes(normalizedQuery)) {
        suggestions.add(product.brand);
      }

      // Category suggestions
      if (product.category && this.normalizeText(product.category).includes(normalizedQuery)) {
        suggestions.add(product.category);
      }

      // Title word suggestions
      if (product.title) {
        const words = this.normalizeText(product.title).split(' ');
        words.forEach(word => {
          if (word.length > 2 && word.includes(normalizedQuery)) {
            suggestions.add(word);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSearchSuggestions(query, limit = 8) {
    if (!query.trim()) return [];

    try {
      const result = await this.searchProducts(query, { limit: 50 });
      return result.products.slice(0, limit);
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }

  /**
   * Clear search cache
   */
  clearCache() {
    this.searchCache.clear();
  }
}

// Export singleton instance
export const searchService = new SearchService();

// Export individual functions for backward compatibility
export const searchProducts = (query, options) => searchService.searchProducts(query, options);
export const getSearchSuggestions = (query, limit) => searchService.getSearchSuggestions(query, limit);
