<?php
$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "loco_info";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $mapJson = file_get_contents('migration_map.json');
    $migrationMap = json_decode($mapJson, true);
    
    $tables_and_sections = [
        "document_verification_table" => ["1.0", "1.1", "1.2"],
        "verify_serial_numbers_of_equipment_as_per_ic" => ["2.0", "2.1", "2.2", "2.3", "2.4", "2.5"],
        "loco_kavach" =>["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13"],
        "emi_filter_box" => ["4.0", "4.1", "4.2"],
        "rib_cab_input_box" => ["5.0", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9"],
        "dmi_lp_ocip" => ["6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10"],
        "rfid_ps_unit" => ["7.0", "7.1", "7.2","7.3","7.4","7.5"],
        "loco_antenna_and_gps_gsm_antenna" => ["8.0", "8.1", "8.2", "8.3" ,"8.4", "8.5", "8.6", "8.7", "8.8"],
        "pneumatic_fittings_and_ep_valve_cocks_fixing" => ["9.0", "9.1", "9.2", "9.4", "9.5", "9.6", "9.7"],
        "pressure_sensors_installation_in_loco" => ["10.0", "10.1", "10.2","10.3"],
        "iru_faviely_units_fixing_for_e70_type_loco" => ["11.0", "11.1", "11.2", "11.3", "11.4", "11.5", "11.6", "11.7"],
        "psjb_tpm_units_fixing_for_ccb_type_loco" => ["12.0", "12.1", "12.2", "12.3", "12.4", "12.5"],
        "sifa_valve_fixing_for_ccb_type_loco" => ["13.0", "13.1", "13.2","13.3","13.4"],
        "pgs_and_speedo_meter_units_fixing" => ["14.0", "14.1", "14.2","14.3", "14.4", "14.5", "14.6", "14.7", "14.8", "14.9","14.10","14.11","14.12","14.13"],
        "rfid_reader_assembly" => ["15.0", "15.1", "15.2","15.3", "15.4", "15.5", "15.6", "15.7", "15.8", "15.9","15.10","15.11"],
        "earthing" => ["16.0", "16.1","16.2","16.3"],
        "radio_power" => ["17.0", "17.1","17.2"],
    ];

    $pdo->beginTransaction();

    foreach ($tables_and_sections as $table => $snos) {
        $stmt = $pdo->prepare("SELECT id, S_no FROM $table WHERE item_id IS NULL OR item_id = ''");
        $stmt->execute();
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $updateCount = 0;
        foreach ($records as $record) {
            $s_no = trim($record['S_no']);
            // Fallback for missing mapping
            if (isset($migrationMap[$s_no])) {
                $item_id = $migrationMap[$s_no];
            } else {
                $item_id = $table . '_' . str_replace('.', '_', $s_no);
            }
                
            $updateStmt = $pdo->prepare("UPDATE $table SET item_id = ? WHERE id = ?");
            $updateStmt->execute([$item_id, $record['id']]);
            $updateCount++;
        }
        echo "Updated $updateCount records in table $table\n";
    }

    // Now update images table globally
    $imgStmt = $pdo->prepare("SELECT id, S_no FROM images WHERE item_id IS NULL OR item_id = ''");
    $imgStmt->execute();
    $images = $imgStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $imgUpdateCount = 0;
    foreach ($images as $img) {
        $s_no = trim($img['S_no']);
        if (isset($migrationMap[$s_no])) {
            $item_id = $migrationMap[$s_no];
            $updateStmt = $pdo->prepare("UPDATE images SET item_id = ? WHERE id = ?");
            $updateStmt->execute([$item_id, $img['id']]);
            $imgUpdateCount++;
        }
    }
    echo "Updated $imgUpdateCount records in images table\n";

    $pdo->commit();
    echo "Migration completed successfully.\n";

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
