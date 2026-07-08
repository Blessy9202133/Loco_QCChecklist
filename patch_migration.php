<?php
$file = 'generateReport.php';
$content = file_get_contents($file);

$search = <<<'EOD'
        // Shift old Section 8 rows (8.1‑8.8) down by 6 positions
        foreach ($tables as $tbl) {
            $shiftStmt = $pdo->prepare("UPDATE $tbl SET S_no = S_no + 6 WHERE loco_id = ? AND S_no BETWEEN 8.1 AND 8.8");
            $shiftStmt->execute([$locoID]);
        }
        // Also shift image rows
        $imgShift = $pdo->prepare("UPDATE images SET S_no = S_no + 6 WHERE loco_id = ? AND S_no BETWEEN 8.1 AND 8.8");
        $imgShift->execute([$locoID]);
EOD;

$replace = <<<'EOD'
        // Shift old Section 8 rows (8.1‑8.8) down by 6 positions
        // We must map descending (8.8 down to 8.1) so we don't accidentally overwrite shifted rows
        $mapping = [
            '8.8' => '8.14',
            '8.7' => '8.13',
            '8.6' => '8.12',
            '8.5' => '8.11',
            '8.4' => '8.10',
            '8.3' => '8.9',
            '8.2' => '8.8',
            '8.1' => '8.7'
        ];
        foreach ($mapping as $oldSno => $newSno) {
            foreach ($tables as $tbl) {
                $shiftStmt = $pdo->prepare("UPDATE $tbl SET S_no = ? WHERE loco_id = ? AND S_no = ?");
                $shiftStmt->execute([$newSno, $locoID, $oldSno]);
            }
            // Also shift image rows
            $imgShift = $pdo->prepare("UPDATE images SET S_no = ? WHERE loco_id = ? AND S_no = ?");
            $imgShift->execute([$newSno, $locoID, $oldSno]);
        }
EOD;

$content = str_replace($search, $replace, $content);
file_put_contents($file, $content);
