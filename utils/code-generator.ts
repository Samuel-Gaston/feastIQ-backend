require('dotenv').config();

export class CodeGenerator {
  static generateUniqueCode(): string {
    const prefix = process.env.CODE_PREFIX || 'NUFI';
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Format: YYYYMMDD
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generate a random number between 1000 and 9999
    return `${prefix}${currentDate}${randomNumber}`;
  }

  static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // avec 6 chiffres
  }

  static generatePassword(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  static generateReferenceId(): string {
    const prefix = 'NUFI';
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${randomPart}`;
  }
}
