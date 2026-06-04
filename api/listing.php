<?php
/**
 * api/listing.php
 * Handles user-submitted property listings from sell.html.
 * Accepts multipart/form-data so photos can be uploaded.
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

function out($ok, $msg, $extra = []) {
    echo json_encode(array_merge(['success' => $ok, 'message' => $msg], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 'Method not allowed.');

$db = new mysqli('localhost', 'root', '', 'nestfind');
if ($db->connect_error) out(false, 'DB connection failed: ' . $db->connect_error);
$db->set_charset('utf8mb4');

// Read fields from $_POST (multipart/form-data)
$property_type = trim($_POST['property_type'] ?? '');
$listing_type  = trim($_POST['listing_type']  ?? '');
$price         = floatval($_POST['price']     ?? 0);
$address       = trim($_POST['address']       ?? '');
$city          = trim($_POST['city']          ?? '');
$pincode       = trim($_POST['pincode']       ?? '000000');
$bhk           = trim($_POST['bhk']           ?? '');
$total_area    = intval($_POST['total_area']  ?? 0);
$furnishing    = trim($_POST['furnishing']    ?? '');
$description   = trim($_POST['description']  ?? '');
$owner_name    = trim($_POST['owner_name']    ?? '');
$owner_phone   = trim($_POST['owner_phone']   ?? '');

$title = trim($_POST['title'] ?? '');
if (!$title) {
    $title = trim(($bhk ? $bhk . ' ' : '') . $property_type . ' in ' . $address);
}

// Validation
if (!$property_type) out(false, 'Property type is required.');
if (!$listing_type)  out(false, 'Listing type is required.');
if (!$address)       out(false, 'Location / Address is required.');
if ($price <= 0)     out(false, 'A valid price is required.');
if (!$owner_name)    out(false, 'Your name is required.');
if (!$owner_phone)   out(false, 'Your mobile number is required.');

// Handle photo uploads
$uploadDir = __DIR__ . '/../uploads/listings/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

$photos = [];
if (!empty($_FILES['photos']['name'][0])) {
    foreach ($_FILES['photos']['tmp_name'] as $i => $tmp) {
        if ($_FILES['photos']['error'][$i] !== UPLOAD_ERR_OK) continue;
        $ext  = strtolower(pathinfo($_FILES['photos']['name'][$i], PATHINFO_EXTENSION));
        $allowed = ['jpg','jpeg','png','webp','gif'];
        if (!in_array($ext, $allowed)) continue;
        $fname = 'listing_' . time() . '_' . uniqid() . '.' . $ext;
        if (move_uploaded_file($tmp, $uploadDir . $fname)) {
            $photos[] = 'uploads/listings/' . $fname;
        }
    }
}
$photosJson = json_encode($photos);

// Ensure listings table has owner_name, owner_phone, photos columns
$db->query("ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_name  VARCHAR(160) DEFAULT NULL AFTER description");
$db->query("ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(20)  DEFAULT NULL AFTER owner_name");
$db->query("ALTER TABLE listings ADD COLUMN IF NOT EXISTS photos      TEXT         DEFAULT NULL AFTER owner_phone");

$stmt = $db->prepare("
    INSERT INTO listings
      (title, property_type, listing_type, price,
       address, city, pincode,
       bhk, total_area, furnishing,
       description, owner_name, owner_phone, photos, status)
    VALUES
      (?, ?, ?, ?,
       ?, ?, ?,
       ?, ?, ?,
       ?, ?, ?, ?, 'pending')
");

if (!$stmt) out(false, 'Prepare failed: ' . $db->error);

$stmt->bind_param('sssdssssiissss',
    $title, $property_type, $listing_type, $price,
    $address, $city, $pincode,
    $bhk, $total_area, $furnishing,
    $description, $owner_name, $owner_phone, $photosJson
);

if ($stmt->execute()) {
    $newId = $db->insert_id;
    $stmt->close();
    out(true, 'Your property has been submitted for review! Our team will verify and publish it shortly.', ['listing_id' => $newId]);
} else {
    $err = $stmt->error;
    $stmt->close();
    out(false, 'Could not save listing: ' . $err);
}
?>
