const { User } = require('./models');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.toJSON());
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      fullName: 'Test Admin'
    });
    
    console.log('Admin user created successfully:', {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role
    });
    
    // Check if test user already exists
    const existingTest = await User.findOne({ where: { username: 'test' } });
    if (!existingTest) {
      // Create test user
      const testHashedPassword = await bcrypt.hash('test123', 10);
      const testUser = await User.create({
        username: 'test',
        email: 'test@test.com',
        password: testHashedPassword,
        role: 'user',
        fullName: 'Test User'
      });
      
      console.log('Test user created successfully:', {
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role
      });
    } else {
      console.log('Test user already exists:', {
        id: existingTest.id,
        username: existingTest.username,
        email: existingTest.email,
        role: existingTest.role
      });
    }
    
  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

createTestUser();
