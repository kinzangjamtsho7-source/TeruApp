const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'college_feedback',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'fuckyuhbitxh',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

module.exports = sequelize;
