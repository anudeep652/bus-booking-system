# User API Endpoints

This document describes the API endpoints available under the `/user` base path.

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

## 1. POST /user/register

**Description:** Registers a new user.

**Request Body:**

```json
{
  "name": "string",       // Required: User's full name.
  "email": "string",      // Required: User's email address (must be unique).
  "phone": "string",      // Optional: User's phone number.
  "password": "string"    // Required: User's password.
  "role": "string"        // Optional: User role; defaults to "user" if not provided. Can be "user" or "admin". Ensure proper authorization when creating admin users.
}
```

**Response:**

*   **Status Codes:**
    *   201 Created: Successfully registered a new user. The response body includes a JWT token.
    *   400 Bad Request: Invalid request body (e.g., missing fields, invalid email format, password too short).  The `message` field in the JSON response will provide details.
    *   409 Conflict: Email address already exists.
    *   500 Internal Server Error: An unexpected error occurred.

*   **Response Body (Success - 201 Created):**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

*   **Response Body (Error - 400/409/500):**

```json
{
  "message": "Error message describing the issue."
}
```

## 2. POST /user/login

**Description:** Logs in an existing user.

**Request Body:**

```json
{
  "email": "string",      // Required: User's email address.
  "password": "string"   // Required: User's password.
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

*   **Response Body (Error - 401/400/500):**

```json
{
  "message": "Error message describing the issue."
}
```

## 3. GET /user/profile/:id

**Description:** Retrieves the profile information for a specific user.

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the user.  This should correspond to the `_id` (MongoDB ObjectId) field in the `UserSchema`.

**Request Body:**

*   None

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully retrieved the user profile.
    *   404 Not Found: User with the specified ID not found.
    *   500 Internal Server Error: An unexpected error occurred.

*   **Response Body (Success - 200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "653f2b4c5d6e7f8a9b0c1d2f",  // MongoDB ObjectId
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "role": "user",
    "status": "active"
    // ... other user properties (as defined in UserSchema)
  }
}
```

*   **Response Body (Error - 404/500):**

```json
{
  "success": false,
  "message": "Error message describing the issue."
}
```

## 4. PUT /user/profile/:id

**Description:** Updates the profile information for a specific user. Requires authentication.

**Parameters:**

*   **Path Parameter:**
    *   `id` (string, required): The unique identifier (ID) of the user. This should correspond to the `_id` (MongoDB ObjectId) field in the `UserSchema`.

**Request Body:**

```json
{
  "name": "string",       // Optional: User's full name.
  "email": "string",      // Optional: User's email address.
  "phone": "string",       // Optional: User's phone number.
  "password": "string",   // Optional: New password (ensure proper hashing).
  // ... other user profile fields to update (excluding role and status)
}
```

**Response:**

*   **Status Codes:**
    *   200 OK: Successfully updated the user profile.
    *   400 Bad Request: Invalid request body (e.g., invalid email format, attempting to update `role` or `status` which may not be allowed via this endpoint).
    *   404 Not Found: User with the specified ID not found.
    *   500 Internal Server Error: An unexpected error occurred during the update process.

*   **Response Body (Success - 200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "653f2b4c5d6e7f8a9b0c1d2f",  // MongoDB ObjectId
    "name": "Updated Name",
    "email": "updated.email@example.com",
    "phone": "555-987-6543",
    "role": "user",
    "status": "active"
    // ... other updated user profile fields (as defined in UserSchema)
  }
}
```

*   **Response Body (Error - 400/404/500):**

```json
{
  "success": false,
  "message": "Error message describing the issue."
}
```
