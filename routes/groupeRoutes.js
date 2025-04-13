const express = require("express");
const router = express.Router();
const GroupeController = require("../controllers/GroupeController");
const groupeController = new GroupeController();
// Obtenir tous les groupes
router.get("/groupes", GroupeController.getAllGroupes);

// Ajouter un groupe
router.post("/ajouterGroupe", GroupeController.addGroupe);

// Mettre à jour le groupe d'un étudiant
router.put("/groupes/:id/students", GroupeController.updateGroupStudents)
//router.put("/modifierGroupe/:id", GroupeController.updateStudentGroup);
router.delete('/supprimerAffectationsGroupe/:idGroupe', GroupeController.removeTuteurAndSujetFromGroupe);
// Supprimer un groupe
router.delete("/supprimerGroupe/:id", GroupeController.deleteGroupe);
router.put("/modifierSujetsAuGroupe/:idGroupe", GroupeController.modifierSujetEtTuteurGroupe);
router.get("/getgroupe/:id", GroupeController.getGroupeByIdts);
router.post("/affecterSujetsAuGroupe/:idGroupe", GroupeController.affecterSujetsEtTuteursAuGroupe);
router.post('/generer-groupes', (req, res) => GroupeController.generateGroups(req, res));















module.exports = router;