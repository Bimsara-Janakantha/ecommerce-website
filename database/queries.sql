-- Create Data Base
CREATE DATABASE SOLE_HAVEN;

-- Use Databse
USE SOLE_HAVEN;

-- USERS TABLE
CREATE TABLE USERS (
  userId INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('developer', 'customer', 'owner', 'seller', 'admin') NOT NULL DEFAULT 'customer',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
