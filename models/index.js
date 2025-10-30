const sequelize = require('../config/db');
const defineUser = require('./User');
const defineExpense = require('./Expense');

const models = {};

models.User = defineUser(sequelize);
models.Expense = defineExpense(sequelize);

// Associations
models.User.hasMany(models.Expense, { foreignKey: 'userId', as: 'expenses' });
models.Expense.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  ...models
};


