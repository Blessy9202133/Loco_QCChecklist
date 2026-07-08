<?php
// We will require check.php to get the $s_no_ranges and $observation_text
require 'check.php';

$mapping = [];
foreach ($tables_and_sections as $table => $snos) {
    // Generate a clean prefix from the table name
    // e.g., 'document_verification_table' -> 'document_verification_table'
    $table_slug = $table;
    
    foreach ($snos as $index => $s_no) {
        $item_index = $index + 1;
        $item_id = $table_slug . "_" . str_replace(".", "_", $s_no);
        $mapping[$s_no] = [
            'item_id' => $item_id,
            'table' => $table
        ];
    }
}

file_put_contents('migration_map.json', json_encode($mapping, JSON_PRETTY_PRINT));
echo "Generated migration_map.json\n";
?>
