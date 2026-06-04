<?php
/**
 * api/save_payment.php
 * Called by payment.html (via fetch) after user clicks Pay.
 * Inserts a completed payment record into the `payments` table.
 * No admin session required — payments are made by regular users/guests.
 *
 * Method : POST
 * Body   : JSON with all payment + property + buyer details
 * Returns: { success, message, booking_id }
 */

// No session required — public endpoint (guests can pay)
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.');
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    respond(false, 'No data received.');
}

// ── Extract & sanitise all fields ───────────────────────────────
$bookingId    = trim($data['bookingId']    ?? '');
$txnId        = trim($data['txnId']        ?? '');

$propTitle    = trim($data['propTitle']    ?? '');
$propLoc      = trim($data['propLoc']      ?? '');
$propType     = trim($data['propType']     ?? '');
$propImage    = trim($data['propImage']    ?? '');

$priceBase    = trim($data['priceBase']    ?? '');
$priceReg     = trim($data['priceReg']     ?? '');
$priceStamp   = trim($data['priceStamp']   ?? '');
$priceService = trim($data['priceService'] ?? '');
$priceTotal   = trim($data['priceTotal']   ?? '');

$labelReg     = trim($data['labelReg']     ?? 'Registration Charges');
$labelStamp   = trim($data['labelStamp']   ?? 'Stamp Duty (1.5%)');
$labelService = trim($data['labelService'] ?? 'NestFind Service Fee');

$buyerName    = trim($data['buyerName']    ?? '');
$buyerMobile  = trim($data['buyerMobile']  ?? '');
$buyerEmail   = trim($data['buyerEmail']   ?? '');
$buyerPan     = strtoupper(trim($data['buyerPan'] ?? ''));
$payMethod    = trim($data['payMethod']    ?? '');

// ── Server-side validation ───────────────────────────────────────
if (!$bookingId || !$txnId || !$buyerName || !$buyerEmail || !$buyerMobile || !$buyerPan) {
    respond(false, 'Missing required fields.');
}

if (!preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]$/', $buyerPan)) {
    respond(false, 'Invalid PAN number format.');
}

// ── Insert into payments table ───────────────────────────────────
$db   = getDB();
$stmt = $db->prepare("
    INSERT INTO payments
      (booking_id, txn_id,
       prop_title, prop_location, prop_type, prop_image,
       price_base, price_reg, price_stamp, price_service, price_total,
       label_reg, label_stamp, label_service,
       buyer_name, buyer_mobile, buyer_email, buyer_pan,
       pay_method, pay_status)
    VALUES
      (?, ?,
       ?, ?, ?, ?,
       ?, ?, ?, ?, ?,
       ?, ?, ?,
       ?, ?, ?, ?,
       ?, 'completed')
");

// 19 placeholders → 19 'sss...' chars  ← was the bug (had 18 before)
$stmt->bind_param(
    'sssssssssssssssssss',
    $bookingId,   $txnId,
    $propTitle,   $propLoc,    $propType,    $propImage,
    $priceBase,   $priceReg,   $priceStamp,  $priceService, $priceTotal,
    $labelReg,    $labelStamp, $labelService,
    $buyerName,   $buyerMobile, $buyerEmail, $buyerPan,
    $payMethod
);

if ($stmt->execute()) {
    $stmt->close();
    respond(true, 'Payment recorded successfully.', ['booking_id' => $bookingId]);
} else {
    if ($db->errno === 1062) {
        // Duplicate booking_id — user double-clicked Pay
        $stmt->close();
        respond(true, 'Payment already recorded.', ['booking_id' => $bookingId]);
    }
    $err = $db->error;
    $stmt->close();
    respond(false, 'Database error: ' . $err);
}
?>
