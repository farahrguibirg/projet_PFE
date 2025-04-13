// SujetUseCase.js
const SujetRepository = require('../repositories/SujetRepository'); // Assurez-vous du bon chemin

class SujetUseCase {
  async createSujet(data) {
    return await SujetRepository.addSujet(data);
  }

  async getSujet(id) {
    return await SujetRepository.getSujetById(id);
  }

  async listSujets() {
    return await SujetRepository.getAllSujets();
  }

  async updateSujet(id, data) {
    return await SujetRepository.updateSujet(id, data);
  }

  async deleteSujet(id) {
    return await SujetRepository.deleteSujet(id);
  }
}

module.exports = new SujetUseCase();
