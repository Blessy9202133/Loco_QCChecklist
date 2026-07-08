<?php
$scriptContent = file_get_contents('script.js');
$lines = explode("\n", $scriptContent);

$newLines = [];
$inTr = false;
$trBuffer = [];
$trStartLineIndex = -1;
$currentSection = 0;
$itemCounter = []; // To keep track of item counts per section
$migrationMap = [];

for ($i = 0; $i < count($lines); $i++) {
    $line = $lines[$i];
    
    // Look for <tr ...> or <tr>
    if (preg_match('/<tr\b([^>]*)>/i', $line, $matches) && !preg_match('/<th>/i', $lines[$i+1] ?? '')) {
        $inTr = true;
        $trBuffer = [];
        $trStartLineIndex = count($newLines);
        $trBuffer[] = $line;
        $newLines[] = $line;
        continue;
    }
    
    if ($inTr) {
        $trBuffer[] = $line;
        $newLines[] = $line;
        
        // Look for the first <td> containing the S_no
        if (preg_match('/<td[^>]*>\s*(\d+\.\d+)\s*<\/td>/i', $line, $tdMatches)) {
            $s_no = trim($tdMatches[1]);
            $section = floor((float)$s_no);
            
            if (!isset($itemCounter[$section])) {
                $itemCounter[$section] = 1;
            } else {
                $itemCounter[$section]++;
            }
            
            $item_id = "sec{$section}_item_" . $itemCounter[$section];
            
            // Add to migration map
            $migrationMap[$s_no] = $item_id;
            
            // Modify the <tr ...> tag that we pushed to $newLines earlier
            $trTag = $newLines[$trStartLineIndex];
            
            // If it already has data-item-id, don't add it again
            if (strpos($trTag, 'data-item-id=') === false) {
                // Insert data-item-id before the closing >
                $newTrTag = preg_replace('/(<tr\b[^>]*?)>/i', '$1 data-item-id="' . $item_id . '">', $trTag);
                $newLines[$trStartLineIndex] = $newTrTag;
            }
            
            $inTr = false; // We found the ID, stop buffering
        }
        
        // If we hit </tr>, stop buffering
        if (preg_match('/<\/tr>/i', $line)) {
            $inTr = false;
        }
    } else {
        $newLines[] = $line;
    }
}

file_put_contents('script_modified.js', implode("\n", $newLines));
file_put_contents('migration_map.json', json_encode($migrationMap, JSON_PRETTY_PRINT));

echo "Processed " . count($migrationMap) . " items.\n";
?>
