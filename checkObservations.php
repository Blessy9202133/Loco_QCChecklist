<?php
header("Content-Type: application/json");

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Database connection details
$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "loco_info";

// Create database connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    // Return error if connection fails
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Get JSON input from the request body
$data = json_decode(file_get_contents("php://input"), true);

// Debugging: Log received data for further analysis
file_put_contents("debug_log.txt", "Received Data: " . print_r($data, true) . "\n", FILE_APPEND);

// Check if all required parameters are present in the received data
if (!isset($data["locoId"], $data["shedName"], $data["railwayDivision"], $data["sectionId"])) {
    // Return error if any required parameter is missing
    echo json_encode([
        "error" => "Missing required parameters",
        "received" => $data
    ]);
    exit;
}

$locoId = $data["locoId"];
$shedName = $data["shedName"];
$railwayDivision = $data["railwayDivision"];
$sectionId = (int) $data["sectionId"]; // Ensure the sectionId is treated as an integer

// Debugging: Log the received section ID
file_put_contents("debug_log.txt", "Received Section ID: $sectionId\n", FILE_APPEND);

// Define table names associated with each section ID
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

// Check if the provided section ID is valid
if (!isset($tableNames[$sectionId])) {
    // Return error if section ID is invalid
    echo json_encode([
        "error" => "Invalid section ID",
        "valid_sections" => array_keys($tableNames)
    ]);
    exit;
}

$table = $tableNames[$sectionId];

// Prepare SQL query to check if observations exist in the table
$checkQuery = "SELECT COUNT(*) as count FROM $table WHERE loco_id = ? AND shed_name = ? AND railway_division = ?";
$checkStmt = $conn->prepare($checkQuery);
$checkStmt->bind_param("sss", $locoId, $shedName, $railwayDivision);
$checkStmt->execute();

// Fetch result and determine if any observations exist
$row = $checkStmt->get_result()->fetch_assoc();
$exists = $row["count"] > 0;

// Return response as JSON, indicating whether the section is filled or empty
echo json_encode([
    "exists" => $exists,
    "sectionId" => $sectionId,
    "message" => $exists ? "Section is filled" : "Section is empty"
]);

// Close the database connection
$conn->close();
?>
