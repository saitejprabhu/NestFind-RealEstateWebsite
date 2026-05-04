<?php
// ============================================================
//  api/signup.php  —  Register a new user
// ============================================================
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed');
}

$data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

$first_name = trim($data['first_name'] ?? '');
$last_name  = trim($data['last_name']  ?? '');
$email      = trim($data['email']      ?? '');
$mobile     = trim($data['mobile']     ?? '');
$password   = $data['password']        ?? '';
$confirm_pw = $data['confirm_password'] ?? '';

// ── Validation ──────────────────────────────────────────────
if (!$first_name || !$last_name)         respond(false, 'First and last name are required');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, 'Invalid email address');
if (!preg_match('/^\d{10}$/', $mobile))  respond(false, 'Enter a valid 10-digit mobile number');
if (strlen($password) < 8)              respond(false, 'Password must be at least 8 characters');
if ($password !== $confirm_pw)          respond(false, 'Passwords do not match');

$db = getDB();

// ── Check duplicate email ────────────────────────────────────
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) respond(false, 'An account with this email already exists');
$stmt->close();

// ── Insert ───────────────────────────────────────────────────
$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $db->prepare(
    'INSERT INTO users (first_name, last_name, email, mobile, password) VALUES (?, ?, ?, ?, ?)'
);
$stmt->bind_param('sssss', $first_name, $last_name, $email, $mobile, $hash);

if ($stmt->execute()) {
    respond(true, 'Account created successfully! Redirecting to login…', ['redirect' => 'login.html']);
} else {
    respond(false, 'Registration failed. Please try again.');
}
?>
