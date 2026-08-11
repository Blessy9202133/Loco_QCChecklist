<?php
header('Content-Type: text/plain');

$host = 'localhost';
$user = 'root';
$pass = 'Hbl@1234';

try {
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // 1. Clean up temp hhp_ tables from loco_info database
    echo "1. Cleaning up temp hhp_ tables from 'loco_info' database...\n";
    $pdo->exec("USE loco_info");
    $hhpTablesInLocoInfo = [
        'hhp_loco', 'hhp_initial_time', 'hhp_document_verification_table',
        'hhp_verify_serial_numbers_of_equipment_as_per_ic', 'hhp_loco_kavach',
        'hhp_emi_filter_box', 'hhp_rib_cab_input_box', 'hhp_dmi_lp_ocip',
        'hhp_rfid_ps_unit', 'hhp_loco_antenna_and_gps_gsm_antenna',
        'hhp_pneumatic_fittings_and_ep_valve_cocks_fixing',
        'hhp_pressure_sensors_installation_in_loco',
        'hhp_iru_faviely_units_fixing_for_e70_type_loco',
        'hhp_psjb_tpm_units_fixing_for_ccb_type_loco',
        'hhp_sifa_valve_fixing_for_ccb_type_loco',
        'hhp_pgs_and_speedo_meter_units_fixing',
        'hhp_rfid_reader_assembly', 'hhp_earthing', 'hhp_radio_power'
    ];
    foreach ($hhpTablesInLocoInfo as $tbl) {
        $pdo->exec("DROP TABLE IF EXISTS `$tbl`");
    }
    echo "✅ 'loco_info' database is now clean.\n\n";

    // 2. Create new separate database hhp_loco_info
    echo "2. Creating new separate database 'hhp_loco_info'...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `hhp_loco_info` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE hhp_loco_info");
    echo "✅ Database 'hhp_loco_info' created/selected.\n\n";

    // 3. Clone table schemas
    echo "3. Creating tables in 'hhp_loco_info'...\n";
    
    // Master loco table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `loco` (
      `Loco_Id` int(11) NOT NULL,
      `Loco_type` varchar(255) NOT NULL,
      `Brake_type` varchar(255) NOT NULL,
      `Railway_Division` varchar(255) NOT NULL,
      `Shed_name` varchar(255) NOT NULL,
      `inspection_Date` date NOT NULL,
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `start_time` datetime DEFAULT NULL,
      `completed_time` datetime DEFAULT NULL,
      PRIMARY KEY (`id`),
      KEY `idx_loco_id` (`Loco_Id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Initial time table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `initial_time` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `loco_id` int(11) NOT NULL,
      `section_id` varchar(50) NOT NULL,
      `initial_time` datetime NOT NULL,
      PRIMARY KEY (`id`),
      KEY `idx_init_time` (`loco_id`, `section_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Clone loginpage table structure & copy users
    $pdo->exec("DROP TABLE IF EXISTS `hhp_loco_info`.`loginpage`");
    $pdo->exec("CREATE TABLE `hhp_loco_info`.`loginpage` LIKE `loco_info`.`loginpage`");
    $pdo->exec("INSERT IGNORE INTO `hhp_loco_info`.`loginpage` SELECT * FROM `loco_info`.`loginpage`");

    // Images table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `images` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `entity_type` varchar(255) DEFAULT NULL,
      `loco_id` varchar(255) NOT NULL,
      `s_no` varchar(50) NOT NULL,
      `image_path` varchar(500) NOT NULL,
      `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id`),
      KEY `idx_images_loco_sno` (`loco_id`,`s_no`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Observation tables
    $sectionTables = [
        'document_verification_table',
        'verify_serial_numbers_of_equipment_as_per_ic',
        'loco_kavach',
        'emi_filter_box',
        'rib_cab_input_box',
        'dmi_lp_ocip',
        'rfid_ps_unit',
        'loco_antenna_and_gps_gsm_antenna',
        'pneumatic_fittings_and_ep_valve_cocks_fixing',
        'pressure_sensors_installation_in_loco',
        'iru_faviely_units_fixing_for_e70_type_loco',
        'psjb_tpm_units_fixing_for_ccb_type_loco',
        'sifa_valve_fixing_for_ccb_type_loco',
        'pgs_and_speedo_meter_units_fixing',
        'rfid_reader_assembly',
        'earthing',
        'radio_power'
    ];

    foreach ($sectionTables as $tbl) {
        $barcodeCol = ($tbl === 'verify_serial_numbers_of_equipment_as_per_ic') ? "`barcode` varchar(255) DEFAULT NULL," : "";
        
        $sql = "CREATE TABLE IF NOT EXISTS `$tbl` (
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
          $barcodeCol
          `image_path` varchar(1000) NOT NULL,
          `observation_status` varchar(255) DEFAULT NULL,
          `created_at` timestamp NULL DEFAULT current_timestamp(),
          `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          PRIMARY KEY (`id`),
          KEY `idx_loco_id` (`loco_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        
        $pdo->exec($sql);
        echo "  - Table '$tbl' created in hhp_loco_info.\n";
    }

    echo "\n🎉 New Database 'hhp_loco_info' fully created and ready!";

} catch (PDOException $e) {
    echo "❌ Error setting up hhp_loco_info DB: " . $e->getMessage();
}
?>
