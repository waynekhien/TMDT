# TMDT - E-commerce Platform with Solana Integration

A full-stack e-commerce platform built with React.js and Node.js, featuring Solana blockchain payment integration and a comprehensive comment system.

## 🚀 Features

### Core E-commerce Features
- **Product Management**: Browse, search, and filter products
- **Shopping Cart**: Add/remove items, quantity management
- **Order Management**: Place orders, track order status
- **User Authentication**: Register, login, profile management
- **Admin Dashboard**: Product, order, and user management

### 💰 Solana Payment Integration
- **Crypto Payments**: Pay with Solana (SOL) cryptocurrency
- **QR Code Payments**: Generate QR codes for easy mobile payments
- **Transaction Verification**: Real-time payment confirmation
- **Devnet Integration**: Uses Solana devnet for testing

### 💬 Comment System (NEW!)
- **Product Reviews**: Users can comment and rate products
- **Star Rating**: 1-5 star rating system for products
- **User Ownership**: Edit/delete own comments only
- **Pagination**: Efficient loading with 5 comments per page
- **Real-time Updates**: Instant comment updates
- **Authentication Required**: Only logged-in users can comment

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **CSS3** - Styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for database operations
- **MySQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Blockchain
- **@solana/web3.js** - Solana blockchain integration
- **Solana Devnet** - Test network for development

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- Git

### 1. Clone the repository
```bash
git clone https://github.com/waynekhien/TMDT.git
cd TMDT
```

### 2. Setup Backend
```bash
cd server
npm install

# Configure database in server/config/db.config.js
# Update MySQL credentials:
# - host: 'localhost'
# - user: 'root'
# - password: '123456'
# - database: 'ecommerce_db'

# Initialize database and seed data
npm run setup
```

### 3. Setup Frontend
```bash
cd ../client
npm install
```

### 4. Environment Configuration
Create `.env` file in client directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### Start Frontend
```bash
cd client
npm start
# Client runs on http://localhost:3000
```

## 📱 Usage

### For Customers
1. **Browse Products**: View product catalog with search and filters
2. **Add to Cart**: Select products and quantities
3. **Checkout**: Choose between traditional or Solana payment
4. **Solana Payment**: Scan QR code with Solana wallet app
5. **Leave Reviews**: Comment and rate products after purchase

### For Admins
1. **Admin Login**: Use admin credentials to access dashboard
2. **Manage Products**: Add, edit, delete products
3. **Manage Orders**: View and update order status
4. **Manage Users**: View user accounts and activity

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search` - Search products

### Comments (NEW!)
- `GET /api/comments/product/:productId` - Get comments for product
- `POST /api/comments` - Create new comment (auth required)
- `PUT /api/comments/:id` - Update comment (owner only)
- `DELETE /api/comments/:id` - Delete comment (owner only)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

### Solana
- `POST /api/solana/create-payment` - Create Solana payment
- `POST /api/solana/verify-payment` - Verify payment transaction

## 🎨 Comment System Features

### User Experience
- **Intuitive Interface**: Clean, modern design matching the site theme
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Vietnamese Language**: All UI text in Vietnamese for local users
- **Real-time Feedback**: Instant updates when adding/editing comments

### Technical Features
- **Authentication Integration**: Secure comment creation and management
- **Input Validation**: Content length limits (1-1000 characters)
- **Error Handling**: Comprehensive error messages and loading states
- **Performance Optimized**: Pagination prevents slow loading with many comments

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Sequelize ORM prevents SQL injection
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🌐 Deployment

### Database Setup
1. Create MySQL database named `ecommerce_db`
2. Run `npm run init-db` to create tables
3. Run `npm run seed` to populate with sample data

### Production Considerations
- Update database credentials for production
- Configure proper CORS origins
- Set up SSL certificates
- Use production Solana network (mainnet-beta)
- Implement proper logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Solana Foundation for blockchain integration resources
- React community for excellent documentation
- All contributors who helped improve this project

---

**Note**: This project uses Solana devnet for testing. For production use, switch to mainnet-beta and update the RPC endpoints accordingly.
