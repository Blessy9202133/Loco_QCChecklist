<?php
header("Content-Type: application/json");

ini_set('display_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "hhp_loco_info";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["locoId"], $data["shedName"], $data["railwayDivision"], $data["sectionId"])) {
    echo json_encode([
        "error" => "Missing required parameters",
        "received" => $data
    ]);
    exit;
}

$locoId = $data["locoId"];
$shedName = $data["shedName"];
$railwayDivision = $data["railwayDivision"];
$sectionId = (int) $data["sectionId"];

$tableNames = [
    1 => 'document_verification_table',
    2 => 'verify_serial_numbers_of_equipment_as_per_ic',
    3 => 'loco_kavach',
    4 => 'emi_filter_box',
    5 => 'rib_cab_input_box',
    6 => 'dmi_lp_ocip',
    7 => 'rfid_ps_unit',
    8 => 'loco_antenna_and_gps_gsm_antenna',
    9 => 'pneumatic_fittings_and_ep_valve_cocks_fixing',
    10 => 'pressure_sensors_installation_in_loco',
    11 => 'iru_faviely_units_fixing_for_e70_type_loco',
    12 => 'psjb_tpm_units_fixing_for_ccb_type_loco',
    13 => 'sifa_valve_fixing_for_ccb_type_loco',
    14 => 'pgs_and_speedo_meter_units_fixing',
    15 => 'rfid_reader_assembly',
    16 => 'earthing',
    17 => 'radio_power'
];

if (!array_key_exists($sectionId, $tableNames)) {
    echo json_encode(["error" => "Invalid sectionId: $sectionId"]);
    exit;
}

$tableName = $tableNames[$sectionId];

$sql = "SELECT * FROM $tableName WHERE loco_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $locoId);
$stmt->execute();
$result = $stmt->get_result();

$observations = [];
while ($row = $result->fetch_assoc()) {
    $observations[] = $row;
}

if (count($observations) > 0) {
    echo json_encode([
        "status" => "exists",
        "observations" => $observations
    ]);
} else {
    echo json_encode([
        "status" => "not_found",
        "message" => "No observations found for section $sectionId"
    ]);
}

$stmt->close();
$conn->close();
?>
