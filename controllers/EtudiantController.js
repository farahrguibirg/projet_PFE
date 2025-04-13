// controllers/EtudiantController.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EtudiantRepository = require('../repositories/EtudiantRepository'); // Importation du repository
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FileService = require('../services/FileService'); // Service pour importer des fichiers

class EtudiantController {
  // Ajouter un étudiant// controllers/EtudiantController.js
  // Ajouter un étudiant
  static async addEtudiant(req, res) {
    try {
      const existing = await EtudiantRepository.getEtudiantById(req.body.idEtudiant);
      if (existing) {
        return res.status(400).json({ error: "L'ID étudiant existe déjà." });
      }
      const hashedPassword = await bcrypt.hash(req.body.motDePasse, 10);
      const newEtudiant = await EtudiantRepository.addEtudiant({ ...req.body, motDePasse: hashedPassword });
      return res.status(201).json({ success: "Étudiant ajouté avec succès", etudiant: newEtudiant });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Obtenir tous les étudiants
  static async getAllEtudiants(req, res) {
    try {
      const etudiants = await EtudiantRepository.getAllEtudiants();
      return res.status(200).json(etudiants);
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

  // Obtenir un étudiant par ID
  static async getEtudiantById(req, res) {
    const { id } = req.params;

    try {
      const etudiant = await EtudiantRepository.getEtudiantById(id);
      if (etudiant) {
        return res.status(200).json(etudiant);
      } else {
        return res.status(404).json({ message: 'Étudiant non trouvé' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

  // Mettre à jour un étudiant
  static async updateEtudiant(req, res) {
    const { id } = req.params;
    const { nom, prenom, email, motDePasse, annee, classe, filiere } = req.body;

    try {
      const etudiant = await EtudiantRepository.getEtudiantById(id);
      if (!etudiant) {
        return res.status(404).json({ message: 'Étudiant non trouvé' });
      }

      const hashedPassword = await bcrypt.hash(motDePasse, 10);
      const etudiantData = { nom, prenom, email, motDePasse: hashedPassword, annee, classe, filiere };

      await EtudiantRepository.updateEtudiant(id, etudiantData);
      return res.status(200).json({ success: 'Étudiant mis à jour avec succès' });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

  // Supprimer un étudiant
  static async deleteEtudiant(req, res) {
    const { id } = req.params;

    try {
      const etudiant = await EtudiantRepository.getEtudiantById(id);
      if (!etudiant) {
        return res.status(404).json({ message: 'Étudiant non trouvé' });
      }

      await EtudiantRepository.deleteEtudiant(id);
      return res.status(200).json({ success: 'Étudiant supprimé avec succès' });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }
  static async importEtudiants(req, res) {
    try {
      // Vérifier si un fichier a été téléchargé
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier fourni.' });
      }
  
      // Lire et convertir le fichier Excel en JSON
      const fileData = FileService.parseExcelFile(req.file);
  
      // Vérifier si le fichier est vide ou invalide
      if (!fileData || fileData.length === 0) {
        return res.status(400).json({ message: 'Le fichier est vide ou invalide.' });
      }
  
      // Vérifier que toutes les colonnes nécessaires existent
      const requiredColumns = ['idEtudiant', 'nom', 'prenom', 'email', 'motDePasse', 'annee', 'classe', 'filiere'];
      const missingColumns = requiredColumns.filter(col => !fileData[0].hasOwnProperty(col));
  
      if (missingColumns.length > 0) {
        return res.status(400).json({ message: `Colonnes manquantes dans le fichier : ${missingColumns.join(', ')}` });
      }
  
      // Récupérer tous les emails existants pour éviter les doublons
      const existingEmails = new Set((await EtudiantRepository.getAllEmails()).map(e => e.email));
  
      // Préparer les étudiants à insérer
      const studentsToInsert = await Promise.all(
        fileData.map(async (row) => {
          try {
            // Vérifier si les informations nécessaires sont présentes
            if (!row.nom || !row.prenom || !row.email || !row.motDePasse) {
              console.warn(`Ligne ignorée : données manquantes - ${JSON.stringify(row)}`);
              return null; // Ignorer les lignes incomplètes
            }
  
            // Vérifier si l'email existe déjà
            if (existingEmails.has(row.email)) {
              console.warn(`Ligne ignorée : email déjà existant - ${row.email}`);
              return null; // Ignorer les doublons
            }
  
            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(row.motDePasse, 10);
  
            // Retourner l'objet étudiant
            return {
              idEtudiant: row.idEtudiant,
              nom: row.nom,
              prenom: row.prenom,
              email: row.email,
              motDePasse: hashedPassword,
              annee: row.annee || '',
              classe: row.classe || '',
              filiere: row.filiere || ''
            };
          } catch (error) {
            console.error(`Erreur lors du traitement de la ligne : ${JSON.stringify(row)}`, error);
            return null; // Ignorer les lignes qui génèrent des erreurs
          }
        })
      );
  
      // Filtrer les étudiants valides (supprimer les valeurs nulles)
      const validStudents = studentsToInsert.filter((s) => s !== null);
  
      // Insérer les étudiants par lots pour éviter les problèmes de performance
      const batchSize = 50; // Nombre d'étudiants à insérer par lot
      for (let i = 0; i < validStudents.length; i += batchSize) {
        const batch = validStudents.slice(i, i + batchSize);
        await EtudiantRepository.addManyEtudiants(batch);
      }
  
      // Retourner la réponse avec le nombre d'étudiants importés
      return res.status(200).json({
        message: `${validStudents.length} étudiants importés avec succès.`,
        students: validStudents, // Optionnel : renvoyer les étudiants importés pour confirmation
      });
    } catch (error) {
      console.error('Erreur lors de l\'importation des étudiants :', error);
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }
  // Valider les données d'un étudiant
  static validateEtudiantData(data) {
    const requiredFields = ['idEtudiant','nom', 'prenom', 'email', 'motDePasse', 'annee', 'classe', 'filiere'];
    const missingFields = requiredFields.filter(field => !data.hasOwnProperty(field));

    if (missingFields.length > 0) {
      throw new Error(`Champs manquants : ${missingFields.join(', ')}`);
    }

    if (!data.nom || !data.prenom || !data.email || !data.motDePasse) {
      throw new Error('Informations incomplètes');
    }

    return true;
  }

  async getEtudiantByUserId(req, res) {
    try {
      const user_id = req.params.user_id;
      const etudiant = await EtudiantRepository.getEtudiantByUserId(user_id);
      res.status(200).json(etudiant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    
    }
  }


}
module.exports = EtudiantController;
   