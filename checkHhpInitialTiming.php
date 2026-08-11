<?php

date_default_timezone_set("Asia/Kolkata");
header("Content-Type: application/json");

ini_set('display_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username   = "root";
$password   = "Hbl@1234";
$dbname     = "hhp_loco_info";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["sectionId"], $data["locoId"])) {
    echo json_encode([
        "error" => "Missing required parameters",
        "received" => $data
    ]);
    exit;
}

$locoId = $data["locoId"];
$sectionId = $data["sectionId"]; 

if ($locoId && $sectionId) {
    $checkSql = "SELECT * FROM initial_time WHERE loco_id = ? AND section_id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("is", $locoId, $sectionId);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            "message"      => "✅ Already exists",
            "locoId"       => $row['loco_id'],
            "sectionId"    => $row['section_id'],
            "initial_time" => $row['initial_time']
        ]);
    } else {
        $currentTime = date("Y-m-d H:i:s");
        $insertSql = "INSERT INTO initial_time (loco_id, section_id, initial_time) VALUES (?, ?, ?)";
        $insertStmt = $conn->prepare($insertSql);
        $insertStmt->bind_param("iss", $locoId, $sectionId, $currentTime);

        if ($insertStmt->execute()) {
            echo json_encode([
                "message"      => "✅ Inserted new record",
                "locoId"       => $locoId,
                "sectionId"    => $sectionId,
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
