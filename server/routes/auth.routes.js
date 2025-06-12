const express = require('express');
const router = express.Router();
const { sign } = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { validateToken } = require('../middleware/auth.middleware');
const { Op } = require('sequelize');

// Constants
const JWT_SECRET = "importantsecure";
const JWT_EXPIRES_IN = '24h';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    
    const user = await User.create({ username, email, password });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API đăng nhập
router.post('/login', async (req, res) => {
  try {
      const {username, password} = req.body;
      
      // Tìm user theo username
      const user = await User.findOne({ where: { username: username } });
      
      // Nếu không tìm thấy user
      if (!user) {
          return res.status(404).json({ error: "Người dùng không tồn tại" });
      }
      
      // So sánh password
      const match = await bcrypt.compare(password, user.password);
      
      // Nếu password không khớp
      if (!match) {
          return res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
      }
      
      // Tạo token
      const accessToken = sign(
          { username: user.username, id: user.id },
          "importantsecure",
          { expiresIn: '24h' }
      );        // Trả về token và thông tin user
      res.status(200).json({
          accessToken: accessToken,
          user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role // Thêm role vào response
          }
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Giữ nguyên các route khác
router.get('/auth', validateToken, (req, res) => {
  res.json(req.user);
});

router.get('/auth', validateToken, (req, res) => {
    res.json(req.user);
});

// Get user basic info
// router.get('/basicinfo/:id', async (req, res) => {
//   try {
//     const id = req.params.id;
//     const basicInfo = await User.findByPk(id, {
//       attributes: {
//         exclude: ['password']
//       }
//     });
    
//     if (!basicInfo) {
//       return res.status(404).json({ error: 'User not found' });
//     }
    
//     res.json(basicInfo);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Change password
router.put('/changepassword', validateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findOne({ where: { email: req.user.email } });
    
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.json({ error: 'Wrong Password Entered' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hash },
      { where: { id: user.id } }
    );
    
    res.json({ message: 'Password Changed Successfully' });
  } catch (error) {
    res.json({ error: 'Error changing password' });
  }
});

// Thêm API tạo admin (chỉ dùng trong môi trường phát triển)
router.post('/create-admin', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Kiểm tra user đã tồn tại chưa
    const userExists = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });
    
    if (userExists) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Tạo admin user
    const user = await User.create({
      username,
      email,
      password,
      role: 'admin'
    });
    
    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
