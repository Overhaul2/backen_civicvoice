
class CreateUserDto {
  constructor({ email, password, phoneNumber,idCardNumber }) {
    this.email = email;
    this.password = password;
    this.phoneNumber = phoneNumber;
    this.idCardNumber = idCardNumber
  }

  validate() {
    if (!this.email) throw new Error("Email requis");
    if (!this.password) throw new Error("Password requis");
    if (!this.idCardNumber) throw new Error("N° Nina requis");
    if (this.password.length < 7) throw new Error("Password trop court");
  }
}

module.exports = CreateUserDto;