<?php
header('Content-Type: application/json');  // Ensure response is JSON

// Database connection
$host = 'localhost';
$dbname = 'loco_info';
$username = 'root'; 
$password = 'Hbl@1234'; 
$dsn = "mysql:host=$host;dbname=$dbname";

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $uploadDir = 'C:/xampp/htdocs/Qcchecklist/uploads/reports/';  // Upload directory

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get user_id from request
        $user_id = $_POST['user_id'] ?? null;

        if (!$user_id) {
            echo json_encode([
                'success' => false,
                'message' => 'Missing user_id. Report cannot be uploaded.'
            ]);
            exit;
        }

        if ($_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['file']['tmp_name'];
            $fileName = $_FILES['file']['name'];
            $uploadPath = $uploadDir . $fileName;

            // Check if the upload directory exists
            if (!is_dir($uploadDir)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Upload directory does not exist.'
                ]);
                exit;
            }

            // Move the uploaded file to the server
            if (move_uploaded_file($fileTmpPath, $uploadPath)) {
                // Insert file info into the database
                $sql = "INSERT INTO report (user_id, file_name, upload_date) VALUES (:user_id, :file_name, NOW())";
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                $stmt->bindParam(':file_name', $fileName, PDO::PARAM_STR);

                if ($stmt->execute()) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'File uploaded and report saved to database.'
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error inserting report into database.'
                    ]);
                }
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Error moving the uploaded file.'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'File upload error: ' . $_FILES['file']['error']
            ]);
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get user_id from request
        $user_id = $_GET['user_id'] ?? null;

        if (!$user_id) {
            echo json_encode([
                'success' => false,
                'message' => 'Missing user_id. Cannot fetch reports.'
            ]);
            exit;
        }

        // Check user role
        $stmt = $pdo->prepare("SELECT role FROM loginpage WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode([
                'success' => false,
                'message' => 'User not found.'
            ]);
            exit;
        }

        // Fetch reports
        if ($user['role'] === 'admin') {
            // Admin can see all reports
            $sql = "SELECT r.report_id, r.file_name, r.upload_date, l.username, l.role
                    FROM report r
                    JOIN loginpage l ON r.user_id = l.user_id";
        } else {
            // Normal users can see only their reports
            $sql = "SELECT report_id, file_name, upload_date FROM report WHERE user_id = :user_id";
        }

        $stmt = $pdo->prepare($sql);

        if ($user['role'] !== 'admin') {
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        }

        $stmt->execute();
        $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'reports' => $reports
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request method.'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
}
?>

