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

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize and validate input
    $employee_name = trim($_POST["employee_name"]);
    $phone_number = trim($_POST["phone_number"]);
    $username = trim($_POST["username"]);
    $password = trim($_POST["password"]);

    $errors = [];

    // Validate Employee Name
    if (strlen($employee_name) < 3 || strlen($employee_name) > 50) {
        $errors[] = "Employee Name must be between 3 and 50 characters.";
    }

    // Validate Phone Number
    if (!preg_match("/^\d{10}$/", $phone_number)) {
        $errors[] = "Phone Number must contain exactly 10 digits.";
    }

    // Validate Username and Password
    if (empty($username)) {
        $errors[] = "Username is required.";
    }
    if (empty($password)) {
        $errors[] = "Password is required.";
    }

    // If there are validation errors, display them
    if (!empty($errors)) {
        echo "<h3>Errors:</h3><ul>";
        foreach ($errors as $error) {
            echo "<li>$error</li>";
        }
        echo "</ul>";
    } else {
        // Prepare an SQL statement to insert the user data
        $stmt = $conn->prepare("INSERT INTO loginpage (employee_name, phone_number, username, password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $employee_name, $phone_number, $username, $password);

        // Execute the statement and check for errors
        if ($stmt->execute()) {
            echo "<h3>Account created successfully!</h3>";
            echo "<p><a href='login.html'>Click here to login</a></p>";
        } else {
            echo "Error: " . $stmt->error;
        }

        // Close the statement
        $stmt->close();
    }
}

// Close the database connection
$conn->close();
?>





