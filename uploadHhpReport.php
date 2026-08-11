<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'hhp_loco_info';
$username = 'root'; 
$password = 'Hbl@1234'; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ensure report table exists in hhp_loco_info
    $pdo->exec("CREATE TABLE IF NOT EXISTS `report` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` VARCHAR(100) NOT NULL,
        `file_name` VARCHAR(255) NOT NULL,
        `upload_date` DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $uploadDir = 'C:/xampp/htdocs/Qcchecklist/uploads/reports/';

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $user_id = $_POST['user_id'] ?? null;

        if (!$user_id) {
            echo json_encode([
                'success' => false,
                'message' => 'Missing user_id. Report cannot be uploaded.'
            ]);
            exit;
        }

        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['file']['tmp_name'];
            $fileName = $_FILES['file']['name'];
            $uploadPath = $uploadDir . $fileName;

            if (move_uploaded_file($fileTmpPath, $uploadPath)) {
                $sql = "INSERT INTO report (user_id, file_name, upload_date) VALUES (:user_id, :file_name, NOW())";
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':user_id', $user_id, PDO::PARAM_STR);
                $stmt->bindParam(':file_name', $fileName, PDO::PARAM_STR);

                if ($stmt->execute()) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'HHP Report uploaded successfully.'
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error inserting report into HHP database.'
                    ]);
                }
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Error moving the uploaded file.'
                ]);
            }
        } else {
            $errCode = isset($_FILES['file']) ? $_FILES['file']['error'] : 'POST max size exceeded or no file';
            echo json_encode([
                'success' => false,
                'message' => 'File upload error: ' . $errCode
            ]);
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_id = $_GET['user_id'] ?? null;
        if ($user_id) {
            $stmt = $pdo->prepare("SELECT id, user_id, file_name, upload_date FROM report WHERE user_id = :user_id ORDER BY upload_date DESC");
            $stmt->execute([':user_id' => $user_id]);
        } else {
            $stmt = $pdo->query("SELECT id, user_id, file_name, upload_date FROM report ORDER BY upload_date DESC");
        }
        $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'reports' => $reports]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
}
?>
