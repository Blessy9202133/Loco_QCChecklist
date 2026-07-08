<?php
$pdo = new PDO('mysql:host=localhost;dbname=loco_info', 'root', 'Hbl@1234');
$stmt = $pdo->query('SHOW TABLES');
while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
    echo $row[0] . PHP_EOL;
}
?>
