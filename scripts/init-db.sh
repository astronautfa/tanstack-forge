#!/bin/bash

# This script initializes a new PostgreSQL database for local development
# Modified to work directly with Postgres.app on macOS

DB_NAME="tanstack_forge"
DB_USER="postgres"
DB_PASSWORD="123"
DB_HOST="localhost"
DB_PORT="5432"

# Check if Postgres.app is installed
if [ ! -d "/Applications/Postgres.app" ]; then
    echo "Postgres.app is not installed. Please install it first."
    exit 1
fi

# Use the direct path to psql from Postgres.app
PSQL="/Applications/Postgres.app/Contents/Versions/latest/bin/psql"

# Create database if it doesn't exist
echo "Creating database $DB_NAME if it doesn't exist..."
$PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists."

# Push the Prisma schema to the database
echo "Pushing the Prisma schema to the database..."
cd "$(dirname "$0")/.." && pnpm db:push

echo "Database initialization complete!"
echo "You can now run 'pnpm db:studio' to open Prisma Studio and manage your database."