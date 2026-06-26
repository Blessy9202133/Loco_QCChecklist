<?php
session_start();

header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "loco_info";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'DB connection failed: ' . $conn->connect_error]);
    exit;
}

if (!isset($_GET['loco_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing loco_id']);
    exit;
}

$locoId = $conn->real_escape_string($_GET['loco_id']);

$tableNames = [
    "document_verification_table", "verify_serial_numbers_of_equipment_as_per_ic", "loco_kavach",
    "emi_filter_box", "rib_cab_input_box", "dmi_lp_ocip", "rfid_ps_unit",
    "loco_antenna_and_gps_gsm_antenna", "pneumatic_fittings_and_ep_valve_cocks_fixing",
    "pressure_sensors_installation_in_loco", "iru_faviely_units_fixing_for_e70_type_loco",
    "psjb_tpm_units_fixing_for_ccb_type_loco", "sifa_valve_fixing_for_ccb_type_loco",
    "pgs_and_speedo_meter_units_fixing", "rfid_reader_assembly", "earthing", "radio_power"
];

$observations = [];

foreach ($tableNames as $tableName) {
    $sql = "SELECT S_no, observation_text, observation_status, remarks, created_at, updated_at FROM $tableName WHERE loco_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $locoId);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $s_no = $row['S_no'];

        // Fetch associated images from `images` table for each S_no
        $imgStmt = $conn->prepare("SELECT image_path FROM images WHERE loco_id = ? AND s_no = ?");
        $imgStmt->bind_param("ss", $locoId, $s_no);
        $imgStmt->execute();
        $imgResult = $imgStmt->get_result();

        $imagePaths = [];
        while ($imgRow = $imgResult->fetch_assoc()) {
            $imagePaths[] = $imgRow['image_path'];
        }

       $observations[] = [
    'S_no' => $row['S_no'],
    'observation_text' => $row['observation_text'],
    'observation_status' => $row['observation_status'],
    'remarks' => $row['remarks'],
    'image_paths' => $imagePaths,
    'created_at' => $row['created_at'],
    'updated_at' => $row['updated_at']
];

    }
}

if (!empty($observations)) {
    echo json_encode(['status' => 'success', 'data' => $observations]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'No observations found']);
}

$conn->close();
?>
