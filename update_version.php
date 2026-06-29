<?php
header('Content-Type: application/json');

// Force Git to run in non-interactive mode and never prompt for credentials
putenv('GIT_TERMINAL_PROMPT=0');
putenv('GIT_ASKPASS=echo');

$repo = "C:\\xampp\\htdocs\\Qcchecklist";
$git = 'git';

chdir($repo);

// Fix git dubious ownership error for the web server user
exec("$git config --global --add safe.directory C:/xampp/htdocs/Qcchecklist");

// Get current branch name dynamically (e.g. 'auto_update' or 'main')
$currentBranch = trim(shell_exec("$git rev-parse --abbrev-ref HEAD"));
if (!$currentBranch) {
    $currentBranch = 'main'; // default fallback
}

// fetch
exec("$git fetch origin $currentBranch 2>&1", $fetchOutput, $fetchCode);

if ($fetchCode !== 0) {
    echo json_encode([
        "status" => "error",
        "step" => "fetch",
        "output" => $fetchOutput
    ]);
    exit;
}

// compare local HEAD with remote tracking branch
$local = trim(shell_exec("$git rev-parse HEAD"));
$remote = trim(shell_exec("$git rev-parse origin/$currentBranch"));

if ($local === $remote) {
    echo json_encode(["status" => "uptodate"]);
    exit;
}

// --- AUTOMATIC DATABASE BACKUP BEFORE UPDATE ---
$backupDir = __DIR__ . '/backups';
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0777, true);
}
$filename = $backupDir . '/auto_backup_' . date('Ymd_His') . '.sql';
$mysqldump = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
if (file_exists($mysqldump)) {
    exec("\"$mysqldump\" -u root -pHbl@1234 loco_info > \"$filename\"");
}

// pull from the current active branch
$commitBefore = trim(shell_exec("$git rev-parse HEAD"));

exec("$git reset --hard 2>&1", $r1, $c1);
exec("$git clean -fd 2>&1", $r2, $c2);
exec("$git pull origin $currentBranch 2>&1", $pullOutput, $pullCode);

$commitAfter = trim(shell_exec("$git rev-parse HEAD"));

if ($pullCode === 0) {
    if ($commitBefore !== $commitAfter) {
        // --- AUTOMATIC DATABASE BACKUP BEFORE MIGRATION ---
        $backupDir = __DIR__ . '/backups';
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0777, true);
        }
        $filename = $backupDir . '/auto_backup_' . date('Ymd_His') . '.sql';
        $mysqldump = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
        if (file_exists($mysqldump)) {
            exec("\"$mysqldump\" -u root -pHbl@1234 loco_info > \"$filename\"");
        }

        // Automatically apply any database migrations silently!
        ob_start();
        include 'db_migration.php';
        ob_end_clean();

        echo json_encode(["status" => "updated"]);
    } else {
        echo json_encode(["status" => "uptodate"]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "step" => "pull",
        "output" => $pullOutput
    ]);
}
?>
