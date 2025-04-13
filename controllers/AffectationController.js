// eslint-disable-next-line @typescript-eslint/no-require-imports
const AffectationService = require('../services/affectationService');

const affectationService = new AffectationService();
class AffectationController {
  async assignTuteursAndSujetsAleatoires(req, res) {
    try {
      const result = await affectationService.assignTuteursAndSujetsAleatoires();
      res.status(200).json({ message: 'Affectation réussie', data: result });
    } catch (error) {
      console.error('Error in assignTuteursAndSujetsAleatoires:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AffectationController();