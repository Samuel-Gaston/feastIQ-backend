// import { Injectable, Logger } from '@nestjs/common';
// import { MailerService } from '@nestjs-modules/mailer';

// @Injectable()
// export class MailService {
//   private readonly logger = new Logger(MailService.name);

//   constructor(private readonly mailerService: MailerService) {}

//   async sendDoctorWelcomeEmail(params: {
//     to: string;
//     name: string;
//     email: string;
//     password: string;
//     licenseNumber?: string;
//     specialization?: string;
//   }) {
//     const { to, name, email, password, licenseNumber, specialization } = params;

//     const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     </head>
//     <body style="margin:0; padding:0; background-color:#f4f6f5; font-family: 'Segoe UI', Arial, sans-serif;">
//       <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f5; padding: 32px 0;">
//         <tr>
//           <td align="center">
//             <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">

//               <!-- Header -->
//               <tr>
//                 <td style="background-color:#0b1f17; padding: 28px 32px;">
//                   <table width="100%" cellpadding="0" cellspacing="0">
//                     <tr>
//                       <td>
//                         <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#1a7a4c; margin-right:8px; vertical-align:middle;"></span>
//                         <span style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:0.3px; vertical-align:middle;">
//                           MediTrack <span style="color:#34d399;">Health</span>
//                         </span>
//                       </td>
//                     </tr>
//                   </table>
//                 </td>
//               </tr>

//               <!-- Body -->
//               <tr>
//                 <td style="padding: 36px 32px 16px;">
//                   <p style="margin:0 0 6px; color:#0b1f17; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
//                     Welcome aboard
//                   </p>
//                   <h1 style="margin:0 0 18px; color:#0b1f17; font-size:22px; font-weight:700; line-height:1.3;">
//                     Welcome, Dr. ${name}
//                   </h1>
//                   <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.7;">
//                     Your account has been created on the MediTrack Health platform.
//                     You can now log in and start managing your patients, reviewing health
//                     records, and tracking vitals from your dashboard.
//                   </p>

//                   <!-- Credentials card -->
//                   <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; margin-bottom:24px;">
//                     <tr>
//                       <td style="padding: 18px 20px;">
//                         <p style="margin:0 0 10px; color:#0b1f17; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px;">
//                           Your login credentials
//                         </p>
//                         <table width="100%" cellpadding="0" cellspacing="0">
//                           <tr>
//                             <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">Email</td>
//                             <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600;">${email}</td>
//                           </tr>
//                           <tr>
//                             <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">Password</td>
//                             <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600; font-family: 'Courier New', monospace;">${password}</td>
//                           </tr>
//                           ${specialization ? `
//                           <tr>
//                             <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">Specialization</td>
//                             <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600;">${specialization}</td>
//                           </tr>` : ''}
//                           ${licenseNumber ? `
//                           <tr>
//                             <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">License No.</td>
//                             <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600;">${licenseNumber}</td>
//                           </tr>` : ''}
//                         </table>
//                       </td>
//                     </tr>
//                   </table>

//                   <p style="margin:0 0 28px; color:#94a3b8; font-size:12.5px; line-height:1.6;">
//                     For your security, please log in and change your password as soon as possible.
//                     Do not share these credentials with anyone.
//                   </p>

//                   <!-- CTA -->
//                   <table cellpadding="0" cellspacing="0">
//                     <tr>
//                       <td style="background-color:#0b1f17; border-radius:8px;">
//                         <a href="#" style="display:inline-block; padding:13px 28px; color:#ffffff; font-size:13.5px; font-weight:700; text-decoration:none;">
//                           Log in to your dashboard →
//                         </a>
//                       </td>
//                     </tr>
//                   </table>
//                 </td>
//               </tr>

//               <!-- Footer -->
//               <tr>
//                 <td style="padding: 24px 32px 28px; border-top:1px solid #e2e8f0;">
//                   <p style="margin:0; color:#94a3b8; font-size:11.5px; line-height:1.6;">
//                     This is an automated message from MediTrack Health. If you did not expect
//                     this email, please contact your platform administrator immediately.
//                   </p>
//                 </td>
//               </tr>

//             </table>
//           </td>
//         </tr>
//       </table>
//     </body>
//     </html>
//     `;

//     try {
//       await this.mailerService.sendMail({
//         to,
//         subject: 'Welcome to MediTrack Health — Your Account is Ready',
//         html,
//       });
//       this.logger.log(`Welcome email sent to doctor: ${to}`);
//     } catch (err) {
//       this.logger.error(`Failed to send welcome email to ${to}`, err);
//       // Intentionally not re-thrown — a failed email shouldn't block doctor creation
//     }
//   }

