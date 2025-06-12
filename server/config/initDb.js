const mysql = require('mysql2/promise');
const sequelize = require('./db.config');

async function initializeDatabase() {
    try {
        // Create connection to MySQL server
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456'
        });        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS ecommerce_db');// Close the connection        await connection.end();
        
        // Connect to the database to clean up indexes
        await sequelize.authenticate();
        
        // Drop existing tables first
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        try {
            // Check if users table exists and clean up indexes
            const [tables] = await sequelize.query("SHOW TABLES LIKE 'users'");            if (tables.length > 0) {
                // Get all non-primary indexes
                const [indexes] = await sequelize.query(
                    "SHOW INDEXES FROM users WHERE Key_name != 'PRIMARY'"
                );
                  // Drop all non-primary indexes
                for (const index of indexes) {
                    try {
                        await sequelize.query(`DROP INDEX \`${index.Key_name}\` ON users`);
                    } catch (err) {
                        // Index might not exist or already dropped
                    }
                }
            }        } catch (error) {
            // No existing users table found or error cleaning indexes
        }
        
        await sequelize.sync({ force: true });        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

// Run if this file is run directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;
