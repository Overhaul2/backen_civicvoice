
export class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(username, email, password) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Créer un nouvel utilisateur
    const newUser = await this.userRepository.create({ username, email, password });
    return newUser;
  }

}