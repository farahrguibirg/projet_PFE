const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');


const Etudiant = sequelize.define('Etudiant', {
  idEtudiant: { type: DataTypes.STRING(50), primaryKey: true, allowNull: false },
  nom: { type: DataTypes.STRING(50), allowNull: false },
  prenom: { type: DataTypes.STRING(50), allowNull: false },
  email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  motDePasse: { type: DataTypes.STRING, allowNull: false },
  annee: { type: DataTypes.STRING(50), allowNull: false },
  classe: { type: DataTypes.STRING(50), allowNull: false },
  filiere: { type: DataTypes.STRING(100), allowNull: false },
  idGroupe: { type: DataTypes.INTEGER, allowNull: true },
}, { timestamps: false,
  tableName: 'Etudiant' ,
  references: {
    model: 'Groupe', // The target table name (Groupe)
    key: 'idGroupe', // The column name in the Groupe table
  },
  onDelete: 'CASCADE', // Optional: defines what happens when a group is deleted
});


module.exports = Etudiant;