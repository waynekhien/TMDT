module.exports = (sequelize, DataTypes) => {
  const SocialComment = sequelize.define('SocialComment', {
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
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'social_comments',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    repliesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'social_comments',
    timestamps: true,
    underscored: true
  });

  SocialComment.associate = (models) => {
    // SocialComment belongs to User
    SocialComment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author'
    });

    // SocialComment belongs to Post
    SocialComment.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post'
    });

    // SocialComment belongs to SocialComment (parent)
    SocialComment.belongsTo(models.SocialComment, {
      foreignKey: 'parentId',
      as: 'parent'
    });

    // SocialComment has many SocialComments (replies)
    SocialComment.hasMany(models.SocialComment, {
      foreignKey: 'parentId',
      as: 'replies'
    });

    // SocialComment has many Likes
    SocialComment.hasMany(models.Like, {
      foreignKey: 'commentId',
      as: 'likes'
    });
  };

  return SocialComment;
};
