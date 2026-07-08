import os
import re
import glob

files = glob.glob("section*.php")
files = [f for f in files if f not in ("section_status.php", "section_table.php")]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine loop variable
    loop_match = re.search(r'foreach\s*\(\$observations\s+as\s+\$(\w+)\)', content)
    if not loop_match:
        print(f"Loop not found in {filepath}")
        continue
    
    var_name = loop_match.group(1) # e.g. obs or observation

    # 1. Modify the INSERT query
    content = re.sub(
        r'(INSERT INTO\s+\w+\s*\([^)]+created_at[^)]*)(\s*\))',
        r'\1, item_id\2',
        content,
        flags=re.IGNORECASE
    )
    
    # 2. Modify VALUES
    content = re.sub(
        r'(VALUES\s*\([^)]+NOW\(\)[^)]*)(\s*\))',
        r'\1, ?\2',
        content,
        flags=re.IGNORECASE
    )
    # And COALESCE
    content = re.sub(
        r'(VALUES\s*\([^)]+COALESCE\(\?,\s*\'\'\)[^)]*NOW\(\)[^)]*)(\s*\))',
        r'\1, ?\2',
        content,
        flags=re.IGNORECASE
    )

    # 3. Modify execute array for the main insert
    content = re.sub(
        r'(\$createdAt\s*)\]\)',
        rf"\1, ${var_name}['item_id']])",
        content
    )
    
    # 4. Modify images delete
    content = re.sub(
        r'(DELETE FROM images WHERE loco_id = \? AND s_no = \?)',
        r'DELETE FROM images WHERE loco_id = ? AND item_id = ?',
        content,
        flags=re.IGNORECASE
    )
    content = content.replace(
        f"$deleteStmt->execute([$locoID, ${var_name}['S_no']]);",
        f"$deleteStmt->execute([$locoID, ${var_name}['item_id']]);"
    )

    # 5. Modify images insert query
    content = re.sub(
        r'(INSERT INTO images \(entity_type, loco_id, s_no, image_path, created_at)(\s*\))',
        r'\1, item_id\2',
        content,
        flags=re.IGNORECASE
    )
    content = re.sub(
        r'(VALUES \(\?,\s*\?,\s*\?,\s*\?,\s*\?)(\s*\))',
        r'\1, ?\2',
        content,
        flags=re.IGNORECASE
    )
    
    # 6. Modify images execute array
    # We must be careful not to keep appending if run multiple times
    if f"${var_name}['item_id']" not in content.split("$imgStmt->execute")[-1]:
        content = re.sub(
            r'(\$imgStmt->execute\(\[[^\]]+)(\s*\]\))',
            rf"\1, ${var_name}['item_id']\2",
            content
        )
    
    # Save back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {filepath}")
