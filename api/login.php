<?php
// ============================================================
//  api/login.php  —  Authenticate user
// ============================================================
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed');
}

$data       = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$identifier = trim($data['identifier'] ?? '');   // email or mobile
$password   = $data['password'] ?? '';

if (!$identifier) respond(false, 'Email or mobile number is required');
if (!$password)   respond(false, 'Password is required');

$db = getDB();

// ── Fetch user by email OR mobile ────────────────────────────
$stmt = $db->prepare('SELECT id, first_name, last_name, email, password FROM users WHERE email = ? OR mobile = ? LIMIT 1');
$stmt->bind_param('ss', $identifier, $identifier);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, $user['password'])) {
    respond(false, 'Invalid credentials. Please check your email/mobile and password.');
}

// ── Success: start PHP session ───────────────────────────────
session_start();
$_SESSION['user_id']   = $user['id'];
$_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
$_SESSION['user_email']= $user['email'];

respond(true, 'Welcome back, ' . $user['first_name'] . '!', [
    'redirect'  => 'index.html',
    'user_name' => $user['first_name'] . ' ' . $user['last_name'],
]);
?>
