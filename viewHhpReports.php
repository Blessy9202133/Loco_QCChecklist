<?php
session_start();

if (!isset($_SESSION['username'])) {
    die("Unauthorized access. Please log in.");
}

$username = $_SESSION['username'];
$employee_name = $_SESSION['employee_name'] ?? 'Unknown Employee';
$role = $_SESSION['role'] ?? 'user';

try {
    // Connect to HHP database
    $pdo = new PDO("mysql:host=localhost;dbname=hhp_loco_info;charset=utf8mb4", 'root', 'Hbl@1234');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ensure report table exists in hhp_loco_info
    $pdo->exec("CREATE TABLE IF NOT EXISTS `report` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` VARCHAR(100) NOT NULL,
        `file_name` VARCHAR(255) NOT NULL,
        `upload_date` DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    if ($role === 'admin') {
        $stmt = $pdo->prepare("SELECT id, file_name, upload_date, DATE_FORMAT(upload_date, '%H:%i') AS upload_time, user_id FROM report ORDER BY upload_date DESC");
    } else {
        $stmt = $pdo->prepare("SELECT id, file_name, upload_date, DATE_FORMAT(upload_date, '%H:%i') AS upload_time, user_id FROM report WHERE user_id = :username ORDER BY upload_date DESC");
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    }
    $stmt->execute();
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fallback: If no reports found in hhp_loco_info.report, query loco_info.report for HHP files
    if (empty($reports)) {
        $pdoStd = new PDO("mysql:host=localhost;dbname=loco_info;charset=utf8mb4", 'root', 'Hbl@1234');
        if ($role === 'admin') {
            $stmt = $pdoStd->prepare("SELECT id, file_name, upload_date, DATE_FORMAT(upload_date, '%H:%i') AS upload_time, user_id FROM report WHERE file_name LIKE 'HHP_%' OR file_name LIKE '%hhp%' OR file_name LIKE '3555_%' OR file_name LIKE '7777_%' OR file_name LIKE '65667_%' ORDER BY upload_date DESC");
        } else {
            $stmt = $pdoStd->prepare("SELECT id, file_name, upload_date, DATE_FORMAT(upload_date, '%H:%i') AS upload_time, user_id FROM report WHERE user_id = :username AND (file_name LIKE 'HHP_%' OR file_name LIKE '%hhp%' OR file_name LIKE '3555_%' OR file_name LIKE '7777_%' OR file_name LIKE '65667_%') ORDER BY upload_date DESC");
            $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        }
        $stmt->execute();
        $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HHP LOCO Reports - HBL Engineering Ltd.</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
    h1, h2 { text-align: center; margin: 0; }
    .container { padding: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    table, th, td { border: 1px solid #ddd; }
    th, td { padding: 10px; text-align: left; }
    th { background-color: #00457C; color: white; }
    td a { color: #00457C; text-decoration: none; }
    td a:hover { text-decoration: underline; }
    .btn { padding: 5px 10px; margin: 5px; cursor: pointer; color: white; border: none; border-radius: 5px; display: inline-block; }
    .view-btn { background-color: #17a2b8; }
    .edit-btn { background-color: #ffc107; color: #000; }
    .download-btn { background-color: #28a745; }
    .back-btn { background-color: #6c757d; }
    .status-label { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
    .completed { color: green; background-color: #d3ffd3; }
    .not-completed { color: red; background-color: #ffd3d3; }
    .profile { position: absolute; right: 20px; color: white; font-size: 14px; }
    #search-input { padding: 10px; width: 300px; margin-top: 20px; }
    
    .upload-btn { background-color: #6f42c1; color: white; border: none; padding: 5px 10px; margin: 5px; cursor: pointer; border-radius: 5px; display: inline-block; }
    .upload-btn:hover { background-color: #5a32a3; }
    
    .wfms-modal {
        display: none;
        position: fixed;
        z-index: 3000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        justify-content: center;
        align-items: center;
    }
    .wfms-modal-content {
        background-color: #fff;
        padding: 25px;
        border-radius: 8px;
        width: 400px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    .wfms-modal-header {
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
        margin-bottom: 15px;
        font-size: 1.2rem;
        font-weight: bold;
        color: #6f42c1;
    }
    .wfms-form-group {
        margin-bottom: 15px;
        text-align: left;
    }
    .wfms-form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
    }
    .wfms-form-group input, .wfms-form-group select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
    }
    .wfms-btn-row {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }
  </style>
</head>
<body>

<header style="display: flex; align-items: center; justify-content: center; background-color: #00457C; color: white; padding: 20px; position: relative;">
    <img src="hbl_logo.jpg" alt="HBL Engineering Ltd. Logo" style="position: absolute; left: 20px; height: 50px;">
    <div>
      <h1>HBL Engineering Ltd.</h1>
      <h2>Electronics Group (HHP LOCO)</h2>
    </div>
    <div class="profile">User: <?php echo htmlspecialchars($username); ?> | Employee: <?php echo htmlspecialchars($employee_name); ?></div>
</header>

<div class="container">
    <a href="index.html" class="btn back-btn">Back to Home</a>
    
    <div style="text-align: right;">
      <input type="text" id="search-input" placeholder="Search by Loco ID..." autocomplete="new-password" name="search_loco_no_autofill">
    </div>
    
    <h2>Your Uploaded HHP LOCO Reports</h2>
    <?php if ($reports): ?>
        <table id="report-table">
            <thead>
                <tr>
                    <th>Report</th>
                    <th>Upload Date</th>
                    <th>Upload Time</th>
                    <?php if ($role === 'admin'): ?> <th>User ID</th> <?php endif; ?>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            <?php foreach ($reports as $report): ?>
                <?php
                preg_match('/\d+/', $report['file_name'], $locoMatches);
                $loco_id = $locoMatches[0] ?? null;

                preg_match('/_Report_([^_]+)_Version[\w-]+\.(pdf)$/i', $report['file_name'], $statusMatch);
                $statusCaptured = isset($statusMatch[1]) ? trim($statusMatch[1]) : '';
                $statusText = strtolower($statusCaptured);
                $statusLabel = ($statusText === 'completed') 
                    ? '<span class="status-label completed">Completed</span>' 
                    : '<span class="status-label not-completed">Not Completed</span>';
                ?>
                <tr data-loco-id="<?php echo htmlspecialchars($loco_id); ?>">
                    <td><?php echo htmlspecialchars($report['file_name']); ?></td>
                    <td><?php echo htmlspecialchars(date('d/m/y', strtotime($report['upload_date']))); ?></td>
                    <td><?php echo htmlspecialchars($report['upload_time']); ?></td>
                    <?php if ($role === 'admin'): ?> 
                        <td><?php echo htmlspecialchars($report['user_id']); ?></td>
                    <?php endif; ?>
                    <td><?php echo $statusLabel; ?></td>
                    <td>
                        <a href="uploads/reports/<?php echo htmlspecialchars($report['file_name']); ?>" class="btn view-btn" target="_blank">View</a>
                        <a href="create_hhp.html?loco_id=<?php echo htmlspecialchars($loco_id); ?>" class="btn edit-btn" target="_blank">Edit</a>
                        <a href="uploads/reports/<?php echo htmlspecialchars($report['file_name']); ?>" download class="btn download-btn" target="_blank">Download</a>
                        <button class="btn upload-btn" onclick="openWFMSLogin(event, '<?php echo htmlspecialchars($report['id']); ?>', '<?php echo htmlspecialchars($loco_id); ?>')">Push to Loco WFMS</button>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    <?php else: ?>
        <p>No HHP reports available.</p>
    <?php endif; ?>
</div>

<script>
  window.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const tableRows = document.querySelectorAll('#report-table tbody tr');

    if (searchInput) {
      setTimeout(() => {
        searchInput.value = '';
      }, 100);

      searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        tableRows.forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }
  });

  function openWFMSLogin(event, reportId, locoId) {
    alert(`WFMS Integration for Loco ID: ${locoId}`);
  }
</script>

</body>
</html>
