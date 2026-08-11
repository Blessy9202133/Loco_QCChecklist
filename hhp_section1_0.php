<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['loco-id'], $_POST['section-id'], $_POST['observations'], $_POST['loco-type'], $_POST['brake-type'], $_POST['railway-division'], $_POST['shed-name'], $_POST['inspection-date'])) {
        
        $locoID = htmlspecialchars($_POST['loco-id']);
        $sectionID = htmlspecialchars($_POST['section-id']);
        $locoType = htmlspecialchars($_POST['loco-type']);
        $brakeType = htmlspecialchars($_POST['brake-type']);
        $railwayDivision = htmlspecialchars($_POST['railway-division']);
        $shedName = htmlspecialchars($_POST['shed-name']);
        $inspectionDate = htmlspecialchars($_POST['inspection-date']);

            // Automatic lookup for locoType, brakeType, inspectionDate from master loco table if empty
            if (empty($locoType) || empty($brakeType) || empty($inspectionDate)) {
                $lookupStmt = $pdo->prepare("SELECT Loco_type, Brake_type, inspection_Date FROM loco WHERE Loco_Id = ?");
                $lookupStmt->execute([$locoID]);
                $locoMaster = $lookupStmt->fetch(PDO::FETCH_ASSOC);
                if ($locoMaster) {
                    if (empty($locoType)) $locoType = $locoMaster['Loco_type'];
                    if (empty($brakeType)) $brakeType = $locoMaster['Brake_type'];
                    if (empty($inspectionDate)) $inspectionDate = $locoMaster['inspection_Date'];
                }
            }
        $observations = json_decode($_POST['observations'], true);
        error_log(print_r($observations, true)); // Logs observations array in the PHP error log


        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(['success' => false, 'message' => 'Error: Invalid JSON format for observations.']);
            exit;
        }

        if (empty($observations)) {
            echo json_encode(['success' => false, 'message' => 'Error: No observations to save.']);
            exit;
        }

        try {
            $pdo = new PDO('mysql:host=localhost;dbname=hhp_loco_info', 'root', 'Hbl@1234');
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $timestmt=$pdo->prepare("SELECT * FROM initial_time WHERE loco_id=? AND section_id=?");
            $timestmt->execute([$locoID,$sectionID]);
            $row = $timestmt->fetch(PDO::FETCH_ASSOC);

            if($row && !empty($row['initial_time'])) {
                $createdAt = $row['initial_time'];
            } else {
                // Fallback: if no record found, use current timestamp
                $createdAt = date("Y-m-d H:i:s");
            }

            $sql = "INSERT INTO document_verification_table 
(loco_id, loco_type, brake_type, railway_division, shed_name, inspection_date, observation_text, remarks, S_no, image_path, observation_status, section_id, created_at, updated_at) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, ''), ?, ?, ?, NOW())";


            $delStmt = $pdo->prepare("DELETE FROM `document_verification_table` WHERE loco_id = ?");
            $delStmt->execute([$locoID]);

            $stmt = $pdo->prepare($sql);

            foreach ($observations as $observation) {
                // Check if image path exists and is not empty
                
                $imagePath = null;
                $imgPathsArr = [];
                if (!empty($observation['image_paths']) && is_array($observation['image_paths'])) {
                    $imgPathsArr = $observation['image_paths'];
                    $imagePath = implode(',', $imgPathsArr);
                } else if (!empty($observation['image_path'])) {
                    $imagePath = htmlspecialchars($observation['image_path']);
                    $imgPathsArr = array_filter(array_map('trim', explode(',', $imagePath)));
                }

                if (!empty($imgPathsArr)) {
                    $deleteImgStmt = $pdo->prepare("DELETE FROM images WHERE loco_id = ? AND s_no = ?");
                    $deleteImgStmt->execute([$locoID, $observation['S_no']]);

                    $insertImgStmt = $pdo->prepare("INSERT INTO images (entity_type, loco_id, s_no, image_path, created_at) VALUES (?, ?, ?, ?, ?)");
                    foreach ($imgPathsArr as $imgPath) {
                        $insertImgStmt->execute(['hhp_section', $locoID, $observation['S_no'], $imgPath, $createdAt]);
                    }
                }

                $stmt->execute([
                    $locoID, $locoType, $brakeType, $railwayDivision, $shedName, $inspectionDate,
                    htmlspecialchars($observation['observation_text']),
                    htmlspecialchars($observation['remarks']),
                    htmlspecialchars($observation['S_no']),
                    $imagePath, // Store the image path if available
                    htmlspecialchars($observation['observation_status']),
                    $sectionID,
                    $createdAt
                ]);
            }

            // Debugging Console Log
            echo json_encode([
                'success' => true, 
                'message' => 'Observations and images saved successfully.',
                'console_log' => "<script>console.log('Observations:', " . json_encode($observations) . ");</script>"
            ]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error saving observations: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing necessary POST data']);
    }
}
?>
