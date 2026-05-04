<?php
// ============================================================
//  api/listing.php  —  Submit a new property listing
// ============================================================
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed');
}

$data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

// ── Required fields ─────────────────────────────────────────
$title         = trim($data['title']         ?? '');
$property_type = trim($data['property_type'] ?? '');
$listing_type  = trim($data['listing_type']  ?? '');
$price         = floatval($data['price']     ?? 0);
$address       = trim($data['address']       ?? '');
$city          = trim($data['city']          ?? '');
$pincode       = trim($data['pincode']       ?? '');

if (!$title)         respond(false, 'Property title is required');
if (!$property_type) respond(false, 'Property type is required');
if (!$listing_type)  respond(false, 'Listing type (sell/rent) is required');
if ($price <= 0)     respond(false, 'Valid price/rent is required');
if (!$address)       respond(false, 'Full address is required');
if (!$city)          respond(false, 'City is required');
if (!preg_match('/^\d{6}$/', $pincode)) respond(false, 'Enter a valid 6-digit pincode');

// ── Optional fields ─────────────────────────────────────────
$negotiable      = isset($data['negotiable'])       ? (int)(bool)$data['negotiable']       : 0;
$bhk             = $data['bhk']             ?? null;
$bathrooms       = isset($data['bathrooms'])       ? (int)$data['bathrooms']       : null;
$total_area      = isset($data['total_area'])      ? (int)$data['total_area']      : null;
$carpet_area     = isset($data['carpet_area'])     ? (int)$data['carpet_area']     : null;
$floor_no        = isset($data['floor_no'])        ? (int)$data['floor_no']        : null;
$total_floors    = isset($data['total_floors'])    ? (int)$data['total_floors']    : null;
$furnishing      = $data['furnishing']      ?? null;
$possession      = $data['possession']      ?? null;
$description     = $data['description']     ?? null;
$amenities       = $data['amenities']       ?? null;
$additional_info = $data['additional_info'] ?? null;

// ── Optional: attach logged-in user ─────────────────────────
session_start();
$user_id = $_SESSION['user_id'] ?? null;

$db = getDB();
$stmt = $db->prepare(
    'INSERT INTO listings
     (user_id, title, property_type, listing_type, price, negotiable,
      address, city, pincode, bhk, bathrooms, total_area, carpet_area,
      floor_no, total_floors, furnishing, possession, description,
      amenities, additional_info)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
);

$stmt->bind_param(
    'isssdiisssiiiissssss',
    $user_id, $title, $property_type, $listing_type, $price, $negotiable,
    $address, $city, $pincode, $bhk, $bathrooms, $total_area, $carpet_area,
    $floor_no, $total_floors, $furnishing, $possession, $description,
    $amenities, $additional_info
);

if ($stmt->execute()) {
    respond(true, 'Your listing has been submitted for review!', ['listing_id' => $db->insert_id]);
} else {
    respond(false, 'Failed to submit listing. Please try again.');
}
?>
