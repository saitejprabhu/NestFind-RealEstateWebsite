<?php
// ============================================================
//  api/payment.php  —  Save payment record
// ============================================================
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed');
}

$data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

// ── Fields ───────────────────────────────────────────────────
$full_name      = trim($data['full_name']      ?? '');
$mobile         = trim($data['mobile']         ?? '');
$email          = trim($data['email']          ?? '');
$pan            = strtoupper(trim($data['pan'] ?? ''));
$pay_method     = trim($data['pay_method']     ?? '');   // upi / card
$upi_app        = trim($data['upi_app']        ?? '');   // gpay / phonepe / paytm / bhim
$upi_id         = trim($data['upi_id']         ?? '');
$card_last4     = trim($data['card_last4']     ?? '');
$amount         = floatval($data['amount']     ?? 0);
$listing_id     = isset($data['listing_id'])   ? (int)$data['listing_id'] : null;

// ── Validation ───────────────────────────────────────────────
if (!$full_name)                                        respond(false, 'Full name is required');
if (!preg_match('/^\d{10}$/', $mobile))                 respond(false, 'Valid 10-digit mobile required');
if (!filter_var($email, FILTER_VALIDATE_EMAIL))         respond(false, 'Valid email is required');
if (!preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]$/', $pan))   respond(false, 'Enter a valid PAN number (e.g. ABCDE1234F)');
if (!in_array($pay_method, ['upi', 'card']))            respond(false, 'Invalid payment method');
if ($amount <= 0)                                       respond(false, 'Invalid payment amount');

$db = getDB();
$stmt = $db->prepare(
    'INSERT INTO payments
     (full_name, mobile, email, pan, pay_method, upi_app, upi_id, card_last4, amount, listing_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$status = 'success';
$stmt->bind_param(
    'ssssssssdis',
    $full_name, $mobile, $email, $pan,
    $pay_method, $upi_app, $upi_id, $card_last4,
    $amount, $listing_id, $status
);

if ($stmt->execute()) {
    respond(true, 'Payment recorded successfully!', [
        'payment_id' => $db->insert_id,
        'redirect'   => 'confirmation.html'
    ]);
} else {
    respond(false, 'Failed to record payment. Please try again.');
}
?>
