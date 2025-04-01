
# Bus Booking API Endpoints

This document describes the API endpoints available under the `/booking` base path.

## 1. GET /booking/:id/history

**Description:** Retrieves the booking history for a specific user.

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the user. This should correspond to the `user_id` field in the `BookingSchema`.

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully retrieved the booking history.
    *   404 Not Found: User with the specified ID not found, or no bookings found for the user.

*   **Response Body (Success - 200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "653f1a2b3c4d5e6f7a8b9c0d", // MongoDB ObjectId (bookingId)
      "user_id": "653e1a2b3c4d5e6f7a8b9c0a", // MongoDB ObjectId referencing the User collection
      "trip_id": "653d1a2b3c4d5e6f7a8b9c0b", // MongoDB ObjectId referencing the Trip collection
      "seat_numbers": [1, 5, 8], // Array of integers representing seat numbers
      "payment_status": "paid", // "pending", "paid", or "failed"
      "booking_status": "confirmed", // "confirmed" or "cancelled"
      "__v": 0, //Version Key
      "bookingDate": "2023-10-29T10:00:00.000Z"
    },
    {
      "_id": "653f1a2b3c4d5e6f7a8b9c0e",
      "user_id": "653e1a2b3c4d5e6f7a8b9c0a",
      "trip_id": "653c1a2b3c4d5e6f7a8b9c0c",
      "seat_numbers": [2, 6],
      "payment_status": "pending",
      "booking_status": "confirmed",
        "__v": 0, //Version Key
      "bookingDate": "2023-10-30T12:00:00.000Z"
    }
  ]
}
```

*   **Response Body (Error - 404):**

```json
{
  "success": false,
  "message": "User not found, or no bookings found for the user."
}
```

## 2. POST /booking/:id/book

**Description:** Creates a new booking for a user.

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the user making the booking. This should correspond to the `user_id` field in the `BookingSchema`.

**Request Body:**

```json
{
  "trip_id": "string",        // Required: The unique identifier (ID) of the trip being booked. This should correspond to the `trip_id` field in the `BookingSchema`. (MongoDB ObjectId)
  "seat_numbers": [1, 5, 8]  // Required: An array of numbers representing seat numbers to book. These numbers must be available on the selected trip.
}
```

**Response:**

*   **Status Codes:**
    *   201 Created: Successfully created a new booking.
    *   400 Bad Request: Invalid request body (e.g., missing `trip_id` or `seat_numbers`, invalid seat numbers, seats already booked), user not found, or trip not found.

*   **Response Body (Success - 201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "653f2b4c5d6e7f8a9b0c1d2e", // MongoDB ObjectId (bookingId)
    "user_id": "653e1a2b3c4d5e6f7a8b9c0a",
    "trip_id": "653d1a2b3c4d5e6f7a8b9c0b",
    "seat_numbers": [1, 5, 8],
    "payment_status": "pending",
    "booking_status": "confirmed",
        "__v": 0, //Version Key
    "bookingDate": "2023-10-29T14:00:00.000Z"
  }
}
```

*   **Response Body (Error - 400):**

```json
{
  "success": false,
  "message": "Error message describing the issue (e.g., 'Invalid seat number', 'Trip not found', 'Seats already booked', 'User not found')"
}
```

## 3. DELETE /booking/:id/bookings/:bookingId

**Description:** Cancels an existing booking.

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the user.  This should correspond to the `user_id` field in the `BookingSchema`.
    *   `bookingId` (string, required): The unique identifier (ID) of the booking to cancel. This should correspond to the `_id` field (bookingId) in the `BookingSchema`.

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully cancelled the booking.
    *   400 Bad Request: Invalid booking ID, or booking does not belong to the user.
    *   404 Not Found: Booking with the specified ID not found.

*   **Response Body (Success - 200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "653f1a2b3c4d5e6f7a8b9c0d",
    "user_id": "653e1a2b3c4d5e6f7a8b9c0a",
    "trip_id": "653d1a2b3c4d5e6f7a8b9c0b",
    "seat_numbers": [1, 5, 8],
    "payment_status": "pending",
    "booking_status": "cancelled",  //Note: booking Status has been updated
          "__v": 0, //Version Key
    "bookingDate": "2023-10-29T10:00:00.000Z"
  },
  "message": "Booking successfully cancelled"
}
```

*   **Response Body (Error - 400/404):**

```json
{
  "success": false,
  "message": "Error message describing the issue (e.g., 'Booking not found', 'Booking does not belong to user')"
}
```
