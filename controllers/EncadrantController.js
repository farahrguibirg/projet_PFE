// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EncadrantRepository = require('../repositories/EncadrantRepository'); // Importation du repository
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FileService = require('../services/FileService');

class EncadrantController {
  // Ajouter un encadrant
  static async addEncadrant(req, res) {
    const { idEncadrant, nom, prenom, email, motDePasse, annee } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(motDePasse, 10);
      const encadrantData = { idEncadrant, nom, prenom, email, motDePasse: hashedPassword, annee };
      
      const encadrant = await EncadrantRepository.addEncadrant(encadrantData);
      return res.status(201).json({ success: 'Encadrant ajouté avec succès', encadrant });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

  // Obtenir tous les encadrants
  static async getAllEncadrants(req, res) {
    try {
      const encadrants = await EncadrantRepository.getAllEncadrants();
      return res.status(200).json(encadrants);
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

 
static async getEncadrantById(req, res) {
  const { id } = req.params;

  try {
    const encadrant = await EncadrantRepository.getEncadrantById(id);
    if (encadrant) {
      return res.status(200).json([encadrant]); // Return the student inside an array
    } else {
      return res.status(404).json([{ message: 'Encadrant non trouvé' }]); // Return error inside an array
    }
  } catch (error) {
    return res.status(500).json([{ message: 'Erreur serveur : ' + error.message }]); // Return error inside an array
  }
}

 
   static async updateEncadrant(req, res) {
      const { id } = req.params;
      const { nom, prenom, email, motDePasse, annee} = req.body;
  
      try {
        const encadrant = await EncadrantRepository.getEncadrantById(id);
        if (!encadrant) {
          return res.status(404).json({ message: 'Étudiant non trouvé' });
        }
  
        let hashedPassword = encadrant.motDePasse; // Garde l'ancien mot de passe si non fourni
        if (motDePasse) {
          hashedPassword = await bcrypt.hash(motDePasse, 10);
        }
  
        const encadrantData = { 
          nom, 
          prenom, 
          email, 
          motDePasse: hashedPassword, 
          annee
        };
  
        await EncadrantRepository.updateEncadrant(id, encadrantData);
        return res.status(200).json({ success: 'Encadrent mis à jour avec succès' });
      } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
      }
    }

  // Supprimer un encadrant
  static async deleteEncadrant(req, res) {
    const { id } = req.params;

    try {
      const encadrant = await EncadrantRepository.getEncadrantById(id);
      if (!encadrant) {
        return res.status(404).json({ message: 'Encadrant non trouvé' });
      }

      await EncadrantRepository.deleteEncadrant(id);
      return res.status(200).json({ success: 'Encadrant supprimé avec succès' });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

  // Importer des encadrants depuis un fichier Excel
  static async importEncadrants(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier fourni.' });
      }
  
      // Lire et convertir le fichier Excel en JSON
      const fileData = FileService.parseExcelFile(req.file);
  
      if (!fileData || fileData.length === 0) {
        return res.status(400).json({ message: 'Le fichier est vide ou invalide.' });
      }
  
      // Vérifier que toutes les colonnes nécessaires existent
      const requiredColumns = ['idEncadrant', 'nom', 'prenom', 'email', 'motDePasse', 'annee'];
      const missingColumns = requiredColumns.filter(col => !fileData[0].hasOwnProperty(col));
  
      if (missingColumns.length > 0) {
        return res.status(400).json({ message: `Colonnes manquantes dans le fichier : ${missingColumns.join(', ')}` });
      }
  
      // Récupérer tous les emails existants pour éviter les doublons
      const existingEmails = new Set((await EncadrantRepository.getAllEmails()).map(e => e.email));
  
      // Préparer les encadrants à insérer
      const encadrantsToInsert = await Promise.all(
        fileData.map(async (row) => {
          // Vérifier si les informations nécessaires sont présentes et valides
          if (!row.nom || !row.prenom || !row.email || !row.motDePasse) {
            return null; // Ignore les lignes incomplètes
          }
  
          if (existingEmails.has(row.email)) {
            return null; // Ignore les doublons
          }
  
          // Hasher le mot de passe
          const hashedPassword = await bcrypt.hash(row.motDePasse, 10);
  
          return {
            idEncadrant: row.idEncadrant,
            nom: row.nom,
            prenom: row.prenom,
            email: row.email,
            motDePasse: hashedPassword,
            annee: row.annee || ''
          };
        })
      );
  
      // Filtrer les valeurs nulles (données incomplètes ou doublons)
      const validEncadrants = encadrantsToInsert.filter(s => s !== null);
  
      // Si des encadrants sont valides, les insérer en batch
      if (validEncadrants.length > 0) {
        await EncadrantRepository.addManyEncadrants(validEncadrants);
      }
  
      // Retourner la réponse avec le nombre d'encadrants importés
      return res.status(200).json({
        message: `${validEncadrants.length} encadrants importés avec succès.`,
        encadrants: validEncadrants // Optionnel : renvoyer les encadrants importés pour confirmation
      });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

  static async getEncadrantProfile(req, res) {
    const { user_id } = req.params;
  
    console.log("ID Encadrant reçu:", user_id); // Log pour vérifier l'ID
  
    try {
      const encadrant = await EncadrantRepository.getEncadrantByUserId(user_id);
      console.log("Données de l'encadrant récupérées:", encadrant); // Log pour vérifier les données
      return res.status(200).json(encadrant);
    } catch (error) {
      console.error("Erreur dans getEncadrantProfile:", error); // Log pour capturer l'erreur
      return res.status(500).json({ message: error.message });
    }
 
  }
  static async exportEncadrants(req, res) {
    try {
      // Récupérer tous les encadrants
      const encadrants = await EncadrantRepository.getAllEncadrants();
  
      // Préparer les données pour l'export
      const data = await Promise.all(encadrants.map(async (encadrant) => {
        console.log("Encadrant:", encadrant); // Log pour vérifier la structure de l'objet encadrant
  
        // Vérifier que idEncadrant est défini
        if (!encadrant.idEncadrant) {
          throw new Error(`idEncadrant manquant pour l'encadrant : ${encadrant.nom} ${encadrant.prenom}`);
        }
  
        // Récupérer les sujets de l'encadrant
        const sujets = await EncadrantRepository.getSujetsByEncadrantId(encadrant.idEncadrant);
  
        // Structurer les données pour l'export
        const encadrantData = {
          idEncadrant: encadrant.idEncadrant,
          nom: encadrant.nom,
          prenom: encadrant.prenom,
          titre1: sujets[0]?.titre || '', // Premier sujet ou vide
          titre2: sujets[1]?.titre || '', // Deuxième sujet ou vide
          titre3: sujets[2]?.titre || '', // Troisième sujet ou vide
          titre4: sujets[3]?.titre || '', // Quatrième sujet ou vide
          titre5: sujets[4]?.titre || '', // Cinquième sujet ou vide
        };
  
        return encadrantData;
      }));
  
      // Générer le fichier Excel
      const buffer = await FileService.generateExcelFile(data);
  
      // Définir les en-têtes de la réponse
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=encadrants.xlsx');
      res.send(buffer); // Envoyer le fichier Excel
    } catch (error) {
      console.error("Erreur lors de l'exportation des encadrants :", error);
      res.status(500).send("Erreur lors de l'exportation des encadrants");
    }
  }
}

module.exports = EncadrantController;