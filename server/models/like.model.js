module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'social_comments',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('like', 'love', 'laugh', 'angry', 'sad', 'wow'),
      defaultValue: 'like'
    }
  }, {
    tableName: 'likes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'post_id'],
        where: {
          post_id: { [sequelize.Sequelize.Op.ne]: null }
        }
      },
      {
        unique: true,
        fields: ['user_id', 'comment_id'],
        where: {
          comment_id: { [sequelize.Sequelize.Op.ne]: null }
        }
      }
    ]
  });

  Like.associate = (models) => {
    // Like belongs to User
    Like.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Like belongs to Post
    Like.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post'
    });

    // Like belongs to SocialComment
    Like.belongsTo(models.SocialComment, {
      foreignKey: 'commentId',
      as: 'comment'
    });
  };

  return Like;
};
