import { ApiProperty } from "@nestjs/swagger";

export class SendMessageDTO{
    @ApiProperty({description:'enter your message'})
    message?:string;
}