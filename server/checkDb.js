const sequelize = require('./config/db.config');
const { User } = require('./models');

async function checkDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Check User table structure
    const userAttributes = User.rawAttributes;
    console.log('\nUser model attributes:');
    Object.keys(userAttributes).forEach(attr => {
      console.log(`- ${attr}: ${userAttributes[attr].type.constructor.name}`);
    });

    // Check if table exists and its structure
    const [results] = await sequelize.query("DESCRIBE users");
    console.log('\nActual database table structure:');
    results.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type}`);
    });

    // Check if we have any users
    const userCount = await User.count();
    console.log(`\nTotal users in database: ${userCount}`);

    if (userCount > 0) {
      const sampleUser = await User.findOne();
      console.log('\nSample user data:');
      console.log(JSON.stringify(sampleUser.toJSON(), null, 2));
    }

  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
