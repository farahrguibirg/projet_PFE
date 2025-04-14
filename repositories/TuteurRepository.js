// repositories/TuteurRepository.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Tuteur = require("../models/Tuteur"); // Remplace l'importation ES6 par require()
const Groupe = require("../models/Groupe");
const { sequelize } = require('../database');

class TuteurRepository {
  // Ajouter un tuteur
  async addTuteur(data) {
    return await Tuteur.create(data);
  }
  async getTuteursByYear(annee) {
    return await Tuteur.findAll({ where: { annee: annee } });
  }

  // Obtenir un tuteur par ID
  async getTuteurById(id) {
    return await Tuteur.findByPk(id);
  }

  // Obtenir tous les tuteurs
  async getAllTuteurs() {
    return await Tuteur.findAll();
  }

  // Mettre à jour un tuteur
  async updateTuteur(id, data) {
    return await Tuteur.update(data, { where: { idTuteur: id } });
  }

  // Supprimer un tuteur
  async deleteTuteur(id) {
    return await Tuteur.destroy({ where: { idTuteur: id } });
  }
  async addManyTuteurs(students) {
    return await Tuteur.bulkCreate(students);
  }
   async getAllEmails() {
    return await Tuteur.findAll({ attributes: ['email'] });
  }
  
  async isTuteurAssigned(tuteurId) {
    const groupe = await Groupe.findOne({ where: { idTuteur: tuteurId } });
    return !!groupe;
  }
    async getTuteurByUserId(user_id) {
      try {
        // Requête SQL pour récupérer les informations du tuteur, du groupe, des étudiants et du sujet
        const query = `
          SELECT 
  Tuteur.idTuteur,
  Tuteur.nom,
  Tuteur.prenom,
  Tuteur.email,
  Groupe.idGroupe,
  Groupe.nomGroupe,
  Sujet.idSujet,
  Sujet.titre,
  Encadrant.idEncadrant,
  Encadrant.nom AS nomEncadrant,
  Encadrant.prenom AS prenomEncadrant,
  Etudiant.idEtudiant,
  Etudiant.nom AS nomEtudiant,
  Etudiant.prenom AS prenomEtudiant
FROM Tuteur
LEFT JOIN Groupe ON Tuteur.idTuteur = Groupe.idTuteur
LEFT JOIN Sujet ON Groupe.idSujet = Sujet.idSujet
LEFT JOIN Encadrant ON Sujet.idEncadrant = Encadrant.idEncadrant
LEFT JOIN Etudiant ON Groupe.idGroupe = Etudiant.idGroupe
WHERE Tuteur.idTuteur = :user_id
        `;
    
        // Exécuter la requête SQL
        const results = await sequelize.query(query, {
          replacements: { user_id }, // Remplacer :user_id par la valeur de user_id
          type: sequelize.QueryTypes.SELECT, // Spécifier le type de requête
        });
    
        // Si aucun résultat n'est trouvé
        if (results.length === 0) {
          throw new Error("Tuteur non trouvé");
        }
    
        // Formater les résultats pour correspondre à la structure attendue
        const tuteurDetails = {
          idTuteur: results[0].idTuteur,
          nom: results[0].nom,
          prenom: results[0].prenom,
          email: results[0].email,
          groupe: results[0].idGroupe ? {
            idGroupe: results[0].idGroupe,
            nomGroupe: results[0].nomGroupe,
            sujet: results[0].idSujet ? {
              idSujet: results[0].idSujet,
              titre: results[0].titre,
              encadrant: results[0].idEncadrant ? {
                idEncadrant: results[0].idEncadrant,
                nom: results[0].nomEncadrant,
                prenom: results[0].prenomEncadrant
              } : null
            } : null,
            etudiants: results
              .filter(row => row.idEtudiant)
              .map(row => ({
                idEtudiant: row.idEtudiant,
                nom: row.nomEtudiant,
                prenom: row.prenomEtudiant
              }))
          } : null
        };
    
        return tuteurDetails;
      } catch (error) {
        console.error("Erreur lors de la récupération des informations du tuteur:", error);
        throw new Error(`Erreur lors de la récupération des informations du tuteur: ${error.message}`);
      }
    }
}

module.exports = new TuteurRepository(); // Exportation avec module.exports
