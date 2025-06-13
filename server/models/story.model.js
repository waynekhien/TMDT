module.exports = (sequelize, DataTypes) => {
  const Story = sequelize.define('Story', {
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
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    backgroundColor: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#ffffff'
    },
    textColor: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#000000'
    },
    viewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'stories',
    timestamps: true,
    underscored: true
  });

  Story.associate = (models) => {
    // Story belongs to User
    Story.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author'
    });

    // Story has many StoryViews
    Story.hasMany(models.StoryView, {
      foreignKey: 'storyId',
      as: 'views'
    });
  };

  return Story;
};
