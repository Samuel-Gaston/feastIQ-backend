import * as Handlebars from 'handlebars';
import { MailerOptions } from '@nestjs-modules/mailer';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

export const mailConfig = (configService: ConfigService): MailerOptions => {
  const translations = {
    fr: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/i18n/fr/common.json'), 'utf-8')),
    en: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/i18n/en/common.json'), 'utf-8')),
  };

  return {
    transport: {
      host: configService.get('MAIL_HOST'),
      port: parseInt(configService.get('MAIL_PORT', '465')),
      secure: true,
      auth: {
        user: configService.get('MAIL_USER'),
        pass: configService.get('MAIL_PASS'),
      },
    },
    defaults: {
      from: `No Reply - NUFISMS <${configService.get('DEFAULT_MAIL_FROM')}>`,
    },
    template: {
      dir: path.join(process.cwd(), 'src', 'common', 'mail', 'templates'),
      adapter: {
        compile: (template: string) => {
          const compiled = Handlebars.compile(template);
          return (context: any) => compiled(context);
        },
      } as any, 
      options: {
        strict: false,
      },
    },
  };
};