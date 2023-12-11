# ServiceSeeker-Backend

# Service Seeker API Documentation

Welcome to the API documentation for Service Seeker. This document provides information about the available endpoints and how to interact with the Service Seeker API.

## Base URL

The base URL for all API endpoints is:

https://service-seeker-api.vercel.app/

### Auth
- **Register**: `POST /auth/register`
- **Login**: `POST /auth/login`
- **Logout**: `POST /auth/logout`

### Users
- **Get all User**: `GET /users/all`
- **Get User by username**: `GET /users/:username`
- **Get user Jobs**: `GET /users/:username/jobs`
- **Update User Profile**: `PUT /users/:username`
- **Change User Password**: `PUT /users/:username/change-passwords`
- **Upload Image Profile** `Post /users/:Username/upload-profile-image`

### Jobs
- **Get All Jobs**: `GET /jobs/all`
- **Get job by Id**: `GET /jobs/detail/:jobsId`
- **Create Job**: `POST /jobs/create`
- **Apply for a Job**: `POST /jobs/:jobsId/apply`
- **Search all job nearby** `GET /jobs/search`
- **Update the Job**: `PUT /jobs/:jobId`
- **Mark a Job Status as Finish** `PUT /jobs/:jobId/finish`
- **Delete a Job**: `DELETE /jobs/:jobId`

### Reviews
- **Add Review**: `POST /reviews/add`
- **Get User Reviews**: `GET /reviews/jobseeker`


## Authentication

All requests to the API require authentication using a valid access token.

### Register
Register a new user.

- **Method**: `POST`
- **Path**: `/auth/register`
- **Response Code**: `201 Created`


**Request body:**

```json
{
  "firstName": "john",
  "lastName": "doe",
  "username": "john_doe",
  "email": "john.doe@example.com",
  "phone": "6282134567"
  "role": "job_seeker",
  "address": "Cikarang"
  "password": "securepassword",
}
```
**JSON body parameters**
|         Name                | Type    | Rules                                                                                                            | Descriptions                                                                  |
| -------------------------   | ------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------    |
| firstName`Required`         | string  | Must have a length between 3 and the specified maximum length (`20`).                            | The first name should have a valid length, not exceeding the specified maximum length.                 |              
| lastName`Optional`          | string  | Optional, but if provided, must have a length between 3 and the specified maximum length (`20`).  | The last name, if provided, should have a valid length, not exceeding the specified maximum length.   |
| username `Required`         | string  | Must be unique; checked against existing usernames in the database.                                              | The username should be unique and not already exist in the database.                   |
| email `Required`            | string  | Must be a valid email format.<br> - Must be unique; checked against existing email addresses in the database.    | The email should be in a valid format, and it should be unique in the database.         |
| phone `Required`            | string  | Must be numeric.                                                                                                 | The phone number should consist of only numeric characters.                                            |
| role  `Required`            | string  | Must be either 'employer' or 'job_seeker'.                                                                       | The role should be either 'employer' or 'job_seeker'.                                                  |
| address `Required`          | string  | Must have a length not exceeding 255 characters.                                                                 | The address should have a valid length, not exceeding the specified maximum length 255 character.                    |
| password  `Required`        | string  |                                                                                                                  |




**Response:**
```json
{
  "success": true,
  "status": "success",
  "message": "User registered successfully"
}
```
**Error Response:** <br>
- `400 Bad Request` : The request cannot be fulfilled due to bad syntax.
- `422 Unprocessable Entity`:  The request contains invalid parameters or error on input validation.
- `500 Internal Server Error`: Failed on Server side

### Login

Log in with an existing user.and retrieve the token.

- **Method**: `POST`
- **Path**: `/auth/login`
- **Response Code**: `200 Ok`

**Request Body:**

```json
{
  "username": "john_doe",
  "password": "securepassword"
}
```
**Response:**
```json
{
  "success": "true",
  "status": "success",
  "message": "Login successful",
  "data": {
      "token": "user_access_token"
    },

```
The token will be valid for 24 hours.

**Error Response:**
- `400 Bad Request` : The request cannot be fulfilled due to bad syntax.
- `401 Unauthorized`:  The request contains Invalid username or password..
- `500 Internal Server Error`: Failed on Server side

### Logout

#### `POST /auth/logout`

Allows the user to logout of the session and invalidates the token before it expires.

- **Method**: `POST`
- **Path**: `/auth/logout`
- **Header**: `Authorization : user_access_token`
- **Response Code**: `200 Ok`

**Response:**
```json
{
    "success": true,
    "message": "Logout successful"
}

```

**Error Response:**
- `400 Bad Request` : The request cannot be fulfilled due to bad syntax.
- `401 Unauthorized`:  User already logout or Token is missing.
- `500 Internal Server Error`: Failed on Server side




### Users

#### Get All Users
##### all logged in or authenticated users can access this EndPoint

