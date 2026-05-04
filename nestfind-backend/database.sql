-- ============================================================
--  NestFind Database Setup
--  Run this in phpMyAdmin or MySQL CLI after starting XAMPP
-- ============================================================

CREATE DATABASE IF NOT EXISTS nestfind CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nestfind;

-- ─────────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80)  NOT NULL,
  last_name  VARCHAR(80)  NOT NULL,
  email      VARCHAR(180) NOT NULL UNIQUE,
  mobile     VARCHAR(15)  NOT NULL,
  password   VARCHAR(255) NOT NULL,         -- bcrypt hash
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  PROPERTY LISTINGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT          DEFAULT NULL,
  title            VARCHAR(255) NOT NULL,
  property_type    VARCHAR(60)  NOT NULL,
  listing_type     VARCHAR(20)  NOT NULL,   -- sell / rent
  price            DECIMAL(14,2) NOT NULL,
  negotiable       TINYINT(1)   DEFAULT 0,
  address          VARCHAR(255) NOT NULL,
  city             VARCHAR(100) NOT NULL,
  pincode          VARCHAR(10)  NOT NULL,
  bhk              VARCHAR(20)  DEFAULT NULL,
  bathrooms        INT          DEFAULT NULL,
  total_area       INT          DEFAULT NULL,
  carpet_area      INT          DEFAULT NULL,
  floor_no         INT          DEFAULT NULL,
  total_floors     INT          DEFAULT NULL,
  furnishing       VARCHAR(50)  DEFAULT NULL,
  possession       VARCHAR(60)  DEFAULT NULL,
  description      TEXT         DEFAULT NULL,
  amenities        VARCHAR(500) DEFAULT NULL,
  additional_info  TEXT         DEFAULT NULL,
  status           VARCHAR(20)  DEFAULT 'pending',  -- pending / approved / rejected
  created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  PAYMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  full_name   VARCHAR(160)   NOT NULL,
  mobile      VARCHAR(15)    NOT NULL,
  email       VARCHAR(180)   NOT NULL,
  pan         VARCHAR(10)    NOT NULL,
  pay_method  VARCHAR(10)    NOT NULL,        -- upi / card
  upi_app     VARCHAR(20)    DEFAULT NULL,    -- gpay / phonepe / paytm / bhim
  upi_id      VARCHAR(100)   DEFAULT NULL,
  card_last4  VARCHAR(4)     DEFAULT NULL,
  amount      DECIMAL(14,2)  NOT NULL,
  listing_id  INT            DEFAULT NULL,
  status      VARCHAR(20)    DEFAULT 'success',
  paid_at     DATETIME       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  CONTACT / INQUIRY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(160) NOT NULL,
  email       VARCHAR(180) NOT NULL,
  mobile      VARCHAR(15)  NOT NULL,
  message     TEXT         NOT NULL,
  listing_id  INT          DEFAULT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
