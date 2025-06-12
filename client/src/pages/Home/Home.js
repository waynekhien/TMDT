import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">          <h1>Welcome to Our Store</h1>
          <p>Discover Amazing Products at Great Prices</p>
          <button className="shop-now-btn" onClick={() => navigate('/products')}>Shop Now</button>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="categories-section">
        <h2>Popular Categories</h2>
        <div className="categories-grid">          <div className="category-card electronics">
            <h3>Electronics</h3>
          </div>
          <div className="category-card fashion">
            <h3>Fashion</h3>
          </div>
          <div className="category-card home-living">
            <h3>Home & Living</h3>
          </div>
          <div className="category-card beauty">
            <h3>Beauty</h3>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="featured-products">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {/* Product cards will be mapped here */}
        </div>
      </div>

      {/* Special Offers */}
      <div className="special-offers">
        <h2>Special Offers</h2>
        <div className="offers-grid">
          <div className="offer-card">
            <div className="offer-content">
              <h3>Summer Sale</h3>
              <p>Up to 50% OFF</p>
              <button>Shop Now</button>
            </div>
          </div>
          <div className="offer-card">
            <div className="offer-content">
              <h3>New Arrivals</h3>
              <p>Check out our latest collection</p>
              <button>Explore</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