//   async sendPatientWelcomeEmail(params: {
//     to: string;
//     name: string;
//     email: string;
//     password: string;
//   }) {
//     const { to, name, email, password } = params;

//     const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     </head>
//     <body style="margin:0; padding:0; background-color:#f4f6f5; font-family: 'Segoe UI', Arial, sans-serif;">
//       <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f5; padding: 32px 0;">
//         <tr>
//           <td align="center">
//             <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">

//               <!-- Header -->
//               <tr>
//                 <td style="background-color:#0b1f17; padding: 28px 32px;">
//                   <table width="100%" cellpadding="0" cellspacing="0">
//                     <tr>
//                       <td>
//                         <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#1a7a4c; margin-right:8px; vertical-align:middle;"></span>
//                         <span style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:0.3px; vertical-align:middle;">
//                           MediTrack <span style="color:#34d399;">Health</span>
//                         </span>
//                       </td>
//                     </tr>
//                   </table>
//                 </td>
//               </tr>

//               <!-- Body -->
//               <tr>
//                 <td style="padding: 36px 32px 16px;">
//                   <p style="margin:0 0 6px; color:#0b1f17; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
//                     Welcome aboard
//                   </p>
//                   <h1 style="margin:0 0 18px; color:#0b1f17; font-size:22px; font-weight:700; line-height:1.3;">
//                     Welcome, ${name}
//                   </h1>
//                   <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.7;">
//                     Your patient account has been created on the MediTrack Health platform.
//                     You can now log in to track your vitals, view your health records, and
//                     stay connected with your care team — all in one place.
//                   </p>

//                   <!-- Credentials card -->
//                   <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; margin-bottom:24px;">
//                     <tr>
//                       <td style="padding: 18px 20px;">
//                         <p style="margin:0 0 10px; color:#0b1f17; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px;">
//                           Your login credentials
//                         </p>
//                         <table width="100%" cellpadding="0" cellspacing="0">
//                           <tr>
//                             <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">Email</td>
//                             <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600;">${email}</td>
//                           </tr>
//                           <tr>
//                             <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">Password</td>
//                             <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600; font-family: 'Courier New', monospace;">${password}</td>
//                           </tr>
//                         </table>
//                       </td>
//                     </tr>
//                   </table>

//                   <p style="margin:0 0 28px; color:#94a3b8; font-size:12.5px; line-height:1.6;">
//                     For your security, please log in and change your password as soon as possible.
//                     Do not share these credentials with anyone.
//                   </p>

//                   <!-- CTA -->
//                   <table cellpadding="0" cellspacing="0">
//                     <tr>
//                       <td style="background-color:#0b1f17; border-radius:8px;">
//                         <a href="#" style="display:inline-block; padding:13px 28px; color:#ffffff; font-size:13.5px; font-weight:700; text-decoration:none;">
//                           Log in to your dashboard →
//                         </a>
//                       </td>
//                     </tr>
//                   </table>
//                 </td>
//               </tr>

//               <!-- Footer -->
//               <tr>
//                 <td style="padding: 24px 32px 28px; border-top:1px solid #e2e8f0;">
//                   <p style="margin:0; color:#94a3b8; font-size:11.5px; line-height:1.6;">
//                     This is an automated message from MediTrack Health. If you did not expect
//                     this email, please contact your platform administrator immediately.
//                   </p>
//                 </td>
//               </tr>

//             </table>
//           </td>
//         </tr>
//       </table>
//     </body>
//     </html>
//     `;

//     try {
//       await this.mailerService.sendMail({
//         to,
//         subject: 'Welcome to MediTrack Health — Your Account is Ready',
//         html,
//       });
//       this.logger.log(`Welcome email sent to patient: ${to}`);
//     } catch (err) {
//       this.logger.error(`Failed to send welcome email to ${to}`, err);
//       // Intentionally not re-thrown — a failed email shouldn't block patient creation
//     }
//   }

//   async sendPasswordReset(to: string, resetUrl: string) {
//     const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     </head>
//     <body style="margin:0; padding:0; background-color:#f4f6f5; font-family: 'Segoe UI', Arial, sans-serif;">
//       <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f5; padding: 32px 0;">
//         <tr>
//           <td align="center">
//             <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">

