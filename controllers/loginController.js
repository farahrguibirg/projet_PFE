// eslint-disable-next-line @typescript-eslint/no-require-imports
const LoginRepository = require('../repositories/loginRepository'); // Repository pour accéder aux données de la table login
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jwt = require('jsonwebtoken');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcrypt");

class LoginController {
  // Obtenir tous les enregistrements de la table login
  static async getAllLogins(req, res) {
    try {
      const logins = await LoginRepository.getAllLogins(); // Récupère tous les enregistrements de login
      return res.status(200).json(logins); // Retourne la liste des logins
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message }); // Gère les erreurs
    }
  }
  static async login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await LoginRepository.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
   
        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }
  
      // Generate a JWT token
      const token = jwt.sign(
        { id: user.id,
          userId: user.user_id
          ,
           email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      return res.status(200).json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          user_id: user.user_id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur : ' + error.message });
    }
  }




}

module.exports = LoginController;
