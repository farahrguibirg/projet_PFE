// eslint-disable-next-line @typescript-eslint/no-require-imports
const Sujet = require("../models/Sujet"); // Importation du modèle Sujet
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Groupe = require('../models/Groupe');
class SujetRepository {
  // Ajouter un sujet
  async addSujet(data) {
    return await Sujet.create(data);
  }
 ;
  
  async getSujetsByYear(annee) {
    return await Sujet.findAll({ where: { annee: annee } });
  }
  // Obtenir un sujet par ID
  async getSujetById(id) {
    return await Sujet.findByPk(id);
  }

  // Obtenir tous les sujets
  async getAllSujets() {
    return await Sujet.findAll({
      logging: console.log, // Affiche la requête SQL
  
    });
  }

  async updateSujet(id, data) {
    try {
      // Recherche du sujet par son ID
      const sujet = await Sujet.findByPk(id);
      if (!sujet) {
        throw new Error('Sujet non trouvé');
      }
  
      // Mise à jour des données du sujet dans la base de données
      await sujet.update(data);
      return sujet;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du sujet:', error);
      throw new Error('Erreur lors de la mise à jour du sujet: ' + error.message);
}
}

  // Supprimer un sujet
  async deleteSujet(id) {
    return await Sujet.destroy({ where: { idSujet: id } });
  }
  async addManySujets(sujets) {
    return await Sujet.bulkCreate(sujets);
  }
  
  async countGroupesBySujet(sujetId) {
    return await Groupe.count({ where: { idSujet: sujetId } });
  }
}

module.exports = new SujetRepository();
