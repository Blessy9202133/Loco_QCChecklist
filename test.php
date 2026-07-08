<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST['loco-id'] = 'dummy';
$_POST['railway-division'] = 'dummy';
$_POST['shed-name'] = 'dummy';
include 'generateReport.php';
