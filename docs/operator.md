# Operator API Endpoints

This document describes the API endpoints available under the `/operator` base path.

**Operator Schema (OperatorSchema):**

```json
{
  "company_name": "string",                   // Operator's company name.
  "email": "string",                          // Operator's email address (must be unique).
  "phone": "string",                          // Operator's phone number.
  "password": "string",                       // Operator's password (hashed).
  "verification_status": "string",           // Verification status: "pending", "verified", or "rejected". Default: "pending".
  "_id": "string"                             // MongoDB ObjectId
}
```

## 1. POST /operator/register

**Description:** Registers a new operator.

**Request Body:**

```json
{
  "company_name": "string",   // Required: Operator's company name.
  "email": "string",          // Required: Operator's email address (must be unique).
  "phone": "string",          // Optional: Operator's phone number.
  "password": "string"       // Required: Operator's password.
}
```

**Response:**

*   **Status Codes:**
    *   201 Created: Successfully registered a new operator. The response body includes a JWT token.
    *   400 Bad Request: Invalid request body (e.g., missing fields, invalid email format, password too short). The `message` field in the JSON response will provide details.
    *   409 Conflict: Email address already exists.
    *   500 Internal Server Error: An unexpected error occurred.

*   **Response Body (Success - 201 Created):**

```json
{
  "message": "Operator registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVyYXRvcklkIjoiMTIzNDU2Nzg5MCIsImlhdCI6MTUxNjIzOTAyMn0.SomeExampleToken"
}
```

*   **Response Body (Error - 400/409/500):**

```json
{
  "message": "Error message describing the issue."
}
```

## 2. POST /operator/login

**Description:** Logs in an existing operator.

**Request Body:**

```json
{
  "email": "string",      // Required: Operator's email address.
  "password": "string"   // Required: Operator's password.
}
```

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully logged in. The response body includes a JWT token.
    *   401 Unauthorized: Invalid credentials (email or password incorrect).
    *   400 Bad Request: Missing email or password in request body.
    *   500 Internal Server Error: An unexpected error occurred.

*   **Response Body (Success - 200 OK):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVyYXRvcklkIjoiMTIzNDU2Nzg5MCIsImlhdCI6MTUxNjIzOTAyMn0.SomeExampleToken"
}
```

*   **Response Body (Error - 401/400/500):**

```json
{
  "message": "Error message describing the issue."
}
```

## 3. POST /operator/api/trips

**Description:** Creates a new trip.

**Request Body:**

```json
{
  "bus_id": "string",       // Required: The ID of the bus associated with the trip (e.g., MongoDB ObjectId referencing a Bus collection).
  "start_location": "string", // Required: Starting location of the trip.
  "end_location": "string",   // Required: Ending location of the trip.
  "departure_time": "string", // Required: Departure time in ISO 8601 format (e.g., "2023-11-01T08:00:00Z").
  "arrival_time": "string",   // Required: Arrival time in ISO 8601 format.
  "available_seats": "number", // Required: Number of available seats on the bus.
  "price": "number"             // Required: Price per seat.
}
```

**Response:**

*   **Status Codes:**
    *   201 Created: Successfully created a new trip.
    *   400 Bad Request: Invalid request body (e.g., missing fields, invalid date format).
    *   500 Internal Server Error: Failed to create trip.

*   **Response Body (Success - 201 Created):**

```json
{
  "_id": "653f8a9b0c1d2e3f4g5h6i7j", // MongoDB ObjectId (Trip ID)
  "bus_id": "653f9b0c1d2e3g4h5i6j7k8l",
  "start_location": "New York",
  "end_location": "Los Angeles",
  "departure_time": "2023-11-01T08:00:00.000Z",
  "arrival_time": "2023-11-02T18:00:00.000Z",
  "available_seats": 40,
  "price": 75
  // ... other trip properties
}
```

*   **Response Body (Error - 400/500):**

```json
{
  "message": "Error message describing the issue."
}
```

## 4. PUT /operator/api/trips/:id

**Description:** Updates trip details.

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the trip to update (MongoDB ObjectId).

**Request Body:**

```json
{
  "start_location": "string", // Optional: Starting location of the trip.
  "end_location": "string",   // Optional: Ending location of the trip.
  "departure_time": "string", // Optional: Departure time in ISO 8601 format.
  "arrival_time": "string",   // Optional: Arrival time in ISO 8601 format.
  "available_seats": "number", // Optional: Number of available seats on the bus.
  "price": "number"             // Optional: Price per seat.
}
```

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully updated the trip.
    *   400 Bad Request: Invalid request body (e.g., invalid date format, invalid data types).
    *   404 Not Found: Trip not found.
    *   500 Internal Server Error: Failed to update trip.

*   **Response Body (Success - 200 OK):**

```json
{
  "_id": "653f8a9b0c1d2e3f4g5h6i7j", // MongoDB ObjectId (Trip ID)
  "bus_id": "653f9b0c1d2e3g4h5i6j7k8l",
  "start_location": "San Francisco", //Updated
  "end_location": "Los Angeles",
  "departure_time": "2023-11-01T08:00:00.000Z",
  "arrival_time": "2023-11-02T18:00:00.000Z",
  "available_seats": 35, //Updated
  "price": 85 //Updated
  // ... other trip properties
}
```

*   **Response Body (Error - 400/404/500):**

```json
{
  "message": "Error message describing the issue."
}
```

## 5. DELETE /operator/api/trips/:id

**Description:** Cancels a trip.

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the trip to cancel (MongoDB ObjectId).

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Trip cancelled successfully.
    *   404 Not Found: Trip not found.
    *   500 Internal Server Error: Failed to cancel trip.

*   **Response Body (Success - 200 OK):**

```json
{
  "message": "Trip cancelled successfully."
}
```

*   **Response Body (Error - 404/500):**

```json
{
  "message": "Error message describing the issue."
}
```

## 6. GET /operator/api/bookings/operator

**Description:** Views bookings for trips associated with the operator.

**Parameters:**

*   **Query Parameters:**
    *   `bus_id` (string, optional): If provided, returns bookings only for trips associated with that bus. (e.g., MongoDB ObjectId referencing a Bus collection). If not provided, all bookings associated with the operator are returned.

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully retrieved bookings.
    *   500 Internal Server Error: Failed to retrieve bookings.

*   **Response Body (Success - 200 OK):**

```json
[
  {
    "_id": "653f0c1d2e3f4g5h6i7j8k9l", // MongoDB ObjectId (Booking ID)
    "user_id": "653f1d2e3f4g5h6i7j8k9l0m",  // MongoDB ObjectId
    "trip_id": "653f8a9b0c1d2e3f4g5h6i7j",  // MongoDB ObjectId
    "seat_numbers": [ 1, 2, 3 ],
    // ... other booking properties
  },
  {
    "_id": "653f1d2e3f4g5h6i7j8k9l0m", // MongoDB ObjectId (Booking ID)
    "user_id": "653f2e3f4g5h6i7j8k9l0m1n", // MongoDB ObjectId
    "trip_id": "653fa0b1c2d3e4f5g6h7i8j9", // MongoDB ObjectId
    "seat_numbers": [ 4, 5 ],
    // ... other booking properties
  }
]
```

*   **Response Body (Error - 500):**

```json
{
  "message": "Error message describing the issue."
}
```
