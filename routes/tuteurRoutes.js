// routes/tuteurRoutes.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const multer = require('multer');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const TuteurController = require('../controllers/TuteurController.js');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/addtuteur", TuteurController.addTuteur);
router.get("/tuteurs", TuteurController.getAllTuteurs);
router.get("/gettuteur/:id", TuteurController.getTuteurById);
router.put("/edittuteur/:id", TuteurController.updateTuteur);
router.delete("/deletetuteur/:id", TuteurController.deleteTuteur);
router.post("/import-tuteurs", upload.single('file'), TuteurController.importTuteurs);
router.get("/tuteurs/:user_id",TuteurController.getTuteurByUserId);
module.exports = router;
