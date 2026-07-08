<?php
$host = 'localhost';
$dbname = 'loco_info';
$username = 'root';
$password = 'Hbl@1234';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $tables = [
        'document_verification_table',
        'verify_serial_numbers_of_equipment_as_per_ic',
        'loco_kavach',
        'rib_cab_input_box',
        'radio_power',
        'rfid_ps_unit',
        'dmi_lp_ocip',
        'loco_antenna_and_gps_gsm_antenna',
        'emi_filter_box',
        'earthing',
        'iru_faviely_units_fixing_for_e70_type_loco',
        'psjb_tpm_units_fixing_for_ccb_type_loco',
        'pneumatic_fittings_and_ep_valve_cocks_fixing',
        'pgs_and_speedo_meter_units_fixing',
        'rfid_reader_assembly',
        'pressure_sensors_installation_in_loco',
        'sifa_valve_fixing_for_ccb_type_loco',
        'images'
    ];

    foreach ($tables as $table) {
        try {
            $pdo->exec("ALTER TABLE `$table` ADD COLUMN item_id VARCHAR(255) DEFAULT NULL AFTER S_no");
            echo "Added item_id to $table\n";
        } catch (PDOException $e) {
            echo "Error adding item_id to $table (might already exist): " . $e->getMessage() . "\n";
        }
        
        try {
            $pdo->exec("ALTER TABLE `$table` ADD INDEX (item_id)");
            echo "Added index for item_id on $table\n";
        } catch (PDOException $e) {
            echo "Error adding index to $table: " . $e->getMessage() . "\n";
        }
    }

    echo "Schema update completed.\n";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
?>
