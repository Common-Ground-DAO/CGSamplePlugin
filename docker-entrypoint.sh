#!/bin/sh
set -e

cd /app

DB_PATH="/app/prisma/db/dev.db"

# Function to handle signals and forward them to the child process
_term() {
  if [ -n "$child" ]; then
    kill -TERM "$child" 2>/dev/null
  fi
}
_int() {
  if [ -n "$child" ]; then
    kill -INT "$child" 2>/dev/null
  fi
}
trap _term TERM
trap _int INT

# Check if the database exists, if not, run migration
if [ ! -f "$DB_PATH" ]; then
  echo "Database not found at $DB_PATH. Running migrations..."
  npm run prisma:deploy
else
  echo "Database found at $DB_PATH. Skipping migration."
fi

# Start the app
npm run start &
child=$!
wait $child 