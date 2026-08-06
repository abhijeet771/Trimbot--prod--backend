import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trim Tokyo AI Chatbot API',
      description: 'AI-powered chatbot backend for Trim Tokyo. This API supports appointment booking, booking management, barber search, pricing, hairstyle recommendations, FAQs, and chatbot conversations.',
      version: 'v1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Bearer token in the format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b2bad187421' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'johndoe@example.com' },
            phone: { type: 'string', example: '+81 90-1234-5678' },
            role: { type: 'string', enum: ['customer', 'barber', 'admin'], example: 'customer' },
            preferences: {
              type: 'object',
              properties: {
                preferredBarber: { type: 'string', example: '60c72b2f9b1d8b2bad187425' },
                preferredServices: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['60c72b2f9b1d8b2bad187430'],
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
          },
        },
        Barber: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b2bad187425' },
            name: { type: 'string', example: 'Ken Tanaka' },
            email: { type: 'string', format: 'email', example: 'ken@trimtokyo.jp' },
            phone: { type: 'string', example: '+81 90-8765-4321' },
            avatarUrl: { type: 'string', example: 'https://example.com/avatars/ken.jpg' },
            bio: { type: 'string', example: 'Expert barber specialized in modern skin fades and classic styling with 10+ years experience.' },
            specialties: { type: 'array', items: { type: 'string' }, example: ['fade', 'beard styling', 'classic cuts'] },
            rating: { type: 'number', format: 'float', example: 4.9 },
            reviewCount: { type: 'integer', example: 124 },
            status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
            schedule: {
              type: 'object',
              properties: {
                monday: { $ref: '#/components/schemas/ScheduleDay' },
                tuesday: { $ref: '#/components/schemas/ScheduleDay' },
                wednesday: { $ref: '#/components/schemas/ScheduleDay' },
                thursday: { $ref: '#/components/schemas/ScheduleDay' },
                friday: { $ref: '#/components/schemas/ScheduleDay' },
                saturday: { $ref: '#/components/schemas/ScheduleDay' },
                sunday: { $ref: '#/components/schemas/ScheduleDay' },
              },
            },
            createdAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
          },
        },
        ScheduleDay: {
          type: 'object',
          properties: {
            isWorking: { type: 'boolean', example: true },
            startTime: { type: 'string', example: '09:00' },
            endTime: { type: 'string', example: '18:00' },
            breaks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  startTime: { type: 'string', example: '13:00' },
                  endTime: { type: 'string', example: '14:00' },
                },
              },
            },
          },
        },
        Service: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b2bad187430' },
            name: { type: 'string', example: 'Premium Haircut & Wash' },
            description: { type: 'string', example: 'Detailed cut including hair wash, scalp massage, and hot towel service.' },
            durationMinutes: { type: 'integer', example: 45 },
            price: { type: 'number', example: 6500 },
            category: { type: 'string', enum: ['Haircut', 'Beard', 'Coloring', 'Treatment', 'Combo', 'Other'], example: 'Haircut' },
            imageUrl: { type: 'string', example: 'https://example.com/services/haircut.jpg' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
          },
        },
        Offer: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b2bad187440' },
            code: { type: 'string', example: 'WELCOME10' },
            title: { type: 'string', example: '10% off for first-time customers' },
            description: { type: 'string', example: 'Get 10% discount on any haircut service on your first visit.' },
            discountType: { type: 'string', enum: ['percentage', 'fixed'], example: 'percentage' },
            discountValue: { type: 'number', example: 10 },
            activeFrom: { type: 'string', format: 'date-time', example: '2026-08-01T00:00:00.000Z' },
            activeTo: { type: 'string', format: 'date-time', example: '2026-12-31T23:59:59.000Z' },
            isActive: { type: 'boolean', example: true },
            usageLimit: { type: 'integer', example: 100 },
            usageCount: { type: 'integer', example: 15 },
            createdAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
          },
        },
        Pricing: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b2bad187450' },
            serviceId: { type: 'string', example: '60c72b2f9b1d8b2bad187430' },
            tier: { type: 'string', enum: ['standard', 'premium', 'student', 'member'], example: 'standard' },
            priceOverride: { type: 'number', example: 5500 },
            discountPercentage: { type: 'number', example: 0 },
            taxPercentage: { type: 'number', example: 10 },
            isActive: { type: 'boolean', example: true },
            notes: { type: 'string', example: 'Special student discount tier pricing' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b2bad187460' },
            userId: { type: 'string', example: '60c72b2f9b1d8b2bad187421' },
            barberId: { type: 'string', example: '60c72b2f9b1d8b2bad187425' },
            services: {
              type: 'array',
              items: { type: 'string' },
              example: ['60c72b2f9b1d8b2bad187430'],
            },
            date: { type: 'string', format: 'date-time', example: '2026-08-02T10:00:00.000Z' },
            endTime: { type: 'string', format: 'date-time', example: '2026-08-02T10:45:00.000Z' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'], example: 'confirmed' },
            notes: { type: 'string', example: 'Prefers scissor cuts on the top.' },
            totalAmount: { type: 'number', example: 6500 },
            paymentStatus: { type: 'string', enum: ['unpaid', 'paid'], example: 'unpaid' },
            source: { type: 'string', enum: ['web', 'chatbot'], example: 'chatbot' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
          },
        },
        Hairstyle: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b2bad187470' },
            name: { type: 'string', example: 'Classic Side Part' },
            description: { type: 'string', example: 'A clean, structured style that splits at the side, perfect for professional environments.' },
            faceShapes: {
              type: 'array',
              items: { type: 'string', enum: ['oval', 'round', 'square', 'heart', 'diamond', 'oblong'] },
              example: ['oval', 'square', 'oblong'],
            },
            hairLength: { type: 'string', enum: ['short', 'medium', 'long'], example: 'short' },
            hairTexture: { type: 'string', enum: ['straight', 'wavy', 'curly', 'coily'], example: 'straight' },
            hairDensity: { type: 'string', enum: ['thin', 'medium', 'thick'], example: 'medium' },
            maintenanceLevel: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
            stylingProducts: { type: 'array', items: { type: 'string' }, example: ['pomade', 'styling comb'] },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'], example: 'easy' },
            imageUrl: { type: 'string', example: 'https://example.com/hairstyles/side-part.jpg' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-08-01T15:19:09.000Z' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred.' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  msg: { type: 'string', example: 'email must be a valid email address' },
                },
              },
            },
          },
        },
      },
    },
  },
  // Search path relative to execution directory (usually server root or project root)
  apis: ['./src/routes/*.ts', './dist/routes/*.js', './server/src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);
export default specs;
