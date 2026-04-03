import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, Injectable } from '@nestjs/common';


@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public appName = 'MediTrack';

  /**
   * Méthode générique pour envoyer des emails
   */
  private async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `${this.appName} : ${subject}`,
        template,
        context: {
          ...context,
          year: new Date().getFullYear(),
          appName: this.appName,
        },
      });
    } catch (error) {
      throw new HttpException('Failed to send email', 500);
    }
  }

  /**
   * Envoyer un email de bienvenue
   */
  async sendWelcomeEmail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    await this.sendEmail(to, subject, 'welcome', context);
  }




// Inside mail.service.ts
/**
 * Envoie les accès (email + password) au nouvel utilisateur
 */
async sendUserCredentials(to: string, password: string, name: string): Promise<void> {
  const subject = 'Vos accès de connexion';
  
  const context = {
    userName: name,              // Matches {{userName}}
    userEmail: to,               // Matches {{userEmail}}
    generatedPassword: password, // Matches {{generatedPassword}}
    loginUrl: 'https://nufisms.com/login', 
  };

  await this.sendEmail(to, subject, 'credentials', context);
}











  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendResetPassword(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    await this.sendEmail(to, subject, template, context);
  }

  /**
   * Envoyer une confirmation de changement de mot de passe
   */
  async sendUpdatePassword(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    await this.sendEmail(to, subject, template, context);
  }

  /**
   * Méthode publique générique pour envoyer n'importe quel type d'email
   */
  async sendCustomEmail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    await this.sendEmail(to, subject, template, context);
  }
}
