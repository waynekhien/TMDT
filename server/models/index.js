'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const sequelize = require('../config/db.config');
const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const modelExports = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    
    // Handle models that export multiple models (like cart.model.js and order.model.js)
    if (typeof modelExports === 'object' && !modelExports.name) {
      Object.keys(modelExports).forEach(modelName => {
        db[modelName] = modelExports[modelName];
      });
    } else {
      // Handle single model exports
      db[modelExports.name] = modelExports;
    }
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
