const Etudiant = require("../models/Etudiant");
const Tuteur = require("../models/Tuteur");
const Sujet = require("../models/Sujet");
const Groupe = require("../models/Groupe");
const { sequelize } = require('../database');

class EtudiantRepository {
  constructor() {
    this.Etudiant = Etudiant;
    this.Groupe = Groupe;
    this.Tuteur = Tuteur;
    this.Sujet = Sujet;
  }

  async addEtudiant(data) {
    const existing = await Etudiant.findByPk(data.idEtudiant);
    if (existing) throw new Error("Cet ID étudiant existe déjà");
    return await Etudiant.create(data);
  }

  async getEtudiantById(id) {
    return await Etudiant.findByPk(id);
  }

  async getAllEtudiants() {
    return await Etudiant.findAll({
      order: [
        ['nom', 'ASC'],
        ['prenom', 'ASC'],
      ],
    });
  }

  async updateEtudiant(id, data) {
    return await Etudiant.update(data, { where: { idEtudiant: id } });
  }

  async deleteEtudiant(id) {
    return await Etudiant.destroy({ where: { idEtudiant: id } });
  }

  async addManyEtudiants(students) {
    return await Etudiant.bulkCreate(students);
  }

  async getAllEmails() {
    return await Etudiant.findAll({
      order: [
        ['nom', 'ASC'],
        ['prenom', 'ASC'],
      ],
      attributes: ['email'],
    });
  }

  async findAllWithoutGroup(year = new Date().getFullYear()) {
    return await Etudiant.findAll({
      order: [
        ['nom', 'ASC'],
        ['prenom', 'ASC'],
      ],
      where: { 
        idGroupe: null,
        annee: year
      },
    });
  }
  async updateGroup(idEtudiant, idGroupe) {
    return await Etudiant.update({ idGroupe }, { where: { idEtudiant } });
  }

  async updateEtudiantGroupe(newGroupeId, oldGroupeId) {
    try {
      const result = await Etudiant.update(
        { idGroupe: newGroupeId },
        { where: { idGroupe: oldGroupeId } }
      );
      return result;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des étudiants:", error);
      throw error;
    }
  }

  async updateEtudiantsByGroupe(idGroupe, data) {
    return await Etudiant.update(data, { where: { idGroupe: idGroupe } });
  }

  async removeStudentFromGroupe(idGroupe) {
    return await Etudiant.update(
      { idGroupe: null },
      { where: { idGroupe: idGroupe } }
    );
  }

  async findGroupeByIdst(idGroupe) {
    try {
      const groupe = await this.Groupe.findByPk(idGroupe, {
        include: [
          { model: this.Etudiant, as: 'etudiants' },
          { model: this.Tuteur, as: 'tuteur' },
          { model: this.Sujet, as: 'sujet' },
        ],
      });
      if (!groupe) return null;
      return groupe;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du groupe par ID: ${error.message}`);
    }
  }
    async addStudentsToGroup(groupId, studentIds, transaction = null) {
      const options = {};
      if (transaction) options.transaction = transaction;
      
      await this.db.Etudiant.update(
        { idGroupe: groupId },
        { where: { idEtudiant: studentIds }, ...options }
      );}

      async getEtudiantByUserId(user_id) {
        try {
          const query = `
            SELECT 
              e.*, 
              g.nomGroupe, 
              t.idTuteur,
              t.nom AS nomTuteur, 
              t.prenom AS prenomTuteur, 
              s.idSujet,
              s.titre AS titreSujet,
              Encadrant.idEncadrant,
              Encadrant.nom AS nomEncadrant,
              Encadrant.prenom AS prenomEncadrant,
              GROUP_CONCAT(CONCAT(e2.nom, ' ', e2.prenom) SEPARATOR ', ') AS autresEtudiants
            FROM Etudiant e
            LEFT JOIN Groupe g ON e.idGroupe = g.idGroupe
            LEFT JOIN Tuteur t ON g.idTuteur = t.idTuteur
            LEFT JOIN Sujet s ON g.idSujet = s.idSujet
            LEFT JOIN Encadrant ON s.idEncadrant = Encadrant.idEncadrant
            LEFT JOIN Etudiant e2 ON g.idGroupe = e2.idGroupe AND e2.idEtudiant != e.idEtudiant
            WHERE e.idEtudiant = :user_id
            GROUP BY e.idEtudiant;
          `;
      
          const [results] = await sequelize.query(query, {
            replacements: { user_id },
            type: sequelize.QueryTypes.SELECT,
          });
      
          if (!results) {
            throw new Error("Étudiant non trouvé");
          }
      
          const etudiant = {
            idEtudiant: results.idEtudiant,
            nom: results.nom,
            prenom: results.prenom,
            email: results.email,
            annee: results.annee,
            classe: results.classe,
            filiere: results.filiere,
            idGroupe: results.idGroupe,
            groupe: {
              idGroupe: results.idGroupe,
              nomGroupe: results.nomGroupe,
              tuteur: {
                idTuteur: results.idTuteur,
                nom: results.nomTuteur,
                prenom: results.prenomTuteur,
              },
              sujet: {
                idSujet: results.idSujet,
                titre: results.titreSujet,
                encadrant: results.idEncadrant
                  ? {
                      idEncadrant: results.idEncadrant,
                      nom: results.nomEncadrant,
                      prenom: results.prenomEncadrant,
                    }
                  : null},
                etudiants: results.autresEtudiants
                  ? results.autresEtudiants.split(', ').map((nomComplet) => {
                      const [nom, prenom] = nomComplet.split(' ');
                      return { nom, prenom };
                    })
                  : [],
              },
          };
          
          return etudiant;
          
        } catch (error) {
          console.error("Erreur lors de la récupération des informations de l'étudiant:", error);
          throw new Error(`Erreur lors de la récupération des informations de l'étudiant: ${error.message}`);
        }
      }     
}

module.exports = new EtudiantRepository();