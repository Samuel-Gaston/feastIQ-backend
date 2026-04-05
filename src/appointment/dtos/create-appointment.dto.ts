import { ApiProperty } from "@nestjs/swagger"
 import { AppointmentStatus } from "../../common/enums/appointment-status.enum";
import { ConsultationType } from "../../common/enums/consultation-type.enum";
import { IsOptional, IsNotEmpty } from "class-validator";


export class CreateAppointmentDTO{

    @ApiProperty({description:'Enter Id of the patient'})
    patient?:string;

    @ApiProperty({description:'Enter the scheduled date and time for the appointment'})
    scheduledAt?: Date;

    @ApiProperty({description:'Select the status of the appointment'})
    status?: AppointmentStatus;

    @ApiProperty({description:'Select the consultation type for the appointment'})
    consultationType?: ConsultationType;

    @ApiProperty({description:'Enter the reason for the appointment'})
    reason?:string;

    @ApiProperty({description:'Enter any additional notes for the appointment'})
    notes?:string;




}