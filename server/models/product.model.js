module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    discountPercentage: {
      type: DataTypes.FLOAT
    },
    rating: {
      type: DataTypes.FLOAT
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Unbranded' // Add default value
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    }  });

  Product.associate = function(models) {
    Product.hasMany(models.CartItem, {
      as: 'CartItems',
      foreignKey: 'productId'
    });

    Product.hasMany(models.OrderItem, {
      as: 'OrderItems',
      foreignKey: 'productId'
    });

    Product.hasMany(models.Comment, {
      as: 'Comments',
      foreignKey: 'productId'
    });
  };

  return Product;
};
