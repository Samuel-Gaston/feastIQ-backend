import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { HttpService } from "@nestjs/axios";
import { Chat } from "../schema/chat.schema";
import { Model, Types } from "mongoose";
import { HttpStatus } from "@nestjs/common";
import { User } from "../../user/schemas/user.schema";
import { SendMessageDTO } from "../dto/send-message.dto";
import { OrderService } from "../../order/service/order.service";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";
import { AxiosResponse } from "axios";


const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = "openai/gpt-oss-120b"


const SYSTEM_PROMPT = `You are the FeastIQ support assistant. You help customers with questions about the platform: how ordering works, Cash on Delivery, delivery times, cancellations, reviews, and account basics.

Facts about FeastIQ you can rely on:
- Customers browse restaurants, add dishes to a cart, and checkout.
- The only payment method right now is Cash on Delivery: the customer pays the delivery person when the order arrives.
- Orders move through these statuses in order: placed, confirmed, preparing, ready_for_pickup, out_for_delivery, delivered.
- A customer can cancel an order only while it is still "placed" or "confirmed".
- A customer can leave a review only after an order is marked "delivered".

If the customer asks about their own orders (status, history), use the get_my_orders or get_order_status tools rather than guessing.
If you don't know the answer, say so honestly and suggest contacting support instead of making something up.
Keep answers short and friendly.`

const TOOLS = [
    {
        type: "function",
        function: {
            name: "get_my_orders",
            description: "Get the list of the current customer's recent orders with their status",
            parameters: {type: "object", properties: {}, required: []}
        }
    },
    {
        type: "function",
        function: {
            name: "get_order_status",
            description: "Get the status and details of one specific order belonging to the current customer",
            parameters: {
                type: "object",
                properties: {
                    orderId: {type: "string", description: "the id of the order"}
                },
                required: ["orderId"]
            }
        }
    }
]

@Injectable()
export class ChatService{
    constructor(
        @InjectModel(Chat.name)
        private readonly chatModel: Model<Chat>,

        private readonly httpService: HttpService,
        private readonly orderService: OrderService,
        private readonly configService: ConfigService
    ){}


    private async getOrCreateSession(user: User): Promise<Chat>{
        let session = await this.chatModel.findOne({customer: new Types.ObjectId(user._id.toString())})
        if(!session){
            session = await this.chatModel.create({
                customer: new Types.ObjectId(user._id.toString()),
                messages: []
            })
        }
        return session
    }

   private async callGroq(messages: any[]): Promise<any>{
        const apiKey = this.configService.get<string>("GROQ_API_KEY")
        if(!apiKey){
            throw new HttpException("GROQ_API_KEY is not configured", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        const response = await firstValueFrom<AxiosResponse<any>>(
            this.httpService.post(
                GROQ_API_URL,
                {
                    model: GROQ_MODEL,
                    messages,
                    tools: TOOLS,
                    tool_choice: "auto"
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    }
                }
            )
        )

        return response.data
    }

    private async runTool(name: string, args: any, user: User): Promise<any>{
        if(name === "get_my_orders"){
            const orders = await this.orderService.getMyOrders(user)
            return orders.slice(0, 10).map(order => ({
                id: order._id,
                status: order.status,
                total: order.total,
                restaurant: order.restaurant
            }))
        }

        if(name === "get_order_status"){
            if(!args?.orderId){
                return {error: "orderId is required"}
            }
            const order = await this.orderService.getOrderById(args.orderId)
            if(order.customer?.toString() !== user._id.toString()){
                return {error: "This order does not belong to you"}
            }
            return {
                id: order._id,
                status: order.status,
                statusHistory: order.statusHistory,
                total: order.total
            }
        }

        return {error: "Unknown tool"}
    }

    async sendMessage(dto: SendMessageDTO, user: User): Promise<{reply: string}>{
        if(!dto.message){
            throw new HttpException("message is required", HttpStatus.BAD_REQUEST)
        }

        const session = await this.getOrCreateSession(user)

        const history = (session.messages ?? []).map(item => ({
            role: item.role,
            content: item.content
        }))

        const messages: any[] = [
            {role: "system", content: SYSTEM_PROMPT},
            ...history,
            {role: "user", content: dto.message}
        ]

        let result = await this.callGroq(messages)
        let choice = result.choices?.[0]?.message

        if(choice?.tool_calls && choice.tool_calls.length > 0){
            messages.push(choice)

            for(const toolCall of choice.tool_calls){
                const args = toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {}
                const toolResult = await this.runTool(toolCall.function.name, args, user)

                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(toolResult)
                })
            }

            result = await this.callGroq(messages)
            choice = result.choices?.[0]?.message
        }

        const reply = choice?.content ?? "Sorry, I could not process that."

        session.messages = [
            ...(session.messages ?? []),
            {role: "user", content: dto.message, createdAt: new Date()},
            {role: "assistant", content: reply, createdAt: new Date()}
        ]
        await session.save()

        return {reply}
    }

    async getMyHistory(user: User): Promise<Chat>{
        const session = await this.getOrCreateSession(user)
        return session
    }

}