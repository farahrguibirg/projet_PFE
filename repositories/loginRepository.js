// eslint-disable-next-line @typescript-eslint/no-require-imports
const Login = require("../models/loginModel"); // Importation du modèle Login

class LoginRepository {
  

  // Obtenir tous les logins
  async getAllLogins() {
    return await Login.findAll({
      logging: console.log,
    });
  }

  async findUserByEmail(email) {
    return await Login.findOne({ where: { email } });
  }


 
}

module.exports = new LoginRepository();
