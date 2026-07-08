<?php
$pdo = new PDO("mysql:host=localhost;dbname=loco_info;charset=utf8mb4", "root", "Hbl@1234", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);

$stmt = $pdo->query("SELECT S_no, COUNT(*) as count FROM loco_antenna_and_gps_gsm_antenna GROUP BY S_no");
$results = $stmt->fetchAll();
foreach ($results as $row) {
    echo $row['S_no'] . " => " . $row['count'] . "\n<br>";
}
?>
