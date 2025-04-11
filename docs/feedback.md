## Endpoints

### 1. Submit Feedback

- **Route:** `POST /api/feedback`
- **Description:** Allows an authenticated user to submit feedback for a specific trip.
- **Authentication:** Required (`isAuthenticated` middleware).
- **Request:**
  - **Headers:**
    - `Content-Type: application/json`
    - `Authorization: Bearer <token>`
  - **Body (JSON):**
    ```json
    {
      "tripId": "string (ObjectId)", // Required: ID of the trip being reviewed
      "rating": "number (1-5)", // Required: Numeric rating
      "comments": "string" // Optional: User's comments
    }
    ```
- **Response:**
  - **Success (201 Created):**
    - `Content-Type: application/json`
    - **Body:**
      ```json
      {
        "success": true,
        "data": <FeedbackObject>
      }
      ```
  - **Error:**
    - `400 Bad Request`: Missing `tripId` or `rating`, invalid data format, or database error during save.
      ```json
      {
        "success": false,
        "message": "Trip ID and rating are required" // or other error message
      }
      ```
    - `401 Unauthorized`: User is not authenticated or token is invalid.
      ```json
      {
        "success": false,
        "message": "User not authenticated" // or message from auth middleware
      }
      ```

### 2. Get Feedback for a Trip

- **Route:** `GET /api/feedback/trip/:tripId`
- **Description:** Retrieves all feedback submissions associated with a specific trip ID.
- **Request:**
  - **URL Parameters:**
    - `tripId` (string, ObjectId format) - Required. The ID of the trip whose feedback is requested.
- **Response:**
  - **Success (200 OK):**
    - `Content-Type: application/json`
    - **Body:**
      ```json
      {
        "success": true,
        // Array of feedback objects for the trip.
        // user_id is populated with { _id, name, email }.
        "data": [<PopulatedFeedbackObject>, ...]
      }
      ```
  - **Error:**
    - `400 Bad Request`: Invalid `tripId` format or database error during fetch.
      ```json
      {
        "success": false,
        "message": "Failed to get feedback"
      }
      ```

### 3. Get Authenticated User's Feedback

- **Route:** `GET /api/feedback/user`
- **Description:** Retrieves all feedback submissions made by the currently authenticated user.
- **Authentication:** Required (`isAuthenticated` middleware).
- **Request:**
  - **Headers:**
    - `Authorization: Bearer <token>`
- **Response:**
  - **Success (200 OK):**
    - `Content-Type: application/json`
    - **Body:**
      ```json
      {
        "success": true,
        // Array of feedback objects submitted by the authenticated user.
        // trip_id is populated with Trip document details.
        "data": [<PopulatedFeedbackObject>, ...]
      }
      ```
  - **Error:**
    - `400 Bad Request`: Database error during fetch.
      ```json
      {
        "success": false,
        "message": "Failed to get user feedback"
      }
      ```
    - `401 Unauthorized`: User is not authenticated or token is invalid.
      ```json
      {
        "success": false,
        "message": "User not authenticated"
      }
      ```

### 4. Get Specific User's Feedback

- **Route:** `GET /api/feedback/user/:userId`
- **Description:** Retrieves all feedback submissions made by a specific user identified by their `userId`.
- **Request:**
  - **Headers:**
    - `Authorization: Bearer <token>`
  - **URL Parameters:**
    - `userId` (string, ObjectId format) - Required. The ID of the user whose feedback is requested.
- **Response:**
  - **Success (200 OK):**
    - `Content-Type: application/json`
    - **Body:**
      ```json
      {
        "success": true,
        // Array of feedback objects submitted by the specified user.
        // trip_id is populated with Trip document details.
        "data": [<PopulatedFeedbackObject>, ...]
      }
      ```
  - **Error:**
    - `400 Bad Request`: Invalid `userId` format or database error during fetch.
      ```json
      {
        "success": false,
        "message": "Failed to get user feedback"
      }
      ```
    - `401 Unauthorized`: Requesting user is not authenticated or token is invalid.
      ```json
      {
        "success": false,
        "message": "User not authenticated"
      }
      ```

---
