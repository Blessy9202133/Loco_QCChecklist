<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

date_default_timezone_set("Asia/Kolkata");
$currentTime = date("Y-m-d H:i:s");

$conn = new mysqli("localhost", "root", "Hbl@1234", "loco_info");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "❌ DB connection failed"]);
    exit;
}

$locoID = trim($_POST['loco_id'] ?? '');
if (!$locoID) {
    echo json_encode(["success" => false, "message" => "❌ Missing loco_id"]);
    exit;
}

$update = $conn->prepare("UPDATE loco SET completed_time = ? WHERE Loco_Id = ?");
$update->bind_param("si", $currentTime, $locoID);

if ($update->execute()) {
    echo json_encode(["success" => true, "message" => "✅ Completed time updated"]);
} else {
    echo json_encode(["success" => false, "message" => "❌ Update failed"]);
}

$update->close();
$conn->close();
?>
