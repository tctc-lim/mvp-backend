Readme for the project

src/
├── config/               # Configuration files
├── common/              # Shared code, decorators, guards
│   ├── decorators/
│   ├── guards/
│   └── interfaces/
├── modules/             # Feature modules
│   ├── auth/           # Authentication
│   ├── users/          # User management
│   ├── members/        # Church members
│   ├── zones/          # Zones management
│   └── cells/          # Cells management
├── prisma/             # Database schema and migrations
└── main.ts            # Application entry point