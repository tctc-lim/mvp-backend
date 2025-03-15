import { ConfigService } from '@nestjs/config';

export const configuration = () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
        url: process.env.DATABASE_URL || ''
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d'
    },
    environment: process.env.NODE_ENV || 'development',
});