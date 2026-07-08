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
        $stmt = $pdo->prepare("SELECT id, loco_id FROM $tbl WHERE S_no = ?");
        $stmt->execute([$oldSno]);
        $rows = $stmt->fetchAll();
        foreach ($rows as $row) {
            // Check if the newSno already exists for this loco
            $check = $pdo->prepare("SELECT id FROM $tbl WHERE loco_id = ? AND S_no = ? AND id != ?");
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
    $stmt = $pdo->prepare("SELECT id, loco_id FROM images WHERE S_no = ?");
    $stmt->execute([$oldSno]);
    $rows = $stmt->fetchAll();
    foreach ($rows as $row) {
        $check = $pdo->prepare("SELECT id FROM images WHERE loco_id = ? AND S_no = ? AND id != ?");
        $check->execute([$row['loco_id'], $newSno, $row['id']]);
        if ($check->rowCount() > 0) {
            $pdo->prepare("DELETE FROM images WHERE id = ?")->execute([$row['id']]);
        } else {
            $pdo->prepare("UPDATE images SET S_no = ? WHERE id = ?")->execute([$newSno, $row['id']]);
        }
    }
}

echo "Done!\n";
?>
