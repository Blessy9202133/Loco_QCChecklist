<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

date_default_timezone_set("Asia/Kolkata");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn = new mysqli('localhost', 'root', 'Hbl@1234', 'loco_info');
    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => '❌ DB connection failed']);
        exit;
    }

    $locoID = trim($_POST['loco-id'] ?? '');
    $locoType = trim($_POST['loco-type'] ?? '');
    $brakeType = trim($_POST['brake-type'] ?? '');
    $railwayDivision = trim($_POST['railway-division'] ?? '');
    $shedName = trim($_POST['shed-name'] ?? '');
    $inspectionDate = trim($_POST['inspection-date'] ?? '');

    if (!$locoID || !$locoType || !$brakeType || !$railwayDivision || !$shedName || !$inspectionDate) {
        echo json_encode(['success' => false, 'message' => '❌ All fields are required']);
        exit;
    }

    $currentTime = date("Y-m-d H:i:s");

    $check = $conn->prepare("SELECT 1 FROM loco WHERE Loco_Id = ?");
    $check->bind_param("i", $locoID);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'ℹ️ Loco already exists. Start time preserved.']);
    } else {
        $insert = $conn->prepare("INSERT INTO loco 
            (Loco_Id, Loco_type, Brake_type, Railway_Division, Shed_name, inspection_Date, start_time, completed_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $insert->bind_param("isssssss", $locoID, $locoType, $brakeType, $railwayDivision, $shedName, $inspectionDate, $currentTime, $currentTime);
        if ($insert->execute()) {
            echo json_encode(['success' => true, 'message' => '✅ Loco info saved with start time']);
        } else {
            echo json_encode(['success' => false, 'message' => '❌ Insert failed: ' . $insert->error]);
        }
        $insert->close();
    }

    $check->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => '❌ Only POST allowed']);
}
?>
