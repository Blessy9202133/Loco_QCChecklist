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

foreach ($tables as $tbl) {
    try {
        $stmt = $pdo->query("SELECT S_no FROM $tbl WHERE S_no LIKE '14.%'");
        $rows = $stmt->fetchAll();
        if (count($rows) > 0) {
            echo "Table $tbl has " . count($rows) . " rows with S_no like 14.%\n";
        }
    } catch (Exception $e) {
        // Table might not exist or no S_no
    }
}
