const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ecommerce_db', 'root', '123456', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true, // Enable timestamps for all models
        underscored: true // Use snake_case for fields
    }
});

module.exports = sequelize;
