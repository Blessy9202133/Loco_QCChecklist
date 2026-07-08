<?php
$pdo = new PDO("mysql:host=localhost;dbname=loco_info;charset=utf8mb4", "root", "Hbl@1234", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);

echo "Fixing loco_antenna_and_gps_gsm_antenna...\n";
$stmt = $pdo->query("SELECT id, loco_id, S_no, observation_text FROM loco_antenna_and_gps_gsm_antenna WHERE S_no LIKE '14.%'");
$rows = $stmt->fetchAll();

foreach ($rows as $row) {
    $id = $row['id'];
    $text = trim(strip_tags($row['observation_text']));
    $newSno = null;

    if (strpos($text, 'Verify RF Antenna – TX1') !== false) {
        $newSno = '8.7';
    } elseif (strpos($text, 'Verify RF Antenna – TX2') !== false) {
        $newSno = '8.8';
    } elseif (strpos($text, 'Verify GPS-GSM Antenna1') !== false) {
        $newSno = '8.9';
    } elseif (strpos($text, 'Verify GPS-GSM Antenna2') !== false) {
        $newSno = '8.10';
    } elseif (strpos($text, 'Verify RF Antenna height') !== false) {
        $newSno = '8.11';
    } elseif (strpos($text, 'Verify GPS-GSM Antenna height') !== false) {
        $newSno = '8.12';
    } elseif (strpos($text, 'Are RF and GPS/GSM') !== false || strpos($text, 'Are RF and GPS') !== false) {
        $newSno = '8.13';
    } elseif (strpos($text, 'Radio Antenna Welding') !== false) {
        $newSno = '8.14';
    } elseif (strpos($text, 'Antenna Mounting') !== false) {
        $newSno = '8.10';
    } elseif (strpos($text, 'RF Antenna Cable Connections') !== false) {
        $newSno = '8.11';
    } elseif (strpos($text, 'GPS/GSM Antenna and Cable Installation') !== false) {
        $newSno = '8.12';
    } elseif (strpos($text, 'Antenna Cables Routing') !== false) {
        $newSno = '8.13';
    } elseif (strpos($text, 'Red oxide coating') !== false) {
        $newSno = '8.14';
    }

    if ($newSno) {
        // Delete if a row with the same loco_id and newSno already exists (user manually filled it again)
        $check = $pdo->prepare("SELECT id FROM loco_antenna_and_gps_gsm_antenna WHERE loco_id = ? AND S_no = ? AND id != ?");
        $check->execute([$row['loco_id'], $newSno, $id]);
        if ($check->rowCount() > 0) {
            echo "Row ID $id (was {$row['S_no']}) conflicts with existing $newSno. Keeping existing and deleting corrupted.\n";
            $pdo->prepare("DELETE FROM loco_antenna_and_gps_gsm_antenna WHERE id = ?")->execute([$id]);
        } else {
            echo "Updating Row ID $id: {$row['S_no']} -> $newSno\n";
            $pdo->prepare("UPDATE loco_antenna_and_gps_gsm_antenna SET S_no = ? WHERE id = ?")->execute([$newSno, $id]);
        }
    } else {
        echo "Could not map text: $text\n";
    }
}
