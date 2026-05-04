<?php
// ============================================================
//  api/config.php  —  Database connection (XAMPP defaults)
// ============================================================

define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // XAMPP default user
define('DB_PASS', '');            // XAMPP default password (empty)
define('DB_NAME', 'nestfind');

function getDB(): mysqli {
    static $conn = null;
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
            exit;
        }
        $conn->set_charset('utf8mb4');
    }
    return $conn;
}

// JSON response helper
function respond(bool $success, string $message, array $data = []): void {
    header('Content-Type: application/json');
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $data));
    exit;
}

// Allow AJAX from same origin
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
?>
