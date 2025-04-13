const groupeRepository = require('../repositories/GroupeRepository');
const GenerateGroups = require('../use-cases/GenerateGroups');
const etudiantRepository = require('../repositories/EtudiantRepository');

class GroupeController {
  // Add a group
  static async addGroupe(req, res) {
    const { etudiants, groupeType } = req.body;

    try {
      if (!etudiants || etudiants.length === 0) {
        return res.status(400).json({ message: 'Aucun étudiant sélectionné' });
      }
      if (!groupeType) {
        return res.status(400).json({ message: 'Type de groupe non spécifié' });
      }
      const existingGroups = await groupeRepository.findAllGroupes();
      const nomGroupe = groupeType === 'numerique' 
        ? `Groupe ${existingGroups.length + 1}`
        : `Groupe ${String.fromCharCode(65 + existingGroups.length)}`;

      const groupe = await groupeRepository.createGroupe(nomGroupe, new Date().getFullYear());

      // Assign students to the group
      for (const idEtudiant of etudiants) {
        await etudiantRepository.updateEtudiant(idEtudiant, { idGroupe: groupe.idGroupe });
      }

      return res.status(201).json({ success: 'Groupe créé avec succès', groupe });
    } catch (error) {
      console.error("Erreur:", error);
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

  // Get all groups with students
  static async getAllGroupes(req, res) {
    try {
      const groupes = await groupeRepository.findAllGroupeset();
      return res.status(200).json(groupes);
    } catch (error) {
      console.error("Error fetching groups:", error);
      return res.status(500).json({ message: 'Server error: ' + error.message });
    }
  }

  static async deleteGroupe(req, res) {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ message: 'ID du groupe requis' });
      }
  
      const groupe = await groupeRepository.findGroupeById(id);
      if (!groupe) {
        return res.status(404).json({ message: 'Groupe non trouvé' });
      }
  
      // Remove all students from this group
      const etudiants = await groupeRepository.getStudentsInGroup(id);
      for (const etudiant of etudiants) {
        await etudiantRepository.updateEtudiant(etudiant.idEtudiant, { idGroupe: null });
      }
  
