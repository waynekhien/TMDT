module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define('Follow', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
      defaultValue: 'accepted'
    }
  }, {
    tableName: 'follows',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['follower_id', 'following_id']
      }
    ]
  });

  Follow.associate = (models) => {
    // Follow belongs to User (follower)
    Follow.belongsTo(models.User, {
      foreignKey: 'followerId',
      as: 'follower'
    });

    // Follow belongs to User (following)
    Follow.belongsTo(models.User, {
      foreignKey: 'followingId',
      as: 'following'
    });
  };

  return Follow;
};
