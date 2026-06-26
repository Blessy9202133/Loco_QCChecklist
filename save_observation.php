<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

// DB Connection
$conn = new mysqli("localhost", "root", "Hbl@1234", "loco_info");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Validate input
$required = ['S_no', 'observation_text', 'observation_status', 'remarks', 'section_id', 'loco_id'];
foreach ($required as $field) {
    if (empty($_POST[$field]) && $_POST[$field] !== "0") {
        echo json_encode(["success" => false, "message" => "Missing: $field"]);
        exit;
    }
}

$S_no = intval($_POST['S_no']);
$observation_text = $_POST['observation_text'];
$observation_status = $_POST['observation_status'];
$remarks = $_POST['remarks'];
$section_id = intval($_POST['section_id']);
$loco_id = intval($_POST['loco_id']);

$table_mapping = [
    1 => "document_verification_table",
    2 => "verify_serial_numbers_of_equipment_as_per_ic",
    3 => "loco_kavach",
    4 => "emi_filter_box",
    5 => "rib_cab_input_box",
    6 => "dmi_lp_ocip",
    7 => "rfid_ps_unit",
    8 => "loco_antenna_and_gps_gsm_antenna",
    9 => "pneumatic_fittings_and_ep_valve_cocks_fixing",
    10 => "pressure_sensors_installation_in_loco",
    11 => "iru_faviely_units_fixing_for_e70_type_loco",
    12 => "psjb_tpm_units_fixing_for_ccb_type_loco",
    13 => "sifa_valve_fixing_for_ccb_type_loco",
    14 => "pgs_and_speedo_meter_units_fixing",
    15 => "rfid_reader_assembly",
    16 => "earthing",
    17 => "radio_power"
];

if (!isset($table_mapping[$section_id])) {
    echo json_encode(["success" => false, "message" => "Invalid section ID"]);
    exit;
}

$table_name = $table_mapping[$section_id];
$image_path = null;

// Handle file upload
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = "uploads/";
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

    $filename = time() . "_" . basename($_FILES['image']['name']);
    $target = $upload_dir . $filename;

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
        echo json_encode(["success" => false, "message" => "Image upload failed"]);
        exit;
    }
    $image_path = $target;
}

// Check if record exists
$sql_check = "SELECT COUNT(*) AS cnt FROM $table_name WHERE S_no = ? AND loco_id = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("ii", $S_no, $loco_id);
$stmt_check->execute();
$result = $stmt_check->get_result()->fetch_assoc();
$stmt_check->close();

$exists = $result['cnt'] > 0;

if ($exists) {
    // UPDATE
    $sql = "UPDATE $table_name SET observation_text = ?, observation_status = ?, remarks = ?";
    if ($image_path !== null) $sql .= ", image_path = ?";
    $sql .= " WHERE S_no = ? AND loco_id = ?";

    $stmt = $conn->prepare($sql);
    if ($image_path !== null) {
        $stmt->bind_param("ssssii", $observation_text, $observation_status, $remarks, $image_path, $S_no, $loco_id);
    } else {
        $stmt->bind_param("sssii", $observation_text, $observation_status, $remarks, $S_no, $loco_id);
    }
} else {
    // INSERT
    $sql = "INSERT INTO $table_name (S_no, loco_id, observation_text, observation_status, remarks, image_path)
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iissss", $S_no, $loco_id, $observation_text, $observation_status, $remarks, $image_path);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => $exists ? "Updated" : "Inserted"]);
} else {
    echo json_encode(["success" => false, "message" => "DB Error: " . $stmt->error]);
}
$stmt->close();
$conn->close();
?>
