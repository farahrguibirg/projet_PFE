// eslint-disable-next-line @typescript-eslint/no-require-imports
const GroupService = require('../services/GroupeService');

class GenerateGroups {
    async execute(nombreEtudiantsParGroupe, nombreGroupes, type) {
        const groupService = new GroupService();
        return await groupService.generateGroups(nombreEtudiantsParGroupe, nombreGroupes, type);
    }
}

module.exports = GenerateGroups;