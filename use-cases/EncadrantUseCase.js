// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcrypt");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EncadrantRepository = require("../repositories/EncadrantRepository"); // Remplace l'importation ES6 par require()


class EncadrantUseCase {
  async createEncadrant(data) {
    data.motDePasse = await bcrypt.hash(data.motDePasse, 10);
    return await EncadrantRepository.addEncadrant(data);
  }

  async getEncadrant(id) {
    return await EncadrantRepository.getEncadrantById(id);
  }

  async listEncadrants() {
    return await EncadrantRepository.getAllEncadrants();
  }

  async updateEncadrant(id, data) {
    if (data.motDePasse) {
      data.motDePasse = await bcrypt.hash(data.motDePasse, 10);
    }
    return await EncadrantRepository.updateEncadrant(id, data);
  }

  async deleteEncadrant(id) {
    return await EncadrantRepository.deleteEncadrant(id);
  
}
}
module.exports = new EncadrantUseCase(); // Exportation avec module.exports