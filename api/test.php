<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Test 1: basic output
$result = ['step' => 'start'];

// Test 2: DB connect
$db = new mysqli('localhost', 'root', '', 'nestfind');
if ($db->connect_error) {
    echo json_encode(['success' => false, 'error' => 'DB FAILED: ' . $db->connect_error]);
    exit;
}

// Test 3: check listings table exists
$r = $db->query("SHOW TABLES LIKE 'listings'");
$tableExists = $r && $r->num_rows > 0;

// Test 4: check columns
$cols = [];
if ($tableExists) {
    $r2 = $db->query("DESCRIBE listings");
    while ($row = $r2->fetch_assoc()) $cols[] = $row['Field'];
}

echo json_encode([
    'success' => true,
    'db_connected' => true,
    'table_exists' => $tableExists,
    'columns' => $cols
]);