<?php
/**
 * api/listings_admin.php
 * Admin API for user-submitted property listings.
 * Actions: list, approve, reject, detail
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

function out($ok, $msg, $extra = []) {
    echo json_encode(array_merge(['success' => $ok, 'message' => $msg], $extra));
    exit;
}

// DB connection
$db = new mysqli('localhost', 'root', '', 'nestfind');
if ($db->connect_error) out(false, 'DB error: ' . $db->connect_error);
$db->set_charset('utf8mb4');

// Session / admin auth
session_start();
if (empty($_SESSION['admin_id'])) out(false, 'Unauthorized');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ── LIST all submissions (with optional status filter) ────────────
if ($action === 'list') {
    $status = $_GET['status'] ?? 'all';
    if ($status === 'all') {
        $rows = $db->query("SELECT * FROM listings ORDER BY created_at DESC");
    } else {
        $stmt = $db->prepare("SELECT * FROM listings WHERE status=? ORDER BY created_at DESC");
        $stmt->bind_param('s', $status);
        $stmt->execute();
        $rows = $stmt->get_result();
    }
    $listings = [];
    while ($r = $rows->fetch_assoc()) $listings[] = $r;
    out(true, 'ok', ['listings' => $listings]);
}

// ── APPROVE: publish listing as a live property ───────────────────
if ($action === 'approve' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $d  = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $id = intval($d['id'] ?? 0);
    if (!$id) out(false, 'Missing listing id');

    $r = $db->query("SELECT * FROM listings WHERE id=$id")->fetch_assoc();
    if (!$r) out(false, 'Listing not found');

    // Derive property_type for properties table (Sale / Rent)
    $ptype = (stripos($r['listing_type'], 'rent') !== false || stripos($r['listing_type'], 'lease') !== false)
           ? 'Rent' : 'Sale';

    // Build description
    $desc  = $r['description'] ?? '';
    $owner = "Owner: {$r['owner_name']} | Phone: {$r['owner_phone']}";
    $desc  = $desc ? "$desc\n\n$owner" : $owner;

    // Use first photo as main image if available
    $photos    = json_decode($r['photos'] ?? '[]', true) ?: [];
    $mainImage = $photos[0] ?? null;
    $extraJson = count($photos) > 1 ? json_encode(array_slice($photos, 1)) : null;

    $area = $r['total_area'] ? $r['total_area'] . ' sqft' : null;

    $stmt = $db->prepare("
        INSERT INTO properties
          (title, price, location, description, property_type,
           image, extra_images, bedrooms, area, furnishing, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    ");
    $stmt->bind_param('sdssssssss',
        $r['title'], $r['price'], $r['address'], $desc, $ptype,
        $mainImage, $extraJson, $r['bhk'], $area, $r['furnishing']
    );

    if (!$stmt->execute()) out(false, 'Failed to publish: ' . $stmt->error);

    // Mark listing as approved
    $db->query("UPDATE listings SET status='approved' WHERE id=$id");
    out(true, 'Property approved and published successfully!');
}

// ── REJECT listing ────────────────────────────────────────────────
if ($action === 'reject' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $d  = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $id = intval($d['id'] ?? 0);
    if (!$id) out(false, 'Missing listing id');
    $db->query("UPDATE listings SET status='rejected' WHERE id=$id");
    out(true, 'Listing rejected.');
}

out(false, 'Unknown action');
