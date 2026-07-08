<?php
$file = 'generateReport.php';
$content = file_get_contents($file);

$search1 = '$locoStmt = $pdo->prepare($locoQuery);';
if (strpos($content, '$locoQuery = ') === false) {
    $replace1 = '$locoQuery = "SELECT loco_id, loco_type, brake_type, railway_division, shed_name, inspection_date FROM loco WHERE loco_id = ? AND railway_division = ? AND shed_name = ?";' . "\n    " . $search1;
    $content = str_replace($search1, $replace1, $content);
}

$search2 = "if (file_exists(__DIR__ . '/' . \$imagePath) && strpos(\$imagePath, 'uploads/') === 0)";
$replace2 = "if (\$imagePath && file_exists(__DIR__ . '/' . \$imagePath) && strpos(\$imagePath, 'uploads/') === 0)";
$content = str_replace($search2, $replace2, $content);

file_put_contents($file, $content);