- **Method**: `GET`
- **Path**: `/users/all`
- **Authorization Header**: `Authorization: user_access_token`
- **Response Code**: `200 OK`

**Response:**
```json
{
"success": true,
    "status": "success",
    "data": [
        {
            "username": "john_doe",
            "fullName": "john doe",
            "email": "john_doe@gmail.com",
            "role": "employer",
            "rating": {
                "totalRating": 3.5,
                "numberOfReviews": 2,
                "averageRating": 7
            },
            "createdAt": "2023-12-06T22:00:40.781Z"
        },
        {
            "username": "anna_mc",
            "fullName": "anna mclaren",
            "email": "anna@gmail.com",
            "role": "job_seeker",
            "rating": {
                "totalRating": 5,
                "numberOfReviews": 2,
                "averageRating": 10
            },
            "createdAt": "2023-12-06T22:00:40.781Z"
        },

    // ... other users
  ]
}
```

**Error Response:**
- `401 Unauthorized`: Token is missing or invalid.
- `500 Internal Server Error`: Failed on Server side

#### Get Detail of user by Username
##### only
- **Method**: `GET`
- **Path**: `/users/:username`
- **Response Code**: `200 OK`

**Response:**
```json
{
  "success": true,
  "status": "success",
    "data": [
        {
            "user": {
                "location": {
                    "type": "Point",
                    "coordinates": [
                        longitude,
                        latitude
                    ]
                },
                "ratings": {
                    "totalRating": 0,
                    "numberOfReviews": 0,
                    "averageRating": 0
                },
                "_id": "userId",
                "firstName": "john",
                "lastName": "doe",
                "fullName": "john doe",
                "username": "john_doe",
                "email": "johndoe@gmail.com",
                "phone": "628123456789",
                "role": "employer",
                "address": "user address",
                "profileImage": "user image Url",
                "createdAt": "2023-12-06T22:00:40.781Z",
            }
        },
```

**Error Response:**
- `401 Unauthorized`: Token is missing or invalid.
- `404 Not Found`: User not found.
- `500 Internal Server Error`: Failed on Server side

#### Get User Jobs
- **Method**: `GET`
- **Path**: `/users/:username/jobs`
- **Authorization Header**: `Authorization: user_access_token`
- **Response Code**: `200 OK`

**Response:**
```json
{
  "success": true,
  "status": "success",
  "data": [
    {
      "jobId": "12345",
      "title": "Software Developer",
      "description": "Develop software applications.",
      "status": "open",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-02T14:30:00Z"
    },
    // ... other jobs
  ]
}
```

**Error Response:**
- `401 Unauthorized`: Token is missing or invalid.
- `404 Not Found`: User not found.
- `500 Internal Server Error`: Failed on Server side

#### Update User Profile
- **Method**: `PUT`
- **Path**: `/users/:username`
- **Authorization Header**: `Authorization: user_access_token`
- **Response Code**: `200 OK`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Updated",
  "email": "john.updated@example.com",
  "phone": "6282198765",
  "address": "Updated Address"
}
```

**Response:**
```json
{
  "success": true,
  "status": "success",
  "message": "User profile updated successfully",
  "data": {
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Updated",
    "email": "john.updated@example.com",
    "phone": "6282198765",
    "role": "job_seeker",
    "address": "Updated Address",
    "location": {
      "type": "Point",
      "coordinates": [longitude, latitude]
    }
  }
}
```

**Error Response:**
- `401 Unauthorized`: Token is missing or invalid.
- `404 Not Found`: User not found.
- `422 Unprocessable Entity`: Validation error on input parameters.
- `500 Internal Server Error`: Failed on Server side

#### Change User Password
- **Method**: `PUT`
- **Path**: `/users/:username/change-password`
- **Authorization Header**: `Authorization: user_access_token`
- **Response Code**: `200 OK`

**Request Body:**
```json
{
  "oldPassword": "securepassword",
  "newPassword": "newsecurepassword"
}
```

**Response:**
```json
{
  "success": true,
  "status": "success",
  "message": "Password changed successfully"
}
```

**Error Response:**
- `401 Unauthorized`: Token is missing or invalid.
- `403 Forbidden`: Incorrect old password.
- `422 Unprocessable Entity`: Validation error on input parameters.
- `500 Internal Server Error`: Failed on Server side

#### Upload Image Profile
- **Method**: `POST`
- **Path**: `/users/:username/upload-profile-image`
- **Authorization Header**: `Authorization: user_access_token`
- **Response Code**: `200 OK`

**Request Body:**
```
Form-data: { "image": [image_file] }
```

**Response:**
```json
{
  "success": true,
  "status": "success",
  "message": "Profile image uploaded successfully",
  "data": {
    "imageUrl": "https://yourcdn.com/images/john_doe_profile.jpg"
  }
}
```

**Error Response:**
- `401 Unauthorized`: Token is missing or invalid.
- `422 Unprocessable Entity`: Validation error on input parameters.
- `500 Internal Server Error`: Failed on Server side



