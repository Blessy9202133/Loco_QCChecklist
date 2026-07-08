<?php
$pdo = new PDO("mysql:host=localhost;dbname=loco_info;charset=utf8mb4", "root", "Hbl@1234", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);

try {
    $pdo->exec("ALTER TABLE verify_serial_numbers_of_equipment_as_per_ic ADD COLUMN barcode VARCHAR(255) NULL");
    echo "Successfully added 'barcode' column to verify_serial_numbers_of_equipment_as_per_ic table!";
} catch (PDOException $e) {
    echo "Column might already exist or another error occurred: " . $e->getMessage();
}
?>
