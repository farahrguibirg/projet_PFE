// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DataTypes } = require('sequelize');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sequelize } = require('../database'); // Assurez-vous que vous utilisez la bonne importation

const Encadrant = sequelize.define('Encadrant', {
 
  idEncadrant: { type: DataTypes.STRING(50), primaryKey: true, allowNull: false },
  nom: { type: DataTypes.STRING(50), allowNull: false },
  prenom: { type: DataTypes.STRING(50), allowNull: false },
  email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  motDePasse: { type: DataTypes.STRING, allowNull: false },
  annee: { type: DataTypes.STRING(50) },
}, {  timestamps: false,
  tableName: 'Encadrant' });

module.exports = Encadrant;