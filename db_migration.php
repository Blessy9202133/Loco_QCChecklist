<?php
/**
 * Database Migration Script
 * Called automatically by update_version.php after a successful git pull.
 * Creates the hhp_loco_info database and all required tables (empty) if they don't already exist.
 */

$host = 'localhost';
$user = 'root';
$pass = 'Hbl@1234';

try {
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // ==========================================
    // 1. Create hhp_loco_info database
    // ==========================================
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `hhp_loco_info` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE hhp_loco_info");

    // ==========================================
    // 2. Master loco table
    // ==========================================
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

    // ==========================================
    // 3. Initial time table
    // ==========================================
    $pdo->exec("CREATE TABLE IF NOT EXISTS `initial_time` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `loco_id` int(11) NOT NULL,
      `section_id` varchar(50) NOT NULL,
      `initial_time` datetime NOT NULL,
      PRIMARY KEY (`id`),
      KEY `idx_init_time` (`loco_id`, `section_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // ==========================================
    // 4. Loginpage table (clone structure & data from loco_info)
    // ==========================================
    $pdo->exec("CREATE TABLE IF NOT EXISTS `loginpage` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `username` varchar(100) NOT NULL,
      `password` varchar(255) NOT NULL,
      `role` varchar(50) DEFAULT 'user',
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Copy users from loco_info.loginpage if hhp loginpage is empty
    $count = $pdo->query("SELECT COUNT(*) FROM `hhp_loco_info`.`loginpage`")->fetchColumn();
    if ($count == 0) {
        // Check if loco_info.loginpage exists
        $check = $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'loco_info' AND table_name = 'loginpage'")->fetchColumn();
        if ($check > 0) {
            $pdo->exec("INSERT IGNORE INTO `hhp_loco_info`.`loginpage` SELECT * FROM `loco_info`.`loginpage`");
        }
    }

    // ==========================================
    // 5. Images table
    // ==========================================
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

    // ==========================================
    // 6. Report table
    // ==========================================
    $pdo->exec("CREATE TABLE IF NOT EXISTS `report` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `user_id` VARCHAR(100) NOT NULL,
      `file_name` VARCHAR(255) NOT NULL,
      `upload_date` DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // ==========================================
    // 7. All 17 observation section tables
    // ==========================================
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
    }

    // Migration completed silently (called from update_version.php)

} catch (PDOException $e) {
    // Log error silently - don't break the update process
    error_log("HHP DB Migration Error: " . $e->getMessage());
}
?>
