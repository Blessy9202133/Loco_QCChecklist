<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log incoming request data for debugging
error_log("📝 Incoming request to deleteImage.php");

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        error_log("📥 Valid POST request received.");

        $data = json_decode(file_get_contents("php://input"), true);
        error_log("📥 JSON Payload: " . print_r($data, true));

        if (!isset($data['loco_id'], $data['s_no'], $data['imgPath'])) {
            error_log("❌ Missing parameters in request.");
            echo json_encode(['success' => false, 'message' => 'Missing parameters']);
            exit;
        }

        // Database connection
        $pdo = new PDO('mysql:host=localhost;dbname=loco_info', 'root', 'Hbl@1234');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        error_log("✅ Database connection established.");

        $locoID = $data['loco_id'];
        $s_no = $data['s_no'];
        $imgPath = $data['imgPath'];

        // Check if the image exists in the database
        $checkStmt = $pdo->prepare("SELECT * FROM images WHERE loco_id = ? AND s_no = ? AND image_path = ?");
        $checkStmt->execute([$locoID, $s_no, $imgPath]);
        $imageRecord = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($imageRecord) {
            error_log("✅ Image record found in database: " . print_r($imageRecord, true));

            // Delete the image record from the database
            $stmt = $pdo->prepare("DELETE FROM images WHERE loco_id = ? AND s_no = ? AND image_path = ?");
            $stmt->execute([$locoID, $s_no, $imgPath]);

            if ($stmt->rowCount() > 0) {
                // Optionally delete the file from the server
                $fullPath = __DIR__ . '/' . $imgPath;
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                    error_log("✅ Image file deleted from server: " . $fullPath);
                } else {
                    error_log("❗ Image file not found on server: " . $fullPath);
                }

                echo json_encode(['success' => true, 'message' => 'Image deleted successfully.']);
            } else {
                error_log("❌ Failed to delete image record from database.");
                echo json_encode(['success' => false, 'message' => 'Failed to delete image record from database.']);
            }
        } else {
            error_log("❌ Image record not found in database for loco_id: $locoID, s_no: $s_no, imgPath: $imgPath");
            echo json_encode(['success' => false, 'message' => 'Image record not found in database.']);
        }
    } else {
        error_log("❌ Invalid request method.");
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    }
} catch (Exception $e) {
    error_log("🔥 Server error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
