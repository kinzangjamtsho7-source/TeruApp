/**
 * Helper script to create the database if it doesn't exist
 * Run this once before starting the server: node scripts/create-db.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME || 'college_feedback';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'fuckyuhbitxh';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

async function createDatabase() {
  // Connect to postgres database (default database) to create our database
  const sequelize = new Sequelize('postgres', DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const [results] = await sequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}';`
    );

    if (results.length > 0) {
      console.log(`ℹ️  Database '${DB_NAME}' already exists`);
    } else {
      // Create database
      await sequelize.query(`CREATE DATABASE ${DB_NAME};`);
      console.log(`✅ Database '${DB_NAME}' created successfully`);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('\n💡 Make sure PostgreSQL is running and credentials are correct.');
      console.error(`💡 Connection details: ${DB_USER}@${DB_HOST}:${DB_PORT}`);
    }
    
    await sequelize.close();
    process.exit(1);
  }
}

createDatabase();

