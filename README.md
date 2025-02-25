# Birthday bot

A Node.js application that notifies when it's someone's birthday.

## Features

- Store and manage people's birthdays
- Send notifications when it's someone's birthday
- RESTful API for managing birthday entries
- PostgreSQL database integration

## Prerequisites

- Node.js (v20 or higher)
- pnpm (v8 or higher)
- PostgreSQL database
- Valid environment configuration (see [Configuration](#configuration))

## Installation

```bash
git clone https://github.com/AxelMth/birthday-bot.git
cd birthday-bot
npm install
```

## Configuration

Create a `.env` file in the root directory:

Required environment variables:

| Variable     | Description                                    |
| ------------ | ---------------------------------------------- |
| DATABASE_URL | PostgreSQL connection string                   |
| PORT         | Port number for the API server (default: 3000) |

## Usage

### Development mode

```bash
pnpm run dev
```

### Build the application

```bash
pnpm run build
```

### Start the production server

```bash
pnpm start
```

## Project architecture

```
.
├── drizzle              # Database schema and migration files
│   └── meta
└── src
    ├── application      # Application business rules and use cases
    │   ├── ports        # Interface definitions for external dependencies
    │   │   ├── input    # Input ports (use cases)
    │   │   └── output   # Output ports (repository interfaces)
    │   └── services     # Implementation of use cases
    ├── db               # Database configuration and setup
    │   └── migrations   # Database migration files
    ├── domain           # Enterprise business rules
    │   ├── entities     # Business entities (Person, etc.)
    │   └── value-objects # Value objects used by entities
    ├── infrastructure   # External interfaces implementations
    │   ├── adapters     # Adapters for external services
    │   ├── factories    # Factories for creating instances
    │   └── repositories # Database repository implementations
    └── presentation     # API layer
        ├── controllers  # HTTP request handlers
        └── schemas      # Request/Response validation schemas
```
