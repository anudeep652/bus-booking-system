# Bus Ticket Booking System API

## Overview

The **Bus Ticket Booking System** is a web-based application that allows users to book bus tickets, operators to manage their trips, and admins to oversee the platform. This system includes authentication, user roles, and multiple functionalities for users, operators, and administrators.

## Usage using Docker compose

### for development

create a .env.development file

```
MONGO_URI=<MONGO_URI>
PORT=8000
JWT_SECRET=<JWT_SECRET>
SERVE_DOCS=true
NODE_ENV=development
```

Run the dev container

```
docker compose up app_dev nginx
```

remove the dev container and db

```
docker compose down
```

### for production

create a .env.production file

```
MONGO_URI=<MONGO_URI>
PORT=8000
JWT_SECRET=<JWT_SECRET>
SERVE_DOCSfalse
NODE_ENV=production
```

build the project

```sh
yarn build
```

Run the prod container

```
docker compose up app_prod
```

remove the prod container and db

```
docker compose down app_prod mongo
```

> since both `dev` and `prod` containers depends on `mongo`, `mongo` container will start automatically when we start the `dev` or `prod` containers but we have to explicitely remove `mongo` when we removing `dev` or `prod` containers

## Frontend Modules

### User Panel

- **Home Page** - Search and filter buses.
- **Booking Page** - Select seats and make payments.
- **Profile Page** - View/update user details.
- **Trip Management** - View bookings and cancellations.

### Operator Panel

- **Dashboard** - Overview of trips and bookings.
- **Trip Management** - Create, update, and cancel trips.
- **Analytics** - View reports and revenue.

### Admin Panel

- **User Management** - Approve/block users.
- **Trip Oversight** - Manage system-wide trips.
- **Reports Dashboard** - System analytics.

## Backend Modules and Architecture

### Architecture Overview

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **Payments**: Integration with Paytm or Razorpay
- **Hosting**: AWS/GCP/DigitalOcean
- **State Management**: Redux for frontend state handling

## Logic Flow

### User Booking Flow

1. User logs in or registers.
2. Searches for available buses using source, destination, and date.
3. Selects a bus and chooses available seats.
4. Adds passenger details and applies any discount codes.
5. Proceeds to payment via integrated gateways.
6. Receives confirmation and e-ticket.
7. Can view, manage, or cancel the booking.

### Operator Flow

1. Operator logs in.
2. Creates a new trip with details such as bus, source, destination, departure time, and pricing.
3. Publishes the trip, making it available for bookings.
4. Monitors real-time seat occupancy and manages bookings.
5. Cancels trips if necessary, notifying affected passengers.
6. Reviews analytics for revenue and performance.

### Admin Oversight Flow

1. Admin logs in.
2. Monitors user and operator activity.
3. Verifies and manages user/operator accounts.
4. Oversees system-wide trips and can modify details as needed.

## API Routes

### Authentication

- `POST /api/register` - Register a user/operator.
- `POST /api/login` - Authenticate user/operator.
- `POST /api/logout` - Logout user.

### User Endpoints

- `GET /api/profile` - View profile.
- `PUT /api/profile` - Update profile.
- `GET /api/bookings` - View booking history.
- `POST /api/bookings` - Book a ticket.
- `DELETE /api/bookings/:id` - Cancel booking.

### Operator Endpoints

- `POST /api/trips` - Create a trip.
- `PUT /api/trips/:id` - Update trip details.
- `DELETE /api/trips/:id` - Cancel trip.
- `GET /api/bookings/operator` - View trip bookings.

### Admin Endpoints

- `GET /api/users` - List users.
- `GET /api/operators` - List operators.
- `PUT /api/users/:id/block` - Block user.
- `PUT /api/operators/:id/verify` - Verify operator.
- `GET /api/reports` - View analytics.

## Database Tables

### 1. Users

| Column   | Type   | Description                      |
| -------- | ------ | -------------------------------- |
| id       | String | Unique user identifier           |
| name     | String | Full name of the user            |
| email    | String | User's email (unique)            |
| phone    | String | Contact number                   |
| password | String | Encrypted password               |
| role     | String | User role (user/admin)           |
| status   | String | Account status (active/inactive) |

### 2. Operators

| Column              | Type   | Description                        |
| ------------------- | ------ | ---------------------------------- |
| id                  | String | Unique operator identifier         |
| company_name        | String | Name of the bus company            |
| email               | String | Operator email (unique)            |
| phone               | String | Contact number                     |
| password            | String | Encrypted password                 |
| verification_status | String | Status (pending/verified/rejected) |

### 3. Buses

| Column      | Type   | Description                  |
| ----------- | ------ | ---------------------------- |
| id          | String | Unique bus identifier        |
| operator_id | String | Reference to the operator    |
| bus_number  | String | Bus registration number      |
| bus_type    | String | Type of bus                  |
| total_seats | Number | Total seats available        |
| amenities   | Array  | List of amenities on the bus |

### 4. Trips

| Column          | Type   | Description                |
| --------------- | ------ | -------------------------- |
| id              | String | Unique trip identifier     |
| bus_id          | String | Reference to the bus       |
| source          | String | Start location of the trip |
| destination     | String | End location of the trip   |
| departure_time  | Date   | Date and time of departure |
| arrival_time    | Date   | Date and time of arrival   |
| price           | Number | Ticket price               |
| available_seats | Number | Number of seats available  |

### 5. Bookings

| Column         | Type   | Description                  |
| -------------- | ------ | ---------------------------- |
| id             | String | Unique booking identifier    |
| user_id        | String | Reference to the user        |
| trip_id        | String | Reference to the trip        |
| seat_numbers   | Array  | List of booked seat numbers  |
| payment_status | String | Status (pending/paid/failed) |
| booking_status | String | Status (confirmed/cancelled) |

### 6. Payments

| Column         | Type   | Description                        |
| -------------- | ------ | ---------------------------------- |
| id             | String | Unique payment identifier          |
| booking_id     | String | Reference to the booking           |
| user_id        | String | Reference to the user              |
| amount         | Number | Payment amount                     |
| payment_method | String | Method (card/cash/online)          |
| payment_status | String | Status (pending/successful/failed) |

### 7. Cancellations

| Column              | Type   | Description                       |
| ------------------- | ------ | --------------------------------- |
| id                  | String | Unique cancellation identifier    |
| booking_id          | String | Reference to the booking          |
| user_id             | String | Reference to the user             |
| refund_status       | String | Status (pending/processed/failed) |
| cancellation_reason | String | Reason for cancellation           |

### 8. Feedback

| Column   | Type   | Description                |
| -------- | ------ | -------------------------- |
| id       | String | Unique feedback identifier |
| user_id  | String | Reference to the user      |
| trip_id  | String | Reference to the trip      |
| rating   | Number | Rating (1-5)               |
| comments | String | User comments              |
