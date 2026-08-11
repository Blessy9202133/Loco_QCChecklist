<?php
header('Content-Type: text/plain');

$host = 'localhost';
$user = 'root';
$pass = 'Hbl@1234';
$db   = 'loco_info';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    echo "Connected to MySQL database '$db'.\n";

    // 1. Create hhp_loco master table
    $createHhpLocoSql = "CREATE TABLE IF NOT EXISTS `hhp_loco` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `Loco_Id` int(11) NOT NULL,
      `Loco_type` varchar(255) NOT NULL,
      `Brake_type` varchar(255) NOT NULL,
      `Railway_Division` varchar(255) NOT NULL,
      `Shed_name` varchar(255) NOT NULL,
      `inspection_Date` date NOT NULL,
      `start_time` datetime DEFAULT NULL,
      `completed_time` datetime DEFAULT NULL,
      PRIMARY KEY (`id`),
      KEY `idx_hhp_loco_id` (`Loco_Id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $pdo->exec($createHhpLocoSql);
    echo "✅ Table 'hhp_loco' created/verified.\n";

    // 2. Create hhp_initial_time table
    $createHhpInitialTimeSql = "CREATE TABLE IF NOT EXISTS `hhp_initial_time` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `loco_id` int(11) NOT NULL,
      `section_id` varchar(50) NOT NULL,
      `initial_time` datetime NOT NULL,
      PRIMARY KEY (`id`),
      KEY `idx_hhp_init_time` (`loco_id`, `section_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($createHhpInitialTimeSql);
    echo "✅ Table 'hhp_initial_time' created/verified.\n";

    // 3. Create all 17 hhp_ observation section tables
    $hhpTables = [
        'hhp_document_verification_table',
        'hhp_verify_serial_numbers_of_equipment_as_per_ic',
        'hhp_loco_kavach',
        'hhp_emi_filter_box',
        'hhp_rib_cab_input_box',
        'hhp_dmi_lp_ocip',
        'hhp_rfid_ps_unit',
        'hhp_loco_antenna_and_gps_gsm_antenna',
        'hhp_pneumatic_fittings_and_ep_valve_cocks_fixing',
        'hhp_pressure_sensors_installation_in_loco',
        'hhp_iru_faviely_units_fixing_for_e70_type_loco',
        'hhp_psjb_tpm_units_fixing_for_ccb_type_loco',
        'hhp_sifa_valve_fixing_for_ccb_type_loco',
        'hhp_pgs_and_speedo_meter_units_fixing',
        'hhp_rfid_reader_assembly',
        'hhp_earthing',
        'hhp_radio_power'
    ];

    foreach ($hhpTables as $tableName) {
        $sql = "CREATE TABLE IF NOT EXISTS `$tableName` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `loco_id` int(11) DEFAULT NULL,
          `section_id` varchar(50) NOT NULL,
          `loco_type` varchar(50) NOT NULL,
          `brake_type` varchar(50) NOT NULL,
          `railway_division` varchar(100) NOT NULL,
          `shed_name` varchar(100) NOT NULL,
          `inspection_date` date NOT NULL,
          `observation_text` text NOT NULL,
          `remarks` text NOT NULL,
          `S_no` varchar(50) NOT NULL,
          `image_path` varchar(1000) NOT NULL,
          `observation_status` varchar(255) DEFAULT NULL,
          `created_at` timestamp NULL DEFAULT current_timestamp(),
          `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          PRIMARY KEY (`id`),
          KEY `idx_loco_id` (`loco_id`),
          KEY `idx_sec_loco` (`loco_id`, `section_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

        $pdo->exec($sql);
        echo "✅ Table '$tableName' created/verified with optimized indexes.\n";
    }

    echo "\n🎉 All HHP LOCO tables initialized successfully!";

} catch (PDOException $e) {
    echo "❌ Error setting up HHP tables: " . $e->getMessage();
}
?>
