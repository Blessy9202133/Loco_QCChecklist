<?php
// Database configuration
$host = 'localhost';
$db = 'loco_info'; // Replace with your database name
$user = 'root';    // Replace with your database username
$pass = 'Hbl@1234';    // Replace with your database password

// Create a connection to the database
$conn = new mysqli($host, $user, $pass, $db);

// Check the connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]));
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Handle PDF upload
    if (isset($_FILES['file'])) {
        $file = $_FILES['file'];
        $uploadDir = 'uploads/';
        $uploadFile = $uploadDir . basename($file['name']);

        if (move_uploaded_file($file['tmp_name'], $uploadFile)) {
            // Save file path in the database
            $filePath = $conn->real_escape_string($uploadFile);

            // Retrieve signature-related data from the request
            $inspectorName = isset($_POST['inspector_name']) ? $conn->real_escape_string($_POST['inspector_name']) : null;
            $inspectorSignature = isset($_POST['inspector_signature']) ? $conn->real_escape_string($_POST['inspector_signature']) : null;
            // $approverSignature = isset($_POST['approver_signature']) ? $conn->real_escape_string($_POST['approver_signature']) : null;
            $inspectorDate = isset($_POST['inspector_date']) ? $conn->real_escape_string($_POST['inspector_date']) : null;
            // $approverDate = isset($_POST['approver_date']) ? $conn->real_escape_string($_POST['approver_date']) : null;

            // Insert data into the database
            $sql = "INSERT INTO signatures (file_path, inspector_name, approver_name, inspector_signature, approver_signature, inspector_date, approver_date)
                    VALUES ('$filePath', '$inspectorName', '$approverName', '$inspectorSignature', '$approverSignature', '$inspectorDate', '$approverDate')";

            if ($conn->query($sql) === TRUE) {
                echo json_encode(["success" => true, "message" => "File uploaded and data saved successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to save data: " . $conn->error]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Failed to upload file"]);
        }
    }
}

// Close the database connection
$conn->close();
?>

