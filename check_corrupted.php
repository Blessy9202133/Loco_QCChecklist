<?php
$pdo = new PDO("mysql:host=localhost;dbname=loco_info;charset=utf8mb4", "root", "Hbl@1234", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);

$stmt = $pdo->query("SELECT S_no, section_id, observation_text FROM loco_antenna_and_gps_gsm_antenna WHERE S_no LIKE '14.%'");
$rows = $stmt->fetchAll();
print_r($rows);
