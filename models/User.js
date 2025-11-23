const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Username for login
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    // Simple password (can be hashed later)
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    // Optional display name
    profileName: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // Track last logged user
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users'
  });

  return User;
};
