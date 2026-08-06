import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { AppointmentController } from '../controllers/appointment.controller';
import { SalonController } from '../controllers/salon.controller';
import {
  chatValidator,
  bookValidator,
  cancelValidator,
  rescheduleValidator,
} from '../validators';

const router = Router();

// Controllers instantiation
const chatController = new ChatController();
const appointmentController = new AppointmentController();
const salonController = new SalonController();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Submit chatbot message
 *     description: Send a message to the Trim Tokyo AI salon assistant. It processes user requests (booking, lookup, recommendations) using a tool loop and returns conversational replies.
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - messageText
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Unique identifier for the chat session.
 *                 example: "tt_session_abc123"
 *               messageText:
 *                 type: string
 *                 description: The text message from the user.
 *                 example: "I want to book a haircut with Ken on Saturday at 2pm"
 *               userId:
 *                 type: string
 *                 description: Optional user ID if the customer is logged in.
 *                 example: "60c72b2f9b1d8b2bad187421"
 *     responses:
 *       200:
 *         description: Chat response generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                       example: "I've successfully booked your haircut with Ken Tanaka for Saturday, Aug 2, at 2:00 PM. See you then!"
 *                     suggestedActions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["View My Bookings", "Add to Calendar"]
 *       400:
 *         description: Validation failed (missing sessionId or messageText).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/chat', chatValidator, chatController.handleChat);

/**
 * @swagger
 * /api/book:
 *   post:
 *     summary: Manually book an appointment
 *     description: Direct REST endpoint to schedule a salon booking for a client.
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - barberId
 *               - serviceIds
 *               - date
 *               - totalAmount
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Optional user ID to associate with this booking.
 *                 example: "60c72b2f9b1d8b2bad187421"
 *               barberId:
 *                 type: string
 *                 description: The Mongo ID of the barber.
 *                 example: "60c72b2f9b1d8b2bad187425"
 *               serviceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of service Mongo IDs to book.
 *                 example: ["60c72b2f9b1d8b2bad187430"]
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: ISO 8601 start date-time for the appointment.
 *                 example: "2026-08-02T14:00:00.000Z"
 *               totalAmount:
 *                 type: number
 *                 description: Base total cost calculation.
 *                 example: 6500
 *               notes:
 *                 type: string
 *                 description: Special instructions from customer.
 *                 example: "Wants a low skin fade."
 *     responses:
 *       201:
 *         description: Appointment created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation failed or booking conflict.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/book', bookValidator, appointmentController.book);

/**
 * @swagger
 * /api/cancel:
 *   post:
 *     summary: Cancel an appointment
 *     description: Cancel an appointment using its database Mongo ID.
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 description: Mongo ID of the target appointment.
 *                 example: "60c72b2f9b1d8b2bad187460"
 *     responses:
 *       200:
 *         description: Appointment successfully cancelled.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Appointment successfully cancelled."
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation failed or invalid ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Appointment not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/cancel', cancelValidator, appointmentController.cancel);

/**
 * @swagger
 * /api/reschedule:
 *   post:
 *     summary: Reschedule an appointment
 *     description: Modify the start date and time of an existing booking.
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - newDate
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 description: Mongo ID of the appointment to reschedule.
 *                 example: "60c72b2f9b1d8b2bad187460"
 *               newDate:
 *                 type: string
 *                 format: date-time
 *                 description: ISO 8601 date string for the new slot.
 *                 example: "2026-08-03T11:00:00.000Z"
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Appointment successfully rescheduled."
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation failed or new date is unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Appointment not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reschedule', rescheduleValidator, appointmentController.reschedule);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Retrieve user appointments
 *     description: Get lists of booking histories associated with a user.
 *     tags:
 *       - Appointments
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         description: The Mongo ID of the user.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8b2bad187421"
 *     responses:
 *       200:
 *         description: List of appointments retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Missing required userId query parameter.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/appointments', appointmentController.getAppointments);

/**
 * @swagger
 * /api/barbers:
 *   get:
 *     summary: Search active barbers
 *     description: Retrieve list of barbers with Optional filters for specialties and schedules.
 *     tags:
 *       - Barbers
 *     parameters:
 *       - name: specialty
 *         in: query
 *         required: false
 *         description: Barber's specialty to filter by (e.g. fade, shave, scissor).
 *         schema:
 *           type: string
 *           example: "fade"
 *       - name: date
 *         in: query
 *         required: false
 *         description: Target date to check schedule availability (format YYYY-MM-DD).
 *         schema:
 *           type: string
 *           example: "2026-08-01"
 *     responses:
 *       200:
 *         description: List of active barbers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Barber'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/barbers', salonController.getBarbers);

/**
 * @swagger
 * /api/pricing:
 *   get:
 *     summary: Look up pricing tiers
 *     description: Retrieve pricing matrices based on service name and targeted user tiers.
 *     tags:
 *       - Pricing
 *     parameters:
 *       - name: serviceName
 *         in: query
 *         required: false
 *         description: Specific service name to filter by.
 *         schema:
 *           type: string
 *           example: "Premium Haircut & Wash"
 *       - name: tier
 *         in: query
 *         required: false
 *         description: Customer pricing tier.
 *         schema:
 *           type: string
 *           enum: [standard, premium, student, member]
 *           default: standard
 *           example: "student"
 *     responses:
 *       200:
 *         description: Service price details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pricing'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/pricing', salonController.getPricing);

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Retrieve active salon services
 *     description: Fetch list of all active styling and grooming services offered at the salon.
 *     tags:
 *       - Services
 *     responses:
 *       200:
 *         description: List of active services.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/services', salonController.getServices);

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Retrieve active offers and promotions
 *     description: Get discount coupon details and running salon promotions.
 *     tags:
 *       - Services
 *     responses:
 *       200:
 *         description: Active discount offers list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Offer'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/offers', salonController.getOffers);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: System health check
 *     description: Checks and returns server status details.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server health metric info.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Trim Tokyo AI Chatbot API is healthy and operational."
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-08-01T15:19:09.000Z"
 */
