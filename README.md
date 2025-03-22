# MVP Backend

This is the backend service for the MVP project, built with NestJS and PostgreSQL.

## Features

- User authentication and authorization
- Role-based access control
- Member management
- Zone and cell management
- Email notifications
- Refresh token support
- Health checks
- API versioning

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.development`
   - Update the variables with your values

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
