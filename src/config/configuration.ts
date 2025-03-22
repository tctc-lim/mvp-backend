export const configuration = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  environment: process.env.NODE_ENV || 'development',
  api: {
    version: '1.0',
    prefix: 'api/v1',
    docsPath: 'api-docs',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  },
  mailer: {
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT || '2525', 10),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
    from: {
      name: process.env.MAILTRAP_FROM_NAME || 'Church KYC',
      email: process.env.MAILTRAP_FROM_EMAIL || 'no-reply@churchkyc.com',
    },
  },
});
