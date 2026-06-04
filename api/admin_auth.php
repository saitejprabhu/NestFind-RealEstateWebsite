<?php
/**
 * api/admin_auth.php
 * Handles admin login and logout via PHP sessions.
 *
 * POST /api/admin_auth.php?action=login  → { success, message }
 * POST /api/admin_auth.php?action=logout → { success, message }
 * GET  /api/admin_auth.php?action=check  → { success, loggedIn }
 *
 * Login strategy (in order):
 *  1. bcrypt password_verify() — for hashed passwords in the DB
 *  2. Plain-text match — fallback for easy first-time setup
 *     (allows admin/admin123 or admin/admin to work immediately)
 */

session_start();
require_once 'config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

if ($action === 'login') {

    // Read JSON body (sent by the fetch/jQuery AJAX call)
    $data     = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $password = trim($data['password'] ?? '');

    if (empty($username) || empty($password)) {
        respond(false, 'Username and password are required.');
    }

    $db   = getDB();
    $stmt = $db->prepare(
        "SELECT id, username, email, password FROM admins WHERE username = ? OR email = ? LIMIT 1"
    );
    $stmt->bind_param('ss', $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $admin  = $result->fetch_assoc();
    $stmt->close();

    if (!$admin) {
        respond(false, 'Invalid credentials. Please try again.');
    }

    $storedHash = $admin['password'];
    $authenticated = false;

    // ── Strategy 1: bcrypt hash (production passwords) ─────────
    // password_verify() handles both $2y$ (PHP) and $2b$ (Python/other) prefixes
    if (password_verify($password, $storedHash)) {
        $authenticated = true;
    }

    // ── Strategy 2: plain-text fallback (first-time setup) ─────
    // Allows the default 'admin123' row to work even if the SQL hash
    // was generated on a different PHP version or bcrypt variant.
    // Once an admin changes their password to a proper hash this won't match.
    if (!$authenticated && $storedHash === $password) {
        $authenticated = true;
    }

    // ── Strategy 3: rehash plain-text on the fly ───────────────
    // If stored value looks like plain text (no $2y/$2b prefix),
    // compare directly AND immediately upgrade to bcrypt in the DB.
    if (!$authenticated && strpos($storedHash, '$2') !== 0) {
        if ($storedHash === $password) {
            $authenticated = true;
            // Upgrade the plain-text password to bcrypt silently
            $newHash = password_hash($password, PASSWORD_BCRYPT);
            $upd = $db->prepare("UPDATE admins SET password = ? WHERE id = ?");
            $upd->bind_param('si', $newHash, $admin['id']);
            $upd->execute();
            $upd->close();
        }
    }

    if ($authenticated) {
        $_SESSION['admin_id']   = $admin['id'];
        $_SESSION['admin_user'] = $admin['username'];
        respond(true, 'Login successful.', [
            'admin' => ['id' => $admin['id'], 'username' => $admin['username']]
        ]);
    } else {
        respond(false, 'Invalid credentials. Please try again.');
    }

} elseif ($action === 'logout') {

    session_unset();
    session_destroy();
    respond(true, 'Logged out successfully.');

} elseif ($action === 'check') {

    header('Content-Type: application/json');
    echo json_encode([
        'success'  => true,
        'loggedIn' => isset($_SESSION['admin_id']),
        'admin'    => isset($_SESSION['admin_id'])
                        ? ['username' => $_SESSION['admin_user']]
                        : null,
    ]);
    exit;

} else {
    respond(false, 'Invalid action.');
}
?>
