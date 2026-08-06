import { IToolDefinition } from '../ai/ai.interface';

export const salonTools: IToolDefinition[] = [
  {
    name: 'checkAvailability',
    description: 'Verify if a specific barber is available at a given date and time for a specific duration.',
    parameters: {
      type: 'object',
      properties: {
        barberId: {
          type: 'string',
          description: 'The unique MongoDB ID of the barber.',
        },
        date: {
          type: 'string',
          description: 'The desired start date and time in ISO 8601 format (e.g., 2026-07-17T14:00:00.000Z).',
        },
        durationMinutes: {
          type: 'number',
          description: 'Total duration of the services in minutes.',
        },
      },
      required: ['barberId', 'date', 'durationMinutes'],
    },
  },
  {
    name: 'bookAppointment',
    description: 'Book a new appointment for a client with a barber for selected services.',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The unique MongoDB ID of the client (User).',
        },
        barberId: {
          type: 'string',
          description: 'The unique MongoDB ID of the barber.',
        },
        serviceIds: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'List of Service MongoDB IDs to book.',
        },
        date: {
          type: 'string',
          description: 'The start date and time of the appointment in ISO 8601 format.',
        },
        totalAmount: {
          type: 'number',
          description: 'The calculated price of the services.',
        },
        notes: {
          type: 'string',
          description: 'Optional comments or requests from the client.',
        },
      },
      required: ['userId', 'barberId', 'serviceIds', 'date', 'totalAmount'],
    },
  },
  {
    name: 'cancelAppointment',
    description: 'Cancel an existing appointment by its appointment ID.',
    parameters: {
      type: 'object',
      properties: {
        appointmentId: {
          type: 'string',
          description: 'The unique MongoDB ID of the appointment to cancel.',
        },
      },
      required: ['appointmentId'],
    },
  },
  {
    name: 'rescheduleAppointment',
    description: 'Reschedule an existing appointment to a new date and time.',
    parameters: {
      type: 'object',
      properties: {
        appointmentId: {
          type: 'string',
          description: 'The unique MongoDB ID of the appointment to reschedule.',
        },
        newDate: {
          type: 'string',
          description: 'The new desired date and time in ISO 8601 format.',
        },
      },
      required: ['appointmentId', 'newDate'],
    },
  },
  {
    name: 'searchBarbers',
    description: 'Find active barbers based on style specialties or availability on a specific date.',
    parameters: {
      type: 'object',
      properties: {
        specialty: {
          type: 'string',
          description: 'Optional specialty filter (e.g., Fade, Beard, Scissor, Color).',
        },
        availableDate: {
          type: 'string',
          description: 'Optional date filter in YYYY-MM-DD format to check if they have active schedules.',
        },
      },
    },
  },
  {
    name: 'pricingLookup',
    description: 'Search salon services, prices, durations, and category details.',
    parameters: {
      type: 'object',
      properties: {
        serviceName: {
          type: 'string',
          description: 'Optional partial name of the service (e.g., Haircut, Color, Beard).',
        },
        pricingTier: {
          type: 'string',
          description: 'Optional price tier filter (e.g., student, member, standard).',
          enum: ['standard', 'student', 'member', 'premium'],
        },
      },
    },
  },
  {
    name: 'recommendHairstyle',
    description: 'Retrieve recommended hairstyles matching face shape, texture, and density.',
    parameters: {
      type: 'object',
      properties: {
        faceShape: {
          type: 'string',
          description: 'The shape of the face.',
          enum: ['oval', 'round', 'square', 'heart', 'diamond', 'oblong'],
        },
        hairTexture: {
          type: 'string',
          description: 'The texture of the hair.',
          enum: ['straight', 'wavy', 'curly', 'coily'],
        },
        hairLength: {
          type: 'string',
          description: 'Desired length profile.',
          enum: ['short', 'medium', 'long'],
        },
      },
    },
  },
  {
    name: 'getUserBookings',
    description: 'Retrieve all bookings (upcoming and past) for a specific user ID.',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The unique MongoDB ID of the user.',
        },
      },
      required: ['userId'],
    },
  },
  {
    name: 'findAvailableSlots',
    description: 'Find open, unbooked appointment slots for a specific barber on a specific date.',
    parameters: {
      type: 'object',
      properties: {
        barberId: {
          type: 'string',
          description: 'The unique MongoDB ID of the barber.',
        },
        date: {
          type: 'string',
          description: 'The date to search for slots in YYYY-MM-DD format.',
        },
      },
      required: ['barberId', 'date'],
    },
  },
  {
    name: 'saveConversation',
    description: 'Save or update session metadata and context (preferred barber, preferences) in database.',
    parameters: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'The active conversation session token.',
        },
        context: {
          type: 'object',
          description: 'Key-value pairs containing conversation context metadata to update (e.g. faceShape, preferredBarberId).',
        },
      },
      required: ['sessionId', 'context'],
    },
  },
];

export default salonTools;
