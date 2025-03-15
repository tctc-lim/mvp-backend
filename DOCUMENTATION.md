I'll help create a comprehensive documentation. Given the length and detail required, I'll break this into multiple responses for better readability.

Let's start with Part 1: Overview and Setup

```markdown:SETUP_DOCUMENTATION.md
# Church KYC System - Backend Documentation

## Overview
The Church KYC System is a comprehensive membership tracking system designed for churches to manage first-timers, second-timers, new converts, and existing members. This documentation covers the backend implementation using NestJS, PostgreSQL, and related technologies.

## Current Implementation Status

### ✅ Completed
1. Basic project setup with NestJS
2. Database configuration with PostgreSQL and Prisma
3. Initial authentication module setup
4. Basic project structure and architecture

### 🚧 In Progress
1. User management implementation
2. Role-based access control
3. Member management features

### ⏳ Pending
1. Zone and Cell management
2. Follow-up system
3. Reporting system
4. Analytics features

## Technical Stack

### Core Technologies
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer

### Development Tools Required
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)
- Git
- VS Code (recommended) or preferred IDE

## Project Setup Instructions

### 1. Prerequisites Installation

```bash
# Install Node.js from
https://nodejs.org/

# Install PostgreSQL from
https://www.postgresql.org/download/

# Install NestJS CLI
npm i -g @nestjs/cli

# Install Git from
https://git-scm.com/
```

### 2. Project Setup

```bash
# Clone the repository (replace with actual repo URL)
git clone <repository-url>
cd church-kyc-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 3. Database Setup

```bash
# Access PostgreSQL
psql postgres

# In PostgreSQL console
CREATE DATABASE church_kyc_db;
CREATE USER username WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE church_kyc_db TO username;
\c church_kyc_db
GRANT ALL ON SCHEMA public TO username;

# Update .env file with database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/church_kyc_db?schema=public"

# Run database migrations
npx prisma migrate dev
```

### 4. Running the Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### 5. Accessing the API Documentation
Once the application is running, visit:
- Swagger Documentation: http://localhost:3000/api-docs
```




Part 2: Project Structure and Component Details

````markdown:STRUCTURE_DOCUMENTATION.md
# Project Structure and Components

## Directory Structure
```plaintext
church-kyc-backend/
├── src/
│   ├── config/                 # Configuration files
│   │   └── configuration.ts    # Environment and app config
│   │
│   ├── prisma/                # Database configuration
│   │   ├── schema.prisma      # Database schema
│   │   ├── prisma.service.ts  # Prisma service
│   │   └── prisma.module.ts   # Prisma module
│   │
│   ├── modules/               # Feature modules
│   │   ├── auth/             # Authentication module
│   │   │   ├── dto/         # Data Transfer Objects
│   │   │   ├── strategies/  # Passport strategies
│   │   │   ├── guards/      # Auth guards
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── users/           # User management (Pending)
│   │   ├── members/         # Church members (Pending)
│   │   ├── zones/           # Zones management (Pending)
│   │   └── cells/           # Cells management (Pending)
│   │
│   ├── common/               # Shared resources
│   │   ├── decorators/      # Custom decorators
│   │   ├── guards/          # Guards
│   │   ├── interfaces/      # Shared interfaces
│   │   └── utils/           # Utility functions
│   │
│   └── main.ts              # Application entry point
│
├── test/                     # Test files
├── prisma/                   # Prisma migrations
├── .env                      # Environment variables
└── package.json             # Project dependencies
```

## Current Implementation Details

### 1. Database Schema (Prisma)
Currently implemented models:
- User
- Zone
- Cell
- Member

Key relationships:
- User (1) ←→ (1) Zone (Zonal Coordinator)
- User (1) ←→ (1) Cell (Cell Leader)
- Zone (1) ←→ (∞) Cells
- Cell (1) ←→ (∞) Members

### 2. Authentication Module
Currently implements:
- User registration
- User login
- JWT authentication
- Role-based authorization

### 3. Configuration
Environment variables configured:
- Database connection
- JWT settings
- Server port
- Environment mode

## API Endpoints (Current)

### Authentication
```plaintext
POST /api/auth/register
- Register new user
- Requires: email, password, name, role

POST /api/auth/login
- User login
- Requires: email, password
```

## Testing the Implementation

### 1. Register a Super Admin
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "Admin User",
    "role": "SUPER_ADMIN"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```
## Development Workflow

### 1. Database Changes
When modifying the database schema:
```bash
# Update schema.prisma file
# Then run:
npx prisma generate
npx prisma migrate dev --name description_of_changes
```

