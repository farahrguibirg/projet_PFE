// usecases/GroupeUseCase.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const GroupeRepository = require("../repositories/GroupeRepository");

class GroupeUseCase {
  // Create a new group
  async createGroupe(nomGroupe, annee) {
    return await GroupeRepository.createGroupe(nomGroupe, annee);
  }

  // Get a group by ID
  async getGroupe(idGroupe) {
    return await GroupeRepository.findGroupeById(idGroupe);
  }

  // List all groups
  async listGroupes() {
    return await GroupeRepository.findAllGroupes();
  }

  // Update a group
  async updateGroupe(idGroupe, data) {
    return await GroupeRepository.updateGroupe(idGroupe, data);
  }

  // Delete a group
  async deleteGroupe(idGroupe) {
    return await GroupeRepository.deleteGroupe(idGroupe);
  }
}

module.exports = new GroupeUseCase();