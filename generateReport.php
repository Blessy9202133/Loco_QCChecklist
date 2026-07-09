<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

if (!isset($_POST['loco-id'], $_POST['railway-division'], $_POST['shed-name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing necessary POST data']);
    exit;
}

$locoID = htmlspecialchars($_POST['loco-id']);
$railwayDivision = htmlspecialchars($_POST['railway-division']);
$shedName = htmlspecialchars($_POST['shed-name']);

try {
    $pdo = new PDO('mysql:host=localhost;dbname=loco_info', 'root', 'Hbl@1234', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // ----- Automatic Section 8 migration (run once per locomotive) -----
    // Ensure a meta table exists to track whether migration has been performed
    $pdo->exec("CREATE TABLE IF NOT EXISTS migration_meta (loco_id VARCHAR(20) PRIMARY KEY, section8_migrated TINYINT DEFAULT 0)");

    // Automatically ensure barcode columns exist globally
    try {
        $pdo->exec("ALTER TABLE verify_serial_numbers_of_equipment_as_per_ic ADD COLUMN barcode VARCHAR(255) NULL");
    } catch (PDOException $e) { /* Ignore if it already exists */ }
    try {
        $pdo->exec("ALTER TABLE verify_serial_numbers_of_equipment_as_per_ic ADD COLUMN barcode_status VARCHAR(50) NULL");
    } catch (PDOException $e) { /* Ignore if it already exists */ }

    try {
        $pdo->exec("ALTER TABLE migration_meta ADD COLUMN section8_subrows_migrated TINYINT DEFAULT 0");
    } catch (PDOException $e) { /* Ignore if already exists */ }

    // Check migration flag for this loco
    $metaStmt = $pdo->prepare("SELECT section8_migrated, section8_subrows_migrated FROM migration_meta WHERE loco_id = ?");
    $metaStmt->execute([$locoID]);
    $meta = $metaStmt->fetch();
    
    $needsMigration = (!$meta || !isset($meta['section8_migrated']) || $meta['section8_migrated'] == 0);

    if ($needsMigration) {
        // List of all observation tables (same list defined later in the script)
        $tables = [
            'document_verification_table', 'verify_serial_numbers_of_equipment_as_per_ic',
            'loco_kavach', 'emi_filter_box', 'rib_cab_input_box', 'dmi_lp_ocip',
            'rfid_ps_unit', 'loco_antenna_and_gps_gsm_antenna', 'pneumatic_fittings_and_ep_valve_cocks_fixing',
            'pressure_sensors_installation_in_loco', 'iru_faviely_units_fixing_for_e70_type_loco',
            'psjb_tpm_units_fixing_for_ccb_type_loco', 'sifa_valve_fixing_for_ccb_type_loco',
            'pgs_and_speedo_meter_units_fixing', 'rfid_reader_assembly', 'earthing', 'radio_power'
        ];
        // Shift old Section 8 rows down by 6 positions
        $mapping = [
            '8.8' => '8.14',
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
        foreach ($mapping as $oldSno => $newSno) {
            foreach ($tables as $tbl) {
                $shiftStmt = $pdo->prepare("UPDATE $tbl SET S_no = ? WHERE loco_id = ? AND S_no = ?");
                $shiftStmt->execute([$newSno, $locoID, $oldSno]);
            }
            $imgShift = $pdo->prepare("UPDATE images SET S_no = ? WHERE loco_id = ? AND S_no = ?");
            $imgShift->execute([$newSno, $locoID, $oldSno]);
        }
        
        // Mark migration as done
        $upsertMeta = $pdo->prepare("INSERT INTO migration_meta (loco_id, section8_migrated) VALUES (?,1) ON DUPLICATE KEY UPDATE section8_migrated=1");
        $upsertMeta->execute([$locoID]);
    }

    $needsSubrowMigration = (!$meta || !isset($meta['section8_subrows_migrated']) || $meta['section8_subrows_migrated'] == 0);
    if ($needsSubrowMigration) {
        $subrowMapping = [
            '8.7.4' => '8.13.4',
            '8.7.3' => '8.13.3',
            '8.7.2' => '8.13.2',
            '8.7.1' => '8.13.1'
        ];
        
        // Pass 1: Trimmed S_no matching
        foreach ($subrowMapping as $oldSno => $newSno) {
            $shiftStmt = $pdo->prepare("UPDATE loco_antenna_and_gps_gsm_antenna SET S_no = ? WHERE loco_id = ? AND TRIM(S_no) = ?");
            $shiftStmt->execute([$newSno, $locoID, $oldSno]);
            $imgShift = $pdo->prepare("UPDATE images SET S_no = ? WHERE loco_id = ? AND TRIM(S_no) = ?");
            $imgShift->execute([$newSno, $locoID, $oldSno]);
        }

        // Pass 2: Robust Text-based matching (handles severely corrupted S_no values)
        $textCheck = $pdo->prepare("SELECT id, S_no, observation_text FROM loco_antenna_and_gps_gsm_antenna WHERE loco_id = ? AND (S_no LIKE '8.%' OR S_no LIKE '14.%' OR S_no LIKE '8.0.%')");
        $textCheck->execute([$locoID]);
        foreach ($textCheck->fetchAll() as $row) {
            $text = $row['observation_text'] ?? '';
            $newSno = null;
            if ($text !== '' && strpos($text, 'securely clamped to the roof using clamps welded to the rooftop') !== false) {
                $newSno = '8.13.1';
            } elseif ($text !== '' && strpos($text, 'conduit is routed into the Loco cabin through the elbow pipe') !== false) {
                $newSno = '8.13.2';
            } elseif ($text !== '' && strpos($text, 'conduit pipe and elbow are sourced from the Loco Kavach') !== false) {
                $newSno = '8.13.3';
            } elseif ($text !== '' && strpos($text, 'RTV Silicone compound') !== false) {
                $newSno = '8.13.4';
            }
            
            if ($newSno && $row['S_no'] !== $newSno) {
                $pdo->prepare("UPDATE loco_antenna_and_gps_gsm_antenna SET S_no = ? WHERE id = ?")->execute([$newSno, $row['id']]);
                $pdo->prepare("UPDATE images SET S_no = ? WHERE loco_id = ? AND TRIM(S_no) = ?")->execute([$newSno, $locoID, trim($row['S_no'])]);
            }
        }
        
        $upsertMeta2 = $pdo->prepare("INSERT INTO migration_meta (loco_id, section8_subrows_migrated) VALUES (?,1) ON DUPLICATE KEY UPDATE section8_subrows_migrated=1");
        $upsertMeta2->execute([$locoID]);
    }
    // -------------------------------------------------------------------

    $shedCondition = "shed_name = ?";
    $shedParams = [$shedName];
    if (strpos($shedName, 'Vadodara') !== false || strpos($shedName, 'Vadodhara') !== false || strpos($shedName, '(BRC)') !== false) {
        $shedCondition = "(shed_name LIKE '%Vadodara%' OR shed_name LIKE '%Vadodhara%' OR shed_name LIKE '%(BRC)%')";
        $shedParams = [];
    } elseif (strpos($shedName, 'Vatva') !== false || strpos($shedName, '(VTA)') !== false) {
        $shedCondition = "(shed_name LIKE '%Vatva%' OR shed_name LIKE '%(VTA)%')";
        $shedParams = [];
    }

    $locoQuery = "SELECT loco_id, loco_type, brake_type, railway_division, shed_name, inspection_date FROM loco WHERE loco_id = ? AND railway_division = ? AND $shedCondition";
    $locoStmt = $pdo->prepare($locoQuery);
    $params = array_merge([$locoID, $railwayDivision], $shedParams);
    $locoStmt->execute($params);
    $locoDetails = $locoStmt->fetch();

    if (!$locoDetails) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Loco details not found.']);
        exit;
    }

    $tableNames = [
        'document_verification_table', 'verify_serial_numbers_of_equipment_as_per_ic',
        'loco_kavach', 'emi_filter_box', 'rib_cab_input_box', 'dmi_lp_ocip',
        'rfid_ps_unit', 'loco_antenna_and_gps_gsm_antenna', 'pneumatic_fittings_and_ep_valve_cocks_fixing',
        'pressure_sensors_installation_in_loco', 'iru_faviely_units_fixing_for_e70_type_loco',
        'psjb_tpm_units_fixing_for_ccb_type_loco', 'sifa_valve_fixing_for_ccb_type_loco',
        'pgs_and_speedo_meter_units_fixing', 'rfid_reader_assembly', 'earthing', 'radio_power'
    ];

    $observations = [];

    // Fetch all images for this loco
    $imageQuery = "SELECT S_no, image_path FROM images WHERE loco_id = ?";
    $imageStmt = $pdo->prepare($imageQuery);
    $imageStmt->execute([$locoID]);
    $allImages = $imageStmt->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_COLUMN);

    // Go through each observation table
    foreach ($tableNames as $tableName) {
        $barcodeSelect = ($tableName === 'verify_serial_numbers_of_equipment_as_per_ic') ? ', barcode' : ', NULL as barcode';
        $query = "SELECT S_no, observation_text, remarks, observation_status, section_id $barcodeSelect
                  FROM $tableName
                  WHERE loco_id = ? AND railway_division = ? AND $shedCondition
                  ORDER BY
                    CAST(SUBSTRING_INDEX(S_no, '.', 1) AS UNSIGNED),
                    CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(S_no, '.', 2), '.', -1) AS UNSIGNED),
                    CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(S_no, '.', 3), '.', -1) AS UNSIGNED),
                    CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(S_no, '.', 4), '.', -1) AS UNSIGNED)";
        $stmt = $pdo->prepare($query);
        $stmt->execute(array_merge([$locoID, $railwayDivision], $shedParams));
        $tableObservations = $stmt->fetchAll();

        foreach ($tableObservations as &$obs) {
            $imagesForThisSno = $allImages[$obs['S_no']] ?? [];

            $validImages = [];
            foreach ($imagesForThisSno as $imagePath) {
                if ($imagePath && file_exists(__DIR__ . '/' . $imagePath) && strpos($imagePath, 'uploads/') === 0) {
                    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
                    $host = $_SERVER['HTTP_HOST'];
                    $validImages[] = $protocol . $host . "/QCCHECKLIST/" . $imagePath;
                }
            }

            $obs['images'] = $validImages;
        }

        $observations = array_merge($observations, $tableObservations);
    }

    echo json_encode([
        'success' => true,
        'locoDetails' => $locoDetails,
        'observations' => $observations
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    $errorMsg = 'Database error: ' . $e->getMessage();
    file_put_contents('generateReport_error.log', date('Y-m-d H:i:s') . " - " . $errorMsg . "\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => $errorMsg]);
} catch (Exception $e) {
    http_response_code(500);
    $errorMsg = 'General error: ' . $e->getMessage();
    file_put_contents('generateReport_error.log', date('Y-m-d H:i:s') . " - " . $errorMsg . "\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => $errorMsg]);
} catch (Error $e) {
    http_response_code(500);
    $errorMsg = 'Fatal error: ' . $e->getMessage();
    file_put_contents('generateReport_error.log', date('Y-m-d H:i:s') . " - " . $errorMsg . "\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => $errorMsg]);
}
?>
