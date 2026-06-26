<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "Hbl@1234", "loco_info");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "❌ DB connection failed"]);
    exit;
}

$locoID = trim($_GET['loco_id'] ?? '');
if (!$locoID) {
    echo json_encode(["success" => false, "message" => "❌ Missing loco_id"]);
    exit;
}

$sql = "SELECT start_time, completed_time FROM loco WHERE Loco_Id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $locoID);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        "success" => true,
        "start_time" => $row["start_time"],
        "completed_time" => $row["completed_time"]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "❌ Loco ID not found"]);
}

$stmt->close();
$conn->close();
?>
