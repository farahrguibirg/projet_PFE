// eslint-disable-next-line @typescript-eslint/no-require-imports
const affectationService = require('../services/affectationService');

module.exports = {
  async execute() {
    return await affectationService.assignTuteursAndSujetsAleatoires;
  },
};