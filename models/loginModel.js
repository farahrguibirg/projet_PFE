// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DataTypes } = require('sequelize');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sequelize } = require('../database');

const Login = sequelize.define('Login', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    user_id: {
        type:  DataTypes.STRING(50),
        allowNull: false
    },
    email: { 
        type: DataTypes.STRING(100), 
        allowNull: false, 
        unique: true 
    },
    password: { 
        type: DataTypes.STRING(255), // Augmenté pour stocker un mot de passe haché
        allowNull: false 
    },
    role: { 
        type: DataTypes.ENUM('etudiant', 'tuteur', 'encadrant', 'responsableFiliere'), 
        allowNull: false 
    }
}, {  
    timestamps: false, // Désactiver createdAt et updatedAt
    tableName: 'Login' // Nom exact de la table dans MySQL
});

module.exports = Login;