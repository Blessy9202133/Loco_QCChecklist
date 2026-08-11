<?php
$sourceFile = 'c:/xampp/htdocs/QCChecklist/script.js';
$targetFile = 'c:/xampp/htdocs/QCChecklist/script_hhp.js';

if (!file_exists($sourceFile)) {
    die("Error: script.js does not exist.");
}

$content = file_get_contents($sourceFile);

// Replace endpoints
$content = str_replace('action="connect.php"', 'action="connect_hhp.php"', $content);
$content = str_replace('fetch("connect.php"', 'fetch("connect_hhp.php"', $content);
$content = str_replace("fetch('connect.php'", "fetch('connect_hhp.php'", $content);

$content = str_replace('checkInitialTiming.php', 'checkHhpInitialTiming.php', $content);
$content = str_replace('save_observation.php', 'save_hhp_observation.php', $content);
$content = str_replace('fetch_observations.php', 'fetch_hhp_observations.php', $content);
$content = str_replace('getReportById.php', 'getHhpReportById.php', $content);

// Replace storage keys
$content = str_replace('localStorage.getItem("locoDetails")', 'localStorage.getItem("hhp_locoDetails")', $content);
$content = str_replace('localStorage.setItem("locoDetails"', 'localStorage.setItem("hhp_locoDetails"', $content);
$content = str_replace('sessionStorage.getItem("locoInfo")', 'sessionStorage.getItem("hhp_locoInfo")', $content);
$content = str_replace('sessionStorage.setItem("locoInfo"', 'sessionStorage.setItem("hhp_locoInfo"', $content);

// Replace Loco Type options HTML with HHP Loco types
$hhpLocoOptionsHtml = '<select id="loco-type" name="loco-type">
      <option value="" disabled selected>Select HHP Loco Type</option>
      <option value="WDG-4" ${locoInfo && locoInfo.locoType === "WDG-4" ? "selected" : ""}>WDG-4</option>
      <option value="WDP-4" ${locoInfo && locoInfo.locoType === "WDP-4" ? "selected" : ""}>WDP-4</option>
      <option value="WDG-4D" ${locoInfo && locoInfo.locoType === "WDG-4D" ? "selected" : ""}>WDG-4D</option>
      <option value="WDP-4B" ${locoInfo && locoInfo.locoType === "WDP-4B" ? "selected" : ""}>WDP-4B</option>
      <option value="WDP-4D" ${locoInfo && locoInfo.locoType === "WDP-4D" ? "selected" : ""}>WDP-4D</option>
      <option value="WDG-3A" ${locoInfo && locoInfo.locoType === "WDG-3A" ? "selected" : ""}>WDG-3A</option>
      <option value="WDP-1" ${locoInfo && locoInfo.locoType === "WDP-1" ? "selected" : ""}>WDP-1</option>
      <option value="WDP-3A" ${locoInfo && locoInfo.locoType === "WDP-3A" ? "selected" : ""}>WDP-3A</option>
      <option value="HHP_GENERIC" ${locoInfo && locoInfo.locoType === "HHP_GENERIC" ? "selected" : ""}>HHP Generic</option>
    </select>';

// Regex replace the select dropdown inside section 0.0 rendering
$pattern = '/<select id="loco-type" name="loco-type">.*?<\/select>/s';
$content = preg_replace($pattern, $hhpLocoOptionsHtml, $content);

file_put_contents($targetFile, $content);
echo "✅ script_hhp.js generated successfully! Size: " . strlen($content) . " bytes.\n";
?>
