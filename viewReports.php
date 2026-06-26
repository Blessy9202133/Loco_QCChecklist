<?php
session_start(); // Start session

// Ensure user is logged in
if (!isset($_SESSION['username'])) {
    die("Unauthorized access. Please log in.");
}

// Fetch user details from session
$username = $_SESSION['username']; // `username` is the `user_id` in reports table
$employee_name = $_SESSION['employee_name'] ?? 'Unknown Employee';
$role = $_SESSION['role'] ?? 'user'; // Default to user role

// Database connection
try {
    $pdo = new PDO("mysql:host=localhost;dbname=loco_info", 'root', 'Hbl@1234');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Query based on role
    if ($role === 'admin') {
        $stmt = $pdo->prepare("SELECT id, file_name, upload_date, DATE_FORMAT(upload_date, '%H:%i') AS upload_time, user_id 
                               FROM report 
                               ORDER BY upload_date DESC");
    } else {
        $stmt = $pdo->prepare("SELECT id, file_name, upload_date, DATE_FORMAT(upload_date, '%H:%i') AS upload_time, user_id 
                               FROM report 
                               WHERE user_id = :username 
                               ORDER BY upload_date DESC");
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    }

    $stmt->execute();
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);  
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
  <title>Reports - HBL Engineering Ltd.</title>
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
    .edit-btn { background-color: #ffc107; }
    .download-btn { background-color: #28a745; }
    .back-btn { background-color: #6c757d; }
    .status-label { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
    .completed { color: green; background-color: #d3ffd3; }
    .not-completed { color: red; background-color: #ffd3d3; }
    .profile { position: absolute; right: 20px; color: white; font-size: 14px; }
    #search-input { padding: 10px; width: 300px; margin-top: 20px; }
  </style>
</head>
<body>

<header style="display: flex; align-items: center; justify-content: center; background-color: #00457C; color: white; padding: 20px; position: relative;">
    <img src="hbl_logo.jpg" alt="HBL Engineering Ltd. Logo" style="position: absolute; left: 20px; height: 50px;">
    <div>
      <h1>HBL Engineering Ltd.</h1>
      <h2>Electronics Group</h2>
    </div>
    <div class="profile">User: <?php echo htmlspecialchars($username); ?> | Employee: <?php echo htmlspecialchars($employee_name); ?></div>
</header>

<div class="container">
    <!-- Back Button -->
    <a href="index.html" class="btn back-btn">Back to Home</a>
    
    <!-- Search Bar on the Right -->
    <div style="text-align: right;">
      <input type="text" id="search-input" placeholder="Search by Loco ID...">
    </div>
    
    <h2>Your Uploaded Reports</h2>
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
                // Extract Loco ID from the beginning of the file name (digits)
                preg_match('/^\d+/', $report['file_name'], $locoMatches);
                $loco_id = $locoMatches[0] ?? null;

                // Modified regex to handle:
                // - a dash after "Version" (e.g., _Version-1)
                // - optional second ".pdf" (e.g., .pdf.pdf)
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
                        <a href="uploads/reports/<?php echo htmlspecialchars($report['file_name']); ?>" class="btn view-btn">View</a>
                        <a href="create.html?loco_id=<?php echo htmlspecialchars($loco_id); ?>" class="btn edit-btn">Edit</a>
                        <a href="uploads/reports/<?php echo htmlspecialchars($report['file_name']); ?>" download class="btn download-btn">Download</a>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    <?php else: ?>
        <p>No reports available.</p>
    <?php endif; ?>
</div>

<script>
  document.getElementById('search-input').addEventListener('input', function() {
    const searchValue = this.value.toLowerCase();
    const rows = document.querySelectorAll('#report-table tbody tr');
    rows.forEach(row => {
      const locoId = row.getAttribute('data-loco-id') || '';
      if (locoId.toLowerCase().includes(searchValue)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
</script>

</body>
</html>
