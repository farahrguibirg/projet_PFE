// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const TuteurRepository = require('../repositories/TuteurRepository'); // Importation du repository
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FileService = require('../services/FileService'); // Service pour importer des fichiers

class TuteurController {


  static async addTuteur(req, res) {
      try {
          // Vérifier si le tuteur existe déjà (par exemple, par email ou ID)
          const existingTuteur = await TuteurRepository.getTuteurById(req.body.idTuteur); // Ou par email
          if (existingTuteur) {
              return res.status(400).json({ error: "Le tuteur existe déjà." });
          }
  
          // Hacher le mot de passe
          const hashedPassword = await bcrypt.hash(req.body.motDePasse, 10);
  
          // Ajouter le tuteur avec le mot de passe hashé
          const newTuteur = await TuteurRepository.addTuteur({
              ...req.body, // Copier toutes les données du corps de la requête
              motDePasse: hashedPassword // Remplacer le mot de passe en clair par le mot de passe hashé
          });
  
          // Retourner une réponse de succès
          return res.status(201).json({
              success: "Tuteur ajouté avec succès",
              tuteur: newTuteur
          });
      } catch (error) {
          // Gérer les erreurs
          console.error("Erreur lors de l'ajout du tuteur :", error.message);
          return res.status(500).json({ error: error.message });
      }
  }

  // Obtenir un tuteur par ID
  static async getTuteurById(req, res) {
    const { id } = req.params;

    try {
      const tuteur = await TuteurRepository.getTuteurById(id);
      if (tuteur) {
        return res.status(200).json(tuteur);
      } else {
        return res.status(404).json({ message: 'Tuteur non trouvé' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

  // Mettre à jour un tuteur
  static async updateTuteur(req, res) {
    const { id } = req.params;
    const { nom, prenom, email, motDePasse, annee, classe, filiere, idGroupe } = req.body;

    try {
      const tuteur = await TuteurRepository.getTuteurById(id);
      if (!tuteur) {
        return res.status(404).json({ message: 'Tuteur non trouvé' });
      }

      const hashedPassword = await bcrypt.hash(motDePasse, 10);
      const tuteurData = { nom, prenom, email, motDePasse: hashedPassword, annee, classe, filiere, idGroupe: idGroupe || null };

      await TuteurRepository.updateTuteur(id, tuteurData);
      return res.status(200).json({ success: 'Tuteur mis à jour avec succès' });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

  // Supprimer un tuteur
  static async deleteTuteur(req, res) {
    const { id } = req.params;

    try {
      const tuteur = await TuteurRepository.getTuteurById(id);
      if (!tuteur) {
        return res.status(404).json({ message: 'Tuteur non trouvé' });
      }

      await TuteurRepository.deleteTuteur(id);
      return res.status(200).json({ success: 'Tuteur supprimé avec succès' });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }


  static async getAllTuteurs(req, res) {
    try {
        const tuteurs = await TuteurRepository.getAllTuteurs(); // Appel au repository
        return res.status(200).json(tuteurs);
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }
  

  static async importTuteurs(req, res) {
    try {
      // Vérifier si un fichier a été téléchargé
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni.' });
      }
  
      // Lire et convertir le fichier Excel en JSON
      const fileData = FileService.parseExcelFile(req.file);
  
      // Vérifier si le fichier est vide ou invalide
      if (!fileData || fileData.length === 0) {
        return res.status(400).json({ error: 'Le fichier est vide ou invalide.' });
      }
  
      // Vérifier que toutes les colonnes nécessaires existent
      const requiredColumns = ['idTuteur', 'nom', 'prenom', 'email', 'motDePasse', 'annee', 'classe', 'filiere'];
      const missingColumns = requiredColumns.filter(col => !fileData[0].hasOwnProperty(col));
  
      if (missingColumns.length > 0) {
        return res.status(400).json({ error: `Colonnes manquantes dans le fichier : ${missingColumns.join(', ')}` });
      }
  
      // Récupérer tous les emails existants pour éviter les doublons
      const existingEmails = new Set((await TuteurRepository.getAllEmails()).map(t => t.email));
  
      // Préparer les tuteurs à insérer
      const validTuteurs = await Promise.all(
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
  
            // Retourner l'objet tuteur
            return {
              idTuteur: row.idTuteur,
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
  
      // Filtrer les tuteurs valides (supprimer les valeurs nulles)
      const filteredTuteurs = validTuteurs.filter(t => t !== null);
  
      // Insérer les tuteurs valides dans la base de données
      if (filteredTuteurs.length > 0) {
        await TuteurRepository.addManyTuteurs(filteredTuteurs);
      }
  
      // Retourner la réponse avec le nombre de tuteurs importés
      return res.status(200).json({
        message: `${filteredTuteurs.length} tuteurs importés avec succès.`,
        tuteurs: filteredTuteurs, // Optionnel : renvoyer les tuteurs importés pour confirmation
      });
    } catch (error) {
      console.error('Erreur lors de l\'importation des tuteurs :', error);
      return res.status(500).json({ error: 'Erreur serveur : ' + error.message });
    }
  }


  static async getTuteurByUserId(req, res) {
    try {
      const user_id = req.params.user_id;
      const tuteur = await TuteurRepository.getTuteurByUserId(user_id);
      res.status(200).json(tuteur);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TuteurController;
