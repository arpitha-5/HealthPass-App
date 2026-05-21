import { PrismaClient, PlanName, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding HealthPass database...');

  // ── Plans ──
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { name: PlanName.BASIC },
      update: {},
      create: {
        name: PlanName.BASIC,
        displayName: 'Basic',
        description: 'Essential health coverage for individual or small family',
        priceMonthly: 499,
        priceQuarterly: 1299,
        priceAnnually: 4999,
        maxAdults: 2,
        maxChildren: 2,
        freeVisits: 3,
        features: {
          doctorVisits: 3,
          diagnosticDiscount: '10%',
          accidentalCover: '₹50,000',
          hospitalNetwork: 'Basic Network',
          walletCredits: '5% on bills',
          telemedicine: true,
        },
      },
    }),
    prisma.plan.upsert({
      where: { name: PlanName.ADVANCED },
      update: {},
      create: {
        name: PlanName.ADVANCED,
        displayName: 'Advanced',
        description: 'Comprehensive coverage for families',
        priceMonthly: 999,
        priceQuarterly: 2699,
        priceAnnually: 9999,
        maxAdults: 4,
        maxChildren: 4,
        freeVisits: 6,
        features: {
          doctorVisits: 6,
          diagnosticDiscount: '25%',
          accidentalCover: '₹1,00,000',
          hospitalNetwork: 'Premium Network',
          walletCredits: '7.5% on bills',
          telemedicine: true,
          insuranceTracking: true,
        },
      },
    }),
    prisma.plan.upsert({
      where: { name: PlanName.ENHANCED },
      update: {},
      create: {
        name: PlanName.ENHANCED,
        displayName: 'Enhanced',
        description: 'Premium health concierge for extended families',
        priceMonthly: 1999,
        priceQuarterly: 5499,
        priceAnnually: 19999,
        maxAdults: 6,
        maxChildren: 6,
        freeVisits: 12,
        features: {
          doctorVisits: 12,
          diagnosticDiscount: '50%',
          accidentalCover: '₹2,00,000',
          hospitalNetwork: 'Elite Network',
          walletCredits: '10% on bills',
          telemedicine: true,
          insuranceTracking: true,
          dedicatedConcierge: true,
          annualHealthCheckup: true,
        },
      },
    }),
  ]);

  console.log(`✅ Seeded ${plans.length} plans`);

  // ── Credit Rules ──
  for (const plan of plans) {
    const billTypes = ['MEDICAL_CONSULTATION', 'PHARMACY', 'DIAGNOSTIC', 'HOSPITAL'] as const;
    const pct = plan.name === 'BASIC' ? 5 : plan.name === 'ADVANCED' ? 7.5 : 10;

    for (const billType of billTypes) {
      await prisma.creditRule.upsert({
        where: { id: `${plan.id}_${billType}` },
        update: {},
        create: {
          planId: plan.id,
          billType,
          percentage: pct,
          maxPerBill: 500,
          maxMonthly: 2000,
          maxAnnual: 10000,
          minBillAmount: 100,
          creditExpiryDays: 365,
        },
      }).catch(() => {
        // Ignore if upsert fails due to missing id field — just create
        return prisma.creditRule.create({
          data: { planId: plan.id, billType, percentage: pct, maxPerBill: 500, maxMonthly: 2000, maxAnnual: 10000, minBillAmount: 100, creditExpiryDays: 365 },
        });
      });
    }
  }

  console.log('✅ Seeded credit rules');

  // ── Sample Hospital ──
  const hospital = await prisma.hospital.upsert({
    where: { id: '000000000000000000000001' },
    update: {},
    create: {
      id: '000000000000000000000001',
      name: 'Apollo Hospitals',
      city: 'Hyderabad',
      address: 'Jubilee Hills, Hyderabad, Telangana 500033',
      specialties: ['Cardiology', 'Orthopedics', 'General Medicine', 'Pediatrics'],
      photos: [],
      supportNumber: '040-23607777',
      waitTime: 15,
    },
  });
  console.log(`✅ Seeded hospital: ${hospital.name}`);

  // ── Sample Doctor ──
  const doctor = await prisma.doctor.create({
    data: {
      hospitalId: hospital.id,
      name: 'Dr. Priya Sharma',
      specialty: 'Cardiology',
    },
  }).catch(() => null);

  if (doctor) {
    // ── Sample Time Slots ──
    const slots = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      slots.push({
        hospitalId: hospital.id,
        doctorId: doctor.id,
        date,
        startTime: '10:00',
        endTime: '10:30',
      });
    }
    await prisma.timeSlot.createMany({ data: slots });
    console.log(`✅ Seeded ${slots.length} time slots`);
  }

  // ── Admin User ──
  const admin = await prisma.user.upsert({
    where: { mobile: '9999999999' },
    update: {},
    create: {
      mobile: '9999999999',
      name: 'HealthPass Admin',
      email: 'admin@healthpass.in',
      role: Role.ADMIN,
      isProfileComplete: true,
      consentAccepted: true,
      consentAt: new Date(),
      city: 'Hyderabad',
    },
  });
  console.log(`✅ Seeded admin user: ${admin.mobile}`);
  
  // ── Medicines ──
  const medicines = await prisma.medicine.createMany({
    data: [
      { name: 'Paracetamol 500mg', brand: 'Crocin', price: 45, type: 'Tablet', dosage: '500mg', strip: '15 Tablets', category: 'Cold', image: 'pill' },
      { name: 'Vitamin C 500mg', brand: 'Limcee', price: 90, type: 'Chewable', dosage: '500mg', strip: '30 Tablets', category: 'Vitamins', image: 'pill' },
      { name: 'Hand Sanitizer', brand: 'Dettol', price: 50, type: 'Liquid', dosage: '50ml', strip: '1 Bottle', category: 'General', image: 'flask-outline' },
      { name: 'Pain Relief Spray', brand: 'Volini', price: 180, type: 'Spray', dosage: '60g', strip: '1 Unit', category: 'Other', image: 'spray' },
    ],
  }).catch(() => null);
  if (medicines) console.log('✅ Seeded pharmacy');

  // ── Diagnostics ──
  const diagnostics = await prisma.diagnosticPackage.createMany({
    data: [
      { name: 'Full Body Checkup', price: 1499, originalPrice: 2499, testCount: 60, preparation: 'Fasting 10-12 hrs', reportTime: '24 hrs', isHomeSample: true },
      { name: 'Diabetes Screening', price: 499, originalPrice: 799, testCount: 4, preparation: 'Fasting 8-10 hrs', reportTime: '12 hrs', isHomeSample: true },
      { name: 'Vitamin Profile', price: 999, originalPrice: 1599, testCount: 2, preparation: 'No prep required', reportTime: '48 hrs', isHomeSample: true },
    ],
  }).catch(() => null);
  if (diagnostics) console.log('✅ Seeded diagnostics');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
