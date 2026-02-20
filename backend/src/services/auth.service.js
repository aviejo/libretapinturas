const bcrypt = require('bcrypt');
const { prisma } = require('../config/database');

const SALT_ROUNDS = 10;

class AuthService {
  async register(email, password) {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      const error = new Error('El email ya está registrado');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  async validateCredentials(email, password) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new AuthService();
