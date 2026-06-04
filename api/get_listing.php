<?php
error_reporting(0);
ini_set('display_errors', 0);
while (ob_get_level()) ob_end_clean();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

function out($ok, $msg, $extra = []) {
    echo json_encode(array_merge(['success' => $ok, 'message' => $msg], $extra));
    exit;
}

$db = new mysqli('localhost', 'root', '', 'nestfind');
if ($db->connect_error) out(false, 'DB Error: ' . $db->connect_error);
$db->set_charset('utf8mb4');

$result = $db->query(
    "SELECT id, title, property_type, listing_type, price,
            address, city, bhk, total_area, furnishing, status, created_at
     FROM listings
     WHERE status IN ('approved', 'pending')
     ORDER BY created_at DESC"
);

if (!$result) out(false, 'Query error: ' . $db->error);

$listings = [];
while ($row = $result->fetch_assoc()) {
    $listings[] = $row;
}

out(true, 'OK', ['listings' => $listings]);
?>