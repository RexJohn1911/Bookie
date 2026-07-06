# 🍿 CinemaBook — Movie Ticket Booking System

A full-stack web application for browsing movies, selecting shows, booking seats, and managing cinema operations via an admin panel.

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router v6, Axios        |
| Backend   | Java 17, Spring Boot 3.2, Spring Data JPA |
| Database  | MySQL 8                                 |
| Build     | Maven (backend), npm (frontend)         |

## Features

- Browse active movies with genre/language info
- View upcoming shows per movie
- Interactive seat map with VIP / Premium / Regular tiers and dynamic pricing
- Booking confirmation with unique reference number
- View and search personal booking history by email
- Admin panel: add/edit/remove movies, schedule shows, view and cancel bookings

## Project Structure

```
movie-booking/
├── backend/          # Spring Boot REST API
│   └── src/main/java/com/moviebooking/
│       ├── model/        # JPA entities
│       ├── repository/   # Spring Data repositories
│       ├── service/      # Business logic
│       ├── controller/   # REST endpoints
│       ├── dto/          # Request / response DTOs
│       └── config/       # CORS, exception handler, data seeder
└── frontend/         # React SPA
    └── src/
        ├── pages/        # MoviesPage, ShowsPage, SeatsPage, etc.
        └── services/     # Axios API client
```

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8 running locally

### 1. Configure environment variables

Before running the backend, set these variables (or edit `application.properties` for local dev):

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=moviebooking
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password
export ADMIN_SECRET=your_admin_key      # used to protect admin endpoints
```

### 2. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`.  
On first run, the database is auto-created and seeded with 3 sample movies and 6 shows.

### 3. Run the frontend

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000`.

## API Overview

| Method | Endpoint                        | Auth         | Description                  |
|--------|---------------------------------|--------------|------------------------------|
| GET    | /api/movies                     | Public       | List active movies           |
| GET    | /api/shows/movie/{id}           | Public       | Shows for a movie            |
| GET    | /api/shows/{id}/seats           | Public       | Seat map for a show          |
| POST   | /api/bookings                   | Public       | Create a booking             |
| GET    | /api/bookings/my?email=...      | Public       | Bookings by email            |
| GET    | /api/movies/admin/all           | X-Admin-Key  | All movies (incl. inactive)  |
| POST   | /api/movies                     | X-Admin-Key  | Add a movie                  |
| POST   | /api/shows                      | X-Admin-Key  | Schedule a show              |
| GET    | /api/bookings/admin/all         | X-Admin-Key  | All bookings                 |
| PUT    | /api/bookings/{id}/cancel       | X-Admin-Key  | Cancel a booking             |

Admin endpoints require the `X-Admin-Key` header matching `ADMIN_SECRET`.

## Screenshots

> Add screenshots of the Movies page, Seat Map, and Admin Panel here after running locally.

## License

MIT
# BOOK
