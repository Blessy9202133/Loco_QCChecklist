<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['report_id']) && isset($_POST['updated_text'])) {
        $report_id = $_POST['report_id'];
        $updated_text = $_POST['updated_text'];

        try {
            $pdo = new PDO("mysql:host=localhost;dbname=loco_info", 'root', 'Hbl@1234');
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Save the updated text back to the database (you can also store the edited file, if needed)
            $stmt = $pdo->prepare("UPDATE report SET file_content = ? WHERE id = ?");
            $stmt->execute([$updated_text, $report_id]);

            echo "Report updated successfully!";
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
        }
    }
}
?>
