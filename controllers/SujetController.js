// eslint-disable-next-line @typescript-eslint/no-require-imports
const SujetRepository = require('../repositories/SujetRepository'); // Importation correcte
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EncadrantRepository = require('../repositories/EncadrantRepository');
const FileService = require('../services/FileService'); // Service pour importer des fichiers
const Encadrant = require('../models/Encadrant'); // ou le chemin correct vers votre modèle
const Sujet =require("../models/Sujet");

const jwt = require('jsonwebtoken');


class SujetController {
    static async addSujet(req, res) {
      // 1. Vérifiez d'abord le token pour déterminer si c'est un admin
      const token = req.headers.authorization?.split(' ')[1];
      let isAdmin = false;
    
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isAdmin = decoded.role === 'responsableFiliere'; // Suppose que votre JWT contient un champ 'role'
      } catch (err) {
        console.log("Erreur vérification token", err);
      }
    
      // 2. Maintenant traitez la création du sujet
      const { titre, idEncadrant } = req.body;
    
      if (!titre || !idEncadrant) {
        return res.status(400).json({ message: "Titre et encadrant requis" });
      }
    
      const status = isAdmin ? 'approved' : 'pending';
      
      try {
        const sujet = await Sujet.create({
          titre,
          idEncadrant,
          status,
          annee: new Date().getFullYear()
        });
    
        return res.status(201).json({
          success: true,
          message: `Sujet ${status} par ${isAdmin ? 'admin' : 'encadrant'}`,
          sujet
        });
      } catch (error) {
        console.error("Erreur création sujet:", error);
        return res.status(500).json({ 
          success: false,
          message: "Erreur serveur"
        });
      }
    }
  // Obtenir tous les sujets
static async getAllSujets(req, res) { // Ajoutez 'req' ici
  try {
    const sujets = await SujetRepository.getAllSujets();
    return res.status(200).json(sujets);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
  }
}


  // Obtenir un sujet par ID
  static async getSujetById(req, res) {
    const { id } = req.params;

    try {
      const sujet = await SujetRepository.getSujetById(id);
      if (sujet) {
        return res.status(200).json(sujet);
      } else {
        return res.status(404).json({ message: 'Sujet non trouvé' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }
 // Mettre à jour l'encadrant d'un sujet
 static async updateSujet(req, res) {
  const { id } = req.params;
  const { idEncadrant, titre } = req.body;
  
  if (!idEncadrant) {
    return res.status(400).json({ message: "L'identifiant de l'encadrant est requis" });
  }
  
  try {
    const sujet = await SujetRepository.getSujetById(id);
    if (!sujet) {
      return res.status(404).json({ message: 'Sujet non trouvé' });
    }
    
    const encadrant = await EncadrantRepository.getEncadrantById(idEncadrant);
    if (!encadrant) {
      return res.status(404).json({ message: 'Encadrant non trouvé' });
    }
    
    // Pass both idEncadrant and titre to the repository function
    await SujetRepository.updateSujet(id, { idEncadrant, titre });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Sujet mis à jour avec succès' 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du sujet:", error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}
  // Supprimer un sujet
  static async deleteSujet(req, res) {
    const { id } = req.params;

    try {
      const sujet = await SujetRepository.getSujetById(id);
      if (!sujet) {
        return res.status(404).json({ message: 'Sujet non trouvé' });
      }

      await SujetRepository.deleteSujet(id);
      return res.status(200).json({ success: 'Sujet supprimé avec succès' });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

static async importSujets(req, res) {
  try {
      if (!req.file) {
          return res.status(400).json({ message: 'Aucun fichier fourni.' });
      }

      // Lire et convertir le fichier Excel en JSON
      const fileData = FileService.parseExcelFile(req.file);

      if (!fileData || fileData.length === 0) {
          return res.status(400).json({ message: 'Le fichier est vide ou invalide.' });
      }

      // Vérifier que les colonnes nécessaires existent
      const requiredColumns = ['idEncadrant', 'nom', 'prenom'];
      const missingColumns = requiredColumns.filter(col => !fileData[0].hasOwnProperty(col));

      if (missingColumns.length > 0) {
          return res.status(400).json({ message: `Colonnes manquantes dans le fichier : ${missingColumns.join(', ')}` });
      }

      // Préparer les sujets à insérer
      const sujetsToInsert = [];

      for (const row of fileData) {
          // Vérifier si l'information nécessaire est présente et valide
          if (!row.idEncadrant) {
              continue; // Ignorer les lignes incomplètes
          }

          // Vérifier si l'encadrant existe déjà dans la base de données
          const encadrantExists = await Encadrant.findOne({ where: { idEncadrant: row.idEncadrant } });

          if (!encadrantExists) {
              console.warn(`Encadrant avec idEncadrant ${row.idEncadrant} non trouvé. Ignorer cette ligne.`);
              continue; // Ignorer les lignes où l'encadrant n'existe pas
          }

          // Parcourir les colonnes pour extraire les sujets
          let colIndex = 2; // Commencer à la colonne 2 (après idEncadrant et nom)
          while (row[`Titre${colIndex - 1}`]) { // Continuer tant qu'il y a des colonnes non vides
              const titre = row[`Titre${colIndex - 1}`];

              // Vérifier si le sujet existe déjà pour cet encadrant
              const sujetExists = await Sujet.findOne({
                  where: {
                      titre: titre,
                      idEncadrant: row.idEncadrant,
                  },
              });

              // Si le sujet n'existe pas, l'ajouter à la liste des sujets à insérer
              if (!sujetExists) {
                  sujetsToInsert.push({
                      titre: titre,
                      idEncadrant: row.idEncadrant, // Associer le sujet à l'encadrant
                  });
              } else {
                  console.warn(`Le sujet "${titre}" existe déjà pour l'encadrant ${row.idEncadrant}. Ignorer.`);
              }

              colIndex++; // Passer à la colonne suivante
          }
      }

      // Insérer les sujets en batch
      if (sujetsToInsert.length > 0) {
          await Sujet.bulkCreate(sujetsToInsert);
      }

      // Retourner la réponse avec le nombre de sujets importés
      return res.status(200).json({
          message: `${sujetsToInsert.length} sujets importés avec succès.`,
          sujets: sujetsToInsert, // Optionnel : renvoyer les sujets importés pour confirmation
      });
  } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
  }
}


static async getPendingSujets(req, res) {
  try {

    const sujets = await Sujet.findAll({
      where: { status: 'pending' },
     
    });
    return res.status(200).json(sujets);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
  }
}

static async updateSujetStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Statut invalide. Doit être 'approved' ou 'rejected'" });
  }

  try {
    const sujet = await Sujet.findByPk(id);
    if (!sujet) {
      return res.status(404).json({ message: 'Sujet non trouvé' });
    }

    await sujet.update({ status });
    return res.status(200).json({ success: true, message: `Sujet ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès` });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
  }
}

static async getApprovedSujets(req, res) {
  try {
    const sujets = await Sujet.findAll({
      where: { status: 'approved' },
    });
    return res.status(200).json(sujets);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
  }
}


static async deleteRejectedSujets(req, res) {
  try {
    // Supprimer tous les sujets avec status='rejected'
    const result = await Sujet.destroy({
      where: { status: 'rejected' }
    });
    
    return res.status(200).json({
      success: true,
      message: `${result} sujets rejetés supprimés avec succès`
    });
  } catch (error) {
    console.error("Erreur suppression sujets rejetés:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression des sujets rejetés"
    });
  }
}




}

module.exports = SujetController;
