<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

if (!isset($_GET['loco_id']) || empty($_GET['loco_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing loco_id parameter.'
    ]);
    exit;
}

$locoId = $_GET['loco_id'];

try {
    $pdo = new PDO("mysql:host=localhost;dbname=hhp_loco_info;charset=utf8mb4", "root", "Hbl@1234", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

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
            'message' => "No HHP locomotive details found for loco_id: $locoId"
        ]);
        exit;
    }

    $transformed = [
        'locoID'          => $locoDetails['Loco_Id'],
        'locoType'        => $locoDetails['Loco_type'],
        'brakeType'       => $locoDetails['Brake_type'],
        'railwayDivision' => $locoDetails['Railway_Division'],
        'shedName'        => $locoDetails['Shed_name'],
        'inspectionDate'  => $locoDetails['inspection_Date']
    ];

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
