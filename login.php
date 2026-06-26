<?php
session_start();

try {
    // Database connection
    $pdo = new PDO("mysql:host=localhost;dbname=loco_info", 'root', 'Hbl@1234');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $username = trim($_POST['username']);
        $password = trim($_POST['password']);

        // Validate input
        if (empty($username) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Username and password are required!']);
            exit();
        }

        // Fetch user details (No hashing, direct comparison)
        $stmt = $pdo->prepare("SELECT username, employee_name, password, role FROM loginpage WHERE username = :username");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && $password === $user['password']) {  
            // ✅ Store username as user_id
            $_SESSION['user_id'] = $user['username'];  
            $_SESSION['username'] = $user['username'];
            $_SESSION['employee_name'] = $user['employee_name'];
            $_SESSION['role'] = $user['role'];  // ✅ Store role in session

            echo json_encode([
                'success' => true, 
                'message' => 'Login successful!', 
                'user_id' => $_SESSION['user_id'],
                'role' => $_SESSION['role'],
                'employee_name' => $user['employee_name']  // Added employee_name here.
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
        }
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
