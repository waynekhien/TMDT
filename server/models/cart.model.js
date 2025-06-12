module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  }, {
    tableName: 'carts',
    timestamps: true
  });

  const CartItem = sequelize.define('CartItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'cart_items',
    timestamps: true
  });

  // Define associate function
  Cart.associate = function(models) {
    Cart.belongsTo(models.User, {
      as: 'User',
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });

    Cart.hasMany(models.CartItem, {
      as: 'CartItems',
      foreignKey: 'cartId',
      onDelete: 'CASCADE'
    });
  };

  CartItem.associate = function(models) {
    CartItem.belongsTo(models.Cart, {
      as: 'Cart',
      foreignKey: 'cartId'
    });

    CartItem.belongsTo(models.Product, {
      as: 'Product',
      foreignKey: 'productId'
    });
  };

  return { Cart, CartItem };
};
