<?php
session_start();
$_SESSION['username'] = '52477';
$_SESSION['employee_name'] = 'sushma';
$_SESSION['role'] = 'user';

ob_start();
include('viewReports.php');
$html = ob_get_clean();

file_put_contents('debug_output.html', $html);
echo "Rendered HTML saved to debug_output.html";
?>
