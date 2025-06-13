import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Star,
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Smartphone,
  Laptop,
  Home as HomeIcon,
  Shirt,
  Sparkles,
  TrendingUp,
  Gift,
  Zap
} from 'lucide-react';
import SearchBar from '../../components/SearchBar/SearchBar';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);

  const heroSlides = [
    {
      title: "Khám phá thế giới mua sắm",
      subtitle: "Hàng triệu sản phẩm chất lượng với giá tốt nhất",
      cta: "Mua ngay",
      background: "bg-gradient-to-r from-blue-600 to-purple-600"
    },
    {
      title: "Siêu sale cuối năm",
      subtitle: "Giảm giá lên đến 70% cho tất cả sản phẩm",
      cta: "Khám phá ngay",
      background: "bg-gradient-to-r from-orange-500 to-red-500"
    },
    {
      title: "Công nghệ mới nhất",
      subtitle: "Cập nhật xu hướng công nghệ 2024",
      cta: "Xem thêm",
      background: "bg-gradient-to-r from-green-500 to-teal-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch sample products for search suggestions
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://dummyjson.com/products?limit=50');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="modern-home">
      {/* Hero Section với Carousel */}
      <section className="hero-carousel">
        <div className="relative h-96 md:h-[500px] overflow-hidden rounded-2xl mx-4 md:mx-8 mt-4">
          {heroSlides.map((slide, index) => (
            <motion.div
              key={index}
              className={`absolute inset-0 ${slide.background} flex items-center justify-center text-white`}
              initial={{ opacity: 0, x: 100 }}
              animate={{
                opacity: currentSlide === index ? 1 : 0,
                x: currentSlide === index ? 0 : 100
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center px-6 max-w-4xl">
                <motion.h1
                  className="text-4xl md:text-6xl font-bold mb-4 font-display"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {slide.title}
                </motion.h1>
                <motion.p
                  className="text-lg md:text-xl mb-8 opacity-90"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {slide.subtitle}
                </motion.p>
                <motion.button
                  className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate('/products')}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {slide.cta} <ArrowRight className="inline ml-2" size={20} />
                </motion.button>
              </div>
            </motion.div>
          ))}

          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="search-section py-8 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            data={products}
            showSuggestions={true}
            maxSuggestions={6}
            className="home-search"
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display">
              Danh mục nổi bật
            </h2>
            <p className="text-gray-600 text-lg">Khám phá các sản phẩm theo danh mục</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Điện tử', icon: Smartphone, color: 'from-blue-500 to-blue-600', items: '1,234' },
              { name: 'Thời trang', icon: Shirt, color: 'from-pink-500 to-pink-600', items: '2,567' },
              { name: 'Gia dụng', icon: HomeIcon, color: 'from-green-500 to-green-600', items: '890' },
              { name: 'Laptop', icon: Laptop, color: 'from-purple-500 to-purple-600', items: '456' },
              { name: 'Làm đẹp', icon: Sparkles, color: 'from-yellow-500 to-yellow-600', items: '1,123' },
              { name: 'Thể thao', icon: TrendingUp, color: 'from-red-500 to-red-600', items: '678' },
              { name: 'Quà tặng', icon: Gift, color: 'from-indigo-500 to-indigo-600', items: '234' },
              { name: 'Khuyến mãi', icon: Zap, color: 'from-orange-500 to-orange-600', items: '999' }
            ].map((category, index) => (
              <motion.div
                key={category.name}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/products?category=${category.name}`)}
              >
                <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 text-white text-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <category.icon size={40} className="mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.items} sản phẩm</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Miễn phí vận chuyển', desc: 'Đơn hàng từ 500k' },
              { icon: Shield, title: 'Bảo hành chính hãng', desc: 'Cam kết 100%' },
              { icon: RotateCcw, title: 'Đổi trả dễ dàng', desc: 'Trong vòng 30 ngày' },
              { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Tư vấn miễn phí' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-primary-600" size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="offers-section py-12 px-4 md:px-8 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              className="text-white"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Siêu sale cuối năm
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Giảm giá lên đến 70% cho hàng ngàn sản phẩm
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate('/products')}
                >
                  Mua ngay <ArrowRight className="inline ml-2" size={20} />
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300">
                  Xem thêm
                </button>
              </div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8">
                <div className="text-6xl font-bold text-white mb-2">70%</div>
                <div className="text-xl text-white/90">Giảm giá tối đa</div>
                <div className="mt-4 text-sm text-white/80">
                  *Áp dụng cho sản phẩm được chọn
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section py-12 px-4 md:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
              Đăng ký nhận tin khuyến mãi
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Nhận thông báo về các ưu đãi đặc biệt và sản phẩm mới nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-6 py-4 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="bg-primary-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-primary-700 transition-colors duration-300">
                Đăng ký
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
