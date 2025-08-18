# Payment System Integration

This project integrates **Pesapal** (online payments) and **M-Pesa** (mobile payments) gateways, offering a comprehensive solution for online and mobile payment processing. The system consists of a **frontend** (user interface) and **backend** (server-side logic) components. It supports secure payment transactions, session management, and transaction updates.

Key features of this system include:

- **Pesapal Integration**: Seamlessly process online payments through Pesapal, handling payment requests and callbacks.
- **M-Pesa Integration**: Support for mobile payments via M-Pesa, including OAuth token generation and payment handling.
- **Guest User Sessions**: Enable guest users to make payments without creating an account, with the ability to refresh JWT tokens.
- **Payment Request & Callbacks**: Initiates payment requests for both Pesapal and M-Pesa and handles their respective callbacks to update transaction statuses.
- **Security Features**: Implements **JWT Authentication** for session management, **CSRF Protection** for secure payments, and **Rate Limiting** to prevent abuse.

---

## Table of Contents

- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Conclusion](#conclusion)

---

## Frontend Setup

To set up the frontend:

1. **Clone the repository:**
    ```bash
    git clone https://github.com/collinsMutai/JamboSafari.git
    ```

2. **Navigate to the frontend directory and install dependencies:**
    ```bash
    cd frontend
    npm install
    ```

3. **Run the frontend application:**
    ```bash
    npm start
    ```
    Access the app at [http://localhost:4200](http://localhost:4200).

4. **Set up environment variables** by editing the `src/environments/environment.ts` file. Replace the following sensitive information with values from your `.env` file or other secure sources.

    ```typescript
    export const environment = {
      production: false,
      emailJS: {
        serviceID: process.env.EMAILJS_SERVICE_ID,
        templateID: process.env.EMAILJS_TEMPLATE_ID,
        contactTemplateID: process.env.EMAILJS_CONTACT_TEMPLATE_ID,
        userID: process.env.EMAILJS_USER_ID,
      },
      reCAPTCHA: {
        siteKey: process.env.RECAPTCHA_SITE_KEY,
      },
      apiUrl: process.env.API_URL || 'http://localhost:3000/api',
    };
    ```

    **Create a `.env` file** at the root of your project and define the variables for `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_CONTACT_TEMPLATE_ID`, `EMAILJS_USER_ID`, `RECAPTCHA_SITE_KEY`, and `API_URL`.

---

## Backend Setup

To set up the backend:

1. **Navigate to the backend directory and install dependencies:**
    ```bash
    cd backend
    npm install
    ```

2. **Set up environment variables** by creating a `.env` file with the following keys:

    ```env
    # Environment Mode (Set to 'production' in live environments)
    NODE_ENV=development  # Or 'production' when deploying to a live environment

    # Pesapal API credentials
    PESAPAL_CONSUMER_KEY=your_consumer_key
    PESAPAL_CONSUMER_SECRET=your_consumer_secret
    PESAPAL_URL=https://www.pesapal.com/API/MakePayment

    # M-Pesa API credentials
    M_PESA_LIPA_NA_MPESA_SHORTCODE=your_lipa_shortcode
    M_PESA_LIPA_NA_MPESA_SHORTCODE_SECRET=your_secret_key
    M_PESA_LIPA_NA_MPESA_LIPA_URL=https://your-api-endpoint
    M_PESA_OAUTH_URL=https://your-oauth-url

    # Server & DB configurations
    PORT=3000
    FRONTEND_ORIGINS=your_frontend_origins  # e.g. 'https://www.examplesite.com,https://localhost:4200'
    MONGO_URI=your_mongo_connection_string

    # Security Configurations
    ENCRYPTION_SECRET=ENCRYPTION_SECRET
    JWT_SECRET=JWT_SECRET

    # Frontend/Third-Party Services
    EMAILJS_SERVICE_ID=your_emailjs_service_id
    EMAILJS_TEMPLATE_ID=your_emailjs_template_id
    EMAILJS_CONTACT_TEMPLATE_ID=your_emailjs_contact_template_id
    EMAILJS_USER_ID=your_emailjs_user_id
    RECAPTCHA_SITE_KEY=your_recaptcha_site_key
    API_URL=http://localhost:3000/api
    ```

    This `.env` file contains:
    - **Pesapal and M-Pesa API credentials** for payment processing.
    - **Server configurations**, including the port, MongoDB URI, and frontend origins.
    - **Security secrets** for JWT and encryption.
    - **EmailJS and reCAPTCHA keys**, which should be securely stored and accessed via environment variables.

3. **Run the backend server:**
    ```bash
    npm start
    ```
    The backend will be available at [http://localhost:3000](http://localhost:3000).

---

## Installation

### Prerequisites

- Node.js (version 14 or higher)
- NPM (Node Package Manager)

### Steps

1. **Clone the repository:**
    ```bash
    git clone https://github.com/collinsMutai/JamboSafari.git
    ```

2. **Install dependencies for both frontend and backend:**

    **Frontend:**
    ```bash
    cd frontend
    npm install
    ```

    **Backend:**
    ```bash
    cd backend
    npm install
    ```

3. **Set up environment variables** in the backend and frontend as outlined above.

4. **Start the application:**

    **Frontend:**
    ```bash
    cd frontend
    npm start
    ```

    **Backend:**
    ```bash
    cd backend
    npm start
    ```

---

## Environment Variables

Here is a summary of the environment variables used in the project:

### Frontend (`src/environments/environment.ts`)
- **`EMAILJS_SERVICE_ID`**: Your EmailJS service ID.
- **`EMAILJS_TEMPLATE_ID`**: Your EmailJS template ID.
- **`EMAILJS_CONTACT_TEMPLATE_ID`**: Your EmailJS contact template ID.
- **`EMAILJS_USER_ID`**: Your EmailJS user ID.
- **`RECAPTCHA_SITE_KEY`**: Your Google reCAPTCHA site key.
- **`API_URL`**: The backend API URL (usually set to `http://localhost:3000/api` during development).

### Backend (`.env`)
- **`NODE_ENV`**: Environment mode (`development` or `production`).
- **Pesapal API credentials**: `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, `PESAPAL_URL`.
- **M-Pesa API credentials**: `M_PESA_LIPA_NA_MPESA_SHORTCODE`, `M_PESA_LIPA_NA_MPESA_SHORTCODE_SECRET`, `M_PESA_LIPA_NA_MPESA_LIPA_URL`, `M_PESA_OAUTH_URL`.
- **Server configurations**: `PORT`, `FRONTEND_ORIGINS`, `MONGO_URI`.
- **Security configurations**: `ENCRYPTION_SECRET`, `JWT_SECRET`.
- **EmailJS and reCAPTCHA keys**: `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_CONTACT_TEMPLATE_ID`, `EMAILJS_USER_ID`, `RECAPTCHA_SITE_KEY`.

---

## Conclusion

This payment system integrates **Pesapal** and **M-Pesa** for online and mobile payments, providing a comprehensive solution for securely processing transactions. It incorporates essential features like **JWT authentication**, **CSRF protection**, **rate limiting**, and **guest user sessions**. Whether you need online payment processing or mobile-based payments, this system offers a reliable and secure solution.

For any issues or questions, open an issue on [GitHub](https://github.com/your-username/your-repository).