### 2. Creating New Modules
```bash
# Generate module
nest g module modules/your-module

# Generate service
nest g service modules/your-module

# Generate controller
nest g controller modules/your-module
```

### 3. Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```
````



Part 3: Implementation Roadmap and Next Steps

`````markdown:IMPLEMENTATION_ROADMAP.md
# Implementation Roadmap and Next Steps

## 1. Pending Modules Implementation

### A. Users Module (Next Priority)
```typescript
// Planned Structure: src/modules/users/
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user-query.dto.ts
├── users.controller.ts
├── users.service.ts
└── users.module.ts
```

**Implementation Tasks:**
1. CRUD operations for users
2. Role management
3. User profile management
4. Password reset functionality
5. Email verification

### B. Members Module
```typescript
// Planned Structure: src/modules/members/
├── dto/
│   ├── create-member.dto.ts
│   ├── update-member.dto.ts
│   └── member-query.dto.ts
├── members.controller.ts
├── members.service.ts
└── members.module.ts
```

**Implementation Tasks:**
1. First-timer registration
2. Second-timer tracking
3. New convert registration
4. Member status updates
5. Member search and filtering
6. Member history tracking

### C. Zones Module
```typescript
// Planned Structure: src/modules/zones/
├── dto/
│   ├── create-zone.dto.ts
│   ├── update-zone.dto.ts
│   └── zone-query.dto.ts
├── zones.controller.ts
├── zones.service.ts
└── zones.module.ts
```

**Implementation Tasks:**
1. Zone CRUD operations
2. Zonal coordinator assignment
3. Zone statistics and reporting
4. Zone member management

### D. Cells Module
```typescript
// Planned Structure: src/modules/cells/
├── dto/
│   ├── create-cell.dto.ts
│   ├── update-cell.dto.ts
│   └── cell-query.dto.ts
├── cells.controller.ts
├── cells.service.ts
└── cells.module.ts
```

**Implementation Tasks:**
1. Cell CRUD operations
2. Cell leader assignment
3. Cell member management
4. Cell attendance tracking
5. Cell reports generation

## 2. Implementation Order and Dependencies

### Phase 1: Core User Management
1. Complete Users Module
2. Implement email service integration
3. Add password reset functionality
4. Set up role-based access control (RBAC)

### Phase 2: Member Management
1. Implement Members Module
2. Set up member status workflow
3. Create member search functionality
4. Implement member history tracking

### Phase 3: Church Structure
1. Implement Zones Module
2. Implement Cells Module
3. Set up hierarchical relationships
4. Create assignment algorithms

### Phase 4: Reporting System
1. Implement weekly reports
2. Create monthly aggregations
3. Set up dashboard statistics
4. Generate PDF exports

## 3. Best Practices and Guidelines

### Code Style
```typescript
// Example of expected code style
@Injectable()
export class SomeService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {}

    async findOne(id: string): Promise<SomeEntity> {
        try {
            return await this.prisma.someEntity.findUnique({
                where: { id },
            });
        } catch (error) {
            throw new NotFoundException(`Entity with ID ${id} not found`);
        }
    }
}
```

### Error Handling
1. Use custom exception filters
2. Implement proper error logging
3. Return appropriate HTTP status codes
4. Include meaningful error messages

### Testing Requirements
1. Unit tests for services
2. E2E tests for controllers
3. Integration tests for complex workflows
4. Minimum 80% code coverage

## 4. Security Considerations

### Authentication
1. Implement JWT refresh tokens
2. Add rate limiting
3. Set up request validation
4. Implement 2FA (optional)

### Authorization
1. Role-based access control
2. Resource-based permissions
3. API endpoint protection
4. Data access restrictions

## 5. Performance Optimization

### Database
1. Implement proper indexing
2. Use pagination for large datasets
3. Optimize complex queries
4. Implement caching strategy

### API
1. Implement response compression
2. Add request caching
3. Optimize bulk operations
4. Implement API versioning

## 6. Documentation Requirements

### API Documentation
1. Complete Swagger documentation
2. Include example requests/responses
3. Document error responses
4. Add authentication details

### Code Documentation
1. Add JSDoc comments
2. Document complex logic
3. Include setup instructions
4. Maintain README files
`````




## Recent Schema Updates (14/03/2025)

### Enhanced Member Tracking System

1. **Member Status System**
   ```typescript
   enum MemberStatus {
     FIRST_TIMER
     SECOND_TIMER
     FULL_MEMBER  // Achieved after 3 Sunday attendances
   }

   enum ConversionStatus {
     NOT_CONVERTED
     NEW_CONVERT    // Can be any member who has given their life to Christ
     REDEDICATED    // For existing believers who rededicated their lives
   }
   ```