//               <!-- Header -->
//               <tr>
//                 <td style="background-color:#0b1f17; padding: 28px 32px;">
//                   <table width="100%" cellpadding="0" cellspacing="0">
//                     <tr>
//                       <td>
//                         <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#1a7a4c; margin-right:8px; vertical-align:middle;"></span>
//                         <span style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:0.3px; vertical-align:middle;">
//                           MediTrack <span style="color:#34d399;">Health</span>
//                         </span>
//                       </td>
//                     </tr>
//                   </table>
//                 </td>
//               </tr>

//               <!-- Body -->
//               <tr>
//                 <td style="padding: 36px 32px 16px;">
//                   <p style="margin:0 0 6px; color:#0b1f17; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
//                     Password reset
//                   </p>
//                   <h1 style="margin:0 0 18px; color:#0b1f17; font-size:22px; font-weight:700; line-height:1.3;">
//                     Reset your password
//                   </h1>
//                   <p style="margin:0 0 28px; color:#475569; font-size:14px; line-height:1.7;">
//                     We received a request to reset the password for your MediTrack Health
//                     account. Click the button below to choose a new password. This link
//                     will expire in 1 hour.
//                   </p>

//                   <!-- CTA -->
//                   <table cellpadding="0" cellspacing="0">
//                     <tr>
//                       <td style="background-color:#0b1f17; border-radius:8px;">
//                         <a href="${resetUrl}" style="display:inline-block; padding:13px 28px; color:#ffffff; font-size:13.5px; font-weight:700; text-decoration:none;">
//                           Reset my password →
//                         </a>
//                       </td>
//                     </tr>
//                   </table>

//                   <p style="margin:28px 0 0; color:#94a3b8; font-size:12.5px; line-height:1.6;">
//                     If you didn't request this, you can safely ignore this email —
//                     your password will remain unchanged.
//                   </p>
//                 </td>
//               </tr>

//               <!-- Footer -->
//               <tr>
//                 <td style="padding: 24px 32px 28px; border-top:1px solid #e2e8f0;">
//                   <p style="margin:0; color:#94a3b8; font-size:11.5px; line-height:1.6;">
//                     This is an automated message from MediTrack Health. If you did not expect
//                     this email, please contact your platform administrator immediately.
//                   </p>
//                 </td>
//               </tr>

//             </table>
//           </td>
//         </tr>
//       </table>
//     </body>
//     </html>
//     `;

