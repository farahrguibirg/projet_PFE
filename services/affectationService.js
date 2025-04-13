// eslint-disable-next-line @typescript-eslint/no-require-imports
const tuteurRepository = require('../repositories/TuteurRepository');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sujetRepository = require('../repositories/SujetRepository');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const groupeRepository = require('../repositories/GroupeRepository');

class AffectationService {
  async assignTuteursAndSujetsAleatoires() {
    try {
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Fetch tutors, subjects, and groups for current year
      const [tuteurs, sujets, groupes] = await Promise.all([
        tuteurRepository.getTuteursByYear(currentYear),
        sujetRepository.getSujetsByYear(currentYear),
        groupeRepository.findGroupesByAnnee(currentYear),
      ]);

      // Check if there are enough tutors, subjects, and groups for current year
      if (tuteurs.length === 0 || sujets.length === 0 || groupes.length === 0) {
        throw new Error(`Not enough tutors, subjects, or groups available for assignment in year ${currentYear}`);
      }

      // Filter available tutors (not assigned yet)
      const tuteursDisponibles = tuteurs.filter(tuteur => !tuteur.isAssigned);

      if (tuteursDisponibles.length === 0) {
        throw new Error(`All tutors are already assigned to a group for year ${currentYear}`);
      }

      // Assign tutors and subjects to groups
      for (const groupe of groupes) {
        if (tuteursDisponibles.length === 0) {
          throw new Error(`No more tutors available for assignment in year ${currentYear}`);
        }

        // Select random tutor
        const randomTuteurIndex = Math.floor(Math.random() * tuteursDisponibles.length);
        const randomTuteur = tuteursDisponibles[randomTuteurIndex];

        // Filter available subjects (those that haven't reached their limit)
        const sujetsDisponibles = await Promise.all(
          sujets.map(async (sujet) => {
            const count = await sujetRepository.countGroupesBySujet(sujet.idSujet);
            return count < 3 ? sujet : null;
          })
        ).then(results => results.filter(sujet => sujet !== null));

        if (sujetsDisponibles.length === 0) {
          throw new Error(`All subjects have reached their assignment limit for year ${currentYear}`);
        }

        // Select random subject from available ones
        const randomSujetIndex = Math.floor(Math.random() * sujetsDisponibles.length);
        const randomSujet = sujetsDisponibles[randomSujetIndex];

        // Assign tutor and subject to group
        await groupeRepository.assignTuteurAndSujet(
          groupe.idGroupe, 
          randomTuteur.idTuteur, 
          randomSujet.idSujet
        );

        // Remove assigned tutor from available list
        tuteursDisponibles.splice(randomTuteurIndex, 1);
      }

      // Fetch all groups with complete details for current year
      const groupesAvecDetails = await groupeRepository.findAllGroupesWithDetails(currentYear);
      
      return groupesAvecDetails;
    } catch (error) {
      console.error('Error in assignTuteursAndSujetsAleatoires:', error);
      throw error;
    }
  }
}

module.exports = AffectationService;