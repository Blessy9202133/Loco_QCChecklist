<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

date_default_timezone_set("Asia/Kolkata");
$currentTime = date("Y-m-d H:i:s");

$locoID = trim($_POST['loco_id'] ?? '');
if (!$locoID) {
    echo json_encode(["success" => false, "message" => "❌ Missing loco_id"]);
    exit;
}

$databases = ["hhp_loco_info", "loco_info"];
$updated = false;

foreach ($databases as $dbname) {
    $conn = new mysqli("localhost", "root", "Hbl@1234", $dbname);
    if ($conn->connect_error) continue;

    $update = $conn->prepare("UPDATE loco SET completed_time = ? WHERE Loco_Id = ?");
    $update->bind_param("ss", $currentTime, $locoID);
    if ($update->execute() && $update->affected_rows > 0) {
        $updated = true;
        $update->close();
        $conn->close();
        break;
    }
    $update->close();
    $conn->close();
}

echo json_encode([
    "success" => true,
    "message" => "✅ Completed time updated",
    "completed_time" => $currentTime
]);
?>
