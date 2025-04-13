// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcrypt");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EtudiantRepository = require("../repositories/EtudiantRepository"); // Remplace l'importation ES6 par require()

class EtudiantUseCase {
  constructor() {
  this.etudiantRepository = new EtudiantRepository();
}
  async createEtudiant(data) {
    data.motDePasse = await bcrypt.hash(data.motDePasse, 10);
    return await EtudiantRepository.addEtudiant(data);
  }

  async getEtudiant(id) {
    return await EtudiantRepository.getEtudiantById(id);
  }

  async listEtudiants() {
    return await EtudiantRepository.getAllEtudiants();
  }

  async updateEtudiant(id, data) {
    if (data.motDePasse) {
      data.motDePasse = await bcrypt.hash(data.motDePasse, 10);
    }
    return await EtudiantRepository.updateEtudiant(id, data);
  }

  async deleteEtudiant(id) {
    return await EtudiantRepository.deleteEtudiant(id);
  }

  async execute(etudiantId) {
    const etudiant = await this.etudiantRepository.findEtudiantWithGroupDetails(etudiantId);
    if (!etudiant) {
      throw new Error('Etudiant not found');
    }
    return etudiant;
  }
}

module.exports = new EtudiantUseCase(); // Exportation avec module.exports
