<?php
/**
 * api/properties.php
 * Full CRUD API for admin-managed property listings.
 *
 * GET    ?action=list&type=Sale|Rent|featured|all  → array of properties
 * POST   ?action=add        (multipart) → add new property with image upload
 * POST   ?action=update     (multipart) → update existing property
 * POST   ?action=delete     (JSON)      → soft-delete (set status inactive)
 * GET    ?action=stats                  → revenue & counts for dashboard
 */

session_start();
require_once 'config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ── Helper: check admin session for write operations ────────────────
function requireAdmin(): void {
    if (!isset($_SESSION['admin_id'])) {
        respond(false, 'Unauthorised. Please log in as admin.');
    }
}

// ── Helper: handle image upload & return saved path ─────────────────
/**
 * Handle multiple image uploads for extra_images field.
 * Returns JSON-encoded array of saved paths, or empty string if no files.
 */
function handleMultipleImageUploads(string $fieldName): string {
    if (!isset($_FILES[$fieldName])) return '';

    $files   = $_FILES[$fieldName];
    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $saved   = [];

    $uploadDir = __DIR__ . '/../uploads/properties/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    // $_FILES['extra_images']['name'] is an array when multiple files uploaded
    $count = is_array($files['name']) ? count($files['name']) : 1;

    for ($i = 0; $i < $count; $i++) {
        $error    = is_array($files['error'])    ? $files['error'][$i]    : $files['error'];
        $tmpName  = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
        $origName = is_array($files['name'])     ? $files['name'][$i]     : $files['name'];
        $size     = is_array($files['size'])     ? $files['size'][$i]     : $files['size'];

        if ($error !== UPLOAD_ERR_OK) continue;
        if ($size > 5 * 1024 * 1024) continue;  // skip oversized silently

        $mimeType = mime_content_type($tmpName);
        if (!in_array($mimeType, $allowed, true)) continue;

        $ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        $filename = 'extra_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $dest     = $uploadDir . $filename;

        if (move_uploaded_file($tmpName, $dest)) {
            $saved[] = 'uploads/properties/' . $filename;
        }
    }

    return count($saved) ? json_encode($saved) : '';
}

function handleImageUpload(string $fieldName): ?string {
    if (!isset($_FILES[$fieldName]) || $_FILES[$fieldName]['error'] !== UPLOAD_ERR_OK) {
        return null; // No file uploaded or error
    }

    $file      = $_FILES[$fieldName];
    $allowed   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $mimeType  = mime_content_type($file['tmp_name']);

    if (!in_array($mimeType, $allowed, true)) {
        respond(false, 'Invalid image type. Only JPEG, PNG, WebP, GIF allowed.');
    }

    if ($file['size'] > 5 * 1024 * 1024) {
        respond(false, 'Image too large. Maximum 5 MB allowed.');
    }

    // Build unique filename to avoid collisions
    $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'prop_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . strtolower($ext);

    // Save relative to project root so HTML src works
    $uploadDir = __DIR__ . '/../uploads/properties/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $destination = $uploadDir . $filename;
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        respond(false, 'Failed to save uploaded image.');
    }

    return 'uploads/properties/' . $filename; // Relative path stored in DB
}

$db = getDB();

// ====================================================================
//  GET: list properties
// ====================================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'list') {
    $type = $_GET['type'] ?? 'all';   // Sale | Rent | featured | all

    $where = "WHERE p.status = 'active'";
    $params = [];
    $types  = '';

    if ($type === 'Sale') {
        $where  .= " AND p.property_type = 'Sale'";
    } elseif ($type === 'Rent') {
        $where  .= " AND p.property_type = 'Rent'";
    } elseif ($type === 'featured') {
        $where  .= " AND p.is_featured = 1";
    }
    // 'all' → no extra filter

    $sql  = "SELECT * FROM properties $where ORDER BY p.created_at DESC";
    // Alias needed for WHERE to work with 'p.'
    $sql  = "SELECT * FROM properties p $where ORDER BY p.created_at DESC";
    $result = $db->query($sql);

    $properties = [];
    while ($row = $result->fetch_assoc()) {
        $properties[] = $row;
    }

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'properties' => $properties]);
    exit;
}

