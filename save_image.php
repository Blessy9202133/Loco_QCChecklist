<?php
// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve the base64 image data
    $imageData = $_POST['imageData'];

    // Check if the image data is valid
    if (strpos($imageData, 'data:image/') === false) {
        echo "Invalid image data.";
        exit;
    }

    // Extract the image type (e.g., png, jpeg)
    preg_match('/data:image\/(.*);base64,/', $imageData, $matches);
    $imageType = $matches[1];

    // Generate a unique file name for the image
    $imageName = uniqid() . '.' . $imageType;
    $uploadDir = 'uploads/';  // Path to the 'uploads' directory

    // Decode the base64 image data
    $imageData = base64_decode(str_replace('data:image/' . $imageType . ';base64,', '', $imageData));

    // Save the image to the uploads directory
    $imagePath = $uploadDir . $imageName;

    // Write the image to the file
    if (file_put_contents($imagePath, $imageData)) {
        // Create a connection to the database
        $servername = "localhost";
        $username = "root"; // Your database username
        $password = "Hbl@1234"; // Your database password
        $dbname = "loco_info"; // Your database name

        $conn = new mysqli($servername, $username, $password, $dbname);

        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        // Insert the image path into the database
        $stmt = $conn->prepare("INSERT INTO observations (image_path) VALUES (?)");
        $stmt->bind_param("s", $imagePath);

        if ($stmt->execute()) {
            echo "Image uploaded and stored successfully!";
        } else {
            echo "Error uploading image: " . $stmt->error;
        }

        $stmt->close();
        $conn->close();
    } else {
        echo "Error saving image to server.";
    }
}
?>

