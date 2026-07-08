<?php
$files = glob("section*_*.php");

foreach ($files as $file) {
    if ($file === 'section_status.php' || $file === 'section_table.php') continue;
    
    $content = file_get_contents($file);
    
    $modified = false;
    
    // 1. Add item_id to INSERT query
    // Find: S_no,
    // Replace: S_no, item_id,
    if (strpos($content, 'S_no, item_id') === false) {
        $content = preg_replace('/(S_no,\s*observation_status)/i', 'S_no, item_id, $1', $content);
        $modified = true;
    }
    
    // 2. Add ? for item_id in VALUES
    // We can just add an extra ? before NOW() or just inject it next to S_no.
    // Let's replace:  $obs['S_no'],
    // With: $obs['S_no'], $obs['item_id'],
    // Wait, the number of ? must match.
    if (strpos($content, ', ?, ?, NOW())') !== false) {
        $content = str_replace(', ?, ?, NOW())"', ', ?, ?, ?, NOW())"', $content);
        $content = str_replace("\$obs['S_no'],", "\$obs['S_no'], \$obs['item_id'],", $content);
    } else if (strpos($content, ', NOW())') !== false) {
        // Find: ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())"
        // Replace with one more ?
        $content = preg_replace('/\) VALUES \((.*?)\)"/s', ') VALUES ($1, ?)"', $content);
        // And for the execute array, find $obs['S_no'] and add item_id
        $content = str_replace("\$obs['S_no'],", "\$obs['S_no'], \$obs['item_id'],", $content);
    } else {
        // Some files like section8_0.php use $createdAt at the end:
        // ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())" -> wait, section8 has:
        // ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())"
        // Let's just do:
        $content = preg_replace('/(VALUES \([^\)]+)\)/i', '$1, ?)', $content);
        // And append to execute array:
        $content = preg_replace('/\$createdAt\s*\]\)/', '$createdAt, $obs[\'item_id\']])', $content);
        
        // Wait, different files have different execute arrays.
        // It's safer to do this with regex very carefully or manually.
    }
}
?>
