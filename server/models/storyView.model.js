module.exports = (sequelize, DataTypes) => {
  const StoryView = sequelize.define('StoryView', {
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
    storyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stories',
        key: 'id'
      }
    },
    viewedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'story_views',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'story_id']
      }
    ]
  });

  StoryView.associate = (models) => {
    // StoryView belongs to User
    StoryView.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'viewer'
    });

    // StoryView belongs to Story
    StoryView.belongsTo(models.Story, {
      foreignKey: 'storyId',
      as: 'story'
    });
  };

  return StoryView;
};
