# @tail-ai/shared

Shared types, utilities, and constants for the Tail.AI application.

## Overview

This package contains all the common types, interfaces, schemas, and constants that are shared between the frontend and backend applications. It ensures type safety and consistency across the entire codebase.

## Features

- **Type Definitions**: Comprehensive TypeScript interfaces for all application entities
- **Validation Schemas**: Zod schemas for runtime validation
- **Constants**: Application-wide constants and enums
- **Utility Types**: Common utility types and interfaces
- **API Types**: Standardized API request/response types

## Installation

```bash
npm install @tail-ai/shared
```

## Usage

### Importing Types

```typescript
import { User, Project, Task, TimeEntry } from '@tail-ai/shared';

// Use the types in your code
const user: User = {
  id: 'user-123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  // ... other properties
};
```

### Importing Schemas

```typescript
import { userRegistrationSchema, projectCreationSchema } from '@tail-ai/shared';

// Validate data at runtime
const userData = {
  email: 'user@example.com',
  password: 'SecurePass123',
  firstName: 'John',
  lastName: 'Doe',
  acceptTerms: true,
};

const result = userRegistrationSchema.safeParse(userData);
if (result.success) {
  // Data is valid
  const validatedUser = result.data;
} else {
  // Handle validation errors
  console.log(result.error.errors);
}
```

### Importing Constants

```typescript
import { APP_ROLES, APP_STATUSES, APP_PRIORITIES } from '@tail-ai/shared';

// Use constants in your code
const userRole = APP_ROLES.ADMIN;
const projectStatus = APP_STATUSES.ACTIVE;
const taskPriority = APP_PRIORITIES.HIGH;
```

## Package Structure

```
src/
├── types/           # TypeScript type definitions
│   ├── index.ts     # Main types export
│   ├── user.ts      # User-related types
│   ├── project.ts   # Project-related types
│   ├── task.ts      # Task-related types
│   ├── timeEntry.ts # Time entry types
│   ├── organization.ts # Organization types
│   ├── auth.ts      # Authentication types
│   └── common.ts    # Common utility types
├── schemas/         # Zod validation schemas
│   ├── index.ts     # Main schemas export
│   ├── user.ts      # User validation schemas
│   ├── project.ts   # Project validation schemas
│   ├── task.ts      # Task validation schemas
│   ├── timeEntry.ts # Time entry validation schemas
│   ├── organization.ts # Organization validation schemas
│   ├── auth.ts      # Authentication validation schemas
│   └── common.ts    # Common validation schemas
├── constants/       # Application constants
│   ├── index.ts     # Main constants export
│   ├── app.ts       # Application constants
│   ├── auth.ts      # Authentication constants
│   ├── api.ts       # API constants
│   ├── validation.ts # Validation constants
│   └── limits.ts    # Application limits
└── utils/           # Utility functions
    └── index.ts     # Utility functions export
```

## Type Categories

### Core Entities

- **User**: User accounts, profiles, and preferences
- **Project**: Project management and organization
- **Task**: Individual tasks within projects
- **TimeEntry**: Time tracking and billing
- **Organization**: Multi-tenant organizations and teams

### Authentication & Security

- **AuthUser**: Authenticated user information
- **Session**: User sessions and tokens
- **Permission**: Access control and permissions
- **Role**: User roles and responsibilities

### API & Communication

- **ApiResponse**: Standardized API responses
- **WebhookPayload**: Webhook data structures
- **BulkOperation**: Bulk operation handling
- **Import/Export**: Data import/export operations

## Schema Categories

### Validation Schemas

- **User Schemas**: Registration, login, profile updates
- **Project Schemas**: Creation, updates, member management
- **Task Schemas**: Creation, updates, status changes
- **Time Entry Schemas**: Start, stop, manual entry
- **Organization Schemas**: Setup, configuration, team management

### Common Schemas

- **Pagination**: Page-based navigation
- **Search**: Query and filter operations
- **Sort**: Data sorting options
- **File Upload**: File handling and validation

## Constants

### Application Constants

- **APP_FEATURES**: Available application features
- **APP_ROLES**: User role definitions
- **APP_STATUSES**: Entity status options
- **APP_PRIORITIES**: Priority levels
- **APP_INTEGRATIONS**: Supported integrations

### Configuration Constants

- **Validation Rules**: Field validation constraints
- **API Limits**: Rate limiting and pagination
- **File Limits**: Upload size and type restrictions
- **Security Settings**: Authentication and authorization

## Development

### Building the Package

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Type Checking

```bash
npm run type-check
```

### Cleaning

```bash
npm run clean
```

## Contributing

When adding new types, schemas, or constants:

1. **Types**: Add to appropriate file in `src/types/`
2. **Schemas**: Add to appropriate file in `src/schemas/`
3. **Constants**: Add to appropriate file in `src/constants/`
4. **Export**: Update the main `index.ts` files
5. **Documentation**: Update this README if needed

### Naming Conventions

- **Types**: PascalCase (e.g., `UserProfile`)
- **Schemas**: camelCase + "Schema" (e.g., `userProfileSchema`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `APP_FEATURES`)
- **Files**: kebab-case (e.g., `user-profile.ts`)

## Dependencies

- **zod**: Runtime validation library
- **typescript**: TypeScript compiler

## License

MIT License - see LICENSE file for details.
