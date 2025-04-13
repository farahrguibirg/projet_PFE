// eslint-disable-next-line @typescript-eslint/no-require-imports
const affectationController = require('../controllers/AffectationController');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');

const router = express.Router();

router.post('/affectation', affectationController.assignTuteursAndSujetsAleatoires
);

module.exports = router;