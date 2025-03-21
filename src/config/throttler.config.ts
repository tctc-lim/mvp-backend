import { ThrottlerOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerOptions[] = [
  {
    // Default rate limit: 10 requests per minute
    ttl: 60,
    limit: 10,
  },
  {
    // Stricter limit for auth endpoints: 5 requests per minute
    ttl: 60,
    limit: 5,
    ignoreUserAgents: [/^postman/i], // Ignore Postman requests
  },
];
