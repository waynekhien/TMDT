const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    coverPhoto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followersCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    followingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    postsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);        }
      }
    },
    timestamps: true, // Enable createdAt and updatedAt
    underscored: true // Use snake_case for User model to match database
  });

  User.associate = function(models) {
    // E-commerce associations
    User.hasOne(models.Cart, {
      as: 'Cart',
      foreignKey: 'userId'
    });

    User.hasMany(models.Order, {
      as: 'Orders',
      foreignKey: 'userId'
    });

    User.hasMany(models.Comment, {
      as: 'Comments',
      foreignKey: 'userId'
    });

    // Social media associations
    User.hasMany(models.Post, {
      as: 'Posts',
      foreignKey: 'userId'
    });

    User.hasMany(models.Story, {
      as: 'Stories',
      foreignKey: 'userId'
    });

    User.hasMany(models.SocialComment, {
      as: 'SocialComments',
      foreignKey: 'userId'
    });

    User.hasMany(models.Like, {
      as: 'Likes',
      foreignKey: 'userId'
    });

    User.hasMany(models.StoryView, {
      as: 'StoryViews',
      foreignKey: 'userId'
    });

    // Following relationships
    User.hasMany(models.Follow, {
      as: 'Following',
      foreignKey: 'followerId'
    });

    User.hasMany(models.Follow, {
      as: 'Followers',
      foreignKey: 'followingId'
    });
  };

  return User;
};
