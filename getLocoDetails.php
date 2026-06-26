<?php
// Set headers for JSON response
header('Content-Type: application/json');

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

// SQL query to fetch loco details
$sql = "SELECT * FROM loco LIMIT 1"; // You can add a WHERE condition here if needed

$result = $conn->query($sql);

// Check if a record exists
if ($result->num_rows > 0) {
    // Fetch the data
    $locoDetails = $result->fetch_assoc();
    // Return success response with loco details
    echo json_encode(["success" => true, "locoDetails" => $locoDetails]);
} else {
    // If no data is found
    echo json_encode(["success" => false, "message" => "No loco details found"]);
}

// Close the connection
$conn->close();
?>
