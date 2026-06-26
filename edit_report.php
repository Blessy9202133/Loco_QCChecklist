<?php
// Import the necessary classes
use Smalot\PdfParser\Parser;

require_once 'vendor/autoload.php';  // Ensure you include the Composer autoload file

// Your code to process the PDF
if (isset($_GET['report_id'])) {
    $report_id = $_GET['report_id'];

    try {
        $pdo = new PDO("mysql:host=localhost;dbname=loco_info", 'root', 'Hbl@1234');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->prepare("SELECT file_name FROM report WHERE id = ?");
        $stmt->execute([$report_id]);
        $report = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($report) {
            // Get the file path
            $pdf_path = 'uploads/reports/' . $report['file_name'];

            if (file_exists($pdf_path)) {
                // Parse the PDF
                $parser = new Parser();
                $pdf = $parser->parseFile($pdf_path);
                $pdf_text = $pdf->getText();
            } else {
                echo "File not found.";
                exit;
            }
        } else {
            echo "Report not found.";
            exit;
        }
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
}
?>

<!-- In HTML below, you can now display the content (extracted text) or populate form fields -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Report</title>
</head>
<body>
    <h2>Edit Report</h2>
    
    <!-- Display the extracted PDF text here -->
    <textarea rows="10" cols="50"><?= htmlspecialchars($pdf_text ?? '') ?></textarea>
    
    <!-- Optionally, you can allow the user to edit and submit the changes -->
    <form action="save_report.php" method="POST">
        <input type="hidden" name="report_id" value="<?= htmlspecialchars($report_id) ?>">
        <textarea name="updated_text" rows="10" cols="50"><?= htmlspecialchars($pdf_text ?? '') ?></textarea><br>
        <button type="submit">Save</button>
    </form>

</body>
</html>


