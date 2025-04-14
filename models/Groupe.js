
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const Etudiant = require('./Etudiant');
const Tuteur = require('./Tuteur');
const Sujet = require('./Sujet');

const Groupe = sequelize.define('Groupe', {
  idGroupe: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nomGroupe: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  annee: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  idTuteur: {
    type: DataTypes.STRING(50),
    allowNull: true,
    references: {
      model: Tuteur,
      key: 'idTuteur',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  idSujet: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Sujet,
      key: 'idSujet',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  }
}, {
  timestamps: false,
  tableName: 'Groupe'
});

// Relation un-à-plusieurs : Un groupe a plusieurs étudiants
Groupe.hasMany(Etudiant, {
  foreignKey: 'idGroupe',
  as: 'etudiants',
});

// Relation un-à-un entre Groupe et Tuteur
Groupe.belongsTo(Tuteur, {
  foreignKey: 'idTuteur',
  as: 'tuteur',
});

// Relation entre Groupe et Sujet
Groupe.belongsTo(Sujet, {
  foreignKey: 'idSujet',
  as: 'sujet',
});

module.exports = Groupe;

