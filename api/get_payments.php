<?php
/**
 * api/get_payments.php
 * Returns all completed payment records for the admin dashboard.
 *
 * GET  ?action=list          → all payments, newest first
 * GET  ?action=stats         → total revenue, count, this-month revenue
 */

session_start();
require_once 'config.php';

// Admin-only endpoint
if (!isset($_SESSION['admin_id'])) {
    respond(false, 'Unauthorised. Please log in as admin.');
}

$action = $_GET['action'] ?? 'list';
$db     = getDB();

if ($action === 'list') {
    $result   = $db->query("SELECT * FROM payments ORDER BY booked_at DESC");
    $payments = [];
    while ($row = $result->fetch_assoc()) {
        $payments[] = $row;
    }
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'payments' => $payments]);
    exit;
}

if ($action === 'stats') {
    $total    = $db->query("SELECT COUNT(*) AS c FROM payments")->fetch_assoc()['c'];
    $saleRev  = $db->query("SELECT COUNT(*) AS c FROM payments WHERE prop_type LIKE '%Sale%'")->fetch_assoc()['c'];
    $rentRev  = $db->query("SELECT COUNT(*) AS c FROM payments WHERE prop_type LIKE '%Rent%'")->fetch_assoc()['c'];
    $thisMonth= $db->query("SELECT COUNT(*) AS c FROM payments WHERE MONTH(booked_at)=MONTH(NOW()) AND YEAR(booked_at)=YEAR(NOW())")->fetch_assoc()['c'];

    header('Content-Type: application/json');
    echo json_encode([
        'success'    => true,
        'total'      => (int)$total,
        'saleCount'  => (int)$saleRev,
        'rentCount'  => (int)$rentRev,
        'thisMonth'  => (int)$thisMonth,
    ]);
    exit;
}

respond(false, 'Invalid action.');
?>
