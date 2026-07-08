<?php
$pdo = new PDO("mysql:host=localhost;dbname=loco_info;charset=utf8mb4", "root", "Hbl@1234", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);

$tables = [
    'document_verification_table', 'verify_serial_numbers_of_equipment_as_per_ic',
    'loco_kavach', 'emi_filter_box', 'rib_cab_input_box', 'dmi_lp_ocip',
    'rfid_ps_unit', 'loco_antenna_and_gps_gsm_antenna', 'pneumatic_fittings_and_ep_valve_cocks_fixing',
    'pressure_sensors_installation_in_loco', 'iru_faviely_units_fixing_for_e70_type_loco',
    'psjb_tpm_units_fixing_for_ccb_type_loco', 'sifa_valve_fixing_for_ccb_type_loco',
    'pgs_and_speedo_meter_units_fixing', 'rfid_reader_assembly', 'earthing', 'radio_power'
];

$mapping = [
    '8.7.4' => '8.13.4',
    '8.7.3' => '8.13.3',
    '8.7.2' => '8.13.2',
    '8.7.1' => '8.13.1',
    '8.7' => '8.13',
    '8.6' => '8.12',
    '8.5' => '8.11',
    '8.4' => '8.10',
    '8.3' => '8.9',
    '8.2' => '8.8',
    '8.1' => '8.7'
];

echo "Force migrating any leftover 8.x old points that didn't get mapped...\n<br>";

foreach ($tables as $tbl) {
    foreach ($mapping as $oldSno => $newSno) {
        $stmt = $pdo->prepare("SELECT id, loco_id, S_no FROM $tbl WHERE TRIM(S_no) = ?");
        $stmt->execute([$oldSno]);
        $rows = $stmt->fetchAll();
        foreach ($rows as $row) {
            echo "Found matching row: {$row['loco_id']} -> {$row['S_no']}<br>";
            // Check if the newSno already exists for this loco
            $check = $pdo->prepare("SELECT id FROM $tbl WHERE loco_id = ? AND TRIM(S_no) = ? AND id != ?");
            $check->execute([$row['loco_id'], $newSno, $row['id']]);
            if ($check->rowCount() > 0) {
                echo "Loco {$row['loco_id']}: Row ID {$row['id']} ($oldSno) conflicts with existing $newSno. Deleting old.\n<br>";
                $pdo->prepare("DELETE FROM $tbl WHERE id = ?")->execute([$row['id']]);
            } else {
                echo "Loco {$row['loco_id']}: Updating Row ID {$row['id']}: $oldSno -> $newSno\n<br>";
                $pdo->prepare("UPDATE $tbl SET S_no = ? WHERE id = ?")->execute([$newSno, $row['id']]);
            }
        }
    }
}

// Do the same for images
foreach ($mapping as $oldSno => $newSno) {
    $stmt = $pdo->prepare("SELECT id, loco_id FROM images WHERE TRIM(S_no) = ?");
    $stmt->execute([$oldSno]);
    $rows = $stmt->fetchAll();
    foreach ($rows as $row) {
        $check = $pdo->prepare("SELECT id FROM images WHERE loco_id = ? AND TRIM(S_no) = ? AND id != ?");
        $check->execute([$row['loco_id'], $newSno, $row['id']]);
        if ($check->rowCount() > 0) {
            $pdo->prepare("DELETE FROM images WHERE id = ?")->execute([$row['id']]);
        } else {
            $pdo->prepare("UPDATE images SET S_no = ? WHERE id = ?")->execute([$newSno, $row['id']]);
        }
    }
}

// FORCE MATCH BY TEXT IN CASE S_NO WAS TRUNCATED OR GLITCHED
echo "<br>Running text-based recovery for 8.13 sub-rows...<br>";
$stmt = $pdo->query("SELECT id, loco_id, S_no, observation_text FROM loco_antenna_and_gps_gsm_antenna WHERE S_no LIKE '8.%' OR S_no LIKE '14.%'");
foreach ($stmt->fetchAll() as $row) {
    $text = $row['observation_text'];
    $newSno = null;
    if (strpos($text, 'securely clamped to the roof using clamps welded to the rooftop') !== false) {
        $newSno = '8.13.1';
    } elseif (strpos($text, 'conduit is routed into the Loco cabin through the elbow pipe') !== false) {
        $newSno = '8.13.2';
    } elseif (strpos($text, 'conduit pipe and elbow are sourced from the Loco Kavach') !== false) {
        $newSno = '8.13.3';
    } elseif (strpos($text, 'RTV Silicone compound') !== false) {
        $newSno = '8.13.4';
    }
    
    if ($newSno && $row['S_no'] !== $newSno) {
        echo "Found sub-row by text! Loco {$row['loco_id']}: Row ID {$row['id']} ({$row['S_no']}) -> $newSno<br>";
        $pdo->prepare("UPDATE loco_antenna_and_gps_gsm_antenna SET S_no = ? WHERE id = ?")->execute([$newSno, $row['id']]);
        $pdo->prepare("UPDATE images SET S_no = ? WHERE loco_id = ? AND S_no = ?")->execute([$newSno, $row['loco_id'], $row['S_no']]);
    }
}

echo "Done!\n";
?>
