<?php
// ============================================================
//  api/inquiry.php  —  Submit a property inquiry / contact
// ============================================================
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed');
}

$data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

$name       = trim($data['name']    ?? '');
$email      = trim($data['email']   ?? '');
$mobile     = trim($data['mobile']  ?? '');
$message    = trim($data['message'] ?? '');
$listing_id = isset($data['listing_id']) ? (int)$data['listing_id'] : null;

if (!$name)                                        respond(false, 'Name is required');
if (!filter_var($email, FILTER_VALIDATE_EMAIL))    respond(false, 'Valid email is required');
if (!preg_match('/^\d{10}$/', $mobile))            respond(false, 'Valid 10-digit mobile number required');
if (strlen($message) < 10)                         respond(false, 'Please enter a message (min 10 chars)');

$db = getDB();
$stmt = $db->prepare(
    'INSERT INTO inquiries (name, email, mobile, message, listing_id) VALUES (?, ?, ?, ?, ?)'
);
$stmt->bind_param('ssssi', $name, $email, $mobile, $message, $listing_id);

if ($stmt->execute()) {
    respond(true, 'Your inquiry has been sent! We will contact you soon.');
} else {
    respond(false, 'Failed to send inquiry. Please try again.');
}
?>
