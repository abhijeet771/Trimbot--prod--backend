import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import {
  User,
  Barber,
  Service,
  Pricing,
  Offer,
  Hairstyle,
  SalonSettings,
  Appointment,
} from '../server/src/models';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trimtokyo';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected successfully.');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Barber.deleteMany({}),
      Service.deleteMany({}),
      Pricing.deleteMany({}),
      Offer.deleteMany({}),
      Hairstyle.deleteMany({}),
      SalonSettings.deleteMany({}),
      Appointment.deleteMany({}),
    ]);
    console.log('Existing collections cleared.');

    // 1. Seed Salon Settings
    console.log('Seeding Salon Settings...');
    const settings = await SalonSettings.create({
      name: 'Trim Tokyo',
      address: 'B1F Palace Building, 1-2-3 Shibuya, Shibuya-ku, Tokyo, 150-0002',
      locationMapUrl: 'https://maps.google.com/?q=Trim+Tokyo+Shibuya',
      cancellationWindowHours: 24,
      maxAdvanceBookingDays: 30,
      parkingDetails: 'Validated parking is available at Shibuya Cross Tower Parking. Show your booking confirmation for 2 hours free parking.',
      contactPhone: '+81-3-5468-1234',
      contactEmail: 'reception@trimtokyo.jp',
      refundPolicy: 'Cancellations made more than 24 hours prior to appointment time are fully refundable. Late cancellations or no-shows are subject to a 100% service fee.',
      membershipDetails: 'Trim Tokyo Club membership is 5,000 JPY per month, including 1 free service of choice, priority booking, and 15% discount on styling products.',
      giftCardDetails: 'Digital vouchers can be purchased in amounts of 5,000, 10,000, or 20,000 JPY. Valid for 1 year from the date of purchase.',
      workingHours: [
        { day: 'monday', open: '10:00', close: '20:00', isClosed: false },
        { day: 'tuesday', open: '10:00', close: '20:00', isClosed: false },
        { day: 'wednesday', open: '10:00', close: '20:00', isClosed: false },
        { day: 'thursday', open: '10:00', close: '20:00', isClosed: false },
        { day: 'friday', open: '10:00', close: '21:00', isClosed: false },
        { day: 'saturday', open: '09:00', close: '20:00', isClosed: false },
        { day: 'sunday', open: '09:00', close: '18:00', isClosed: false },
      ],
    });
    console.log('Salon settings seeded.');

    // 2. Seed Services
    console.log('Seeding Services...');
    const servicesData = [
      {
        name: 'Signature Haircut',
        description: 'A customized precision haircut including consultation, wash, scalp massage, and style styling.',
        durationMinutes: 45,
        price: 6500,
        category: 'Haircut' as const,
        isActive: true,
      },
      {
        name: 'Quick Trim',
        description: 'A maintenance cut for sides and neck line. Wash not included.',
        durationMinutes: 20,
        price: 3500,
        category: 'Haircut' as const,
        isActive: true,
      },
      {
        name: 'Classic Beard Grooming',
        description: 'Beard trim using clippers and shears, hot towel therapy, and premium beard oil application.',
        durationMinutes: 30,
        price: 4000,
        category: 'Beard' as const,
        isActive: true,
      },
      {
        name: 'Luxury Hot Towel Shave',
        description: 'Traditional straight razor shave with pre-shave oil, hot towels, and soothing post-shave balm.',
        durationMinutes: 45,
        price: 5500,
        category: 'Beard' as const,
        isActive: true,
      },
      {
        name: 'Creative Hair Coloring',
        description: 'Full hair coloring or bleach/highlights tailored to suit your style and skin tone.',
        durationMinutes: 90,
        price: 12000,
        category: 'Coloring' as const,
        isActive: true,
      },
      {
        name: 'Scalp Detox & Treatment',
        description: 'Deep cleaning scrub, charcoal head spa massage, and hair strengthening treatment.',
        durationMinutes: 30,
        price: 5000,
        category: 'Treatment' as const,
        isActive: true,
      },
      {
        name: 'The Tokyo Executive Combo',
        description: 'Our premium signature package: Signature Haircut, Classic Beard Trim, and Scalp Detox.',
        durationMinutes: 90,
        price: 14000,
        category: 'Combo' as const,
        isActive: true,
      },
    ];

    const services = await Service.create(servicesData);
    console.log(`Seeded ${services.length} services.`);

    // 3. Seed Barbers
    console.log('Seeding Barbers...');
    const barbersData = [
      {
        name: 'Rahul Sen',
        email: 'rahul@trimtokyo.jp',
        phone: '080-1111-2222',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        bio: 'Over 10 years of experience in London and Tokyo. Specializes in skin fades, pompadours, and complex texturizing.',
        specialties: ['Skin Fade', 'Pompadour', 'Texturing', 'Scissor Cut'],
        rating: 4.9,
        reviewCount: 342,
        status: 'active' as const,
        schedule: {
          monday: { isWorking: true, startTime: '10:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
          tuesday: { isWorking: true, startTime: '10:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
          wednesday: { isWorking: true, startTime: '10:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
          thursday: { isWorking: false, startTime: '10:00', endTime: '18:00', breaks: [] },
          friday: { isWorking: true, startTime: '12:00', endTime: '21:00', breaks: [{ startTime: '16:00', endTime: '17:00' }] },
          saturday: { isWorking: true, startTime: '09:00', endTime: '20:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
          sunday: { isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '12:30', endTime: '13:30' }] },
        },
      },
      {
        name: 'Ken Tanaka',
        email: 'ken@trimtokyo.jp',
        phone: '080-3333-4444',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        bio: 'Tokyo native. Master of beard grooming, line-ups, and traditional hot towel shaves. Styling expert.',
        specialties: ['Beard Grooming', 'Hot Towel Shave', 'Line-ups', 'Classic Cuts'],
        rating: 4.8,
        reviewCount: 218,
        status: 'active' as const,
        schedule: {
          monday: { isWorking: false, startTime: '10:00', endTime: '18:00', breaks: [] },
          tuesday: { isWorking: true, startTime: '10:00', endTime: '20:00', breaks: [{ startTime: '14:00', endTime: '15:00' }] },
          wednesday: { isWorking: true, startTime: '10:00', endTime: '20:00', breaks: [{ startTime: '14:00', endTime: '15:00' }] },
          thursday: { isWorking: true, startTime: '10:00', endTime: '20:00', breaks: [{ startTime: '14:00', endTime: '15:00' }] },
          friday: { isWorking: true, startTime: '10:00', endTime: '20:00', breaks: [{ startTime: '14:00', endTime: '15:00' }] },
          saturday: { isWorking: true, startTime: '09:00', endTime: '20:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
          sunday: { isWorking: false, startTime: '09:00', endTime: '18:00', breaks: [] },
        },
      },
      {
        name: 'Yuki Takahashi',
        email: 'yuki@trimtokyo.jp',
        phone: '080-5555-6666',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        bio: 'Specialist in creative coloring, bleach work, and Korean/Japanese modern textured fringes and mullets.',
        specialties: ['Coloring', 'Highlights', 'Modern Shag', 'Mullet', 'Fringe'],
        rating: 4.95,
        reviewCount: 185,
        status: 'active' as const,
        schedule: {
          monday: { isWorking: true, startTime: '10:00', endTime: '20:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
          tuesday: { isWorking: false, startTime: '10:00', endTime: '18:00', breaks: [] },
          wednesday: { isWorking: true, startTime: '10:00', endTime: '20:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
          thursday: { isWorking: true, startTime: '10:00', endTime: '20:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
          friday: { isWorking: true, startTime: '12:00', endTime: '21:00', breaks: [{ startTime: '16:00', endTime: '17:00' }] },
          saturday: { isWorking: true, startTime: '09:00', endTime: '20:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
          sunday: { isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
        },
      },
    ];

    const barbers = await Barber.create(barbersData);
    console.log(`Seeded ${barbers.length} barbers.`);

    // 4. Seed Pricing / Tier adjustments
    console.log('Seeding Pricing matrix overrides...');
    const pricingData = [
      {
        serviceId: services[0]._id, // Signature Haircut
        tier: 'student' as const,
        discountPercentage: 20, // 20% Student discount
        taxPercentage: 10,
        isActive: true,
        notes: 'Available on weekdays only. Must show valid student ID.',
      },
      {
        serviceId: services[0]._id, // Signature Haircut
        tier: 'member' as const,
        discountPercentage: 15, // 15% VIP Member discount
        taxPercentage: 10,
        isActive: true,
        notes: 'VIP Membership pricing applied automatically.',
      },
      {
        serviceId: services[2]._id, // Classic Beard Grooming
        tier: 'member' as const,
        discountPercentage: 15,
        taxPercentage: 10,
        isActive: true,
      },
    ];

    const pricings = await Pricing.create(pricingData);
    console.log(`Seeded ${pricings.length} pricing override rules.`);

    // 5. Seed Coupons/Offers
    console.log('Seeding promo offers...');
    const offersData = [
      {
        code: 'WELCOME10',
        title: 'New Client discount',
        description: 'Get 10% off your first ever booking with any barber.',
        discountType: 'percentage' as const,
        discountValue: 10,
        activeFrom: new Date(),
        activeTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        usageLimit: 1000,
      },
      {
        code: 'MIDWEEK1000',
        title: 'Midweek Special',
        description: 'Get 1000 JPY off any combo or styling package booked on Tuesdays or Wednesdays.',
        discountType: 'fixed' as const,
        discountValue: 1000,
        activeFrom: new Date(),
        activeTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ];
    const offers = await Offer.create(offersData);
    console.log(`Seeded ${offers.length} discount offers.`);

    // 6. Seed Hairstyles Recommendation Index
    console.log('Seeding Hairstyle Recommendations...');
    const hairstyleData = [
      {
        name: 'Textured Crop skin fade',
        description: 'A short textured fringe on top paired with a sharp, high skin fade on the sides. Very modern, low maintenance, and perfect for square or round face shapes.',
        faceShapes: ['oval' as const, 'round' as const, 'square' as const],
        hairLength: 'short' as const,
        hairTexture: 'straight' as const,
        hairDensity: 'medium' as const,
        maintenanceLevel: 'low' as const,
        stylingProducts: ['Matte Pomade', 'Sea Salt Spray'],
        difficulty: 'easy' as const,
      },
      {
        name: 'Classic Side Part pompadour',
        description: 'A sophisticated look featuring a clean shaved side-part and swept up volume on top. Fits oblong, diamond, or oval face shapes.',
        faceShapes: ['oval' as const, 'oblong' as const, 'diamond' as const],
        hairLength: 'medium' as const,
        hairTexture: 'straight' as const,
        hairDensity: 'thick' as const,
        maintenanceLevel: 'high' as const,
        stylingProducts: ['Water-Based High Shine Pomade', 'Hair Dryer'],
        difficulty: 'hard' as const,
      },
      {
        name: 'Messy Textured French Crop',
        description: 'Perfect for wavy hair. Provides clean texture on top with cropped sides. Fits heart or oval face shapes nicely and hides thinning hair.',
        faceShapes: ['oval' as const, 'heart' as const, 'round' as const],
        hairLength: 'short' as const,
        hairTexture: 'wavy' as const,
        hairDensity: 'thin' as const,
        maintenanceLevel: 'medium' as const,
        stylingProducts: ['Styling Powder', 'Matte Clay'],
        difficulty: 'easy' as const,
      },
      {
        name: 'Modern Curly Undercut',
        description: 'Emphasizes natural curls on top while keeping the sides short and tidy. Clean look for office environments.',
        faceShapes: ['oval' as const, 'square' as const, 'diamond' as const],
        hairLength: 'medium' as const,
        hairTexture: 'curly' as const,
        hairDensity: 'thick' as const,
        maintenanceLevel: 'medium' as const,
        stylingProducts: ['Curl Cream', 'Light Hold Hair Spray'],
        difficulty: 'medium' as const,
      },
    ];

    const hairstyles = await Hairstyle.create(hairstyleData);
    console.log(`Seeded ${hairstyles.length} hairstyle entries.`);
 
    // 7. Seed Demo User
    console.log('Seeding Demo User...');
    const demoUser = await User.create({
      name: 'Jane Doe',
      email: 'customer@trimtokyo.jp',
      phone: '080-9999-8888',
      role: 'customer',
      preferences: {
        preferredBarber: barbers[0]._id, // Rahul Sen
        preferredServices: [services[0]._id], // Signature Haircut
      },
    });
    console.log('Demo user seeded.');
 
    // 8. Seed Demo Appointments
    console.log('Seeding Demo Appointments...');
    const today = new Date();
    
    // Past appointment (5 days ago)
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 5);
    pastDate.setHours(14, 0, 0, 0); 
    const pastEndDate = new Date(pastDate.getTime() + 45 * 60000); 
 
    // Upcoming appointment 1 (2 days from now)
    const upcomingDate1 = new Date(today);
    upcomingDate1.setDate(today.getDate() + 2);
    upcomingDate1.setHours(11, 0, 0, 0); 
    const upcomingEndDate1 = new Date(upcomingDate1.getTime() + 75 * 60000); 
 
    // Upcoming appointment 2 (5 days from now)
    const upcomingDate2 = new Date(today);
    upcomingDate2.setDate(today.getDate() + 5);
    upcomingDate2.setHours(16, 30, 0, 0); 
    const upcomingEndDate2 = new Date(upcomingDate2.getTime() + 45 * 60000); 
 
    await Appointment.create([
      {
        userId: demoUser._id,
        barberId: barbers[0]._id, 
        services: [services[0]._id], 
        date: pastDate,
        endTime: pastEndDate,
        status: 'confirmed',
        notes: 'Needs classic styling.',
        totalAmount: 6500,
        paymentStatus: 'paid',
        source: 'chatbot',
      },
      {
        userId: demoUser._id,
        barberId: barbers[1]._id, 
        services: [services[0]._id, services[2]._id], 
        date: upcomingDate1,
        endTime: upcomingEndDate1,
        status: 'confirmed',
        notes: 'Prefers hot towel finish.',
        totalAmount: 10500,
        paymentStatus: 'unpaid',
        source: 'chatbot',
      },
      {
        userId: demoUser._id,
        barberId: barbers[2]._id, 
        services: [services[0]._id], 
        date: upcomingDate2,
        endTime: upcomingEndDate2,
        status: 'confirmed',
        notes: 'Keep it clean.',
        totalAmount: 6500,
        paymentStatus: 'unpaid',
        source: 'chatbot',
      },
    ]);
    console.log('Demo appointments seeded.');
 
    console.log('Seeding finished successfully. Closing DB connection...');
    await mongoose.disconnect();
    console.log('DB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
