import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
     // mail.module.ts
useFactory: (config: ConfigService) => ({
  transport: {
    host: config.get<string>('MAIL_HOST'),
    port: config.get<number>('MAIL_PORT'),
    // If port is 465, secure MUST be true. 
    // If you want secure: false, change port to 587.
    secure: config.get<number>('MAIL_PORT') === 587, 
    auth: {
      user: config.get<string>('MAIL_USER'),
      pass: config.get<string>('MAIL_PASSWORD'), // Matches .env key
    },
  },
  defaults: {
    from: config.get<string>('MAIL_FROM'),
  },
}),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}