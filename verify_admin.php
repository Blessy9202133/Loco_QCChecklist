<?php
// Database connection details
$servername = "localhost";
$username = "root";  // Update with your database username
$password = "Hbl@1234";  // Update with your database password
$dbname = "loco_info";

// Admin password to verify
$admin_password = 'hbl@123'; // Replace this with your actual admin password for verification

// Get the admin password entered by the user
$entered_password = $_POST['admin_password'];

// Check if the entered admin password matches
if ($entered_password === $admin_password) {
    // If verified, proceed to create a user
    header("Location: create_user.html");
    exit();
} else {
    // If not verified, show an error message with an alert and redirect back
    echo "<script>
            alert('Invalid admin password! Please try again.');
            window.location.href = 'account.html';
          </script>";
}
?>