      await groupeRepository.deleteGroupe(id);
      return res.status(200).json({ message: 'Groupe supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression du groupe:', error);
      return res.status(500).json({ message: 'Erreur serveur lors de la suppression du groupe', error: error.message });
    }
  }

  // Get a group by ID
  static async getGroupeById(req, res) {
    const { id } = req.params;
    try {
      const groupe = await groupeRepository.findGroupeById(id);
      if (groupe) {
        return res.status(200).json(groupe);
      } else {
        return res.status(404).json({ message: 'Groupe non trouvé' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }

  static async generateGroups(req, res) {
    const { nombreEtudiantsParGroupe, nombreGroupes, type, annee } = req.body;

    if (type !== "numerique" && type !== "alphabet") {
      return res.status(400).json({ message: "Type de groupe invalide. Choisissez 'numerique' ou 'alphabet'." });
    }
    if (!nombreEtudiantsParGroupe && !nombreGroupes) {
      return res.status(400).json({ message: "Veuillez spécifier le nombre d'étudiants par groupe ou le nombre de groupes." });
    }
    try {
      const generateGroups = new GenerateGroups();
      const groupes = await generateGroups.execute(nombreEtudiantsParGroupe, nombreGroupes, type, annee || new Date().getFullYear());
      res.status(201).json({ message: "Groupes générés avec succès.", groupes });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async affecterSujetsEtTuteursAuGroupe(req, res) {
    const { idGroupe } = req.params;
    const { idTuteur, idSujet } = req.body;

    try {
      const groupe = await groupeRepository.findGroupeByIdst(idGroupe);
      if (!groupe) {
        return res.status(404).json({ message: 'Groupe non trouvé' });
      }

      const nombreGroupesAvecSujet = await groupeRepository.countGroupesAvecSujet(idSujet);
      if (nombreGroupesAvecSujet >= 3) {
        return res.status(400).json({ 
          message: 'Ce sujet est déjà affecté à 3 groupes et ne peut plus être sélectionné' 
        });
      }

      const tuteurAffecte = await groupeRepository.findGroupeByTuteur(idTuteur);
      if (tuteurAffecte) {
        return res.status(400).json({ 
          message: 'Ce tuteur est déjà affecté à un groupe et ne peut plus être sélectionné' 
        });
      }

      if (groupe.idTuteur && groupe.idSujet) {
        return res.status(400).json({ 
          message: 'Ce groupe a déjà un tuteur et un sujet affectés' 
        });
      }

      const groupeUpdated = await groupeRepository.affecterSujetEtTuteur(
        idGroupe, 
        idTuteur,
        parseInt(idSujet)
      );

      return res.status(200).json({
        message: 'Tuteur et sujet affectés avec succès',
        groupe: groupeUpdated
      });
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  } 

  static async getGroupeByIdts(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de groupe invalide" });
      }
      const groupe = await groupeRepository.findGroupeByIdst(id);
      if (!groupe) {
        return res.status(404).json({ message: "Groupe non trouvé" });
      }

      res.status(200).json(groupe);
    } catch (error) {
      console.error("Erreur dans le serveur lors de la récupération du groupe:", error);
      res.status(500).json({ message: "Erreur serveur lors de la récupération du groupe" });
    }
  }

  static async modifierSujetEtTuteurGroupe(req, res) {
    try {
      const { idGroupe } = req.params;
      const { idSujet, idTuteur } = req.body;
      
      if (!idGroupe || isNaN(Number(idGroupe))) {
        return res.status(400).json({ message: "ID de groupe invalide" });
      }
      
      if (idSujet !== undefined && (idSujet === null || isNaN(Number(idSujet)))) {
        return res.status(400).json({ message: "ID de sujet invalide" });
      }
      
      if (idTuteur !== undefined && idTuteur === null) {
        return res.status(400).json({ message: "ID de tuteur invalide" });
      }
      
      const groupe = await groupeRepository.findGroupeById(Number(idGroupe));
      if (!groupe) {
        return res.status(404).json({ message: "Groupe non trouvé" });
      }
      
      // Check if sujet is already assigned to 3 groups
      if (idSujet !== undefined && idSujet !== null) {
        const nombreGroupesSujet = await groupeRepository.countGroupesAvecSujet(Number(idSujet));
        const memeIdSujet = groupe.idSujet === Number(idSujet);
        
        if (nombreGroupesSujet >= 3 && !memeIdSujet) {
          return res.status(400).json({ 
            message: "Ce sujet est déjà affecté au nombre maximum de groupes (3)" 
          });
        }
      }
      
      // Check if tuteur is already assigned to another group
      if (idTuteur !== undefined && idTuteur !== null) {
        const groupeTuteur = await groupeRepository.findGroupeByTuteur(idTuteur);
        if (groupeTuteur && Number(groupeTuteur.idGroupe) !== Number(idGroupe)) {
          return res.status(400).json({ 
            message: "Ce tuteur est déjà affecté à un autre groupe" 
          });
        }
      }
      
      const groupeMisAJour = await groupeRepository.updateGroupeSujetTuteur(
        idGroupe, 
        idSujet !== undefined ? Number(idSujet) : undefined,
        idTuteur !== undefined ? idTuteur : undefined
      );
      
      res.status(200).json({
        message: "Groupe mis à jour avec succès",
        groupe: groupeMisAJour
      });
    } catch (error) {
      console.error("Erreur lors de la modification du groupe:", error);
      res.status(500).json({
        message: "Erreur serveur lors de la modification du groupe",
        error: error.message
      });
    }
  }

  static async removeTuteurAndSujetFromGroupe(req, res) {
    try {
      const { idGroupe } = req.params;
      if (!idGroupe) {
        res.status(400).json({ message: "ID du groupe non fourni" });
        return;
      }
      const result = await groupeRepository.removeTuteurAndSujetFromGroupe(idGroupe);
      if (!result) {
        res.status(404).json({ message: "Groupe non trouvé" });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Tuteur et sujet supprimés du groupe avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du tuteur et du sujet du groupe:", error);
      res.status(500).json({
        message: "Erreur lors de la suppression",
        error: error.message,
      });
    }
  }

  static async updateGroupStudents(req, res) {
    const { id } = req.params;
    const { studentIds } = req.body;

    try {
      if (!Array.isArray(studentIds)) {
        return res.status(400).json({ message: 'Invalid student IDs format' });
      }

      const groupe = await groupeRepository.findGroupeById(id);
      if (!groupe) {
        return res.status(404).json({ message: 'Group not found' });
      }

      // Get current students in the group
      const currentStudents = await groupeRepository.getStudentsInGroup(id);
      
      // Remove all current students from this group
      for (const student of currentStudents) {
        await etudiantRepository.updateEtudiant(student.idEtudiant, { idGroupe: null });
      }

      // Add new students to the group
      for (const studentId of studentIds) {
        await etudiantRepository.updateEtudiant(studentId, { idGroupe: id });
      }

      const updatedGroup = await groupeRepository.findGroupeByIdWithStudents(id);

      return res.status(200).json({
        message: 'Group updated successfully',
        groupe: updatedGroup
      });
    } catch (error) {
      console.error('Error updating group students:', error);
      return res.status(500).json({ 
        message: 'Error updating group students',
        error: error.message 
      });
    }
  }



  
}

module.exports = GroupeController;