// ====================================================================
//  GET: dashboard stats (counts + revenue)
// ====================================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'stats') {
    requireAdmin();

    // Total active properties
    $total      = $db->query("SELECT COUNT(*) AS c FROM properties WHERE status='active'")->fetch_assoc()['c'];
    $saleCount  = $db->query("SELECT COUNT(*) AS c FROM properties WHERE status='active' AND property_type='Sale'")->fetch_assoc()['c'];
    $rentCount  = $db->query("SELECT COUNT(*) AS c FROM properties WHERE status='active' AND property_type='Rent'")->fetch_assoc()['c'];
    $featured   = $db->query("SELECT COUNT(*) AS c FROM properties WHERE status='active' AND is_featured=1")->fetch_assoc()['c'];

    // Revenue: sum of Sale prices (potential) + 12× monthly rent (annual)
    $saleRev  = $db->query("SELECT COALESCE(SUM(price),0) AS r FROM properties WHERE status='active' AND property_type='Sale'")->fetch_assoc()['r'];
    $rentRev  = $db->query("SELECT COALESCE(SUM(price)*12,0) AS r FROM properties WHERE status='active' AND property_type='Rent'")->fetch_assoc()['r'];

    // Inquiries count
    $inquiries = $db->query("SELECT COUNT(*) AS c FROM inquiries")->fetch_assoc()['c'];

    // Completed payments count
    $payments  = $db->query("SELECT COUNT(*) AS c FROM payments")->fetch_assoc()['c'];

    // Registered users count
    $users = $db->query("SELECT COUNT(*) AS c FROM users")->fetch_assoc()['c'];

    // Distinct cities covered
    $cities = $db->query("SELECT COUNT(DISTINCT location) AS c FROM properties WHERE status='active'")->fetch_assoc()['c'];

    // Monthly property additions (last 6 months)
    $monthly = [];
    for ($i = 5; $i >= 0; $i--) {
        $label = date('M Y', strtotime("-$i months"));
        $y     = date('Y', strtotime("-$i months"));
        $m     = date('m', strtotime("-$i months"));
        $cnt   = $db->query("SELECT COUNT(*) AS c FROM properties WHERE YEAR(created_at)=$y AND MONTH(created_at)=$m")->fetch_assoc()['c'];
        $monthly[] = ['month' => $label, 'count' => (int)$cnt];
    }

    header('Content-Type: application/json');
    echo json_encode([
        'success'    => true,
        'total'      => (int)$total,
        'saleCount'  => (int)$saleCount,
        'rentCount'  => (int)$rentCount,
        'featured'   => (int)$featured,
        'saleRevenue'=> (float)$saleRev,
        'rentRevenue'=> (float)$rentRev,
        'inquiries'  => (int)$inquiries,
        'payments'   => (int)$payments,
        'users'      => (int)$users,
        'cities'     => (int)$cities,
        'monthly'    => $monthly,
    ]);
    exit;
}

// ====================================================================
//  POST: add property
// ====================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'add') {
    requireAdmin();

    // Validate required fields
    $title    = trim($_POST['title']    ?? '');
    $price    = floatval($_POST['price'] ?? 0);
    $location = trim($_POST['location'] ?? '');
    $type     = trim($_POST['property_type'] ?? '');

    if (empty($title) || $price <= 0 || empty($location) || !in_array($type, ['Sale','Rent'])) {
        respond(false, 'Title, valid price, location, and property type (Sale/Rent) are required.');
    }

    $description = trim($_POST['description'] ?? '');
    $bedrooms    = trim($_POST['bedrooms']    ?? '');
    $bathrooms   = intval($_POST['bathrooms'] ?? 0) ?: null;
    $area        = trim($_POST['area']        ?? '');
    $furnishing  = trim($_POST['furnishing']  ?? '');
    $isFeatured  = isset($_POST['is_featured']) ? 1 : 0;
    $amenities   = trim($_POST['amenities']   ?? '');
    $extraImages = trim($_POST['extra_images'] ?? '');
    $mapEmbed    = trim($_POST['map_embed']   ?? '');

    // Handle main image upload
    $imagePath = handleImageUpload('image');

    // Handle extra images upload (multiple files) — overrides any existing extra_images POST value
    $uploadedExtras = handleMultipleImageUploads('extra_images_files');
    if ($uploadedExtras !== '') {
        $extraImages = $uploadedExtras;
    }

    $stmt = $db->prepare(
        "INSERT INTO properties (title, price, location, description, property_type, is_featured, image, bedrooms, bathrooms, area, furnishing, amenities, extra_images, map_embed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param('sdsssississsss',
        $title, $price, $location, $description, $type, $isFeatured,
        $imagePath, $bedrooms, $bathrooms, $area, $furnishing, $amenities, $extraImages, $mapEmbed
    );

    if ($stmt->execute()) {
        $newId = $db->insert_id;
        $stmt->close();
        respond(true, 'Property added successfully.', ['id' => $newId]);
    } else {
        $stmt->close();
        respond(false, 'Database error: ' . $db->error);
    }
}

