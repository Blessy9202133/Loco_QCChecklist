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
    // Connect to separate HHP database: hhp_loco_info
    $pdo = new PDO('mysql:host=localhost;dbname=hhp_loco_info', 'root', 'Hbl@1234', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Query locomotive details
    $locoStmt = $pdo->prepare("SELECT Loco_Id AS loco_id, Loco_Id AS locoID, Loco_type AS loco_type, Loco_type AS locoType, Brake_type AS brake_type, Brake_type AS brakeType, Railway_Division AS railway_division, Railway_Division AS railwayDivision, Shed_name AS shed_name, Shed_name AS shedName, inspection_Date AS inspection_date, inspection_Date AS inspectionDate FROM loco WHERE Loco_Id = ?");
    $locoStmt->execute([$locoID]);
    $locoDetails = $locoStmt->fetch();

    if (!$locoDetails) {
        echo json_encode(['success' => false, 'message' => "No locomotive found with ID $locoID"]);
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

    $allObservations = [];

    foreach ($tableNames as $tbl) {
        $barcodeSelect = ($tbl === 'verify_serial_numbers_of_equipment_as_per_ic') ? ', barcode' : ', NULL as barcode';
        $stmt = $pdo->prepare("SELECT S_no, observation_text, observation_status, remarks, image_path, created_at, updated_at, section_id $barcodeSelect FROM $tbl WHERE loco_id = ?");
        $stmt->execute([$locoID]);
        $rows = $stmt->fetchAll();

        foreach ($rows as $row) {
            $s_no = $row['S_no'];
            $imgStmt = $pdo->prepare("SELECT image_path FROM images WHERE loco_id = ? AND s_no = ?");
            $imgStmt->execute([$locoID, $s_no]);
            $imgRows = $imgStmt->fetchAll(PDO::FETCH_COLUMN);

            $imgPaths = !empty($imgRows) ? $imgRows : array_filter(array_map('trim', explode(',', $row['image_path'] ?? '')));

            $allObservations[] = [
                'S_no' => $row['S_no'],
                'observation_text' => $row['observation_text'],
                'observation_status' => $row['observation_status'],
                'remarks' => $row['remarks'],
                'image_path' => !empty($imgPaths) ? implode(',', $imgPaths) : $row['image_path'],
                'image_paths' => array_values($imgPaths),
                'images' => array_values($imgPaths),
                'barcode' => $row['barcode'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'section_id' => $row['section_id']
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'locoDetails' => $locoDetails,
        'observations' => $allObservations
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
