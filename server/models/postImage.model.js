module.exports = (sequelize, DataTypes) => {
  const PostImage = sequelize.define('PostImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'post_images',
    timestamps: true,
    underscored: true
  });

  PostImage.associate = (models) => {
    // PostImage belongs to Post
    PostImage.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post'
    });
  };

  return PostImage;
};
