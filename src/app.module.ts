import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule, I18nJsonLoader, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { RolesModule } from './roles/roles.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [
       // Load .env globally
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

    // MongoDB connection
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL'),
      }),
    }),

    RolesModule,
    PatientModule,
    DoctorModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
