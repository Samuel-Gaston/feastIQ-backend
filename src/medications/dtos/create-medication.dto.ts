import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";



export class CreateMedicationDTO{
    @ApiProperty({description:'the name of the medication'})
    prescription?:string;

    @ApiProperty({description:'the name of the medication'})
    name?:string;

    @ApiProperty({description:'the dosage'})
    dosage?:string;

    @ApiProperty({description:'the frequency'})
    frequency?:string;

    @ApiProperty({description:'the schedule'})
    schedule?:string;

    @ApiProperty({description:'the duration'})
    duration?:string;

    @ApiProperty({description:'the instrcutions of this medications'})
    instruction?:string;

    @ApiProperty({description:'the startDate'})
    startDate?:Date;

    @ApiProperty({description:'the endDate'})
    endDate?:Date;

}