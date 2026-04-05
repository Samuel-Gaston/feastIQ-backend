// import { InjectModel } from "@nestjs/mongoose";
// import { User } from "../../user/schemas/user.schema";
// import { Model } from "mongoose";
// import { Injectable } from "@nestjs/common";
// import { CreateUserDto } from "../../user/dtos/create-user.dto";
// import { CreatePatientDTO } from "../../patient/dtos/create-patient.dto";
// import { Patient } from "../../patient/schemas/patient.schema";
// import { MailService } from "../../common/mail/mail.service";
// import { I18nService } from "nestjs-i18n";



// @Injectable()
// export class AuthService{
//     constructor(
//         @InjectModel(Patient.name)
//         private readonly userModel: Model<Patient>,
//         private readonly mailService: MailService,
//           private readonly i18n: I18nService,
//     ){}

//     async register(dto: CreatePatientDTO): Promise<any>{
//         const response = await this.userModel.create(dto);
//     const welcomeSubject = this.i18n.translate('common.WELCOME_SUBJECT', {
//       lang,
//     });
//     this.mailService
//       .sendWelcomeEmail(context.userEmail, welcomeSubject, 'welcome', context)
//       .catch((error) => {
//         logger.error('Failed to send welcome email', error);
//       });    
//     }


//      async register(
//     createCustomerDto: CreatePatientDTO,
//     lang: string,
//   ): Promise<any> {
//     const response = await this.userservice.create(createCustomerDto);
//     const context = {
//       ...response.context,
//       activationLink: await this.getActivationUrl(response.userId),
//       lang,
//     };
//     const welcomeSubject = this.i18n.translate('common.WELCOME_SUBJECT', {
//       lang,
//     });
//     this.mailService
//       .sendWelcomeEmail(context.userEmail, welcomeSubject, 'welcome', context)
//       .catch((error) => {
//         logger.error('Failed to send welcome email', error);
//       });

//     this.socketGateway.emitEvent(SOCKET_EVENTS.ADMIN_NOTIFICATION_MESSAGE, {
//       message: 'New register',
//       email: context.userEmail,
//       date: new Date(),
//     });

//     await this.notificationService.saveNotification({
//       title: this.i18n.translate('common.NEW_USER_NOTIFICATION_TITLE', {
//         lang,
//       }),
//       message: this.i18n.translate('common.NEW_USER_NOTIFICATION_MESSAGE', {
//         lang,
//         args: { email: context.userEmail },
//       }),
//       roles: [RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.ACCOUNTANT, RoleEnum.SUPPORT],
//     });
//   }
// }