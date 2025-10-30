const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Expense = sequelize.define('Expense', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      validate: { min: 0 }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    tableName: 'expenses'
  });

  return Expense;
};
