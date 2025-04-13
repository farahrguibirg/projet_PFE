const LoginRepository = require("../repositories/loginRepository");

class LoginUseCase {
    static async getAllLogins() {
        return await LoginRepository.getAll();
    }
}

module.exports = LoginUseCase;
