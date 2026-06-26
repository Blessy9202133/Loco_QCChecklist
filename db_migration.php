<?php
// Database Update Script for Loco QCChecklist Modifications

$conn = new mysqli("localhost", "root", "Hbl@1234", "loco_info");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Write your migration queries here
// Example:
// $conn->query("ALTER TABLE ... ADD COLUMN ...");

$conn->close();
echo "<br><b>Database Migration Completed Successfully!</b><br>";
?>
