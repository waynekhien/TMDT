module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    taggedUsers: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    sharesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'posts',
    timestamps: true,
    underscored: true
  });

  Post.associate = (models) => {
    // Post belongs to User
    Post.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author'
    });

    // Post has many Likes
    Post.hasMany(models.Like, {
      foreignKey: 'postId',
      as: 'likes'
    });

    // Post has many SocialComments
    Post.hasMany(models.SocialComment, {
      foreignKey: 'postId',
      as: 'socialComments'
    });

    // Post has many PostImages
    Post.hasMany(models.PostImage, {
      foreignKey: 'postId',
      as: 'images'
    });
  };

  return Post;
};
