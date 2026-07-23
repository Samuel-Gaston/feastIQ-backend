import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AiChatMessage } from '../schemas/ai-chat-message.schema';
import { Patient } from '../../patient/schemas/patient.schema';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    @InjectModel(AiChatMessage.name) private readonly aiChatModel: Model<AiChatMessage>,
    @InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
    private readonly configService: ConfigService,
  ) {}

  // ── Calls OpenAI's Chat Completions API directly ──────────────────────
  private async callLlm(userMessage: string, history: AiChatMessage[]): Promise<string> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in .env');
    }

    // Build conversation context from recent history (last 10 messages) so the AI has memory
    const recentHistory = history.slice(-10).map(m => ({
      role: m.sender === 'PATIENT' ? 'user' : 'assistant',
      content: m.content,
    }));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful, cautious health assistant inside the MediTrack telemedicine app. ' +
              'Give brief, safe, general health guidance in plain language (2-4 sentences). ' +
              'Never diagnose conditions or prescribe medication. ' +
              'Always encourage the user to book a consultation with their doctor for anything serious, ' +
              'persistent, or concerning. Stay warm but professional.',
          },
          ...recentHistory,
          { role: 'user', content: userMessage },
        ],
        max_tokens: 220,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) throw new Error('OpenAI returned no reply content');
    return reply.trim();
  }

  async sendMessage(userId: string, content: string) {
    if (!content?.trim()) throw new Error('Message content is required');

    const patient = await this.patientModel.findOne({ user: new Types.ObjectId(userId) });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const history = await this.aiChatModel
      .find({ patient: patient._id })
      .sort({ sentAt: 1 })
      .lean();

    const userMsg = await this.aiChatModel.create({
      patient: patient._id,
      sender: 'PATIENT',
      content: content.trim(),
    });

    let replyText: string;
    try {
      replyText = await this.callLlm(content.trim(), history as any);
    } catch (err: any) {
      this.logger.error(`LLM call failed: ${err.message}`);
      replyText =
        "I'm having trouble connecting right now. Please try again in a moment, or reach out to your doctor directly if this is urgent.";
    }

    const aiMsg = await this.aiChatModel.create({
      patient: patient._id,
      sender: 'AI',
      content: replyText,
    });

    return { userMessage: userMsg, aiMessage: aiMsg };
  }

  async getHistory(userId: string) {
    const patient = await this.patientModel.findOne({ user: new Types.ObjectId(userId) });
    if (!patient) throw new NotFoundException('Patient profile not found');

    return this.aiChatModel.find({ patient: patient._id }).sort({ sentAt: 1 }).lean();
  }
}