import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { AxiosResponse } from "axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AiGatewayService{
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ){}

    private getBaseUrl(): string{
        return this.configService.get<string>("AI_SERVICE_BASE_URL") || "http://localhost:8000"
    }

    async classifyFood(fileBuffer: Buffer, filename: string, mimetype: string): Promise<any>{
        try{
            const FormData = require("form-data")
            const form = new FormData()
            form.append("file", fileBuffer, {filename, contentType: mimetype})

            const response = await firstValueFrom<AxiosResponse<any>>(
                this.httpService.post(`${this.getBaseUrl()}/classify-food`, form, {
                    headers: form.getHeaders()
                })
            )
            return response.data
        }catch(error){
            throw new HttpException("AI classification service is currently unavailable", HttpStatus.SERVICE_UNAVAILABLE)
        }
    }

    async getRecommendations(customerId: string, preferredTags: string[], topN: number = 5): Promise<any>{
        try{
            const response = await firstValueFrom<AxiosResponse<any>>(
                this.httpService.post(`${this.getBaseUrl()}/recommend`, {
                    customerId,
                    preferredTags,
                    topN
                })
            )
            return response.data
        }catch(error){
            return {recommendations: [], coldStart: true}
        }
    }

    async classifyFoodByUrl(photoUrl: string): Promise<any>{
        try{
            const imageResponse = await firstValueFrom<AxiosResponse<ArrayBuffer>>(
                this.httpService.get(photoUrl, {responseType: "arraybuffer"})
            )
            const fileBuffer = Buffer.from(imageResponse.data)

            return await this.classifyFood(fileBuffer, "dish.jpg", "image/jpeg")
        }catch(error){
            return null
        }
    }

}