<?php
// wfms_proxy.php
// Proxy to handle Loco WFMS API calls from the Checklist UI

ob_start(); // Start buffering to catch any accidental output
header('Content-Type: application/json');

$action = $_POST['action'] ?? '';
$wfmsBaseUrl = "https://eg.hbl.in:5105/api";

if ($action === 'login') {
    $user = $_POST['user'] ?? '';
    $pass = $_POST['pass'] ?? '';

    $ch = curl_init("$wfmsBaseUrl/login");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['username' => $user, 'password' => $pass]));
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-app-module: WFMS2',
        'x-app-client: Wizard'
    ]);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    ob_clean(); // Clear any accidental output before sending JSON
    if ($error) {
        echo json_encode(['status' => false, 'message' => "Login Connection Error: $error"]);
    } else {
        echo $response;
    }
    ob_end_flush();
    exit;
}

if ($action === 'get_assignments') {
    $token = $_POST['token'] ?? '';

    $url = "$wfmsBaseUrl/activity/all?pageNo=1&pageSize=500&dashboard=1";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); 
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json',
        'x-app-module: WFMS2',
        'x-app-client: Wizard'
    ]);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    ob_clean();
    if ($error) {
        echo json_encode(['status' => false, 'message' => "Connection Error: $error"]);
    } else {
        echo $response;
    }
    ob_end_flush();
    exit;
}

if ($action === 'get_activity_details') {
    $token = $_POST['token'] ?? '';
    $activityId = $_POST['activityId'] ?? '';

    $url = "$wfmsBaseUrl/activity/details?activityId=" . urlencode($activityId);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); 
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json',
        'x-app-module: WFMS2',
        'x-app-client: Wizard'
    ]);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    ob_clean();
    if ($error) {
        echo json_encode(['status' => false, 'message' => "Connection Error: $error"]);
    } else {
        echo $response;
    }
    ob_end_flush();
    exit;
}

echo json_encode(['status' => false, 'message' => 'Invalid action']);
?>
