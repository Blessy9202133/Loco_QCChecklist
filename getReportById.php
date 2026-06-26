<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

// Validate we have a 'loco_id' parameter
if (!isset($_GET['loco_id']) || empty($_GET['loco_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing loco_id parameter.'
    ]);
    exit;
}

$locoId = $_GET['loco_id'];

try {
    // Connect to the database
    $pdo = new PDO("mysql:host=localhost;dbname=loco_info;charset=utf8mb4", "root", "Hbl@1234", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Fetch the locomotive details from the 'loco' table using loco_id
    $stmt = $pdo->prepare("
        SELECT Loco_Id, Loco_type, Brake_type, Railway_Division, Shed_name, inspection_Date 
        FROM loco
        WHERE Loco_Id = :locoId
    ");
    $stmt->execute([':locoId' => $locoId]);
    $locoDetails = $stmt->fetch();

    if (!$locoDetails) {
        echo json_encode([
            'success' => false,
            'message' => "No locomotive details found for loco_id: $locoId"
        ]);
        exit;
    }

    // Transform the keys into a more JavaScript-friendly format
    $transformed = [
        'locoID'          => $locoDetails['Loco_Id'],
        'locoType'        => $locoDetails['Loco_type'],
        'brakeType'       => $locoDetails['Brake_type'],
        'railwayDivision' => $locoDetails['Railway_Division'],
        'shedName'        => $locoDetails['Shed_name'],
        'inspectionDate'  => $locoDetails['inspection_Date']
    ];

    // Return the JSON response
    echo json_encode([
        'success' => true,
        'data' => [
            'locoDetails' => $transformed
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