//     try {
//       await this.mailerService.sendMail({
//         to,
//         subject: 'Reset your MediTrack Health password',
//         html,
//       });
//       this.logger.log(`Password reset email sent to: ${to}`);
//     } catch (err) {
//       this.logger.error(`Failed to send password reset email to ${to}`, err);
//     }
//   }
// }

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
  this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'gastonetoke@gmail.com',
        pass: 'ekjffvztcdmwfubv',
      },
    });
  }

  async sendDoctorWelcomeEmail(params: {
    to: string;
    name: string;
    email: string;
    password: string;
    licenseNumber?: string;
    specialization?: string;
  }) {
    const { to, name, email, password, licenseNumber, specialization } = params;

       const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f5; font-family: 'Segoe UI', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f5; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">

              <!-- Header -->
              <tr>
                <td style="background-color:#0b1f17; padding: 28px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#1a7a4c; margin-right:8px; vertical-align:middle;"></span>
                        <span style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:0.3px; vertical-align:middle;">
                          MediTrack <span style="color:#34d399;">Health</span>
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 36px 32px 16px;">
                  <p style="margin:0 0 6px; color:#0b1f17; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                    Welcome aboard
                  </p>
                  <h1 style="margin:0 0 18px; color:#0b1f17; font-size:22px; font-weight:700; line-height:1.3;">
                    Welcome, Dr. ${name}
                  </h1>
                  <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.7;">
                    Your account has been created on the MediTrack Health platform.
                    You can now log in and start managing your patients, reviewing health
                    records, and many more from your dashboard.
                  </p>

                  <!-- Credentials card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; margin-bottom:24px;">
                    <tr>
                      <td style="padding: 18px 20px;">
                        <p style="margin:0 0 10px; color:#0b1f17; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px;">
                          Your login credentials
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">Email</td>
                            <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600;">${email}</td>
                          </tr>
                          <tr>
                            <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">Password</td>
                            <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600; font-family: 'Courier New', monospace;">${password}</td>
                          </tr>
                          ${specialization ? `
                          <tr>
                            <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">Specialization</td>
                            <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600;">${specialization}</td>
                          </tr>` : ''}
                          ${licenseNumber ? `
                          <tr>
                            <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">License No.</td>
                            <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600;">${licenseNumber}</td>
                          </tr>` : ''}
                        </table>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 28px; color:#94a3b8; font-size:12.5px; line-height:1.6;">
                    For your security, please log in and change your password as soon as possible.
                    Do not share these credentials with anyone.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    try {
      await this.transporter.sendMail({
        from: '"MediTrack Health" <gastonetoke@gmail.com>',
        to: to,
        subject: 'Welcome to MediTrack Health — Your Account is Ready',
        html,
      });
      this.logger.log(`Welcome email sent successfully to doctor: ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}`, err);
    }
  }

  async sendPatientWelcomeEmail(params: {
    to: string;
    name: string;
    email: string;
    password: string;
  }) {
    const { to, name, email, password } = params;

      const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f5; font-family: 'Segoe UI', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f5; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">

              <!-- Header -->
              <tr>
                <td style="background-color:#0b1f17; padding: 28px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#1a7a4c; margin-right:8px; vertical-align:middle;"></span>
                        <span style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:0.3px; vertical-align:middle;">
                          MediTrack <span style="color:#34d399;">Health</span>
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 36px 32px 16px;">
                  <p style="margin:0 0 6px; color:#0b1f17; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                    Welcome aboard
                  </p>
                  <h1 style="margin:0 0 18px; color:#0b1f17; font-size:22px; font-weight:700; line-height:1.3;">
                    Welcome, ${name}
                  </h1>
                  <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.7;">
                    Your patient account has been created on the MediTrack Health platform.
                    You can now log in to track your vitals, view your health records, and
                    stay connected with your care team — all in one place.
                  </p>

                  <!-- Credentials card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; margin-bottom:24px;">
                    <tr>
                      <td style="padding: 18px 20px;">
                        <p style="margin:0 0 10px; color:#0b1f17; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px;">
                          Your login credentials
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">Email</td>
                            <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600;">${email}</td>
                          </tr>
                          <tr>
                            <td style="padding:4px 0; color:#64748b; font-size:13px; width:90px;">Password</td>
                            <td style="padding:4px 0; color:#0b1f17; font-size:13px; font-weight:600; font-family: 'Courier New', monospace;">${password}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 28px; color:#94a3b8; font-size:12.5px; line-height:1.6;">
                    For your security, please log in and change your password as soon as possible.
                    Do not share these credentials with anyone.
                  </p>

                </td>
              </tr>

       

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    try {
      await this.transporter.sendMail({
        from: '"MediTrack Health" <gastonetoke@gmail.com>',
        to: to,
        subject: 'Welcome to MediTrack Health — Your Account is Ready',
        html,
      });
      this.logger.log(`Welcome email sent successfully to patient: ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}`, err);
    }
  }

async sendPasswordReset(to: string, resetUrl: string) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f5; font-family: 'Segoe UI', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f5; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">

              <!-- Header -->
              <tr>
                <td style="background-color:#0b1f17; padding: 28px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:#1a7a4c; margin-right:8px; vertical-align:middle;"></span>
                        <span style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:0.3px; vertical-align:middle;">
                          MediTrack <span style="color:#34d399;">Health</span>
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 36px 32px 16px;">
                  <p style="margin:0 0 6px; color:#0b1f17; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                    Account Security
                  </p>
                  <h1 style="margin:0 0 18px; color:#0b1f17; font-size:22px; font-weight:700; line-height:1.3;">
                    Reset your password
                  </h1>
                  <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.7;">
                    We received a request to reset the password for your MediTrack Health account. Click the button below to choose a new password.
                  </p>

                  <!-- Action Button Container -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" target="_blank" style="display:inline-block; background-color:#0b1f17; color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; padding:12px 28px; border-radius:6px; letter-spacing:0.3px;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 16px; color:#64748b; font-size:12.5px; line-height:1.6;">
                    If you didn't request a password reset, you can safely ignore this email. This link will expire shortly for security reasons.
                  </p>

                  <p style="margin:0 0 28px; color:#94a3b8; font-size:12px; line-height:1.5; word-break:break-all;">
                    Or copy and paste this link into your browser: <br />
                    <a href="${resetUrl}" style="color:#1a7a4c; text-decoration:underline;">${resetUrl}</a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    try {
      await this.transporter.sendMail({
        from: '"MediTrack Health" <gastonetoke@gmail.com>',
        to: to,
        subject: 'Reset your password — MediTrack Health',
        html,
      });
      this.logger.log(`Password reset email sent to: ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}`, err);
    }
  }
}