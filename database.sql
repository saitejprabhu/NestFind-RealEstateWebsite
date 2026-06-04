-- ============================================================
--  NestFind Database Setup (Updated with Admin + Properties)
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
  password   VARCHAR(255) NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  ADMIN USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(80)  NOT NULL UNIQUE,
  email      VARCHAR(180) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  Default admin credentials:
--    Username : admin
--    Password : admin123
--
--  The password is stored as PLAIN TEXT here so it works
--  immediately on any PHP/MySQL version without hash mismatches.
--  admin_auth.php will auto-upgrade it to bcrypt on first login.
-- ─────────────────────────────────────────────
INSERT INTO admins (username, email, password)
VALUES ('admin', 'admin@nestfind.com', 'admin123')
ON DUPLICATE KEY UPDATE password = 'admin123';

-- ─────────────────────────────────────────────
--  PROPERTIES (Admin-managed dynamic listings)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  price         DECIMAL(14,2) NOT NULL,
  location      VARCHAR(255) NOT NULL,
  description   TEXT         DEFAULT NULL,
  property_type ENUM('Sale','Rent') NOT NULL,
  is_featured   TINYINT(1)   DEFAULT 0,
  image         VARCHAR(500) DEFAULT NULL,
  bedrooms      VARCHAR(20)  DEFAULT NULL,
  bathrooms     INT          DEFAULT NULL,
  area          VARCHAR(50)  DEFAULT NULL,
  furnishing    VARCHAR(50)  DEFAULT NULL,
  status        ENUM('active','inactive') DEFAULT 'active',
  -- View Details fields (populated via admin panel)
  amenities     TEXT         DEFAULT NULL,  -- JSON array of amenity strings
  extra_images  TEXT         DEFAULT NULL,  -- JSON array of image URLs
  map_embed     TEXT         DEFAULT NULL,  -- Google Maps <iframe> embed HTML
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Migration: if properties table already exists, add new columns
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities    TEXT DEFAULT NULL AFTER furnishing;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS extra_images TEXT DEFAULT NULL AFTER amenities;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS map_embed    TEXT DEFAULT NULL AFTER extra_images;

-- ─────────────────────────────────────────────
--  LISTINGS (user-submitted sell/rent requests)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT          DEFAULT NULL,
  title            VARCHAR(255) NOT NULL,
  property_type    VARCHAR(60)  NOT NULL,
  listing_type     VARCHAR(20)  NOT NULL,
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
  status           VARCHAR(20)  DEFAULT 'pending',
  created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Migration: add owner contact and photos columns to listings if they don't exist
ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_name  VARCHAR(160) DEFAULT NULL AFTER description;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(20)  DEFAULT NULL AFTER owner_name;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS photos      TEXT         DEFAULT NULL AFTER owner_phone;
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

-- ─────────────────────────────────────────────
--  PAYMENTS (recorded after each completed payment)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  booking_id     VARCHAR(40)   NOT NULL UNIQUE,
  txn_id         VARCHAR(40)   NOT NULL,
  -- Property snapshot (stored so it's preserved even if property is deleted)
  prop_title     VARCHAR(255)  NOT NULL,
  prop_location  VARCHAR(255)  NOT NULL,
  prop_type      VARCHAR(20)   NOT NULL,   -- Sale / Rent
  prop_image     VARCHAR(500)  DEFAULT NULL,
  -- Price breakdown
  price_base     VARCHAR(60)   NOT NULL,
  price_reg      VARCHAR(60)   NOT NULL,
  price_stamp    VARCHAR(60)   NOT NULL,
  price_service  VARCHAR(60)   NOT NULL,
  price_total    VARCHAR(60)   NOT NULL,
  -- Row labels (differ for Sale vs Rent)
  label_reg      VARCHAR(80)   DEFAULT 'Registration Charges',
  label_stamp    VARCHAR(80)   DEFAULT 'Stamp Duty (1.5%)',
  label_service  VARCHAR(80)   DEFAULT 'NestFind Service Fee',
  -- Buyer details
  buyer_name     VARCHAR(160)  NOT NULL,
  buyer_mobile   VARCHAR(15)   NOT NULL,
  buyer_email    VARCHAR(180)  NOT NULL,
  buyer_pan      VARCHAR(10)   NOT NULL,
  -- Payment method
  pay_method     VARCHAR(100)  NOT NULL,
  pay_status     VARCHAR(20)   DEFAULT 'completed',
  -- Timestamps
  booked_at      DATETIME      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
