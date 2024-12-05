#!/usr/bin/env bash

FRONTEND_LOGS=logs/frontend-logs.out
BACKEND_LOGS=logs/backend-logs.out

mkdir -p logs

echo "Starting frontend vite dev server"
nohup npm run dev --prefix=app/static > $FRONTEND_LOGS 2>&1 &
FRONTEND_PID=$!

echo "Starting backend nodemon server"
nohup npm run dev-hot --prefix=app/server > $BACKEND_LOGS 2>&1 &
BACKEND_PID=$!

echo Frontend PID: $FRONTEND_PID, stdout and stderr streaming to $FRONTEND_LOGS
echo Backend PID: $BACKEND_PID, stdout and stderr streaming to $BACKEND_LOGS

# From now on, if the user presses Ctrl+C we should teardown gracefully
function cleanup() {
  echo "Killing frontend server"
  kill $FRONTEND_PID
  echo "Killing backend server"
  kill $BACKEND_PID
  echo "All done, enjoy your day :)"
}
trap cleanup EXIT

# Wait for Ctrl+C
echo "Ready to use. App is available on http://localhost:3000. Press Ctrl+C to teardown."
sleep infinity
