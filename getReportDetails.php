<?php
header('Content-Type: application/json');

// Check if 'loco_id' is set in the query parameters
if (isset($_GET['loco_id'])) {
    $locoId = $_GET['loco_id'];  // Get the loco ID from URL

    try {
        // Database connection
        $pdo = new PDO("mysql:host=localhost;dbname=loco_info", 'root', 'Hbl@1234');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Fetch the report using loco_id
        $stmtReport = $pdo->prepare("SELECT * FROM report WHERE loco_id = :loco_id");
        $stmtReport->bindParam(':loco_id', $locoId, PDO::PARAM_INT);
        $stmtReport->execute();
        $report = $stmtReport->fetch(PDO::FETCH_ASSOC);

        if ($report) {
            // Array to hold all observations
            $observations = [];

            // Loop through all 17 tables to fetch observations related to loco_id
            for ($section = 1; $section <= 17; $section++) {
                $stmtObs = $pdo->prepare("SELECT * FROM section{$section}_observations WHERE loco_id = :loco_id");
                $stmtObs->bindParam(':loco_id', $locoId, PDO::PARAM_INT);
                $stmtObs->execute();
                $sectionObservations = $stmtObs->fetchAll(PDO::FETCH_ASSOC);

                if ($sectionObservations) {
                    // Add observations from this section
                    $observations["section{$section}"] = $sectionObservations;
                }
            }

            // Attach the observations to the report
            $report['observations'] = $observations;

            echo json_encode(['success' => true, 'report' => $report]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Report not found for this loco.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request. Loco ID is required.']);
}
?>
