<?php
date_default_timezone_set("Asia/Kolkata");
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (
            isset($_POST['loco-id'], $_POST['section-id'], $_POST['observations'],
                  $_POST['loco-type'], $_POST['brake-type'],
                  $_POST['railway-division'], $_POST['shed-name'], $_POST['inspection-date'])
        ) {
            // Database connection
            $pdo = new PDO('mysql:host=localhost;dbname=loco_info', 'root', 'Hbl@1234');
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Fetch form data
            $locoID = $_POST['loco-id'];
            $sectionID = $_POST['section-id'];
            $locoType = $_POST['loco-type'];
            $brakeType = $_POST['brake-type'];
            $railwayDivision = $_POST['railway-division'];
            $shedName = $_POST['shed-name'];
            $inspectionDate = $_POST['inspection-date'];
            $observations = json_decode($_POST['observations'], true);

            // Validate observations data
            if (!$observations || !is_array($observations)) {
                echo json_encode(['success' => false, 'message' => 'Invalid observation data']);
                exit;
            }

            // Function to format observations dynamically
            function formatObservations($label, $values) {
                $valueArray = preg_split('/\s+/', trim($values)); // Split on spaces
                $formattedValues = [];
            
                foreach ($valueArray as $index => $value) {
                    $formattedValues[] = "{$label} " . ($index + 1) . ": {$value}";
                }
            
                return implode(", ", $formattedValues);
            }

            $formattedObservations = [];

            $timestmt=$pdo->prepare("SELECT * FROM initial_time WHERE loco_id=? AND section_id=?");
            $timestmt->execute([$locoID,$sectionID]);
            $row = $timestmt->fetch(PDO::FETCH_ASSOC);

            if($row && !empty($row['initial_time'])) {
                $createdAt = $row['initial_time'];
            } else {
                // Fallback: if no record found, use current timestamp
                $createdAt = date("Y-m-d H:i:s");
            }

            
            // Prepare SQL statement
            $sql = "INSERT INTO verify_serial_numbers_of_equipment_as_per_ic (
                loco_id, loco_type, brake_type, railway_division, shed_name,
                inspection_date, observation_text, remarks, S_no,
                observation_status, section_id, created_at,updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,NOW())";
            
            $stmt = $pdo->prepare($sql);

            // Loop through each observation
            foreach ($observations as $obs) {
                $imagePath = isset($obs['image_path']) ? htmlspecialchars($obs['image_path']) : null;
                
                 

                $stmt->execute([
                    $locoID, $locoType, $brakeType, $railwayDivision, $shedName, $inspectionDate,
                    htmlspecialchars($obs['observation_text']),
                    htmlspecialchars($obs['remarks']),
                    htmlspecialchars($obs['S_no']),
                    htmlspecialchars($obs['observation_status']),
                    $sectionID,
                    $createdAt
        
                ]);

                // Format observation text dynamically
                $formattedObservations[] = formatObservations($obs['observation_text'], $obs['S_no']);

                // Update images in the images table:
                if (!empty($obs['image_paths']) && is_array($obs['image_paths'])) {
                    $deleteStmt = $pdo->prepare("DELETE FROM images WHERE loco_id = ? AND s_no = ?");
                    $deleteStmt->execute([$locoID, $obs['S_no']]);

                    foreach ($obs['image_paths'] as $imgPath) {
                        $imgStmt = $pdo->prepare("INSERT INTO images (entity_type, loco_id, s_no, image_path, created_at) VALUES (?, ?, ?, ?, ?)");
                        $imgStmt->execute(['radio_power', $locoID, $obs['S_no'], $imgPath,$createdAt]);
                    }
                }
            }

            echo json_encode([
                'success' => true, 
                'message' => 'Observations and images saved successfully.',
                'formattedObservations' => $formattedObservations,
                'sectionId'=>$sectionID,
                'locoId'=>$locoID                        
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Missing fields']);
        }
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>


