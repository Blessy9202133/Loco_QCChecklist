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

    // Fetch loco details
    $locoQuery = "SELECT loco_id, loco_type, brake_type, railway_division, shed_name, inspection_date
                  FROM loco
                  WHERE loco_id = ? AND railway_division = ? AND shed_name = ?";
    $locoStmt = $pdo->prepare($locoQuery);
    $locoStmt->execute([$locoID, $railwayDivision, $shedName]);
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
        $query = "SELECT S_no, observation_text, remarks, observation_status, section_id
                  FROM $tableName
                  WHERE loco_id = ? AND railway_division = ? AND shed_name = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$locoID, $railwayDivision, $shedName]);
        $tableObservations = $stmt->fetchAll();

        foreach ($tableObservations as &$obs) {
            $imagesForThisSno = $allImages[$obs['S_no']] ?? [];

            $validImages = [];
            foreach ($imagesForThisSno as $imagePath) {
                if (file_exists(__DIR__ . '/' . $imagePath) && strpos($imagePath, 'uploads/') === 0) {
                    $validImages[] = "http://localhost/Qcchecklist/" . $imagePath;
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
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
