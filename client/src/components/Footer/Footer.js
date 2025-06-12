import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Heart,
  ShoppingBag,
  CreditCard,
  Truck,
  Shield,
  Clock,
  Globe
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Company Info Section */}
          <div className="footer-section company-info">
            <div className="footer-logo">
              <ShoppingBag size={32} />
              <h3>TMDT Store</h3>
            </div>
            <p className="company-description">
              Cửa hàng thương mại điện tử hàng đầu, mang đến trải nghiệm mua sắm tuyệt vời 
              với sản phẩm chất lượng cao và dịch vụ khách hàng xuất sắc.
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <MapPin size={16} />
                <span>Số 10, Ngõ 7, Phùng Khoang</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+84 (0) 947167310</span>
              </div>
              <div className="contact-item">
                <Mail size={16} />
                <span>khien23092003@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="footer-section">
            <h4>Liên kết nhanh</h4>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/products">Sản phẩm</Link></li>
              <li><Link to="/categories">Danh mục</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Customer Services Section */}
          <div className="footer-section">
            <h4>Dịch vụ khách hàng</h4>
            <ul className="footer-links">
              <li><Link to="/orders">Đơn hàng của tôi</Link></li>
              <li><Link to="/cart">Giỏ hàng</Link></li>
              <li><Link to="/profile">Tài khoản</Link></li>
              <li><Link to="/help">Trợ giúp</Link></li>
              <li><Link to="/return-policy">Chính sách đổi trả</Link></li>
            </ul>
          </div>

          {/* Policies Section */}
          <div className="footer-section">
            <h4>Chính sách</h4>
            <ul className="footer-links">
              <li><Link to="/privacy-policy">Bảo mật thông tin</Link></li>
              <li><Link to="/terms-of-service">Điều khoản dịch vụ</Link></li>
              <li><Link to="/shipping-policy">Chính sách vận chuyển</Link></li>
              <li><Link to="/warranty">Bảo hành</Link></li>
              <li><Link to="/payment-methods">Phương thức thanh toán</Link></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="footer-section newsletter">
            <h4>Đăng ký nhận tin</h4>
            <p>Nhận thông tin khuyến mãi và sản phẩm mới nhất</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Nhập email của bạn"
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn">
                Đăng ký
              </button>
            </div>
            
            {/* Social Media Links */}
            <div className="social-media">
              <h5>Theo dõi chúng tôi</h5>
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                  <Facebook size={20} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <Instagram size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                  <Twitter size={20} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link youtube">
                  <Youtube size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="footer-features">
          <div className="feature-item">
            <Truck size={24} />
            <div className="feature-content">
              <h5>Miễn phí vận chuyển</h5>
              <p>Đơn hàng từ 500k</p>
            </div>
          </div>
          <div className="feature-item">
            <Shield size={24} />
            <div className="feature-content">
              <h5>Bảo hành chính hãng</h5>
              <p>Cam kết 100%</p>
            </div>
          </div>
          <div className="feature-item">
            <CreditCard size={24} />
            <div className="feature-content">
              <h5>Thanh toán an toàn</h5>
              <p>Bảo mật SSL</p>
            </div>
          </div>
          <div className="feature-item">
            <Clock size={24} />
            <div className="feature-content">
              <h5>Hỗ trợ 24/7</h5>
              <p>Luôn sẵn sàng</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <h5>Phương thức thanh toán</h5>
          <div className="payment-icons">
            <div className="payment-icon">VISA</div>
            <div className="payment-icon">MASTERCARD</div>
            <div className="payment-icon">MOMO</div>
            <div className="payment-icon">ZALOPAY</div>
            <div className="payment-icon">COD</div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>
              © {currentYear} TMDT Store. Tất cả quyền được bảo lưu. 
              Made with <Heart size={14} className="heart-icon" /> by ABC
            </p>
          </div>
          
          <div className="footer-bottom-links">
            <Link to="/sitemap">
              <Globe size={16} />
              Sơ đồ trang web
            </Link>
            <span className="divider">|</span>
            <Link to="/accessibility">Hỗ trợ tiếp cận</Link>
            <span className="divider">|</span>
            <Link to="/cookies">Chính sách Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
