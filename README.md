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
