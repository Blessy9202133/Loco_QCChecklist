
<?php
// Database connection details
$servername = "localhost";
$username = "root"; // Replace with your database username
$password = "Hbl@1234"; // Replace with your database password
$dbname = "loco_info"; // Replace with your database name

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the user ID from the URL
$user_id = $_GET['id'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $new_password = $_POST['new_password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    // Check if passwords match
    if ($new_password !== $confirm_password) {
        $error = "Passwords do not match.";
    } else {
        // Update the password in the database
        $update_sql = "UPDATE loginpage SET password = ? WHERE id = ?";
        $stmt = $conn->prepare($update_sql);
        $stmt->bind_param('si', $new_password, $user_id);

        if ($stmt->execute()) {
            $success = "Password updated successfully.";
        } else {
            $error = "Error updating password: " . $stmt->error;
        }
    }
}

// Query to fetch user details
$sql = "SELECT employee_name, username FROM loginpage WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

$stmt->close();
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit User Password</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(to bottom, #f9f9f9, #e6e6e6);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            width: 100%;
            max-width: 400px;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
        }

        label {
            font-weight: bold;
            display: block;
            margin: 10px 0 5px;
            color: #555;
        }

        input {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }

        input:focus {
            border-color: #4CAF50;
            outline: none;
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.2);
        }

        button {
            width: 100%;
            padding: 12px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #45a049;
        }

        .message {
            margin-top: 20px;
            text-align: center;
            font-weight: bold;
            padding: 10px;
            border-radius: 5px;
        }

        .error {
            color: #d8000c;
            background-color: #ffbaba;
            border: 1px solid #d8000c;
        }

        .success {
            color: #4CAF50;
            background-color: #d4edda;
            border: 1px solid #4CAF50;
        }

        @media (max-width: 600px) {
            .container {
                padding: 15px;
            }

            button {
                padding: 10px;
                font-size: 14px;
            }
        }

        .nav-btn {
            background-color: #007BFF;
            color: white;
            padding: 5px 10px;
            font-size: 14px;
            border: none;
            border-radius: 5px;
            margin: 10px 0;
            cursor: pointer;
            width: 100%;
        }

        .nav-btn:hover {
            background-color: #0056b3;
        }

        .button-group {
            display: flex;
            justify-content: space-between;
            gap: 10px;
        }

        .button-group button {
            width: 48%;
        }

    </style>
</head>
<body>
    <div class="container">
        <h2>Edit Password for <?php echo htmlspecialchars($user['employee_name']); ?></h2>
        <form method="POST">
            <label for="new-password">New Password:</label>
            <input type="password" id="new-password" name="new_password" required placeholder="Enter new password">

            <label for="confirm-password">Confirm Password:</label>
            <input type="password" id="confirm-password" name="confirm_password" required placeholder="Re-enter new password">

            <button type="submit">Update Password</button>
        </form>

        <?php if (!empty($error)) { ?>
            <p class="message error"><?php echo htmlspecialchars($error); ?></p>
        <?php } ?>

        <?php if (!empty($success)) { ?>
            <p class="message success"><?php echo htmlspecialchars($success); ?></p>
        <?php } ?>

        <div class="button-group">
            <button class="nav-btn" onclick="window.location.href='login.html'">Go to Login</button>
            <button class="nav-btn" onclick="window.location.href='view_users.php'">Back to User List</button>
        </div>
    </div>
</body>
</html>
