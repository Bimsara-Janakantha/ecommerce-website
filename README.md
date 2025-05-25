# SOLE HAVEN: an e-Commerce Web Application

A fully functional multi-page e-commerce web application built with **HTML**, **CSS**, **JavaScript (AJAX)** for the frontend, **PHP** for the backend, and **MySQL** as the database.

---

## Table of Contents

- [Project Overview](#project-overview)  
- [Tech Stack](#tech-stack)  
- [Features](#features)  
- [API Design & Routing](#api-design--routing)  
- [Frontend Architecture](#frontend-architecture)  
- [Backend Architecture](#backend-architecture)  
- [Payment Integration](#payment-integration)  
- [Setup & Installation](#setup--installation)  
- [Testing](#testing)  
- [Known Issues & Debugging](#known-issues--debugging)  

---

## Project Overview

This project is a robust e-commerce platform that supports user registration, login, product browsing, shopping cart management, seller product management, and payment processing through Google Pay. The application features a clean, responsive UI with modular design principles and a RESTful PHP backend API that securely handles all data operations.

---

## Tech Stack

| Layer          | Technology                              |
|----------------|---------------------------------------|
| Frontend       | HTML5, CSS3, JavaScript (AJAX)        |
| Backend        | PHP (with modular routing and controllers) |
| Database       | MySQL                                 |
| Payment Gateway| Google Pay JavaScript API              |

---

## Features

### Backend & API

- Central PHP-based API router handling HTTP methods: `GET`, `POST`, `PATCH`, `DELETE`.
- Clean URI parsing and normalized routing table.
- Modular controllers for handling login, user, product, and cart operations.
- Simulated authentication with JSON payload validation.
- Proper HTTP response codes and error handling (`401`, `404`, `405`, `500`, etc).
- Debugging enabled for development with error logging and request inspection.
- JSON output consistency to avoid frontend parse errors.
- Secure file uploads for product images with unique filenames and directory management.
- Robust product management API supporting multiple stock entries per size.
- Input validation and prepared statements for secure data handling.

### Frontend

- Responsive multi-page layout with semantic HTML5.
- Modular sections: header, footer, dynamic main content.
- Navigation with pages: Home, Products, Cart, About, Contact, Login, Register.
- Shopping cart using JavaScript and `localStorage` for persistence.
- Dynamic product form for add/edit with stock management.
- Frontend-only cart checkout logic with subtotal, shipping, discount, and coupon calculations.
- Product list table with dynamic updates, notifications, and validation.
- Shared stylesheets and Google Fonts integration.
- Dynamic loading of shared UI components using JavaScript.
- Input validation including email format and Sri Lankan mobile number.
- Textarea live word count with character limits.
- Access control to restrict pages to authenticated users.

### Payment Integration

- Google Pay API integration using official JS client.
- Support for card payments (Visa, Mastercard).
- Merchant info and tokenization configured.
- Dynamic Google Pay button rendering based on environment readiness.
- Billing/shipping validation before payment initiation.
- Handling of success and error payment responses.
- Tested on secure contexts (HTTPS/localhost).

---

## API Design & Routing

- Central router: `app.php` parses incoming HTTP requests.
- Routes mapped in associative array, e.g. `/login`, `/product`.
- Each route linked to a dedicated controller file for logic separation.
- Request methods strictly validated for each endpoint.
- Fallback 404 response for unknown routes.
- JSON-based request/response format with appropriate headers.
- Controllers handle CRUD operations for users and products.
- Includes image upload handling with error and security checks.

---

## Frontend Architecture

- Static HTML pages with dynamic JavaScript for interactivity.
- AJAX `fetch()` calls connect to backend API.
- Modular JavaScript functions for product list rendering, form validation, and notifications.
- LocalStorage used to maintain cart state and session data.
- CSS organized into a main stylesheet plus page-specific stylesheets.
- Google Fonts dynamically loaded and applied site-wide.
- Event delegation used for dynamic UI elements like product table buttons.
- Responsive design principles applied for usability on multiple devices.

---

## Backend Architecture

- PHP environment with enabled error reporting during development.
- Organized file structure with `controllers/`, `routes/`, and core API router.
- Uses PDO for MySQL database interaction with prepared statements.
- Supports image uploads, renaming, and storage under gender-based directories.
- Includes detailed error handling and logging for server-side debugging.
- Secure validation of input data to prevent malformed requests.
- JSON encoding used for all responses to frontend.

---

## Setup & Installation

### Prerequisites

- PHP 7.x or above
- MySQL Server
- Apache or compatible web server (e.g., XAMPP, WAMP)

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ecommerce-webapp.git
   cd ecommerce-webapp
