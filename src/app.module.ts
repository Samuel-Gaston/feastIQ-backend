import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule, I18nJsonLoader, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { RolesModule } from './roles/roles.module';
import { CustomerModule } from './customer/customer.module';
import { UserModule } from './user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailConfig } from './config/mail.config';
import { MailModule } from './common/mail/mail.module';
import {AdminModule} from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { MenuItemModule } from './menus/menu-item.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
import { SeedModule } from './database/seed.module';
import { AiGatewayModule } from './ai-gateway/ai-gateway.module';
import { RecommendationModule } from './recommendation/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true ,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

 I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, '../src/i18n/'),
        watch: true,
      },
      resolvers: [new AcceptLanguageResolver()],
    }),

       MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => mailConfig(configService),
    }),

   
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL'),
      }),
    }),

    RolesModule,
    UserModule,
    CustomerModule,
    RestaurantModule,
    AuthModule,
    AdminModule,
    MenuItemModule,
    CartModule,
    OrderModule,
    ReviewModule,
    ChatModule,
    MailModule,
    NotificationModule,
    AuditLogModule,
    SeedModule,
    RecommendationModule,
    AiGatewayModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
