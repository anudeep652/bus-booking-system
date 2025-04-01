# Admin API Endpoints

This document describes the API endpoints available under the `/admin` base path. All endpoints require Admin authentication.

**User Schema (UserSchema):**

```json
{
  "name": "string",           // User's full name.
  "email": "string",          // User's email address (must be unique).
  "phone": "string",          // User's phone number.
  "password": "string",       // User's password (hashed).
  "role": "string",           // User role: "user" or "admin".
  "status": "string",         // User status: "active" or "inactive". Default: "active".
  "_id": "string"             // MongoDB ObjectId
}
```

## 1. GET /admin/users

**Description:** Retrieves a list of all users, paginated.

**Parameters:**

*   **Query Parameters:**
    *   `page` (number, optional): The page number to retrieve. Default: 1.
    *   `limit` (number, optional): The maximum number of users to return per page. Default: 10.

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully retrieved the list of users.
    *   500 Internal Server Error: An unexpected error occurred.

*   **Response Body (Success - 200 OK):**

```json
{
  "status": "success",
  "results": 2, // Number of users in the data array
  "data": [
    {
      "_id": "653f3a4b5c6d7e8f9a0b1c2d", // MongoDB ObjectId (User ID)
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "555-123-4567",
      "role": "user",
      "status": "active"
      //... other user properties (as defined in UserSchema)
    },
    {
      "_id": "653f4b5c6d7e8f9a0b1c2e3f", // MongoDB ObjectId (User ID)
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "555-987-6543",
      "role": "admin",
      "status": "inactive"
      //... other user properties (as defined in UserSchema)
    }
  ]
}
```

*   **Response Body (Error - 500):**

```json
{
  "status": "error",
  "message": "Error message describing the issue."
}
```

## 2. GET /admin/operators

**Description:** Retrieves a list of all operators, paginated.

**Parameters:**

*   **Query Parameters:**
    *   `page` (number, optional): The page number to retrieve. Default: 1.
    *   `limit` (number, optional): The maximum number of operators to return per page. Default: 10.

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully retrieved the list of operators.
    *   500 Internal Server Error: An unexpected error occurred.

*   **Response Body (Success - 200 OK):**

```json
{
  "status": "success",
  "results": 2, // Number of operators in the data array
  "data": [
    {
      "_id": "653f5c6d7e8f9a0b1c2f4g5h", // MongoDB ObjectId (Operator ID)
      "name": "Operator One",
      "email": "op1@example.com",
      // Assuming operators have similar fields to Users, expand as needed
      "verificationStatus": "verified"
    },
    {
      "_id": "653f6d7e8f9a0b1c2g3h5i6j", // MongoDB ObjectId (Operator ID)
      "name": "Operator Two",
      "email": "op2@example.com",
      // Assuming operators have similar fields to Users, expand as needed
      "verificationStatus": "pending"
    }
  ]
}
```

*   **Response Body (Error - 500):**

```json
{
  "status": "error",
  "message": "Error message describing the issue."
}
```

## 3. PUT /admin/users/:id/status

**Description:** Changes the status of a user (active/inactive).

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the user.  This should correspond to the `_id` (MongoDB ObjectId) field in the `UserSchema`.

**Request Body:**

```json
{
  "status": "string"  // Required:  "active" or "inactive".
}
```

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully updated the user's status.
    *   400 Bad Request: Invalid status provided in the request body (must be "active" or "inactive").
    *   404 Not Found: User with the specified ID not found.
    *   500 Internal Server Error: An unexpected error occurred.

*   **Response Body (Success - 200 OK):**

```json
{
  "status": "success",
  "data": {
    "_id": "653f3a4b5c6d7e8f9a0b1c2d", // MongoDB ObjectId (User ID)
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "role": "user",
    "status": "inactive"  // Updated status
    //... other user properties (as defined in UserSchema)
  }
}
```

*   **Response Body (Error - 400/404/500):**

```json
{
  "status": "error",
  "message": "Error message describing the issue."
}
```

## 4. PUT /admin/operators/:id/verification

**Description:** Changes the verification status of an operator (pending/verified/rejected).

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the operator.

**Request Body:**

```json
{
  "status": "string"  // Required: "pending", "verified", or "rejected".
}
```

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully updated the operator's verification status.
    *   400 Bad Request: Invalid status provided in the request body (must be "pending", "verified", or "rejected").
    *   404 Not Found: Operator with the specified ID not found.
    *   500 Internal Server Error: An unexpected error occurred.

*   **Response Body (Success - 200 OK):**

```json
{
  "status": "success",
  "data": {
    "_id": "653f5c6d7e8f9a0b1c2f4g5h", // MongoDB ObjectId (Operator ID)
    "name": "Operator One",
    "email": "op1@example.com",
    // Assuming operators have similar fields to Users, expand as needed
    "verificationStatus": "verified" // Updated status
  }
}
```

*   **Response Body (Error - 400/404/500):**

```json
{
  "status": "error",
  "message": "Error message describing the issue."
}
```

## 5. GET /admin/trips

**Description:** Retrieves a list of all trips, paginated.

**Parameters:**

*   **Query Parameters:**
    *   `page` (number, optional): The page number to retrieve. Default: 1.
    *   `limit` (number, optional): The maximum number of trips to return per page. Default: 10.

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully retrieved the list of trips.
    *   500 Internal Server Error: An unexpected error occurred.

*   **Response Body (Success - 200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "653f7e8f9a0b1c2h3i4j5k6l", // MongoDB ObjectId (Trip ID)
      "startLocation": "Location A",
      "endLocation": "Location B",
      //... other trip properties (define a TripSchema for completeness)
    }
  ]
}
```

*   **Response Body (Error - 500):**

```json
{
  "status": "error",
  "message": "Error message describing the issue."
}
```

## 6. GET /admin/reports

**Description:** Retrieves admin reports.

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully retrieved the reports.
    *   500 Internal Server Error: An unexpected error occurred.

*   **Response Body (Success - 200 OK):**

```json
{
  "status": "success",
  "data": {
    "totalUsers": 100,
    "activeUsers": 75,
    //... other report properties (define the structure of reports)
  }
}
```

*   **Response Body (Error - 500):**

```json
{
  "status": "error",
  "message": "Error message describing the issue."
}
```

## 7. PUT /admin/trips/:id/cancel

**Description:** Cancels a specific trip.

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the trip to cancel.

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully cancelled the trip.
    *   404 Not Found: Trip with the specified ID not found.
    *   500 Internal Server Error: An unexpected error occurred.

*   **Response Body (Success - 200 OK):**

```json
{
  "status": "success",
  "data": {
    "_id": "653f7e8f9a0b1c2h3i4j5k6l", // MongoDB ObjectId (Trip ID)
    "startLocation": "Location A",
    "endLocation": "Location B",
    "status": "cancelled"
    //... other trip properties (define a TripSchema for completeness)
  }
}
```

*   **Response Body (Error - 404/500):**

```json
{
  "status": "error",
  "message": "Error message describing the issue."
}
```
