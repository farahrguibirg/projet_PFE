/*const Groupe = require('../models/Groupe');
const Etudiant = require('../models/Etudiant');
const Tuteur = require('../models/Tuteur');
const Sujet = require('../models/Sujet');

class ExportRepository {
  async getAffectationsForExport() {
    try {
      // Fetch all groupes with related data
      const groupes = await Groupe.findAll({
        include: [
          {
            model: Etudiant,
            as: 'etudiants',
            attributes: ['nom', 'prenom']
          },
          {
            model: Tuteur,
            as: 'tuteur',
            attributes: ['idTuteur', 'nom', 'prenom']
          },
          {
            model: Sujet,
            as: 'sujet',
            attributes: ['idSujet', 'titre']
          }
        ]
      });

      // Format data for export - garder les noms complets des étudiants
      return groupes.map(groupe => {
        const groupeData = groupe.toJSON();
        return {
          idGroupe: groupeData.idGroupe,
          nomGroupe: groupeData.nomGroupe,
          annee: groupeData.annee,
          // Liste des noms complets des étudiants
          etudiants: groupeData.etudiants.map(etudiant => `${etudiant.nom} ${etudiant.prenom}`),
          tuteur: groupeData.tuteur ? `${groupeData.tuteur.nom} ${groupeData.tuteur.prenom}` : 'Non assigné',
          sujet: groupeData.sujet ? groupeData.sujet.titre : 'Non assigné',
          isAffected: !!(groupeData.tuteur && groupeData.sujet)
        };
      });
    } catch (error) {
      console.error('Erreur dans ExportRepository:', error);
      throw error;
    }
  }
}

module.exports = new ExportRepository();*/
const Groupe = require('../models/Groupe');
const Etudiant = require('../models/Etudiant');
const Tuteur = require('../models/Tuteur');
const Sujet = require('../models/Sujet');
const Encadrant = require('../models/Encadrant');

class ExportRepository {
  async getAffectationsForExport() {
    try {
      // Fetch all groupes with related data
      const groupes = await Groupe.findAll({
        include: [
          {
            model: Etudiant,
            as: 'etudiants',
            attributes: ['nom', 'prenom']
          },
          {
            model: Tuteur,
            as: 'tuteur',
            attributes: ['idTuteur', 'nom', 'prenom']
          },
          {
            model: Sujet,
            as: 'sujet',
            attributes: ['idSujet', 'titre'],
            include: [
              {
                model: Encadrant,
                as: 'Encadrant',
                attributes: ['idEncadrant', 'nom', 'prenom']
              }
            ]
          }
        ]
      });

      // Format data for export - garder les noms complets des étudiants
      return groupes.map(groupe => {
        const groupeData = groupe.toJSON();
        return {
          idGroupe: groupeData.idGroupe,
          nomGroupe: groupeData.nomGroupe,
          annee: groupeData.annee,
          // Liste des noms complets des étudiants
          etudiants: groupeData.etudiants.map(etudiant => `${etudiant.nom} ${etudiant.prenom}`),
          tuteur: groupeData.tuteur ? `${groupeData.tuteur.nom} ${groupeData.tuteur.prenom}` : 'Non assigné',
          // Récupérer l'encadrant à travers le sujet
          encadrant: (groupeData.sujet && groupeData.sujet.Encadrant) 
          ? `${groupeData.sujet.Encadrant.nom} ${groupeData.sujet.Encadrant.prenom}` 
          : 'Non assigné',
          sujet: groupeData.sujet ? groupeData.sujet.titre : 'Non assigné',
          isAffected: !!(groupeData.tuteur && groupeData.sujet)
        };
      });
    } catch (error) {
      console.error('Erreur dans ExportRepository:', error);
      throw error;
    }
  }
}

module.exports = new ExportRepository();

