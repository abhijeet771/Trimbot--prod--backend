import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import * as fs from 'fs';
import {
  User,
  Barber,
  Service,
  Pricing,
  Offer,
  Hairstyle,
  SalonSettings,
  Appointment,
  Review,
} from '../server/src/models';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trimtokyo';
const dumpDir = path.join(__dirname, '../trimtoyo/dump/trimtokyo');

function readBsonFile(filePath: string): any[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: BSON file not found: ${filePath}`);
    return [];
  }
  const buffer = fs.readFileSync(filePath);
  let offset = 0;
  const documents: any[] = [];
  const BSON = (mongoose.mongo as any).BSON;
  while (offset < buffer.length) {
    const size = buffer.readInt32LE(offset);
    if (size <= 0 || offset + size > buffer.length) {
      break;
    }
    const docBuffer = buffer.subarray(offset, offset + size);
    try {
      const doc = BSON.deserialize(docBuffer);
      documents.push(doc);
    } catch (err) {
      console.error(`Error deserializing doc at offset ${offset} in ${filePath}:`, err);
      break;
    }
    offset += size;
  }
  return documents;
}

const restoreDatabase = async () => {
  try {
    console.log('Connecting to database for restoration...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected successfully.');

    // 1. Clear existing data
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Barber.deleteMany({}),
      Service.deleteMany({}),
      Pricing.deleteMany({}),
      Offer.deleteMany({}),
      Hairstyle.deleteMany({}),
      SalonSettings.deleteMany({}),
      Appointment.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('Existing collections cleared.');

    // 2. Load BSON files
    console.log(`Reading BSON dumps from: ${dumpDir}`);
    const authsDocs = readBsonFile(path.join(dumpDir, 'auths.bson'));
    const usersDocs = readBsonFile(path.join(dumpDir, 'users.bson'));
    const barberProfilesDocs = readBsonFile(path.join(dumpDir, 'barberprofiles.bson'));
    const barberServicesDocs = readBsonFile(path.join(dumpDir, 'barberservices.bson'));
    const ordersDocs = readBsonFile(path.join(dumpDir, 'orders.bson'));
    const reviewsDocs = readBsonFile(path.join(dumpDir, 'reviews.bson'));

    console.log('\n--- BSON Data Summary ---');
    console.log(`Auths: ${authsDocs.length}`);
    console.log(`User profiles: ${usersDocs.length}`);
    console.log(`Barber profiles: ${barberProfilesDocs.length}`);
    console.log(`Barber services: ${barberServicesDocs.length}`);
    console.log(`Orders/Bookings: ${ordersDocs.length}`);
    console.log(`Reviews: ${reviewsDocs.length}`);
    console.log('-------------------------\n');

    // 3. Migrate Users (Auth + Profiles)
    console.log('Migrating Users...');
    const userProfileMap = new Map<string, any>();
    for (const u of usersDocs) {
      if (u.authId) {
        userProfileMap.set(u.authId.toString(), u);
      }
    }

    const usersToInsert = [];
    for (const auth of authsDocs) {
      const profile = userProfileMap.get(auth._id.toString());
      
      let chatRole: 'customer' | 'admin' | 'barber' = 'customer';
      if (auth.role === 'admin') chatRole = 'admin';
      else if (auth.role === 'barber') chatRole = 'barber';

      usersToInsert.push({
        _id: auth._id,
        name: auth.name || 'Unnamed User',
        email: auth.email,
        password: auth.password,
        phone: profile?.phone || '',
        role: chatRole,
        preferences: {
          preferredServices: [],
        },
        createdAt: auth.createdAt || new Date(),
        updatedAt: auth.updatedAt || new Date(),
      });
    }

    // Insert fallback user profiles that don't have matching auth record
    const insertedAuthIds = new Set(usersToInsert.map(u => u._id.toString()));
    for (const u of usersDocs) {
      if (u.authId && !insertedAuthIds.has(u.authId.toString())) {
        usersToInsert.push({
          _id: u.authId,
          name: 'Imported User',
          email: `imported_${u._id}@trimtokyo.jp`,
          phone: u.phone || '',
          role: 'customer',
          preferences: {
            preferredServices: [],
          },
          createdAt: u.createdAt || new Date(),
          updatedAt: u.updatedAt || new Date(),
        });
      }
    }

    await User.insertMany(usersToInsert);
    console.log(`Successfully migrated ${usersToInsert.length} Users.`);

    // 4. Migrate Barbers (Barber Profiles)
    console.log('Migrating Barbers...');
    const barberServicesMap = new Map<string, any[]>();
    for (const s of barberServicesDocs) {
      const pId = s.barberProfileId ? s.barberProfileId.toString() : '';
      if (pId) {
        if (!barberServicesMap.has(pId)) {
          barberServicesMap.set(pId, []);
        }
        barberServicesMap.get(pId)!.push(s);
      }
    }

    const authMap = new Map<string, any>();
    for (const a of authsDocs) {
      authMap.set(a._id.toString(), a);
    }

    const barbersToInsert = [];
    for (const bp of barberProfilesDocs) {
      const auth = bp.userId ? authMap.get(bp.userId.toString()) : null;
      const services = barberServicesMap.get(bp._id.toString()) || [];
      
      const specialties = Array.from(new Set(services.map(s => s.title)))
        .filter(t => t)
        .slice(0, 5) as string[];

      const defaultSchedule = {
        monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
        tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
        wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
        thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
        friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] },
        saturday: { isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '13:00', endTime: '13:30' }] },
        sunday: { isWorking: false, startTime: '09:00', endTime: '18:00', breaks: [] },
      };

      barbersToInsert.push({
        _id: bp._id,
        name: auth?.name || bp.shopName || 'Unnamed Barber',
        email: auth?.email || `barber_${bp._id}@trimtokyo.jp`,
        phone: bp.phone || '',
        avatarUrl: bp.avatar || '',
        bio: bp.description || '',
        specialties: specialties.length > 0 ? specialties : ['Haircut', 'Styling'],
        rating: bp.rating || 0,
        reviewCount: bp.totalReviews || 0,
        status: bp.isActive ? 'active' : 'inactive',
        schedule: defaultSchedule,
        createdAt: bp.createdAt || new Date(),
        updatedAt: bp.updatedAt || new Date(),
      });
    }

    await Barber.insertMany(barbersToInsert);
    console.log(`Successfully migrated ${barbersToInsert.length} Barbers.`);

    // 5. Migrate Services
    console.log('Migrating Services...');
    const servicesToInsert = [];
    for (const bs of barberServicesDocs) {
      let category: 'Haircut' | 'Beard' | 'Coloring' | 'Treatment' | 'Combo' | 'Other' = 'Other';
      const titleLower = bs.title.toLowerCase();
      if (titleLower.includes('cut') || titleLower.includes('trim') || titleLower.includes('style')) {
        category = 'Haircut';
      } else if (titleLower.includes('beard') || titleLower.includes('shave') || titleLower.includes('mustache')) {
        category = 'Beard';
      } else if (titleLower.includes('color') || titleLower.includes('dye') || titleLower.includes('highlight')) {
        category = 'Coloring';
      } else if (titleLower.includes('treatment') || titleLower.includes('spa') || titleLower.includes('detox') || titleLower.includes('massage')) {
        category = 'Treatment';
      } else if (titleLower.includes('combo') || titleLower.includes('package') || titleLower.includes('executive')) {
        category = 'Combo';
      }

      servicesToInsert.push({
        _id: bs._id,
        name: bs.title,
        description: bs.description || bs.title,
        durationMinutes: bs.duration || 30,
        price: bs.price || 0,
        category,
        isActive: bs.isActive && bs.status === 'APPROVED',
        createdAt: bs.createdAt || new Date(),
        updatedAt: bs.updatedAt || new Date(),
      });
    }

    await Service.insertMany(servicesToInsert);
    console.log(`Successfully migrated ${servicesToInsert.length} Services.`);

    // 6. Migrate Appointments (Orders)
    console.log('Migrating Appointments...');
    const appointmentsToInsert = [];
    for (const order of ordersDocs) {
      const serviceIds = (order.services || []).map((s: any) => s.serviceId);
      const startDate = order.scheduledDate || new Date();
      const totalDuration = order.totalDuration || 30;
      const endDate = new Date(new Date(startDate).getTime() + totalDuration * 60000);

      let chatStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' = 'confirmed';
      if (order.status === 'PENDING') chatStatus = 'pending';
      else if (order.status === 'COMPLETED') chatStatus = 'completed';
      else if (order.status === 'CANCELLED') chatStatus = 'cancelled';

      appointmentsToInsert.push({
        _id: order._id,
        userId: order.userId,
        barberId: order.barberId,
        services: serviceIds,
        date: startDate,
        endTime: endDate,
        status: chatStatus,
        notes: order.deliveryAddress?.addressLine || '',
        totalAmount: order.totalAmount || 0,
        paymentStatus: order.paymentStatus === 'PAID' ? 'paid' : 'unpaid',
        source: 'web',
        createdAt: order.createdAt || new Date(),
        updatedAt: order.updatedAt || new Date(),
      });
    }

    await Appointment.insertMany(appointmentsToInsert);
    console.log(`Successfully migrated ${appointmentsToInsert.length} Appointments.`);

    // 7. Migrate Reviews
    console.log('Migrating Reviews...');
    const reviewsToInsert = [];
    for (const rev of reviewsDocs) {
      reviewsToInsert.push({
        _id: rev._id,
        userId: rev.userId,
        barberId: rev.barberId,
        rating: rev.rating || 5,
        comment: rev.comment || '',
        createdAt: rev.createdAt || new Date(),
        updatedAt: rev.updatedAt || new Date(),
      });
    }

    await Review.insertMany(reviewsToInsert);
    console.log(`Successfully migrated ${reviewsToInsert.length} Reviews.`);

    // 8. Seed Default Metadata (Salon Settings, Hairstyles, Offers, Pricing)
    console.log('Seeding Default Metadata (Salon Settings, Hairstyles, Offers, Pricing)...');
    
    // Salon Settings
    await SalonSettings.create({
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

    // Hairstyles
    await Hairstyle.create([
      {
        name: 'Textured Crop skin fade',
        description: 'A short textured fringe on top paired with a sharp, high skin fade on the sides. Very modern, low maintenance, and perfect for square or round face shapes.',
        faceShapes: ['oval', 'round', 'square'],
        hairLength: 'short',
        hairTexture: 'straight',
        hairDensity: 'medium',
        maintenanceLevel: 'low',
        stylingProducts: ['Matte Pomade', 'Sea Salt Spray'],
        difficulty: 'easy',
      },
      {
        name: 'Classic Side Part pompadour',
        description: 'A sophisticated look featuring a clean shaved side-part and swept up volume on top. Fits oblong, diamond, or oval face shapes.',
        faceShapes: ['oval', 'oblong', 'diamond'],
        hairLength: 'medium',
        hairTexture: 'straight',
        hairDensity: 'thick',
        maintenanceLevel: 'high',
        stylingProducts: ['Water-Based High Shine Pomade', 'Hair Dryer'],
        difficulty: 'hard',
      },
      {
        name: 'Messy Textured French Crop',
        description: 'Perfect for wavy hair. Provides clean texture on top with cropped sides. Fits heart or oval face shapes nicely and hides thinning hair.',
        faceShapes: ['oval', 'heart', 'round'],
        hairLength: 'short',
        hairTexture: 'wavy',
        hairDensity: 'thin',
        maintenanceLevel: 'medium',
        stylingProducts: ['Styling Powder', 'Matte Clay'],
        difficulty: 'easy',
      },
      {
        name: 'Modern Curly Undercut',
        description: 'Emphasizes natural curls on top while keeping the sides short and tidy. Clean look for office environments.',
        faceShapes: ['oval', 'square', 'diamond'],
        hairLength: 'medium',
        hairTexture: 'curly',
        hairDensity: 'thick',
        maintenanceLevel: 'medium',
        stylingProducts: ['Curl Cream', 'Light Hold Hair Spray'],
        difficulty: 'medium',
      },
    ]);

    // Offers
    const offersData = [
      {
        code: 'WELCOME10',
        title: 'New Client discount',
        description: 'Get 10% off your first ever booking with any barber.',
        discountType: 'percentage' as const,
        discountValue: 10,
        activeFrom: new Date(),
        activeTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
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
    await Offer.create(offersData);

    // Seed some general pricing overrides for a few imported services if available
    const importedServices = await Service.find({ name: /Hair Cut|Shave/i }).limit(2);
    if (importedServices.length > 0) {
      await Pricing.create([
        {
          serviceId: importedServices[0]._id,
          tier: 'student',
          discountPercentage: 20,
          taxPercentage: 10,
          isActive: true,
          notes: 'Available on weekdays only. Must show valid student ID.',
        },
        {
          serviceId: importedServices[0]._id,
          tier: 'member',
          discountPercentage: 15,
          taxPercentage: 10,
          isActive: true,
          notes: 'VIP Membership pricing applied automatically.',
        },
      ]);
    }

    console.log('Seeded default metadata and pricing overrides.');
    console.log('\nRestoration finished successfully! Closing DB connection...');
    await mongoose.disconnect();
    console.log('DB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Restoration failed:', error);
    process.exit(1);
  }
};

restoreDatabase();
