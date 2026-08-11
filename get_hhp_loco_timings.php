<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$locoID = trim($_GET['loco_id'] ?? '');
if (!$locoID) {
    echo json_encode(["success" => false, "message" => "❌ Missing loco_id"]);
    exit;
}

$databases = ["hhp_loco_info", "loco_info"];
$found = false;

foreach ($databases as $dbname) {
    $conn = new mysqli("localhost", "root", "Hbl@1234", $dbname);
    if ($conn->connect_error) continue;

    $stmt = $conn->prepare("SELECT start_time, completed_time FROM loco WHERE Loco_Id = ?");
    $stmt->bind_param("s", $locoID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $found = true;
        echo json_encode([
            "success" => true,
            "start_time" => $row["start_time"],
            "completed_time" => $row["completed_time"]
        ]);
        $stmt->close();
        $conn->close();
        break;
    }
    $stmt->close();
    $conn->close();
}

if (!$found) {
    echo json_encode(["success" => false, "message" => "❌ Loco ID not found"]);
}
?>
