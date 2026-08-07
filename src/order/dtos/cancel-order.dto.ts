import { ApiProperty } from "@nestjs/swagger";

export class CancelOrderDTO{
    @ApiProperty({description:'enter the reason for cancellation'})
    reason?:string;
}