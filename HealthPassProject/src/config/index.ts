export const config = {
  port: parseInt(process.env.PORT ?? '5000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES ?? '10', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10),
    blockDurationMinutes: 30,
  },
  supportedCities: ['Hyderabad', 'Bangalore', 'Chennai', 'Mumbai', 'Delhi', 'Pune'],
  freeVisitPolicy: 'AT_BOOKING' as const, // default, admin can change per config
};
