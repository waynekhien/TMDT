module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000] // Comment length between 1 and 1000 characters
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    }
  }, {
    tableName: 'comments',
    timestamps: true,
    underscored: true
  });

  Comment.associate = function(models) {
    Comment.belongsTo(models.User, {
      as: 'User',
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });

    Comment.belongsTo(models.Product, {
      as: 'Product',
      foreignKey: 'productId',
      onDelete: 'CASCADE'
    });
  };

  return Comment;
};
