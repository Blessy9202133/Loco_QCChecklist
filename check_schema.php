<?php
$pdo = new PDO("mysql:host=localhost;dbname=loco_info;charset=utf8mb4", "root", "Hbl@1234", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);

$stmt = $pdo->query("DESCRIBE loco_antenna_and_gps_gsm_antenna");
print_r($stmt->fetchAll());

$stmt = $pdo->query("SELECT S_no, observation_text FROM loco_antenna_and_gps_gsm_antenna WHERE S_no LIKE '8.%' OR S_no LIKE '14.%'");
print_r($stmt->fetchAll());
?>