// ====================================================================
//  POST: update property
// ====================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update') {
    requireAdmin();

    $id = intval($_POST['id'] ?? 0);
    if ($id <= 0) respond(false, 'Invalid property ID.');

    // Fetch existing row to preserve image if no new one uploaded
    $existing = $db->query("SELECT * FROM properties WHERE id=$id")->fetch_assoc();
    if (!$existing) respond(false, 'Property not found.');

    $title       = trim($_POST['title']         ?? $existing['title']);
    $price       = floatval($_POST['price']     ?? $existing['price']);
    $location    = trim($_POST['location']      ?? $existing['location']);
    $type        = trim($_POST['property_type'] ?? $existing['property_type']);
    $description = trim($_POST['description']   ?? $existing['description']);
    $bedrooms    = trim($_POST['bedrooms']      ?? $existing['bedrooms']);
    $bathrooms   = intval($_POST['bathrooms']   ?? $existing['bathrooms']) ?: null;
    $area        = trim($_POST['area']          ?? $existing['area']);
    $furnishing  = trim($_POST['furnishing']    ?? $existing['furnishing']);
    $isFeatured  = isset($_POST['is_featured']) ? 1 : 0;
    $status      = in_array($_POST['status'] ?? '', ['active','inactive']) ? $_POST['status'] : $existing['status'];
    $amenities   = array_key_exists('amenities', $_POST)   ? trim($_POST['amenities'])    : ($existing['amenities'] ?? '');
    $extraImages = array_key_exists('extra_images', $_POST) ? trim($_POST['extra_images']) : ($existing['extra_images'] ?? '');
    $mapEmbed    = array_key_exists('map_embed', $_POST)   ? trim($_POST['map_embed'])    : ($existing['map_embed'] ?? '');

    // Only update main image if a new one was uploaded
    $imagePath = handleImageUpload('image') ?? $existing['image'];

    // Handle extra images: new uploads override existing ones
    $uploadedExtras = handleMultipleImageUploads('extra_images_files');
    if ($uploadedExtras !== '') {
        $extraImages = $uploadedExtras;
    }

    $stmt = $db->prepare(
        "UPDATE properties SET title=?, price=?, location=?, description=?, property_type=?, is_featured=?, image=?, bedrooms=?, bathrooms=?, area=?, furnishing=?, status=?, amenities=?, extra_images=?, map_embed=?
         WHERE id=?"
    );
    $stmt->bind_param('sdsssisississssi',
        $title, $price, $location, $description, $type, $isFeatured,
        $imagePath, $bedrooms, $bathrooms, $area, $furnishing, $status,
        $amenities, $extraImages, $mapEmbed, $id
    );

    if ($stmt->execute()) {
        $stmt->close();
        respond(true, 'Property updated successfully.');
    } else {
        $stmt->close();
        respond(false, 'Database error: ' . $db->error);
    }
}

// ====================================================================
//  POST: delete property (set status=inactive)
// ====================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    requireAdmin();

    $data = json_decode(file_get_contents('php://input'), true);
    $id   = intval($data['id'] ?? 0);
    if ($id <= 0) respond(false, 'Invalid property ID.');

    $stmt = $db->prepare("UPDATE properties SET status='inactive' WHERE id=?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        $stmt->close();
        respond(true, 'Property deleted successfully.');
    } else {
        $stmt->close();
        respond(false, 'Database error: ' . $db->error);
    }
}

// Fallback for unmatched routes
respond(false, 'Invalid request.');
?>
