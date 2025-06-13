const sequelize = require('../config/db.config');

async function addSocialFields() {
  try {
    console.log('Adding social media fields to users table...');

    // Add new columns to users table one by one
    const columns = [
      'profile_picture VARCHAR(255)',
      'cover_photo VARCHAR(255)',
      'bio TEXT',
      'website VARCHAR(255)',
      'is_private BOOLEAN DEFAULT FALSE',
      'followers_count INT DEFAULT 0',
      'following_count INT DEFAULT 0',
      'posts_count INT DEFAULT 0'
    ];

    for (const column of columns) {
      try {
        await sequelize.query(`ALTER TABLE users ADD COLUMN ${column}`);
        console.log(`Added column: ${column.split(' ')[0]}`);
      } catch (error) {
        if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column ${column.split(' ')[0]} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log('Social media fields added successfully!');

    // Verify the changes
    const [results] = await sequelize.query("DESCRIBE users");
    console.log('\nUpdated table structure:');
    results.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

addSocialFields();
