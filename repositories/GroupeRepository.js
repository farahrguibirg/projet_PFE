const Groupe = require('../models/Groupe');
const Tuteur = require('../models/Tuteur');
const Sujet = require('../models/Sujet');
const Etudiant = require('../models/Etudiant');

class GroupeRepository {
  constructor() {
    this.Groupe = Groupe;
    this.Etudiant = Etudiant;
    this.Tuteur = Tuteur;
    this.Sujet = Sujet;
  }

  // Create a new group
  async createGroupe(nomGroupe, annee) {
    try {
      const groupe = await this.Groupe.create({ nomGroupe, annee });
      return groupe;
    } catch (error) {
      throw new Error(`Error creating group: ${error.message}`);
    }
  }

  async findGroupeById(idGroupe) {
    try {
      const groupe = await this.Groupe.findByPk(idGroupe, {
        include: [{ model: this.Etudiant, as: 'etudiants' }],
      });
    
      if (!groupe) {
        return null;
      }
    
      return groupe;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du groupe par ID: ${error.message}`);
    }
  }

  // Update a group
  async updateGroupe(idGroupe, nomGroupe, annee) {
    try {
      const groupe = await this.Groupe.findByPk(idGroupe);
      if (groupe) {
        groupe.nomGroupe = nomGroupe;
        groupe.annee = annee;
        await groupe.save();
        return groupe;
      }
      return null;
    } catch (error) {
      throw new Error(`Error updating group: ${error.message}`);
    }
  }

  async deleteGroupe(idGroupe) {
    try {
      const groupe = await this.Groupe.findByPk(idGroupe);
      if (!groupe) {
        return false;
      }
    
      await groupe.destroy();
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du groupe: ${error.message}`);
    }
  }
    
  // Find all groups
  async findAllGroupeset() {
    try {
      const groupes = await this.Groupe.findAll({
        include: [{ model: this.Etudiant, as: 'etudiants' }],
      });
      return groupes;
    } catch (error) {
      throw new Error(`Error finding all groups: ${error.message}`);
    }
  }

  // Get students in a specific group
  async getStudentsInGroup(idGroupe) {
    try {
      const groupe = await this.Groupe.findByPk(idGroupe, {
        include: [{ model: this.Etudiant, as: 'etudiants' }],
      });
      return groupe ? groupe.etudiants : [];
    } catch (error) {
      throw new Error(`Error getting students in group: ${error.message}`);
    }
  }

  // Add a student to a group
  async addStudentToGroupe(idGroupe, idEtudiant) {
    try {
      const etudiant = await this.Etudiant.findByPk(idEtudiant);
      if (etudiant) {
        etudiant.idGroupe = idGroupe;
        await etudiant.save();
        return etudiant;
      }
      return null;
    } catch (error) {
      throw new Error(`Error adding student to group: ${error.message}`);
    }
  }

  // Remove a student from a group
  async removeStudentFromGroupe(idEtudiant) {
    try {
      const etudiant = await this.Etudiant.findByPk(idEtudiant);
      if (etudiant) {
        etudiant.idGroupe = null;
        await etudiant.save();
        return etudiant;
      }
      return null;
    } catch (error) {
      throw new Error(`Error removing student from group: ${error.message}`);
    }
  }

  async findAllWithStudents() {
    return await Groupe.findAll({
      include: ['etudiants']
    });
  }
  
  async affecterSujetEtTuteur(idGroupe, idTuteur, idSujet) {
    try {
      const groupe = await this.Groupe.findByPk(idGroupe);
      if (!groupe) {
        throw new Error('Groupe non trouvé');
      }
  
      groupe.idTuteur = idTuteur;
      groupe.idSujet = idSujet;
      await groupe.save();
  
      return groupe;
    } catch (error) {
      throw new Error(`Erreur lors de l'affectation: ${error.message}`);
    }
  }

  async findAllGroupes() {
    return await Groupe.findAll();
  }

  async findAllGroupesWithDetails() {
    const groupes = await Groupe.findAll({
      include: [
        { model: Tuteur, as: 'tuteur', attributes: ['nom','prenom'] },
        { model: Sujet, as: 'sujet', attributes: ['titre'] },
        { model: Etudiant, as: 'etudiants', attributes: ['nom','prenom'] },
      ],
    });

    return groupes.map(groupe => ({
      groupeNom: groupe.nomGroupe,
      tuteurNom: groupe.tuteur ? `${groupe.tuteur.nom} ${groupe.tuteur.prenom}` : 'Non assigné',
      sujetTitre: groupe.sujet ? groupe.sujet.titre : 'Non assigné',
      etudiants: groupe.etudiants.map(etudiant => `${etudiant.nom} ${etudiant.prenom}`),
    }));
  }

  async assignTuteurAndSujet(groupeId, tuteurId, sujetId) {
    const groupe = await Groupe.findByPk(groupeId);
    if (!groupe) throw new Error('Groupe non trouvé');

    groupe.idTuteur = tuteurId;
    groupe.idSujet = sujetId;
    await groupe.save();

    return groupe;
  }

  async countGroupesAvecSujet(idSujet) {
    try {
      return await this.Groupe.count({ where: { idSujet } });
    } catch (error) {
      throw new Error(`Erreur lors du comptage des groupes avec ce sujet: ${error.message}`);
    }
  }

  async findGroupeByTuteur(idTuteur) {
    try {
      return await this.Groupe.findOne({ where: { idTuteur } });
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du groupe par tuteur: ${error.message}`);
    }
  }

  async findGroupeByIdst(idGroupe) {
    try {
      const groupe = await this.Groupe.findByPk(idGroupe, {
        include: [
          { model: this.Etudiant, as: 'etudiants' },
          { model: this.Tuteur, as: 'tuteur' },
          { model: this.Sujet, as: 'sujet' }
        ],
      });
      if (!groupe) {
        return null;
      }
      return groupe;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du groupe par ID: ${error.message}`);
    }
  }

  async findAllGroupesst() {
    try {
      const groupes = await this.Groupe.findAll({
        include: [
          { model: this.Etudiant, as: 'etudiants' },
          { model: this.Tuteur, as: 'tuteur' },
          { model: this.Sujet, as: 'sujet' }
        ],
      });
      return groupes;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de tous les groupes: ${error.message}`);
    }
  }

  async updateGroupeSujetTuteur(idGroupe, idSujet, idTuteur) {
    try {
      const groupe = await Groupe.findByPk(Number(idGroupe));
      
      if (!groupe) {
        return null;
      }
      
      const updateData = {};
      
      if (idSujet !== undefined) {
        const sujet = await Sujet.findByPk(Number(idSujet));
        if (!sujet) {
          throw new Error("Sujet non trouvé");
        }
        updateData.idSujet = Number(idSujet);
      }
      
      if (idTuteur !== undefined) {
        const tuteur = await Tuteur.findByPk(idTuteur);
        if (!tuteur) {
          throw new Error("Tuteur non trouvé");
        }
        updateData.idTuteur = idTuteur;
      }
      
      await groupe.update(updateData);
      
      const groupeMisAJour = await Groupe.findByPk(Number(idGroupe), {
        include: [
          { model: Tuteur, as: 'tuteur' },
          { model: Sujet, as: 'sujet' },
          { model: Etudiant, as: 'etudiants' }
        ]
      });
      
      return groupeMisAJour;
    } catch (error) {
      console.error("Erreur dans le repository lors de la modification du groupe:", error);
      throw error;
    }
  }

  async removeTuteurAndSujetFromGroupe(idGroupe) {
    try {
      const groupe = await Groupe.findByPk(idGroupe);
  
      if (!groupe) {
        return false;
      }
  
      groupe.idTuteur = null;
      groupe.idSujet = null;
      await groupe.save();
  
      return true;
    } catch (error) {
      console.error("Erreur dans le repository lors de la suppression du tuteur et du sujet:", error);
      throw error;
    }
  }

  async findGroupesByAnnee(annee) {
    return await Groupe.findAll({ where: { annee: annee } });
  }

  async findGroupesByAnneeWithDetails(annee) {
    return await Groupe.findAll({
      where: { annee: annee },
      include: [
        { model: Tuteur, as: 'tuteur' },
        { model: Sujet, as: 'sujet' },
        { model: Etudiant, as: 'etudiants' }
      ]
    });
  }

  async findGroupeByIdWithStudents(id) {
    const groupe = await Groupe.findByPk(id, {
      include: [{
        model: Etudiant,
        as: 'etudiants',
        attributes: ['idEtudiant', 'nom', 'prenom', 'email']
      }]
    });
    return groupe;
  }

  async updateGroupStudents(idGroupe, studentIds) {
    try {
      const groupe = await this.Groupe.findByPk(idGroupe);
      
      if (!groupe) {
        throw new Error('Group not found');
      }

      // Get current students in the group
      const currentStudents = await groupe.getEtudiants();
      
      // Remove all current students from the group
      for (const student of currentStudents) {
        await student.update({ idGroupe: null });
      }
      
      // Add new students to the group
      if (studentIds && studentIds.length > 0) {
        for (const studentId of studentIds) {
          const student = await this.Etudiant.findByPk(studentId);
          if (student) {
            await student.update({ idGroupe: idGroupe });
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating group students:', error);
      throw error;
    }
  }
}

module.exports = new GroupeRepository();