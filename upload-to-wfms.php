<?php
session_start();
header('Content-Type: application/json');

// Ensure user is logged in
if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access. Please log in.']);
    exit;
}

$reportId = $_POST['reportId'] ?? null;
$activityId = $_POST['activityId'] ?? null;
$docId = $_POST['docId'] ?? null;
$wfmsToken = $_POST['wfms_token'] ?? '';

if (!$reportId || !$activityId || !$docId || !$wfmsToken) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters (reportId, activityId, docId, or token).']);
    exit;
}

// Loco WFMS Base URL (Port 5105)
$wfmsBaseUrl = "https://eg.hbl.in:5105/api"; 

try {
    // Database connection
    $pdo = new PDO("mysql:host=localhost;dbname=loco_info", 'root', 'Hbl@1234');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Get Report Details
    $stmt = $pdo->prepare("SELECT file_name, last_uploaded_hash FROM report WHERE id = :id");
    $stmt->execute(['id' => $reportId]);
    $report = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$report) {
        echo json_encode(['success' => false, 'message' => 'Report not found in local database.']);
        exit;
    }

    $filePath = 'uploads/reports/' . $report['file_name'];
    if (!file_exists($filePath)) {
        echo json_encode(['success' => false, 'message' => 'Report file found in DB but missing on disk.']);
        exit;
    }

    // 2. Prevent duplicate uploads by comparing SHA-256 hash
    $localHash = hash_file('sha256', $filePath);
    if ($report['last_uploaded_hash'] === $localHash) {
        echo json_encode(['success' => true, 'message' => 'Report is already up-to-date in Loco WFMS.']);
        exit;
    }

    // 3. PUSH FILE (PDF) to the specific activity document slot in Loco WFMS
    $fields = [
        "activityId" => $activityId,
        "docId" => $docId
    ];

    $uploadRes = uploadToLocoWFMS("$wfmsBaseUrl/activity/upload", $fields, $filePath, $wfmsToken);

    if ($uploadRes && isset($uploadRes['status']) && $uploadRes['status']) {
        // 4. Update local record with the new hash
        $updateStmt = $pdo->prepare("UPDATE report SET last_uploaded_hash = :hash WHERE id = :id");
        $updateStmt->execute(['hash' => $localHash, 'id' => $reportId]);
        
        echo json_encode(['success' => true, 'message' => 'Report pushed to Loco WFMS successfully!']);
    } else {
        $errorMsg = $uploadRes['message'] ?? 'Loco WFMS rejected the upload. Ensure you have permissions for this activity.';
        echo json_encode(['success' => false, 'message' => "Loco WFMS Error: $errorMsg"]);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

/**
 * Helper: Upload file to Loco WFMS using User Token
 */
function uploadToLocoWFMS($url, $fields, $filePath, $token) {
    $ch = curl_init($url);
    $fields['file'] = new CURLFile(realpath($filePath));

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'x-app-module: WFMS2',
        'x-app-client: Wizard'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return json_decode($response, true);
}
?>
