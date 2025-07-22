# Car Inventory Backend

A simple Go backend for the Car Inventory Management Application.

## Features
- REST API for vehicle CRUD
- SQLite database
- JWT authentication
- CORS enabled for local frontend dev

## Setup

1. **Install Go** (v1.20+ recommended)
2. **Install dependencies:**
   ```sh
   go mod tidy
   ```
3. **Run the server:**
   ```sh
   go run main.go
   ```
   The server will start on `http://localhost:8080`

## API Endpoints

### Auth
- `POST /api/register` — `{ "username": string, "password": string }`
- `POST /api/login` — `{ "username": string, "password": string }` → `{ "token": string }`

### Vehicles (auth required)
- `GET /api/vehicles` — List vehicles
- `POST /api/vehicles` — Add vehicle
- `PUT /api/vehicles/{id}` — Update vehicle
- `DELETE /api/vehicles/{id}` — Delete vehicle

**All vehicle endpoints require an `Authorization` header with the JWT token.**

## Database
- SQLite file: `car_inventory.db` (auto-created)

## Notes
- Passwords are stored in plaintext for demo purposes. Use hashing in production.
- CORS is enabled for all origins for local development. 