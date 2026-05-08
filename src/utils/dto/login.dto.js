
class LoginDto {
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }

  validate() {
    if (!this.email || !this.password) {
      throw new Error("Email et Mot de passe requis *");
    }
  }
}

module.exports = LoginDto;