<?php 
// Set the content type to JSON
header('Content-Type: application/json');

// Allow cross-origin requests if needed
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Check if the request method is POST and if loco-id is set
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['loco-id'])) {
        $locoID = htmlspecialchars($_POST['loco-id']);

        try {
            // Database connection
            $pdo = new PDO('mysql:host=localhost;dbname=loco_info', 'root', 'Hbl@1234');
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Query to fetch loco details (assuming these are unique per loco_id)
            $locoDetailsQuery = "SELECT loco_id, loco_type, brake_type, railway_division, shed_name 
                                 FROM observations 
                                 WHERE loco_id = ? 
                                 LIMIT 1"; // Fetch only one record for loco details
            $locoDetailsStmt = $pdo->prepare($locoDetailsQuery);
            $locoDetailsStmt->execute([$locoID]);
            $locoDetails = $locoDetailsStmt->fetch(PDO::FETCH_ASSOC);

            // Query to fetch all observations for the loco_id
            $observationsQuery = "SELECT S_no, observation_text, remarks, image_path, observation_status 
                                  FROM observations 
                                  WHERE loco_id = ?";
            $observationsStmt = $pdo->prepare($observationsQuery);
            $observationsStmt->execute([$locoID]);
            $observations = $observationsStmt->fetchAll(PDO::FETCH_ASSOC);

            // Check if any data exists
            if ($locoDetails && count($observations) > 0) {
                // Return both loco details and observations
                echo json_encode([
                    'success' => true,
                    'locoDetails' => $locoDetails,
                    'observations' => $observations
                ]);
            } else {
                // Handle case where no data is found
                echo json_encode(['success' => false, 'message' => 'No data found for this loco ID.']);
            }
        } catch (PDOException $e) {
            // Return a database error message
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        // Handle case where loco-id is missing
        echo json_encode(['success' => false, 'message' => 'Loco ID is missing.']);
    }
}
?>







