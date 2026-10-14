<?php

date_default_timezone_set("Asia/Kolkata");
header("Content-Type: application/json");

// Disable HTML error display so API responses remain pure JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Database connection details
$servername = "localhost";
$username   = "root";
$password   = "Hbl@1234";
$dbname     = "loco_info";

try {
    // Create database connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
        exit;
    }

    // Auto-create initial_time table if it does not exist
    $conn->query("CREATE TABLE IF NOT EXISTS initial_time (
        loco_id VARCHAR(50) NOT NULL,
        section_id VARCHAR(50) NOT NULL,
        initial_time DATETIME NOT NULL,
        PRIMARY KEY (loco_id, section_id)
    )");

    // Get JSON input from the request body
    $data = json_decode(file_get_contents("php://input"), true);

    if (@file_exists(__DIR__)) {
        @file_put_contents(__DIR__ . "/debug_log.txt", "Received Data: " . print_r($data, true) . "\n", FILE_APPEND);
    }

    // Check if required parameters are present
    if (!isset($data["sectionId"], $data["locoId"])) {
        echo json_encode([
            "error" => "Missing required parameters",
            "received" => $data
        ]);
        exit;
    }

    $locoId = trim((string)$data["locoId"]);
    $sectionId = trim((string)$data["sectionId"]);

    if ($locoId !== "" && $sectionId !== "") {
        $checkSql = "SELECT * FROM initial_time WHERE loco_id = ? AND section_id = ?";
        $checkStmt = $conn->prepare($checkSql);
        if ($checkStmt) {
            $checkStmt->bind_param("ss", $locoId, $sectionId);
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
                $insertSql = "INSERT INTO initial_time (loco_id, section_id, initial_time) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE initial_time = initial_time";
                $insertStmt = $conn->prepare($insertSql);
                if ($insertStmt) {
                    $insertStmt->bind_param("sss", $locoId, $sectionId, $currentTime);
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
                } else {
                    echo json_encode(["error" => "Prepare insert failed: " . $conn->error]);
                }
            }
            $checkStmt->close();
        } else {
            echo json_encode(["error" => "Prepare check failed: " . $conn->error]);
        }
    } else {
        echo json_encode([
            "error" => "Missing parameters. Pass loco_id & section_id"
        ]);
    }

    $conn->close();
} catch (Throwable $e) {
    echo json_encode(["error" => "Server exception: " . $e->getMessage()]);
}
?>