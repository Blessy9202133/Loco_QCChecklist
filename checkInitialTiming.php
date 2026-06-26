<?php

date_default_timezone_set("Asia/Kolkata");
header("Content-Type: application/json");

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Database connection details
$servername = "localhost";
$username   = "root";
$password   = "Hbl@1234";
$dbname     = "loco_info";

// Create database connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Get JSON input from the request body
$data = json_decode(file_get_contents("php://input"), true);

// Debugging: Log received data
file_put_contents("debug_log.txt", "Received Data: " . print_r($data, true) . "\n", FILE_APPEND);

// Check if required parameters are present
if (!isset($data["sectionId"],$data["locoId"])) {
    echo json_encode([
        "error" => "Missing required parameters",
        "received" => $data
    ]);
    exit;
}

$locoId=$data["locoId"];
$sectionId = $data["sectionId"]; 

// Debugging: Log received section ID
file_put_contents("debug_log.txt", "Received Section ID: $sectionId\n", FILE_APPEND);



if ($locoId && $sectionId) {

    $checkSql = "SELECT * FROM initial_time WHERE loco_id = ? AND section_id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("is", $locoId, $sectionId);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Exists → return existing row
        echo json_encode([
            "message"      => "✅ Already exists",
            "locoId"      => $row['loco_id'],
            "sectionId"   => $row['section_id'],
            "initial_time" => $row['initial_time']
        ]);
    } else {
        // Not exists → insert new row
        $currentTime=date("Y-m-d H:i:s");
        $insertSql = "INSERT INTO initial_time (loco_id, section_id, initial_time) VALUES (?, ?, ?)";
        $insertStmt = $conn->prepare($insertSql);
        $insertStmt->bind_param("iss",$locoId,$sectionId,$currentTime);

        if ($insertStmt->execute()) {
            echo json_encode([
                "message"      => "✅ Inserted new record",
                "locoId"      => $locoId,
                "sectionId"   => $sectionId,
                "initial_time" => $currentTime
            ]);
        } else {
            echo json_encode(["error" => "Insert failed: " . $conn->error]);
        }

        $insertStmt->close();
    }

    $checkStmt->close();
} else {
    echo json_encode([
        "error" => "Missing parameters. Pass loco_id & section_id"
    ]);
}

$conn->close();
?>