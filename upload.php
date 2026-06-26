<?php
// Enable Error Reporting for Debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/upload_errors.log');

// Set header for JSON response
header('Content-Type: application/json');

// Create uploads folder if it doesn't exist
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    error_log("🚨 Failed to create upload directory.");
    echo json_encode(["success" => false, "message" => "Failed to create upload directory."]);
    exit;
}

$uploadedFiles = [];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

if (isset($_FILES['images']) && is_array($_FILES['images']['name'])) {
    foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
        $originalName = basename($_FILES['images']['name'][$key]);
        $error = $_FILES['images']['error'][$key];

        if ($error !== UPLOAD_ERR_OK) {
            error_log("🚨 Upload error for $originalName: Code $error");
            continue; // Skip to next file
        }

        // Check MIME type
        $fileType = mime_content_type($tmpName);
        if (!in_array($fileType, $allowedTypes)) {
            error_log("🚨 Invalid file type for $originalName: $fileType");
            continue;
        }

        // Generate unique file name
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $filename = uniqid('img_', true) . '.' . $extension;
        $uploadPath = $uploadDir . $filename;

        if (move_uploaded_file($tmpName, $uploadPath)) {
            // Return relative path for frontend use
            $uploadedFiles[] = 'uploads/' . $filename;
        } else {
            error_log("🚨 Failed to move uploaded file: $originalName");
        }
    }

    if (!empty($uploadedFiles)) {
        echo json_encode(["success" => true, "file_paths" => $uploadedFiles]);
    } else {
        echo json_encode(["success" => false, "message" => "No valid images uploaded."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "No files received."]);
}
?>
