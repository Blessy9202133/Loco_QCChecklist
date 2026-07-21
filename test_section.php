<?php
$_POST = [
    'loco-id' => '44467',
    'section-id' => '8.0',
    'loco-type' => '',
    'brake-type' => '',
    'railway-division' => '',
    'shed-name' => '',
    'inspection-date' => '',
    'observations' => json_encode([
        [
            'S_no' => '8.1',
            'observation_text' => 'Verify RF Antenna <= 310mm',
            'remarks' => '',
            'observation_status' => 'Yes',
            'image_paths' => []
        ]
    ])
];
$_SERVER['REQUEST_METHOD'] = 'POST';
include 'section8_0.php';
