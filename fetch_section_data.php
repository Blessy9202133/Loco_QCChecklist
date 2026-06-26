<?php
header("Content-Type: application/json");

// Database credentials
$servername = "localhost"; // Your database host
$username = "root"; // Your database username
$password = "Hbl@1234"; // Your database password
$dbname = "loco_info"; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

if (isset($_GET['section_id'])) {
    $section_id = $_GET['section_id'];

    // Fetch details for the selected section using section_id
    $sql = "SELECT * FROM sections WHERE section_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $section_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
} else {
    echo json_encode(["error" => "No section ID provided"]);
}

$conn->close();
?>