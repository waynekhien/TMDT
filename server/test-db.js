const { User } = require('./models');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test finding a user
    const users = await User.findAll({
      limit: 1,
      attributes: ['id', 'username', 'email', 'profilePicture', 'coverPhoto']
    });
    
    console.log('Database connection successful!');
    console.log('Sample user data:', users[0] ? users[0].toJSON() : 'No users found');
    
    // Test if profilePicture and coverPhoto fields exist
    if (users[0]) {
      console.log('User fields check:');
      console.log('- profilePicture field exists:', users[0].profilePicture !== undefined);
      console.log('- coverPhoto field exists:', users[0].coverPhoto !== undefined);
    }
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase();
