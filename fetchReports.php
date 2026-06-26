<?php
header('Content-Type: application/json');
$host = 'localhost';
$dbname = 'loco_info';
$username = 'root';
$password = 'Hbl@1234';
$dsn = "mysql:host=$host;dbname=$dbname";

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get username (acting as user_id) from the request
    $username = $_GET['user_id'] ?? null; // 'user_id' actually contains the username

    if (!$username) {
        echo json_encode(['success' => false, 'message' => 'Missing or invalid username.']);
        exit;
    }

    // Fetch user role from the loginpage table
    $stmt = $pdo->prepare("SELECT role FROM loginpage WHERE username = :username");
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found.']);
        exit;
    }

    $role = $user['role'];

    // Query reports based on role
    if ($role === 'admin') {
        $sql = "SELECT * FROM report";  // Admin sees all reports
        $stmt = $pdo->prepare($sql);
    } else {
        $sql = "SELECT * FROM report WHERE user_id = :username";  // Users see only their reports
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    }

    $stmt->execute();
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'reports' => $reports]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
