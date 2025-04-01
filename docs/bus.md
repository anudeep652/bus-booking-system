# Bus API Endpoints

This document describes the API endpoints available under the `/bus` base path.  These endpoints are typically used by operators to manage their buses.

**Bus Schema (BusSchema):**

```json
{
  "operator_id": "string",        // Required: MongoDB ObjectId referencing the Operator collection. ID of the operator who owns the bus.
  "bus_number": "string",          // Required: Bus number or registration plate (e.g., "ABC-123").
  "bus_type": "string",            // Required: Type of bus (e.g., "Luxury", "Sleeper", "Standard").
  "total_seats": "number",         // Required: Total number of seats on the bus.
  "amenities": ["string"],       // Optional: Array of strings representing bus amenities (e.g., ["WiFi", "AC", "Charging Ports"]).
  "_id": "string"                 // MongoDB ObjectId
}
```

## 1. POST /bus/

**Description:** Creates a new bus.

**Request Body:**

```json
{
  "operator_id": "string",       // Required: MongoDB ObjectId of the operator who owns the bus.
  "bus_number": "string",          // Required: Bus number or registration plate.
  "bus_type": "string",            // Required: Type of bus.
  "total_seats": "number",         // Required: Total number of seats.
  "amenities": ["string"]        // Optional: Array of bus amenities.
}
```

**Response:**

*   **Status Codes:**
    *   201 Created: Successfully created a new bus.
    *   400 Bad Request: Invalid request body (e.g., missing fields, invalid data types).
    *   500 Internal Server Error: Failed to create bus.

*   **Response Body (Success - 201 Created):**

```json
{
  "_id": "653fa1b2c3d4e5f6g7h8i9j0",  // MongoDB ObjectId (Bus ID)
  "operator_id": "653fb2c3d4e5f6g7h8i9j0k",
  "bus_number": "ABC-123",
  "bus_type": "Luxury",
  "total_seats": 45,
  "amenities": ["WiFi", "AC", "Charging Ports"]
  // ... other bus properties
}
```

*   **Response Body (Error - 400/500):**

```json
{
  "message": "Error message describing the issue."
}
```

## 2. PUT /bus/:id

**Description:** Updates bus details.

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the bus to update (MongoDB ObjectId).

**Request Body:**

```json
{
  "bus_number": "string",          // Optional: Updated bus number or registration plate.
  "bus_type": "string",            // Optional: Updated type of bus.
  "total_seats": "number",         // Optional: Updated total number of seats.
  "amenities": ["string"]        // Optional: Updated array of bus amenities.
}
```

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully updated the bus.
    *   400 Bad Request: Invalid request body (e.g., invalid data types).
    *   404 Not Found: Bus not found.
    *   500 Internal Server Error: Failed to update bus.

*   **Response Body (Success - 200 OK):**

```json
{
  "_id": "653fa1b2c3d4e5f6g7h8i9j0",  // MongoDB ObjectId (Bus ID)
  "operator_id": "653fb2c3d4e5f6g7h8i9j0k",
  "bus_number": "XYZ-789", // Updated
  "bus_type": "Sleeper", // Updated
  "total_seats": 30,   // Updated
  "amenities": ["AC", "Blankets"]  // Updated
  // ... other bus properties
}
```

*   **Response Body (Error - 400/404/500):**

```json
{
  "message": "Error message describing the issue."
}
```

## 3. DELETE /bus/:id

**Description:** Deletes a bus.

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the bus to delete (MongoDB ObjectId).

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Bus deleted successfully.
    *   404 Not Found: Bus not found.
    *   500 Internal Server Error: Failed to delete bus.

*   **Response Body (Success - 200 OK):**

```json
{
  "message": "Bus deleted successfully."
}
```

*   **Response Body (Error - 404/500):**

```json
{
  "message": "Error message describing the issue."
}
```

## 4. GET /bus/

**Description:** Retrieves all buses for a specific operator.

**Parameters:**

*   **Query Parameters:**
    *   `operator_id` (string, required): The unique identifier (ID) of the operator (MongoDB ObjectId).

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully retrieved the buses for the operator.
    *   400 Bad Request: Operator ID is required.
    *   500 Internal Server Error: Failed to fetch buses.

*   **Response Body (Success - 200 OK):**

```json
[
  {
    "_id": "653fa1b2c3d4e5f6g7h8i9j0",  // MongoDB ObjectId (Bus ID)
    "operator_id": "653fb2c3d4e5f6g7h8i9j0k",
    "bus_number": "ABC-123",
    "bus_type": "Luxury",
    "total_seats": 45,
    "amenities": ["WiFi", "AC", "Charging Ports"]
    // ... other bus properties
  },
  {
    "_id": "653fb2c3d4e5f6g7h8i9j0l1",  // MongoDB ObjectId (Bus ID)
    "operator_id": "653fb2c3d4e5f6g7h8i9j0k",
    "bus_number": "XYZ-789",
    "bus_type": "Sleeper",
    "total_seats": 30,
    "amenities": ["AC", "Blankets"]
    // ... other bus properties
  }
]
```

*   **Response Body (Error - 400/500):**

```json
{
  "message": "Error message describing the issue."
}
```
