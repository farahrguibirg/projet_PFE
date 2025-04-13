// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DataTypes } = require('sequelize');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sequelize } = require('../database');
const Encadrant = require('./Encadrant');
const Sujet = sequelize.define('Sujet', {
  idSujet: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true,
    allowNull: false 
  },
  titre: { type: DataTypes.STRING(50), allowNull: false },
  
  idEncadrant: { 
    type: DataTypes.STRING(50), 
    allowNull: false,
    references: {
      model: 'Encadrant',
      key: 'idEncadrant',
    },
  },
  
  annee: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: () => new Date().getFullYear() // Default to current year
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  }
}, {  
  timestamps: false,
  tableName: 'Sujet' 
});
Sujet.belongsTo(Encadrant, { foreignKey: 'idEncadrant' });
module.exports = Sujet;