2. **Follow-up System**
   ```typescript
   enum FollowUpType {
     PHONE_CALL
     VISITATION
     ATTENDANCE_CHECK
   }

   enum FollowUpStatus {
     PENDING
     COMPLETED
     NOT_REACHABLE
     RESCHEDULED
     DECLINED
   }
   ```

3. **Milestone & Department Tracking**
   ```typescript
   enum MilestoneType {
     JOINED_CELL
     JOINED_DEPARTMENT
     DCA_BASIC
     DCA_MATURITY
     ENCOUNTER
     DLI
     SUNDAY_SERVICE_ATTENDANCE
   }
   ```

### New Database Models Added

1. **FollowUp Model**
   - Tracks all follow-up activities
   - Links members with follow-up team
   - Records outcomes and next steps

2. **Department Model**
   - Manages church departments
   - Tracks member participation
   - Records join dates and active status

3. **MemberMilestone Model**
   - Records spiritual journey progress
   - Tracks completion dates
   - Includes verification system

### Next Implementation Steps

1. **Generate New Modules**
   ```bash
   nest g module modules/followup
   nest g module modules/department
   nest g module modules/milestone
   ```

2. **Update Database**
   ```bash
   npx prisma migrate dev --name enhanced_tracking_system
   ```

3. **Implement New API Endpoints**
   - Follow-up management
   - Department assignments
   - Milestone recording
   - Attendance tracking

### Coming Features
1. Automated status updates based on attendance
2. Follow-up team dashboard
3. Enhanced reporting system
4. Department management interface

## Updates (March 15, 2024)

### Environment Setup Enhancement
We've implemented a dual-environment setup for better development and production separation:

1. **Development Environment**
   ```env
   # .env.development
   DATABASE_URL="postgresql://postgres:[DEV-PASSWORD]@db.dev-project-ref.supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[DEV-PASSWORD]@db.dev-project-ref.supabase.co:5432/postgres"
   JWT_SECRET="dev-secret-here"
   NODE_ENV="development"
   ```

2. **Production Environment**
   ```env
   # .env.production
   DATABASE_URL="postgresql://postgres:[PROD-PASSWORD]@db.prod-project-ref.supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[PROD-PASSWORD]@db.prod-project-ref.supabase.co:5432/postgres"
   JWT_SECRET="prod-secret-here"
   NODE_ENV="production"
   ```

### Database Management
- **Separate Databases**: Development and Production databases on Supabase
- **Automated Sync**: Added NPM scripts for database management:
  ```json
  {
    "scripts": {
      "db:migrate:dev": "dotenv -e .env.development prisma migrate dev",
      "db:migrate:prod": "dotenv -e .env.production prisma migrate deploy",
      "db:sync": "npm run db:migrate:dev && npm run db:migrate:prod",
      "db:studio:dev": "dotenv -e .env.development prisma studio",
      "db:studio:prod": "dotenv -e .env.production prisma studio"
    }
  }
  ```

### Deployment Configuration
1. **Vercel Setup**
   - Single project handling both environments
   - Environment-specific URLs:
     - Production: `https://your-project.vercel.app`
     - Development: `https://dev-your-project-username.vercel.app`

2. **Environment Variables in Vercel**
   ```bash
   Production:
   - DATABASE_URL=[production-supabase-url]
   - JWT_SECRET=[production-secret]

   Development:
   - DATABASE_URL=[development-supabase-url]
   - JWT_SECRET=[development-secret]
   ```

### Development Workflow
1. **Making Schema Changes**:
   ```bash
   # 1. Edit prisma/schema.prisma
   # 2. Update development database
   npm run db:migrate:dev

   # 3. Test changes
   npm run db:studio:dev

   # 4. When ready, sync to production
   npm run db:sync
   ```

2. **Vercel Deployment**:
   - Main branch deploys to production
   - Other branches deploy to development environment
   - Each PR gets a preview deployment

### API Access
Frontend applications should use environment-specific API URLs:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://your-project.vercel.app/api'
    : 'https://dev-your-project-username.vercel.app/api'
);
```

### Best Practices
1. **Database Management**:
   - Always test changes in development first
   - Use `db:sync` only when changes are verified
   - Keep regular backups of production database

2. **Environment Handling**:
   - Use appropriate environment variables
   - Never expose production secrets
   - Keep development and production in sync

3. **Deployment**:
   - Review changes before production deployment
   - Test thoroughly in development
   - Monitor deployment logs

### Next Steps
1. Implement automated testing for both environments
2. Set up monitoring and logging
3. Implement backup automation
4. Add deployment notifications

### Dependencies Added
- dotenv-cli: For environment-specific commands
- Additional Prisma scripts for database management



