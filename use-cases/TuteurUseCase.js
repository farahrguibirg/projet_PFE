// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcrypt");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const TuteurRepository = require("../repositories/TuteurRepository"); // Remplace l'importation ES6 par require()

class TuteurUseCase {
  async createTuteur(data) {
    data.motDePasse = await bcrypt.hash(data.motDePasse, 10);
    return await TuteurRepository.addTuteur(data);
  }

  async getTuteur(id) {
    return await TuteurRepository.getTuteurById(id);
  }

  async listTuteurs() {
    return await TuteurRepository.getAllTuteurs();
  }

  async updateTuteur(id, data) {
    if (data.motDePasse) {
      data.motDePasse = await bcrypt.hash(data.motDePasse, 10);
    }
    return await TuteurRepository.updateTuteur(id, data);
  }

  async deleteTuteur(id) {
    return await TuteurRepository.deleteTuteur(id);
  }
}

module.exports = new TuteurUseCase(); // Exportation avec module.exports
