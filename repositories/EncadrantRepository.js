// eslint-disable-next-line @typescript-eslint/no-require-imports
const Encadrant = require("../models/Encadrant");
const Sujet = require("../models/Sujet");
const { sequelize } = require('../database');
class EncadrantRepository {
  // Ajouter un encadrant
  async addEncadrant(data) {
    try {
      return await Encadrant.create(data);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'encadrant:", error);
      throw error;
    }
  }

  // Obtenir un encadrant par ID
  async getEncadrantById(id) {
    try {
      return await Encadrant.findByPk(id);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'encadrant:", error);
      throw error;
    }
  }

  // Obtenir tous les encadrants
  async getAllEncadrants() {
    try {
      return await Encadrant.findAll({
        logging: console.log, // Affiche la requête SQL
        raw: true // Retourne les données brutes
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des encadrants:", error);
      throw error;
    }
  }

  // Mettre à jour un encadrant
  async updateEncadrant(id, data) {
    try {
      const [updatedRows] = await Encadrant.update(data, { 
        where: { idEncadrant: id },
        returning: true
      });
      return updatedRows > 0 ? await this.getEncadrantById(id) : null;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'encadrant:", error);
      throw error;
    }
  }

  // Supprimer un encadrant
  async deleteEncadrant(id) {
    try {
      return await Encadrant.destroy({ where: { idEncadrant: id } });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'encadrant:", error);
      throw error;
    }
  }

 
  async addManyEncadrants(encadrants) {
    return await Encadrant.bulkCreate(encadrants);
  }
   async getAllEmails() {
    return await Encadrant.findAll({ attributes: ['email'] });
   }async getEncadrantByUserId(user_id) {
    try {
      const query = `
        SELECT 
          enc.*, 
          s.idSujet AS sujetId, 
          s.titre AS sujetTitre, 
          g.idGroupe AS groupeId, 
          g.nomGroupe AS groupeNom, 
          t.idTuteur AS tuteurId, 
          t.nom AS tuteurNom, 
          t.prenom AS tuteurPrenom,
          e.idEtudiant AS etudiantId,
          e.nom AS etudiantNom, 
          e.prenom AS etudiantPrenom
        FROM Encadrant enc
        LEFT JOIN Sujet s ON enc.idEncadrant = s.idEncadrant
        LEFT JOIN Groupe g ON s.idSujet = g.idSujet
        LEFT JOIN Tuteur t ON g.idTuteur = t.idTuteur
        LEFT JOIN Etudiant e ON g.idGroupe = e.idGroupe
        WHERE enc.idEncadrant = ?
      `;
  
      const results = await sequelize.query(query, {
        replacements: [user_id],
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (!results.length) {
        throw new Error("Encadrant non trouvé");
      }
  
      const encadrant = {
        idEncadrant: results[0].idEncadrant,
        nom: results[0].nom,
        prenom: results[0].prenom,
        email: results[0].email,
        annee: results[0].annee,
        sujets: [],
      };
  
      const sujetMap = new Map();
  
      results.forEach((row) => {
        if (!row.sujetId) return;
  
        if (!sujetMap.has(row.sujetId)) {
          sujetMap.set(row.sujetId, {
            idSujet: row.sujetId,
            titre: row.sujetTitre,
            groupes: new Map(),
          });
        }
  
        const sujet = sujetMap.get(row.sujetId);
  
        if (row.groupeId) {
          if (!sujet.groupes.has(row.groupeId)) {
            sujet.groupes.set(row.groupeId, {
              idGroupe: row.groupeId,
              nomGroupe: row.groupeNom,
              tuteur: row.tuteurId ? {
                idTuteur: row.tuteurId,
                nom: row.tuteurNom,
                prenom: row.tuteurPrenom,
              } : null,
              etudiants: [],
            });
          }
  
          const groupe = sujet.groupes.get(row.groupeId);
  
          if (row.etudiantId) {
            groupe.etudiants.push({
              idEtudiant: row.etudiantId,
              nom: row.etudiantNom,
              prenom: row.etudiantPrenom,
            });
          }
        }
      });
  
      encadrant.sujets = Array.from(sujetMap.values()).map((sujet) => ({
        ...sujet,
        groupes: Array.from(sujet.groupes.values()),
      }));
  
      return encadrant;
    } catch (error) {
      console.error("Erreur dans getEncadrantByUserId:", error);
      throw new Error(`Erreur lors de la récupération des informations de l'encadrant: ${error.message}`);
    }
  }
   async getSujetsByEncadrantId(idEncadrant) {
    try {
      const sujets = await Sujet.findAll({
        where: { idEncadrant }, // Récupérer les sujets associés à l'encadrant
        attributes: ['titre'], // Sélectionner uniquement le titre
      });
      return sujets;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des sujets : ${error.message}`);
    }
  }
  
}

module.exports = new EncadrantRepository();
