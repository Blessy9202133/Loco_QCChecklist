<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$tableNames = [
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

$sectionIndex = $_POST['section_index'] ?? null;
if (!isset($tableNames[(int)$sectionIndex])) {
    echo json_encode(['success' => false, 'message' => 'Invalid or missing section index.']);
    exit;
}
$tableName = $tableNames[(int)$sectionIndex];

$locoId = trim($_POST['loco-id'] ?? '');
$sectionId = trim($_POST['section-id'] ?? '');
$locoType = trim($_POST['loco-type'] ?? '');
$brakeType = trim($_POST['brake-type'] ?? '');
$railwayDivision = trim($_POST['railway-division'] ?? '');
$shedName = trim($_POST['shed-name'] ?? '');
$inspectionDate = trim($_POST['inspection-date'] ?? '');
$observationsJson = $_POST['observations'] ?? '';

if (empty($locoId) || empty($sectionId) || empty($observationsJson)) {
    echo json_encode(['success' => false, 'message' => 'Missing required data.']);
    exit;
}

$observations = json_decode($observationsJson, true);
if (!$observations || !is_array($observations)) {
    echo json_encode(['success' => false, 'message' => 'Invalid observations format.']);
    exit;
}

try {
    $pdo = new PDO("mysql:host=localhost;dbname=loco_info;charset=utf8mb4", "root", "Hbl@1234", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed: ' . $e->getMessage()]);
    exit;
}

$debugInfo = []; // Array to hold debug information per observation.

try {
    $pdo->beginTransaction();

    foreach ($observations as $obs) {
        $s_no = $obs['S_no'];
        $remarks = $obs['remarks'] ?? '';
        $status = $obs['observation_status'] ?? '';
        $newBarcode = trim($obs['barcode'] ?? '');
        $newHeight = trim($obs['height'] ?? '');
        $clientObservationText = trim($obs['observation_text'] ?? '');
        $image_paths = $obs['image_paths'] ?? []; // Get image paths from the observation

        // Get existing observation_text (which holds description and barcode) if any.
        $check = $pdo->prepare("SELECT observation_text FROM $tableName WHERE loco_id = ? AND section_id = ? AND s_no = ?");
        $check->execute([$locoId, $sectionId, $s_no]);
        $existing = $check->fetch();

        $debugEntry = [
            'S_no' => $s_no,
            'newBarcode_input' => $newBarcode,
            'newHeight_input' => $newHeight,
            'clientObservationText' => $clientObservationText,
            'action' => '',
            'existing_observation_text' => ''
        ];

        if ($existing) {
            $existingText = trim($existing['observation_text']);
            $debugEntry['existing_observation_text'] = $existingText;

            // Use the client-provided observation text when available.
            $updatedDescription = $clientObservationText !== '' ? $clientObservationText : $existingText;

            if ($tableName === 'loco_antenna_and_gps_gsm_antenna' && in_array($s_no, ['8.1', '8.2', '8.3', '8.4', '8.5', '8.6'])) {
                // Normalize and ensure ending punctuation for section 8 height rows.
                $updatedDescription = str_replace(['≤', '&lt;='], '<=', $updatedDescription);
                if ($updatedDescription !== '' && substr($updatedDescription, -1) !== '.') {
                    $updatedDescription .= '.';
                }

                if ($newHeight !== '') {
                    $observation_text = trim(preg_replace('/\s*(\d+)?$/', '', $updatedDescription)) . ' ' . $newHeight;
                } else {
                    $observation_text = trim($updatedDescription);
                }
            } else {
                if (preg_match('/^(.*):\s*(\d{10,15})$/', $existingText, $matches)) {
                    $existingDescription = trim($matches[1]);
                    $existingBarcode = trim($matches[2]);
                } else {
                    $existingDescription = $existingText;
                    $existingBarcode = '';
                }

                if ($newBarcode === '') {
                    $newBarcode = $existingBarcode;
                }

                if ($newBarcode !== '') {
                    if ($tableName === 'verify_serial_numbers_of_equipment_as_per_ic') {
                        $observation_text = trim($updatedDescription);
                    } else {
                        $baseDescription = $clientObservationText !== '' ? $clientObservationText : $existingDescription;
                        $observation_text = trim($baseDescription) . ': ' . $newBarcode;
                    }
                } else {
                    $observation_text = trim($updatedDescription);
                }
            }

            // Update record in database.
            if ($tableName === 'verify_serial_numbers_of_equipment_as_per_ic') {
                $update = $pdo->prepare("
                    UPDATE $tableName
                    SET loco_type = ?, brake_type = ?, railway_division = ?, shed_name = ?, inspection_date = ?, observation_text = ?, barcode = ?, observation_status = ?, remarks = ?, updated_at = NOW()
                    WHERE loco_id = ? AND section_id = ? AND s_no = ?
                ");
                $update->execute([$locoType, $brakeType, $railwayDivision, $shedName, $inspectionDate, $observation_text, $newBarcode, $status, $remarks, $locoId, $sectionId, $s_no]);
            } else {
                $update = $pdo->prepare("\
                    UPDATE $tableName
                    SET loco_type = ?, brake_type = ?, railway_division = ?, shed_name = ?, inspection_date = ?, observation_text = ?, observation_status = ?, remarks = ?, updated_at = NOW()
                    WHERE loco_id = ? AND section_id = ? AND s_no = ?
                ");
                $update->execute([$locoType, $brakeType, $railwayDivision, $shedName, $inspectionDate, $observation_text, $status, $remarks, $locoId, $sectionId, $s_no]);
            }

            $debugEntry['action'] = 'updated';
            
            // Handle image updates if provided.
            if (!empty($image_paths) && is_array($image_paths)) {
                // Delete existing images for this observation.
                $deleteStmt = $pdo->prepare("DELETE FROM images WHERE loco_id = ? AND s_no = ?");
                $deleteStmt->execute([$locoId, $s_no]);

                // Insert the new images.
                foreach ($image_paths as $imgPath) {
                    $imgStmt = $pdo->prepare("INSERT INTO images (entity_type, loco_id, s_no, image_path, created_at) VALUES (?, ?, ?, ?, NOW())");
                    $imgStmt->execute(['radio_power', $locoId, $s_no, $imgPath]);
                }
            }
        } else {
            // No existing record: Insert a new record.
            if ($tableName === 'verify_serial_numbers_of_equipment_as_per_ic') {
                $insert = $pdo->prepare("
                    INSERT INTO $tableName 
                        (loco_id, section_id, s_no, observation_text, barcode, observation_status, remarks, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ");
                // The frontend sends description in observation_text (which we don't have here from DB)
                // We'll leave observation_text empty, or you could pass it from the JS if needed
                $insert->execute([$locoId, $sectionId, $s_no, '', $newBarcode, $status, $remarks]);
            } else {
                $insert = $pdo->prepare("
                    INSERT INTO $tableName 
                        (loco_id, section_id, s_no, loco_type, brake_type, railway_division, shed_name, inspection_date, observation_text, observation_status, remarks, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ");

                $insertObservationText = trim($clientObservationText);

                if ($tableName === 'loco_antenna_and_gps_gsm_antenna' && in_array($s_no, ['8.1', '8.2', '8.3', '8.4', '8.5', '8.6'])) {
                    $insertObservationText = str_replace(['≤', '&lt;='], '<=', $insertObservationText);
                    if ($insertObservationText !== '' && substr($insertObservationText, -1) !== '.') {
                        $insertObservationText .= '.';
                    }
                    if ($newHeight !== '') {
                        $insertObservationText = trim(preg_replace('/\s*(\d+)?$/', '', $insertObservationText)) . ' ' . $newHeight;
                    }
                }

                if ($insertObservationText === '') {
                    $insertObservationText = $newHeight !== '' ? $newHeight : $insertObservationText;
                }

                $insert->execute([
                    $locoId,
                    $sectionId,
                    $s_no,
                    $locoType,
                    $brakeType,
                    $railwayDivision,
                    $shedName,
                    $inspectionDate,
                    $insertObservationText,
                    $status,
                    $remarks
                ]);

                $debugEntry['action'] = 'inserted';
                $debugEntry['finalHeight'] = $newHeight;

                if (!empty($image_paths) && is_array($image_paths)) {
                    foreach ($image_paths as $imgPath) {
                        $imgStmt = $pdo->prepare("INSERT INTO images (entity_type, loco_id, s_no, image_path, created_at) VALUES (?, ?, ?, ?, NOW())");
                        $imgStmt->execute(['radio_power', $locoId, $s_no, $imgPath]);
                    }
                }
            }
        }
        $debugInfo[] = $debugEntry;
    }
    
    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Observations and images updated successfully.', 'debug' => $debugInfo]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error updating observations: ' . $e->getMessage()]);
}
?>