router.get('/health', salonController.getHealth);

/**
 * @swagger
 * /api/faq:
 *   get:
 *     summary: Retrieve salon FAQs
 *     description: Fetches operating hours, validated parking policies, address, and cancellations.
 *     tags:
 *       - FAQ
 *     responses:
 *       200:
 *         description: FAQ information loaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     address:
 *                       type: string
 *                       example: "B1F Palace Building, 1-2-3 Shibuya, Shibuya-ku, Tokyo"
 *                     hours:
 *                       type: object
 *                       properties:
 *                         monday_to_thursday:
 *                           type: string
 *                           example: "10:00 AM - 8:00 PM"
 *                         friday:
 *                           type: string
 *                           example: "10:00 AM - 9:00 PM"
 *                         saturday:
 *                           type: string
 *                           example: "9:00 AM - 8:00 PM"
 *                         sunday:
 *                           type: string
 *                           example: "9:00 AM - 6:00 PM (Ken Tanaka closed)"
 *                     parking:
 *                       type: string
 *                       example: "Validated parking is available at Shibuya Cross Tower Parking (2 hours free for bookings over 10,000 Yen)"
 *                     cancellationPolicy:
 *                       type: string
 *                       example: "Full refund for cancellations made >24 hours before the appointment. Less than 24 hours results in a 100% cancellation charge."
 *                     walkIns:
 *                       type: string
 *                       example: "Walk-ins are accommodated if a barber is free, but booking is highly recommended."
 */
router.get('/faq', salonController.getFaq);

/**
 * @swagger
 * /api/users/lookup:
 *   get:
 *     summary: Look up user by email
 *     description: Query DB to check if customer profile exists under a specific email address.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - name: email
 *         in: query
 *         required: true
 *         description: Target user email address.
 *         schema:
 *           type: string
 *           format: email
 *           example: "johndoe@example.com"
 *     responses:
 *       200:
 *         description: User profile found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing email query parameter.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No user found matching the provided email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/users/lookup', salonController.lookupUserByEmail);

/**
 * @swagger
 * /api/hairstyles/recommend:
 *   get:
 *     summary: Get hairstyle recommendations
 *     description: Look up personalized hairstyles recommending specific styles based on facial features.
 *     tags:
 *       - Hairstyle
 *     parameters:
 *       - name: faceShape
 *         in: query
 *         required: false
 *         description: Customer's face shape (e.g. oval, round, square, heart, diamond, oblong).
 *         schema:
 *           type: string
 *           example: "oval"
 *       - name: hairTexture
 *         in: query
 *         required: false
 *         description: Customer's hair texture (e.g. straight, wavy, curly, coily).
 *         schema:
 *           type: string
 *           example: "straight"
 *       - name: hairLength
 *         in: query
 *         required: false
 *         description: Customer's hair length (e.g. short, medium, long).
 *         schema:
 *           type: string
 *           example: "short"
 *     responses:
 *       200:
 *         description: List of recommended hairstyles.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hairstyle'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/hairstyles/recommend', salonController.getHairstyleRecommendations);

export default router;
