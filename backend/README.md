# Expense Tracker Backend

Express + MongoDB backend for an expense tracker application.

## What is included

- JWT-based authentication
- User registration and login
- Protected profile endpoint
- Create expense endpoint
- List expenses endpoint
- MongoDB persistence with Mongoose models for users and expenses
- Pagination, sorting, and basic filtering for expense listing
- Layered architecture: routes, controllers, services, models, middlewares, validators
- Centralized error handling

## Folder structure

```text
src/
  config/
  controllers/
  middlewares/
  models/
  routes/
  services/
  utils/
  validators/
  app.js
  server.js
```

## API endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Expenses

- `GET /api/v1/expenses`
- `POST /api/v1/expenses`

## Request examples

### Register

```json
{
  "name": "Gaurav",
  "email": "gaurav@example.com",
  "password": "strongpassword123"
}
```

### Login

```json
{
  "email": "gaurav@example.com",
  "password": "strongpassword123"
}
```

### Create expense

```json
{
  "title": "Groceries",
  "amount": 54.75,
  "category": "Food",
  "spentAt": "2026-03-30T12:00:00.000Z",
  "notes": "Weekly supermarket visit"
}
```

## Run locally

```bash
npm install
npm run dev
```

## Environment variables

```env
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=replace-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

`DB_URL` is still accepted as a fallback alias for `MONGODB_URI` to avoid breaking older local setups.
