module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending'
    },
    solanaSignature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    solanaReference: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true, // Enable createdAt and updatedAt
    underscored: true // Use snake_case for database columns
  });

  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    timestamps: true, // Enable createdAt and updatedAt
    underscored: true // Use snake_case for database columns
  });

  // Define associate functions
  Order.associate = function(models) {
    Order.belongsTo(models.User, { as: 'User', foreignKey: 'userId' });
    Order.hasMany(models.OrderItem, { as: 'OrderItems', foreignKey: 'orderId' });
  };

  OrderItem.associate = function(models) {
    OrderItem.belongsTo(models.Order, { as: 'Order', foreignKey: 'orderId' });
    OrderItem.belongsTo(models.Product, { as: 'Product', foreignKey: 'productId' });
  };

  return { Order, OrderItem };
};
