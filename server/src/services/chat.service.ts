import AIFactory from '../ai/ai.factory';
import { IMessageParam } from '../ai/ai.interface';
import { salonTools } from '../toolCalling/tools';
import { getCombinedSystemPrompt } from '../prompts';
import {
  ConversationRepository,
  MessageRepository,
  UserRepository,
  SalonSettingsRepository,
} from '../repositories';
import { BookingService } from './booking.service';
import { BarberService } from './barber.service';
import { PricingService } from './pricing.service';
import { RecommendationService } from './recommendation.service';
import logger from '../utils/logger';

export class ChatService {
  private conversationRepo = new ConversationRepository();
  private messageRepo = new MessageRepository();
  private userRepo = new UserRepository();
  private settingsRepo = new SalonSettingsRepository();

  private bookingService = new BookingService();
  private barberService = new BarberService();
  private pricingService = new PricingService();
  private recommendationService = new RecommendationService();

  async handleChatMessage(params: {
    sessionId: string;
    messageText: string;
    userId?: string;
  }): Promise<{ text: string; conversationId: string }> {
    const { sessionId, messageText, userId } = params;

    // 1. Fetch or create conversation session
    let conversation = await this.conversationRepo.findBySessionId(sessionId);
    if (!conversation) {
      conversation = await this.conversationRepo.create(sessionId, userId);
    }

    // 2. Save user message
    await this.messageRepo.create({
      conversationId: conversation._id as any,
      sender: 'user',
      text: messageText,
    });

    // 3. Load conversation history
    const history = await this.messageRepo.findByConversationId(conversation._id.toString());
    
    // 4. Fetch dynamic system variables (Salon Settings + Current Date/Time context)
    const settings = await this.settingsRepo.getSettings();
    const currentDate = new Date();
    
    // Assemble dynamic system prompt additions
    const dateContext = `
[CURRENT SYSTEM CONTEXT]
Current Date: ${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Current Time: ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
Active Session ID: ${sessionId}
Registered Client User ID: ${userId || 'guest_user'}
Active Salon Settings:
- Address: ${settings.address}
- Contact Phone: ${settings.contactPhone}
- Cancellation Policy: ${settings.refundPolicy}
- VIP Membership: ${settings.membershipDetails}
- Gift Cards: ${settings.giftCardDetails}
`;

    const fullSystemPrompt = getCombinedSystemPrompt() + '\n' + dateContext;

    // 5. Assemble messages for LLM
    const llmMessages: IMessageParam[] = [
      { role: 'system', content: fullSystemPrompt },
      ...history.map((h) => {
        const msg: IMessageParam = {
          role: h.sender as any,
          content: h.text,
        };
        if (h.toolCalls && h.toolCalls.length > 0) {
          msg.tool_calls = h.toolCalls.map((tc: any) => ({
            id: tc.id || `call_${Math.random().toString(36).substring(7)}`,
            name: tc.name,
            arguments: typeof tc.arguments === 'string' ? tc.arguments : JSON.stringify(tc.arguments || {}),
          }));
        }
        return msg;
      }),
    ];

    // 6. Get AI client and request response (handles recursive tool calling)
    const aiService = AIFactory.getAIService();
    let loops = 0;
    const maxLoops = 5; // prevent infinite loops
    let aiTextResult = '';

    while (loops < maxLoops) {
      loops++;
      logger.info(`AI Chat Request loop ${loops}...`);
      
      const aiResponse = await aiService.generateResponse(llmMessages, {
        temperature: 0.1,
        tools: salonTools,
        toolChoice: 'auto',
      });

      aiTextResult = aiResponse.message;

      if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
        logger.info(`AI requested ${aiResponse.toolCalls.length} tool calls.`);
        
        // Push assistant's tool-calling intent into LLM message array
        llmMessages.push({
          role: 'assistant',
          content: aiResponse.message || '',
          tool_calls: aiResponse.toolCalls,
        });

        // Save tool-call intent into database history
        await this.messageRepo.create({
          conversationId: conversation._id as any,
          sender: 'assistant',
          text: aiResponse.message || 'Calling backend tools...',
          toolCalls: aiResponse.toolCalls,
        });

        // Execute tool calls one by one
        for (const tc of aiResponse.toolCalls) {
          logger.info(`Executing tool: ${tc.name} with args: ${tc.arguments}`);
          let toolResult: any;

          try {
            const args = JSON.parse(tc.arguments);
            
            switch (tc.name) {
              case 'checkAvailability':
                toolResult = await this.bookingService.checkAvailability(
                  args.barberId,
                  args.date,
                  args.durationMinutes
                );
                break;
              case 'bookAppointment':
                // Check if user is guest or log-in
                const targetUserId = args.userId || userId;
                if (!targetUserId) {
                  // Prompt creation of guest user if userId is missing
                  const guestUser = await this.userRepo.findOrCreateGuest(
                    'Guest Client',
                    `guest_${sessionId}@trimtokyo.jp`,
                    '080-0000-0000'
                  );
                  args.userId = guestUser._id.toString();
                } else {
                  args.userId = targetUserId;
                }
                
                toolResult = await this.bookingService.bookAppointment(args);
                
                // Store last booking in session context
                await this.conversationRepo.updateContext(sessionId, {
                  lastAppointmentId: toolResult._id,
                  preferredBarberId: toolResult.barberId,
                });
                break;
              case 'cancelAppointment':
                toolResult = await this.bookingService.cancelAppointment(args.appointmentId);
                break;
              case 'rescheduleAppointment':
                toolResult = await this.bookingService.rescheduleAppointment(
                  args.appointmentId,
                  args.newDate
                );
                break;
              case 'searchBarbers':
                toolResult = await this.barberService.searchBarbers(
                  args.specialty,
                  args.availableDate
                );
                break;
              case 'pricingLookup':
                toolResult = await this.pricingService.pricingLookup(
                  args.serviceName,
                  args.pricingTier || 'standard'
                );
                break;
              case 'recommendHairstyle':
                toolResult = await this.recommendationService.recommendHairstyle(
                  args.faceShape,
                  args.hairTexture,
                  args.hairLength
                );
                // Save diagnosed faceShape to session context if provided
                if (args.faceShape) {
                  await this.conversationRepo.updateContext(sessionId, {
                    faceShape: args.faceShape,
                  });
                }
                break;
              case 'getUserBookings':
                toolResult = await this.bookingService.getUserBookings(args.userId || userId || '');
                break;
              case 'findAvailableSlots':
                toolResult = await this.bookingService.findAvailableSlots(
                  args.barberId,
                  args.date
                );
                break;
              case 'saveConversation':
                toolResult = await this.conversationRepo.updateContext(sessionId, args.context);
                break;
              default:
                toolResult = { error: `Tool ${tc.name} is not implemented.` };
            }
          } catch (err: any) {
            logger.error(`Error executing tool ${tc.name}: ${err.message}`);
            toolResult = { error: err.message };
          }

          // Push tool results back to LLM context
          const toolResultString = JSON.stringify(toolResult);
          logger.info(`Tool execution complete. Result sent back to LLM: ${toolResultString.substring(0, 150)}...`);
          
          llmMessages.push({
            role: 'tool',
            content: toolResultString,
            name: tc.name,
            tool_call_id: tc.id,
          });
        }
      } else {
        // No more tool calls, AI returned text message. Save it and break.
        await this.messageRepo.create({
          conversationId: conversation._id as any,
          sender: 'assistant',
          text: aiResponse.message,
        });
        break;
      }
    }

    return {
      text: aiTextResult,
      conversationId: conversation._id.toString(),
    };
  }
}

export default ChatService;
