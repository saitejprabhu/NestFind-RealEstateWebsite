# NestFind — Admin Dashboard Setup Guide

## What Was Added

### New Files
- `admin/login.html` — Admin login page (accessible from Login page)
- `admin/dashboard.html` — Full admin dashboard with property CRUD & revenue
- `api/admin_auth.php` — Admin session login/logout/check
- `api/properties.php` — Full CRUD API for admin-managed properties
- `uploads/properties/` — Directory where uploaded property images are saved

### Modified Files
- `database.sql` — Added `admins` table + `properties` table
- `login.html` — Added "Admin Dashboard Login" link at the bottom
- `index.html` — Home page now loads FEATURED properties from DB dynamically
- `buy.html` — Buy page now loads SALE properties from DB dynamically
- `rent.html` — Rent page now loads RENT properties from DB dynamically
- `api/config.php` — Cleaned up, kept same DB settings

---

## Setup Instructions (XAMPP)

### 1. Import the Database
Open phpMyAdmin → Import → select `database.sql`
This creates: `nestfind` database with `admins`, `properties`, `users`, `listings`, `inquiries` tables.

**Default admin credentials:**
- Username: `admin`
- Password: `admin123`

### 2. Place Files
Copy the entire project folder to `htdocs/` in XAMPP:
```
C:\xampp\htdocs\webtech-master\
```

### 3. Start XAMPP
Start Apache + MySQL from the XAMPP control panel.

### 4. Access the Site
- Site: `http://localhost/webtech-master/`
- Admin: `http://localhost/webtech-master/admin/login.html`
- Or: Login page → "Admin Dashboard Login" button

---

## How It Works

### Adding a Property
1. Log in at `admin/login.html`
2. Go to **Add Property** in the sidebar
3. Fill in: Title, Price, Location, Type (Sale/Rent), optional details + image
4. Check **"Mark as Featured"** to show on the Home page
5. Click **Save Property**

### Where Properties Appear
| Property Type | is_featured | Appears On          |
|--------------|-------------|---------------------|
| Sale          | No          | Buy page only       |
| Sale          | Yes         | Buy page + Home page|
| Rent          | No          | Rent page only      |
| Rent          | Yes         | Rent page + Home page|

### Editing / Deleting
- Go to **All Properties** → click ✏️ Edit or 🗑️ Delete
- Delete sets `status = 'inactive'` (soft delete, data preserved)

### Revenue Dashboard
- **Sale Portfolio** = sum of all active Sale property prices
- **Annual Rent Revenue** = sum of all monthly rents × 12
- **Monthly Chart** = bar chart of properties added per month (last 6 months)

---

## Image Upload
- Accepted formats: JPEG, PNG, WebP, GIF
- Max size: 5 MB
- Saved to: `uploads/properties/`
- Served as: `uploads/properties/prop_TIMESTAMP_HASH.ext`
