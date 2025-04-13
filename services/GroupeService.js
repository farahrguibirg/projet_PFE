// eslint-disable-next-line @typescript-eslint/no-require-imports
const groupeRepository = require('../repositories/GroupeRepository');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const etudiantRepository = require('../repositories/EtudiantRepository'); // Importing the singleton instance directly

class GroupService {
  /**
   * Mélange aléatoirement un tableau en utilisant l'algorithme de Fisher-Yates.
   * @param {Array} array - Le tableau à mélanger.
   * @returns {Array} - Le tableau mélangé.
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Choisir un index aléatoire
      [array[i], array[j]] = [array[j], array[i]]; // Échanger les éléments
    }
    return array;
  }

  /**
   * Génère des groupes d'étudiants en fonction des paramètres donnés.
   * @param {number} nombreEtudiantsParGroupe - Nombre d'étudiants par groupe.
   * @param {number} nombreGroupes - Nombre total de groupes.
   * @param {string} type - Type de nommage des groupes ('numerique' ou 'alphabet').
   * @param {number} year - Année de création des groupes (par défaut, l'année en cours).
   * @returns {Promise<Array>} - Liste des groupes créés avec leurs étudiants.
   */
  async generateGroups(nombreEtudiantsParGroupe, nombreGroupes, type, year = new Date().getFullYear()) {
    this.validateInput(nombreEtudiantsParGroupe, nombreGroupes, type);

    // Récupérer tous les étudiants sans groupe
    const etudiants = await etudiantRepository.findAllWithoutGroup(year);
    if (etudiants.length === 0) throw new Error("Aucun étudiant trouvé.");

    // Mélanger aléatoirement les étudiants
    const shuffledEtudiants = this.shuffleArray(etudiants);

    // Créer les groupes en fonction des paramètres
    const groupes = this.createGroups(shuffledEtudiants, nombreEtudiantsParGroupe, nombreGroupes);

    // Assigner les étudiants aux groupes dans la base de données
    await this.assignStudentsToGroups(groupes, type, year);

    console.log(`Created ${groupes.length} groups with ${etudiants.length} students.`);
    return await groupeRepository.findAllWithStudents();
  }

  /**
   * Valide les entrées de la fonction generateGroups.
   * @param {number} nombreEtudiantsParGroupe - Nombre d'étudiants par groupe.
   * @param {number} nombreGroupes - Nombre total de groupes.
   * @param {string} type - Type de nommage des groupes.
   */
  validateInput(nombreEtudiantsParGroupe, nombreGroupes, type) {
    if (nombreEtudiantsParGroupe && nombreGroupes) {
      throw new Error("Cannot specify both 'nombreEtudiantsParGroupe' and 'nombreGroupes'. Choose one.");
    }
    if (nombreEtudiantsParGroupe && nombreEtudiantsParGroupe <= 0) {
      throw new Error("'nombreEtudiantsParGroupe' must be a positive integer.");
    }
    if (nombreGroupes && nombreGroupes <= 0) {
      throw new Error("'nombreGroupes' must be a positive integer.");
    }
    if (!['numerique', 'alphabet'].includes(type)) {
      throw new Error("Type invalide. Utilisez 'numerique' ou 'alphabet'.");
    }
  }

  /**
   * Crée les groupes en fonction des étudiants et des paramètres donnés.
   * @param {Array} etudiants - Liste des étudiants.
   * @param {number} nombreEtudiantsParGroupe - Nombre d'étudiants par groupe.
   * @param {number} nombreGroupes - Nombre total de groupes.
   * @returns {Array} - Liste des groupes créés.
   */
  createGroups(etudiants, nombreEtudiantsParGroupe, nombreGroupes) {
    let groupes = [];
    let totalGroupes;

    if (nombreEtudiantsParGroupe) {
      totalGroupes = Math.ceil(etudiants.length / nombreEtudiantsParGroupe);
      groupes = Array.from({ length: totalGroupes }, () => []); // Initialiser des groupes vides

      etudiants.forEach((etudiant, index) => {
        const groupIndex = Math.floor(index / nombreEtudiantsParGroupe);
        groupes[groupIndex].push(etudiant);
      });

      // Si le dernier groupe n'a qu'un seul étudiant, le déplacer dans le groupe précédent
      if (groupes[groupes.length - 1].length === 1) {
        groupes[groupes.length - 2].push(groupes[groupes.length - 1][0]);
        groupes.pop(); // Supprimer le dernier groupe
      }
    } else if (nombreGroupes) {
      totalGroupes = nombreGroupes;
      groupes = this.distributeStudents(etudiants, totalGroupes);
    }

    return groupes;
  }

  /**
   * Répartit les étudiants de manière égale dans les groupes.
   * @param {Array} etudiants - Liste des étudiants.
   * @param {number} totalGroupes - Nombre total de groupes.
   * @returns {Array} - Liste des groupes avec les étudiants répartis.
   */
  distributeStudents(etudiants, totalGroupes) {
    const groupes = Array.from({ length: totalGroupes }, () => []); // Initialiser des groupes vides

    etudiants.forEach((etudiant, index) => {
      const groupIndex = index % totalGroupes; // Répartir les étudiants de manière égale
      groupes[groupIndex].push(etudiant);
    });

    return groupes;
  }

  /**
   * Assigne les étudiants aux groupes dans la base de données.
   * @param {Array} groupes - Liste des groupes.
   * @param {string} type - Type de nommage des groupes.
   * @param {number} year - Année de création des groupes.
   */
  async assignStudentsToGroups(groupes, type, year) {
    for (let i = 0; i < groupes.length; i++) {
      const nomGroupe = this.generateGroupName(type, i);
      console.log(`Creating group: ${nomGroupe}`);

      let groupe;
      try {
        groupe = await groupeRepository.createGroupe(nomGroupe, year);
        if (!groupe || !groupe.idGroupe) {
          throw new Error(`Failed to create group: ${nomGroupe}. No valid group ID returned.`);
        }
      } catch (error) {
        console.error(`Error creating group: ${nomGroupe}`, error);
        throw new Error(`Failed to create group: ${nomGroupe}. Reason: ${error.message}`);
      }

      console.log(`Group created with ID: ${groupe.idGroupe}`);

      // Assigner les étudiants au groupe
      const updatePromises = groupes[i].map(async (etudiant) => {
        console.log(`Assigning student ID ${etudiant.idEtudiant} to group ID ${groupe.idGroupe}`);
        await etudiantRepository.updateGroup(etudiant.idEtudiant, groupe.idGroupe);
      });

      await Promise.all(updatePromises);
    }
  }

  /**
   * Génère un nom de groupe en fonction du type et de l'index.
   * @param {string} type - Type de nommage ('numerique' ou 'alphabet').
   * @param {number} index - Index du groupe.
   * @returns {string} - Nom du groupe.
   */
  generateGroupName(type, index) {
    if (type === 'numerique') {
      return `Groupe ${index + 1}`;
    } else if (type === 'alphabet') {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      return `Groupe ${alphabet[index % alphabet.length]}`;
    } else {
      throw new Error("Type invalide. Utilisez 'numerique' ou 'alphabet'.");
    }
  }
}

module.exports = GroupService;