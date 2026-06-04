<?php
// ============================================================
//  api/inquiry.php  —  Submit a property inquiry / contact
// ============================================================

ob_start();

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    respond(false, 'Method not allowed');
}

$data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

$name       = trim($data['name']    ?? '');
$email      = trim($data['email']   ?? '');
$mobile     = trim($data['mobile']  ?? '');
$message    = trim($data['message'] ?? '');

$raw_listing_id = $data['listing_id'] ?? null;
$listing_id     = ($raw_listing_id !== null && $raw_listing_id !== '') ? (int)$raw_listing_id : null;

if (!$name)                                        { ob_end_clean(); respond(false, 'Name is required'); }
if (!filter_var($email, FILTER_VALIDATE_EMAIL))    { ob_end_clean(); respond(false, 'Valid email is required'); }
if (!preg_match('/^\d{10}$/', $mobile))            { ob_end_clean(); respond(false, 'Valid 10-digit mobile number required'); }
if (strlen($message) < 10)                         { ob_end_clean(); respond(false, 'Please enter a message (min 10 chars)'); }

$db = getDB();

// Auto-create the inquiries table if it doesn't exist yet
$db->query("
    CREATE TABLE IF NOT EXISTS inquiries (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(160) NOT NULL,
        email      VARCHAR(180) NOT NULL,
        mobile     VARCHAR(15)  NOT NULL,
        message    TEXT         NOT NULL,
        listing_id INT          DEFAULT NULL,
        created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
");

$stmt = $db->prepare(
    'INSERT INTO inquiries (name, email, mobile, message, listing_id) VALUES (?, ?, ?, ?, ?)'
);

if (!$stmt) {
    ob_end_clean();
    respond(false, 'DB prepare failed: ' . $db->error);
}

$stmt->bind_param('sssss', $name, $email, $mobile, $message, $listing_id);

ob_end_clean();

if ($stmt->execute()) {
    respond(true, 'Your inquiry has been sent! We will contact you soon.');
} else {
    respond(false, 'Failed to send inquiry: ' . $stmt->error);
}
?>