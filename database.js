// database.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Sequelize } = require('sequelize');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require('./config');

// Initialiser Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false, // Optionnel : désactive les logs SQL
});

// Connexion à la base de données
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion MySQL réussie');
  } catch (error) {
    console.error('Impossible de se connecter à MySQL:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
