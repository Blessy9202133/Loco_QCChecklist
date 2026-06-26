<?php
// Database connection
$servername = "localhost";  
$username = "root";  
$password = "Hbl@1234";  
$dbname = "loco_info";  

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if we're inserting observations and if the image is provided
    if (isset($_POST['loco-id'], $_POST['section-id'], $_POST['observations'], $_POST['loco-type'], $_POST['brake-type'], $_POST['railway-division'], $_POST['shed-name'])) {
        
        // Get data from POST
        $locoID = $_POST['loco-id'];
        $sectionID = $_POST['section-id'];
        $locoType = $_POST['loco-type'];
        $brakeType = $_POST['brake-type'];
        $railwayDivision = $_POST['railway-division'];
        $shedName = $_POST['shed-name'];
        $observations = json_decode($_POST['observations'], true);  // Decode the observations array
        
        // Process each observation
        foreach ($observations as $index => $observation) {
            $observationText = $observation['observation_text'];
            $remarks = $observation['remarks'];
            $sno = $observation['S_no'];  // S_no is passed as a string
            $observationStatus = $observation['observation_status'];  // Ensure this matches the enum values in the DB

            // Handle the image upload (file or camera)
            $imagePath = ''; // Initialize the image path variable

            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                // For file upload
                $fileTmpPath = $_FILES['image']['tmp_name'];
                $fileName = $_FILES['image']['name'];
                $fileSize = $_FILES['image']['size'];
                $fileType = $_FILES['image']['type'];

                // Generate a default file name for the uploaded image
                $newFileName = 'file-' . ($index + 1) . '.' . pathinfo($fileName, PATHINFO_EXTENSION);
                $uploadDir = 'uploads/';  // Directory to save images

                // Ensure the upload directory exists
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                // Full path where the file will be saved
                $filePath = $uploadDir . $newFileName;

                // Move the uploaded file to the desired directory
                if (move_uploaded_file($fileTmpPath, $filePath)) {
                    $imagePath = $filePath; // Store the relative path of the file
                } else {
                    echo json_encode(["error" => "File upload failed"]);
                    exit;
                }
            } elseif (isset($observation['image_path']) && $observation['image_path']) {
                // For camera upload (base64 or file)
                $imageData = $observation['image_path'];
                if (strpos($imageData, 'data:image/jpeg;base64,') === 0) {
                    // Handle base64 encoding
                    $imageData = str_replace('data:image/jpeg;base64,', '', $imageData);
                    $decodedImageData = base64_decode($imageData);
                    
                    // Generate a default filename for camera images
                    $newFileName = 'file-' . ($index + 1) . '.jpg';
                    $uploadDir = 'uploads/';

                    // Ensure upload directory exists
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }

                    // Save image data to file
                    $imageSaved = file_put_contents($uploadDir . $newFileName, $decodedImageData);
                    if ($imageSaved === false) {
                        echo json_encode(["error" => "Failed to save camera image"]);
                        exit;
                    }

                    $imagePath = $uploadDir . $newFileName; // Store the relative path
                }
            }

            // Prepare and execute insert query
            $query = "INSERT INTO observations (loco_id, section_id, loco_type, brake_type, railway_division, shed_name, observation_text, remarks, S_no, image_path, observation_status) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($query);
            if (!$stmt) {
                die("Error in prepare: " . $conn->error);
            }

            // Bind parameters for the INSERT query
            $stmt->bind_param("isssssssssb", $locoID, $sectionID, $locoType, $brakeType, $railwayDivision, $shedName, $observationText, $remarks, $sno, $imagePath, $observationStatus);
            $stmt->execute();
        }

        echo json_encode(["success" => "Observations added successfully."]);
    }
    // Fetch observations for a specific loco ID (with optional S_no filter)
    elseif (isset($_POST['loco-id'])) {
        $locoID = $_POST['loco-id'];  // Get the loco ID from POST

        // Optional: If S_no is provided, we can filter by S_no
        $sno = isset($_POST['S_no']) ? $_POST['S_no'] : null;

        // Prepare SQL query to fetch observations for the given loco ID and optionally S_no
        if ($sno) {
            $query = "SELECT * FROM observations WHERE loco_id = ? AND S_no = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("is", $locoID, $sno);  // Use 's' for the string S_no
        } else {
            $query = "SELECT * FROM observations WHERE loco_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $locoID);  // Bind the loco_id parameter
        }

        // Execute the query
        if (!$stmt->execute()) {
            die("Error executing query: " . $stmt->error);
        }

        // Get the result
        $result = $stmt->get_result();

        // Log the number of rows returned
        error_log("Rows returned: " . $result->num_rows);

        // Check if there are any observations
        if ($result->num_rows > 0) {
            // Fetch all observations as an associative array
            $observations = $result->fetch_all(MYSQLI_ASSOC);

            // Return the observations as JSON
            echo json_encode($observations);
        } else {
            // No observations found for the given loco ID
            echo json_encode([]);
        }
        // Close the prepared statement
        $stmt->close();
    } else {
        // Missing parameters, return an error
        echo json_encode(["error" => "Required parameters not provided."]);
    }
}

// Close the database connection
$conn->close();
?>









