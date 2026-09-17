<?php
ini_set('memory_limit', '512M'); // or 1024M if needed
set_time_limit(120); // 2 minutes to avoid timeout

register_shutdown_function(function () {
    $error = error_get_last();
    if (!$error) {
        return;
    }
    $fatalTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR];
    if (!in_array($error['type'], $fatalTypes, true)) {
        return;
    }
    if (headers_sent()) {
        return;
    }
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Dashboard backend fatal error',
        'message' => $error['message'] ?? 'Unknown error',
        'file' => isset($error['file']) ? basename($error['file']) : null,
        'line' => $error['line'] ?? null,
    ]);
});


if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
    // you want to allow, and if so:
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        // may also be using PUT, PATCH, HEAD etc
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

// Holidays array - supports both specific dates (YYYY-MM-DD) and recurring patterns (MM-DD)
// Only include weekdays (weekend holidays are already excluded by weekend logic)
$holidays = [
    // Add specific dates here (e.g., '2024-12-25', '2025-01-01')
    '2025-11-27',
    '2025-11-28',
    '12-24',
    '12-25',
    '12-31',
    '01-01',
    // Add recurring patterns here (e.g., '12-25' for Christmas, '01-01' for New Year's Day, '07-04' for Independence Day)
];

    if($_GET['test']){
        $responseData = json_decode('{"calls":[{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:10:31.330","result":"CB","cty_id":"B","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:12:37.873","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:13:09.803","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:13:54.400","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:15:34.813","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:17:21.237","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 08:20:07.230","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 08:20:49.810","result":"ccOoA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:22:22.747","result":"MobHM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:23:36.990","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 08:23:55.113","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:25:40.567","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:26:30.960","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 08:40:46.153","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 08:42:41.777","result":"ccOoA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:16:30.830","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:17:15.733","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:18:32.510","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:23:34.967","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:26:41.160","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:29:17.827","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:29:47.890","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:30:14.690","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:32:54.457","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:33:02.167","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:33:55.890","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:34:42.090","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:35:17.280","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:36:05.040","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:38:26.283","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:38:28.563","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:39:18.687","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:40:39.907","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:41:48.610","result":"ccNO","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:41:50.373","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:42:15.683","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:48:23.027","result":"AP","cty_id":"D","connected":1,"pitched":1,"positive":1},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:48:48.317","result":"CB","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:49:07.567","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:49:36.347","result":"ccOoS","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:50:23.803","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:50:38.373","result":"ccNO","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:53:41.367","result":"ccNIy","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:53:55.187","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:57:43.267","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:58:11.660","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:58:40.993","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:02:42.943","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:05:08.657","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:06:13.987","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:07:22.040","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:10:05.163","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:11:08.160","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:12:08.937","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:12:22.610","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:13:09.383","result":"ccNI6","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:13:11.870","result":"ccNIy","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:13:29.663","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:16:07.870","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:16:21.107","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:17:05.100","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:17:27.803","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:18:43.837","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:21:59.750","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:22:41.323","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:22:56.153","result":"ccNI6","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:24:28.717","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:24:31.173","result":"ccOoS","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:25:43.480","result":"ccNA","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:25:48.717","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:26:46.130","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:27:07.020","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:28:17.320","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:28:35.420","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:28:44.993","result":"ccNO","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:29:26.330","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:29:40.373","result":"ccHU","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:31:01.140","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:33:48.583","result":"ccNI6","cty_id":"B","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:34:18.210","result":"ccNIy","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:37:15.073","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:37:30.330","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:37:44.707","result":"ccDNC","cty_id":"R","connected":1,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:39:35.757","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:40:48.873","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:43:00.160","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:43:40.230","result":"ccHU","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:44:16.310","result":"WN","cty_id":"D","connected":1,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:45:08.300","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:48:34.720","result":"ccLM","cty_id":"B","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:49:31.780","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:49:57.760","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:52:55.760","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:56:07.910","result":"ccNI3","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:00:52.617","result":"ccNIy","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:04:06.283","result":"ccLM","cty_id":"B","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:05:26.580","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:05:49.493","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:08:55.120","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:10:07.177","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:11:04.520","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:11:17.900","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:12:17.887","result":"ccNIy","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:12:59.600","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:13:26.553","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:14:26.523","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:16:10.760","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:16:33.790","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:18:19.720","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:20:36.503","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:22:28.773","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:26:53.757","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:27:18.343","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:27:41.777","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:28:54.503","result":"ccOoA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:29:48.523","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:34:30.080","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:35:05.893","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:35:06.953","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:36:30.443","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:37:11.080","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:39:04.630","result":"ccNIy","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:41:06.027","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:42:36.427","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:43:07.623","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:45:23.503","result":"ccNIy","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:48:08.733","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:49:13.630","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:49:32.097","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:50:10.907","result":"ccNIy","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:53:29.530","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:00:07.620","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:06:09.283","result":"ccVM","cty_id":"B","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:10:32.007","result":"AP","cty_id":"D","connected":1,"pitched":1,"positive":1},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:10:57.590","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:11:42.993","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:12:12.573","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:13:01.420","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:13:23.410","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:13:50.100","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:14:39.193","result":"ccNIy","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:22:24.490","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:43:23.000","result":"AP","cty_id":"CI","connected":1,"pitched":1,"positive":1},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 12:46:47.977","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 12:47:20.540","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0}],"hours":[{"hours":4.7075,"employee":"Phenick Thongpasouk"},{"hours":4.691111111111111,"employee":"Audra Radwanski"}]}', TRUE);
        // Initialize scorecard arrays for test mode
        $responseData['settersScorecards'] = [];
        $responseData['confirmersScorecards'] = [];
        $responseData['settersAppointments'] = [];
        $responseData['secondarySettersAppointments'] = [];
        $responseData['gspCalls'] = [];
        $responseData['gspHours'] = [];
        $responseData['secondaryGspCalls'] = [];
        $responseData['secondaryGspHours'] = [];
    }else{
        $responseData = [
            'settersCalls' => [],
            'confirmersCalls' => [],
            'gspCalls' => [],
            'gspHours' => [],
            'hours' => [],
        ];
    }
    
    require_once(__DIR__ . "/../../shared/sharedFunctions.php");
    require_once(__DIR__ . "/../../shared/db.php");

    // Match AppointmentsFiltered: one appointment per lead per calendar day (highest id wins)
    if (!function_exists('filterLatestAppointmentPerLeadPerDay')) {
        function filterLatestAppointmentPerLeadPerDay($appointments) {
            if (!is_array($appointments)) {
                return [];
            }
            $bestByLeadDay = [];
            foreach ($appointments as $appointment) {
                if (!is_array($appointment)) {
                    continue;
                }
                $id = isset($appointment['id']) ? intval($appointment['id']) : 0;
                $ldsId = $appointment['lds_id'] ?? $appointment['Lds_ID'] ?? $appointment['Lds_id'] ?? '';
                $apptDate = $appointment['ApptDate'] ?? $appointment['apptdate'] ?? '';
                if ($ldsId === '' || $ldsId === null || $apptDate === '' || $apptDate === null) {
                    $key = 'id:' . $id;
                } else {
                    $dayTs = strtotime($apptDate);
                    $day = $dayTs ? date('Y-m-d', $dayTs) : (string)$apptDate;
                    $key = $ldsId . '|' . $day;
                }
                if (!isset($bestByLeadDay[$key]) || intval($bestByLeadDay[$key]['id'] ?? 0) < $id) {
                    $bestByLeadDay[$key] = $appointment;
                }
            }
            return array_values($bestByLeadDay);
        }
    }

    // Load dsp_dispositions keyed by descr (same approach as LeadProg → data sync)
    if (!function_exists('loadDispositionsByDescr')) {
        function loadDispositionsByDescr($endpoint) {
            $query = "SELECT * FROM dsp_dispositions ORDER BY id DESC";
            $rows = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($query));
            if (!is_array($rows)) {
                return [];
            }
            $dispositions = [];
            foreach ($rows as $dispo) {
                if (!is_array($dispo)) {
                    continue;
                }
                foreach ($dispo as $key => $value) {
                    if (strtolower($key) != $key) {
                        $dispo[strtolower($key)] = $value;
                        unset($dispo[$key]);
                    }
                }
                if (!isset($dispo['descr'])) {
                    continue;
                }
                // Trim: SQL Server CHAR columns often return padded values (e.g. "CXL            ")
                $descr = trim((string)$dispo['descr']);
                if ($descr === '') {
                    continue;
                }
                $dispositions[$descr] = $dispo;
            }
            return $dispositions;
        }
    }

    // Truthy check matching LeadProg sync's `$dispo[$flag] > 0`, plus API bool/string variants
    if (!function_exists('dispositionFlagIsSet')) {
        function dispositionFlagIsSet($value) {
            if (is_bool($value)) {
                return $value;
            }
            if (is_numeric($value)) {
                return floatval($value) > 0;
            }
            if (is_string($value)) {
                $normalized = strtolower(trim($value));
                if ($normalized === '') {
                    return false;
                }
                if (in_array($normalized, ['1', 'true', 'yes', 'y'], true)) {
                    return true;
                }
                if (is_numeric($normalized)) {
                    return floatval($normalized) > 0;
                }
            }
            return false;
        }
    }

    // Look up disposition by dsp id, tolerating CHAR padding on either side
    if (!function_exists('findDispositionByDspId')) {
        function findDispositionByDspId($dspId, $dispositions) {
            $dspId = trim((string)$dspId);
            if ($dspId === '' || !is_array($dispositions)) {
                return null;
            }
            if (isset($dispositions[$dspId])) {
                return $dispositions[$dspId];
            }
            foreach ($dispositions as $key => $dispo) {
                if (trim((string)$key) === $dspId) {
                    return $dispo;
                }
            }
            return null;
        }
    }

    // Determine ApptSet from disposition (mirrors LeadProg sync script logic)
    if (!function_exists('isAppointmentSetFromDisposition')) {
        function isAppointmentSetFromDisposition($appointment, $dispositions) {
            if (!is_array($appointment) || !is_array($dispositions)) {
                return false;
            }
            $dspId = $appointment['Dsp_ID'] ?? $appointment['dsp_id'] ?? '';
            $dispo = findDispositionByDspId($dspId, $dispositions);
            if ($dispo === null) {
                return false;
            }
            $dctId = intval($dispo['dct_id'] ?? 0);
            $setBy = intval($appointment['SetBy'] ?? $appointment['setby'] ?? 0);

            // dct_id 1–4 cascade: issued+ implies appointment set
            if ($dctId >= 1) {
                return true;
            }

            // dct_id 0: use disposition setappt flag, but require a real SetBy
            // (same as sync: setappt > 0, then force false when setby == 0)
            if (dispositionFlagIsSet($dispo['setappt'] ?? 0) && $setBy != 0) {
                return true;
            }

            return false;
        }
    }

    // Keep only appointments considered set by disposition; normalize ApptSet to 1/0 for the UI
    if (!function_exists('filterAppointmentsSetByDisposition')) {
        function filterAppointmentsSetByDisposition($appointments, $dispositions) {
            if (!is_array($appointments)) {
                return [];
            }
            $filtered = [];
            foreach ($appointments as $appointment) {
                if (!is_array($appointment)) {
                    continue;
                }
                $isSet = isAppointmentSetFromDisposition($appointment, $dispositions);
                $appointment['ApptSet'] = $isSet ? 1 : 0;
                if ($isSet) {
                    $filtered[] = $appointment;
                }
            }
            return $filtered;
        }
    }


    // ---- Efficiency helpers for long date ranges (YTD, etc.) ----
    if (!function_exists('ccDateRangeDayCount')) {
        function ccDateRangeDayCount($start, $end) {
            $s = strtotime($start);
            $e = strtotime($end);
            if ($s === false || $e === false) {
                return 0;
            }
            return max(0, (int) floor(($e - $s) / 86400));
        }
    }

    if (!function_exists('ccBuildDateChunks')) {
        function ccBuildDateChunks($start, $end, $maxDays = 31) {
            $chunks = [];
            $current = strtotime($start);
            $endTs = strtotime($end);
            if ($current === false || $endTs === false || $current >= $endTs) {
                return [[$start, $end]];
            }
            while ($current < $endTs) {
                $chunkStart = date('Y-m-d', $current);
                $chunkEndTs = min(strtotime('+' . intval($maxDays) . ' days', $current), $endTs);
                $chunks[] = [$chunkStart, date('Y-m-d', $chunkEndTs)];
                $current = $chunkEndTs;
            }
            return $chunks;
        }
    }

    if (!function_exists('ccCurlMultiGet')) {
        function ccCurlMultiGet($urls, $concurrency = 20) {
            $count = count($urls);
            $results = array_fill(0, $count, []);
            if ($count === 0) {
                return $results;
            }

            if (!function_exists('curl_multi_init')) {
                foreach ($urls as $i => $url) {
                    $decoded = curlCall($url);
                    $results[$i] = is_array($decoded) ? $decoded : [];
                }
                return $results;
            }

            $concurrency = max(1, min(intval($concurrency), 30));
            $mh = curl_multi_init();
            $handles = [];
            $indexMap = [];
            $nextIndex = 0;
            $active = 0;

            $addHandle = function ($url, $origIndex) use ($mh, &$handles, &$indexMap, &$active) {
                $ch = curl_init($url);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_CONNECTTIMEOUT => 15,
                    CURLOPT_TIMEOUT => 90,
                ]);
                curl_multi_add_handle($mh, $ch);
                $handles[(int) $ch] = $ch;
                $indexMap[(int) $ch] = $origIndex;
                $active++;
            };

            while ($active < $concurrency && $nextIndex < $count) {
                $addHandle($urls[$nextIndex], $nextIndex);
                $nextIndex++;
            }

            do {
                do {
                    $status = curl_multi_exec($mh, $running);
                } while ($status === CURLM_CALL_MULTI_PERFORM);

                while ($info = curl_multi_info_read($mh)) {
                    $ch = $info['handle'];
                    $id = (int) $ch;
                    $origIndex = $indexMap[$id];
                    $body = curl_multi_getcontent($ch);
                    $decoded = json_decode($body, true);
                    $results[$origIndex] = is_array($decoded) ? $decoded : [];
                    curl_multi_remove_handle($mh, $ch);
                    curl_close($ch);
                    unset($handles[$id], $indexMap[$id]);
                    $active--;

                    if ($nextIndex < $count) {
                        $addHandle($urls[$nextIndex], $nextIndex);
                        $nextIndex++;
                    }
                }

                if ($running) {
                    curl_multi_select($mh, 1.0);
                }
            } while ($running || $active > 0);

            curl_multi_close($mh);
            return $results;
        }
    }

    if (!function_exists('ccFetchTimesheetsByDeputy')) {
        function ccFetchTimesheetsByDeputy($endpoint, $deputyIDs, $start, $end, $concurrency = 20) {
            $byDeputy = [];
            foreach ($deputyIDs as $id) {
                $byDeputy[intval($id)] = [];
            }
            if (empty($deputyIDs)) {
                return $byDeputy;
            }

            $dayCount = ccDateRangeDayCount($start, $end);
            $chunks = $dayCount > 45 ? ccBuildDateChunks($start, $end, 31) : [[$start, $end]];

            $urls = [];
            $meta = [];
            foreach ($deputyIDs as $deputyID) {
                $id = intval($deputyID);
                foreach ($chunks as $chunk) {
                    $urls[] = "$endpoint/deputy/getTimesheets.php?startDate={$chunk[0]}&endDate={$chunk[1]}&id=$id";
                    $meta[] = $id;
                }
            }

            $results = ccCurlMultiGet($urls, $concurrency);
            foreach ($results as $i => $rows) {
                if (!is_array($rows) || empty($rows)) {
                    continue;
                }
                if (isset($rows[0]) && is_array($rows[0])) {
                    $list = $rows;
                } elseif (isset($rows['data']) && is_array($rows['data'])) {
                    $list = $rows['data'];
                } else {
                    $list = (isset($rows['Employee']) || isset($rows['Id'])) ? [$rows] : [];
                }
                $id = $meta[$i];
                foreach ($list as $row) {
                    if (is_array($row)) {
                        $byDeputy[$id][] = $row;
                    }
                }
            }
            return $byDeputy;
        }
    }

    if (!function_exists('ccFetchLpReportChunked')) {
        function ccFetchLpReportChunked($endpoint, $sqlBuilder, $start, $end, $maxDays = 31, $concurrency = 8) {
            $dayCount = ccDateRangeDayCount($start, $end);
            $chunks = $dayCount > 45 ? ccBuildDateChunks($start, $end, $maxDays) : [[$start, $end]];
            $urls = [];
            foreach ($chunks as $chunk) {
                $sql = $sqlBuilder($chunk[0], $chunk[1]);
                $urls[] = "$endpoint/lp/customReport.php?rptSQL=" . urlencode($sql);
            }
            $parts = ccCurlMultiGet($urls, $concurrency);
            $merged = [];
            foreach ($parts as $rows) {
                if (!is_array($rows)) {
                    continue;
                }
                foreach ($rows as $row) {
                    if (is_array($row)) {
                        $merged[] = $row;
                    }
                }
            }
            return $merged;
        }
    }



    // Scorecard helpers (hoisted so secondary-only requests can use them)
    if (!function_exists('extractScorecardItems')) {
            function extractScorecardItems($formData, $responses) {
                $result = ['items' => [], 'maxTotal' => 0.0, 'actualTotal' => 0.0];

                $fd = is_string($formData) ? json_decode($formData, true) : $formData;
                $rs = is_string($responses) ? json_decode($responses, true) : $responses;

                // 1) Legacy actualTotal: sum every number-typed response value, no matching required.
                if(is_array($rs)) {
                    foreach($rs as $r) {
                        if(is_array($r) && ($r['type'] ?? null) === 'number' && isset($r['value'])) {
                            $result['actualTotal'] += (float)$r['value'];
                        }
                    }
                }

                if(!is_array($fd) || !isset($fd['fields']) || !is_array($fd['fields'])) {
                    return $result;
                }

                // 2) Build lookup tables for the items[] drill-down.
                $byKey = [];
                $byLabel = [];
                $numberValueQueue = [];
                if(is_array($rs)) {
                    foreach($rs as $outerKey => $r) {
                        if(is_array($r)) {
                            $candidates = [];
                            if(is_string($outerKey)) $candidates[] = $outerKey;
                            foreach(['key', 'id', 'name'] as $kField) {
                                if(isset($r[$kField]) && (is_string($r[$kField]) || is_int($r[$kField]))) {
                                    $candidates[] = (string)$r[$kField];
                                }
                            }
                            foreach(array_unique($candidates) as $c) {
                                $byKey[$c] = $r;
                            }
                            foreach(['label', 'name', 'title'] as $lField) {
                                if(isset($r[$lField]) && is_string($r[$lField])) {
                                    $byLabel[$r[$lField]] = $r;
                                }
                            }
                            if(($r['type'] ?? null) === 'number' && array_key_exists('value', $r)) {
                                $numberValueQueue[] = (float)$r['value'];
                            }
                        } elseif(is_string($outerKey)) {
                            $byKey[$outerKey] = ['value' => $r];
                            if(is_numeric($r)) {
                                $numberValueQueue[] = (float)$r;
                            }
                        }
                    }
                }

                $queueIdx = 0;
                foreach($fd['fields'] as $field) {
                    if(!is_array($field)) continue;
                    if(($field['type'] ?? null) !== 'number') continue;

                    $key   = $field['key'] ?? $field['id'] ?? $field['name'] ?? null;
                    $label = $field['label'] ?? $field['name'] ?? $field['title'] ?? $key;
                    $max   = (float)($field['validation']['max'] ?? 0);

                    $matched = false;
                    $value = 0.0;

                    // Try every plausible identifier on the form field
                    $lookupCandidates = [];
                    foreach(['key', 'id', 'name', 'label', 'title'] as $f) {
                        if(isset($field[$f]) && (is_string($field[$f]) || is_int($field[$f]))) {
                            $lookupCandidates[] = (string)$field[$f];
                        }
                    }
                    foreach(array_unique($lookupCandidates) as $candidate) {
                        if(isset($byKey[$candidate]) && array_key_exists('value', $byKey[$candidate])) {
                            $value = (float)$byKey[$candidate]['value'];
                            $matched = true;
                            break;
                        }
                        if(isset($byLabel[$candidate]) && array_key_exists('value', $byLabel[$candidate])) {
                            $value = (float)$byLabel[$candidate]['value'];
                            $matched = true;
                            break;
                        }
                    }

                    // Positional fallback: consume next number-typed response value
                    if(!$matched && $queueIdx < count($numberValueQueue)) {
                        $value = $numberValueQueue[$queueIdx];
                        $queueIdx++;
                    }

                    $result['items'][] = [
                        'key'   => $key,
                        'label' => $label,
                        'max'   => $max,
                        'value' => $value,
                        'pct'   => $max > 0 ? round(($value / $max) * 100, 2) : 0,
                    ];

                    $result['maxTotal'] += $max;
                }

                return $result;
            }
    }

    if (!function_exists('buildCallIndex')) {
            // Keeps only the fields findLinkedCall returns, and sorts each employee's
            // calls by timestamp so lookups can binary search instead of scanning.
            function buildCallIndex($calls) {
                $index = [];
                if(!is_array($calls)) return $index;
                foreach($calls as $call) {
                    $name = trim(($call['FirstName'] ?? '') . ' ' . ($call['LastName'] ?? ''));
                    if($name === '') continue;
                    $ts = isset($call['CallDate']) ? strtotime($call['CallDate']) : false;
                    if($ts === false) continue;
                    if(!isset($index[$name])) $index[$name] = [];
                    $index[$name][] = [
                        'ts' => $ts,
                        'call_id' => $call['id'] ?? null,
                        'lds_id' => $call['lds_id'] ?? null,
                        'cst_id' => $call['cst_id'] ?? null,
                        'CallDate' => $call['CallDate'] ?? null,
                    ];
                }
                foreach($index as $name => $entries) {
                    usort($entries, function($a, $b) {
                        return $a['ts'] - $b['ts'];
                    });
                    $index[$name] = $entries;
                }
                return $index;
            }
    }

    if (!function_exists('findLinkedCall')) {
            function findLinkedCall($index, $employeeName, $callDate, $toleranceSeconds = 120) {
                if(!$employeeName || !$callDate || empty($index[$employeeName])) return null;
                $target = strtotime($callDate);
                if($target === false) return null;

                $entries = $index[$employeeName];
                // Binary search for the first call at or after the target time
                $lo = 0;
                $hi = count($entries) - 1;
                while($lo <= $hi) {
                    $mid = intval(($lo + $hi) / 2);
                    if($entries[$mid]['ts'] < $target) {
                        $lo = $mid + 1;
                    } else {
                        $hi = $mid - 1;
                    }
                }

                // The nearest call is on one side of the insertion point
                $best = null;
                $bestDiff = $toleranceSeconds + 1;
                foreach([$lo - 1, $lo] as $candidateIdx) {
                    if(!isset($entries[$candidateIdx])) continue;
                    $diff = abs($entries[$candidateIdx]['ts'] - $target);
                    if($diff < $bestDiff) {
                        $bestDiff = $diff;
                        $best = $entries[$candidateIdx];
                    }
                }
                if($best === null || $bestDiff > $toleranceSeconds) return null;
                return [
                    'call_id' => $best['call_id'],
                    'lds_id'  => $best['lds_id'],
                    'cst_id'  => $best['cst_id'],
                    'CallDate' => $best['CallDate'],
                ];
            }
    }

    if (!function_exists('ccAggregateCallRows')) {
            /**
             * Collapses call rows into counts grouped by the only dimensions the
             * dashboard filters on client-side: employee, hour of day, call bucket
             * and qualified. A year of calls becomes a few thousand buckets, and any
             * combination of those filters can still be evaluated from them.
             *
             * Counters: d=dials c=connected p=pitched v=positive
             *           pv=pitched & positive  a=appointments set  i=issued
             */
            function ccAggregateCallRows($rows, $excludedCallIds = []) {
                $employeeNames = [];
                $nameIndex = [];
                $buckets = [];
                // Excluded calls that actually fall in this window, so the client can
                // still show an accurate "excluded records" count and panel.
                $excludedMatches = [];
                if (!is_array($rows)) {
                    return ['employeeNames' => [], 'buckets' => [], 'excludedRows' => []];
                }
                foreach ($rows as $row) {
                    if (!empty($excludedCallIds) && isset($excludedCallIds[(string)($row['id'] ?? '')])) {
                        $excludedMatches[] = $row;
                        continue;
                    }
                    $name = $row['employee'] ?? '';
                    if (!isset($nameIndex[$name])) {
                        $nameIndex[$name] = count($employeeNames);
                        $employeeNames[] = $name;
                    }
                    $employeeIdx = $nameIndex[$name];
                    // 'YYYY-mm-dd HH:...' -> hour of day
                    $hour = intval(substr((string)($row['date'] ?? ''), 11, 2));
                    $bucket = intval($row['cqd_id'] ?? 0);
                    $qualified = $row['qualified'] === true ? 1 : ($row['qualified'] === false ? 0 : -1);

                    $key = $employeeIdx . '|' . $hour . '|' . $bucket . '|' . $qualified;
                    if (!isset($buckets[$key])) {
                        $buckets[$key] = [
                            'e' => $employeeIdx, 'h' => $hour, 'b' => $bucket, 'q' => $qualified,
                            'd' => 0, 'c' => 0, 'p' => 0, 'v' => 0, 'pv' => 0, 'a' => 0, 'i' => 0,
                        ];
                    }

                    $connected = intval($row['connected'] ?? 0) === 1;
                    $pitched = intval($row['pitched'] ?? 0) === 1;
                    $positive = intval($row['positive'] ?? 0) === 1;

                    $buckets[$key]['d']++;
                    if ($connected) $buckets[$key]['c']++;
                    if ($pitched) $buckets[$key]['p']++;
                    if ($positive) $buckets[$key]['v']++;
                    if ($pitched && $positive) $buckets[$key]['pv']++;
                    if (isset($row['ApptSet']) && $row['ApptSet'] > 0) $buckets[$key]['a']++;
                    if (isset($row['Issued']) && $row['Issued'] > 0) $buckets[$key]['i']++;
                }
                return [
                    'employeeNames' => $employeeNames,
                    'buckets' => array_values($buckets),
                    'excludedRows' => $excludedMatches,
                ];
            }
    }

    if (!function_exists('ccProjectDrilldownRows')) {
            /**
             * Columns and row predicate for one drill-down table. Only the rows and
             * fields that table renders are returned; the client still applies its own
             * hour, employee and call-bucket filters, so those are never pre-applied.
             */
            function ccProjectDrilldownRows($rows, $table) {
                $projections = [
                    'connection'          => ['fields' => ['id','employee','date','connected'], 'require' => null],
                    'dialsPerHour'        => ['fields' => ['id','employee','date','result'], 'require' => null],
                    'pitch'               => ['fields' => ['id','employee','date','connected','pitched'], 'require' => 'connected'],
                    'conversion'          => ['fields' => ['id','employee','date','pitched','positive','qualified'], 'require' => 'pitched'],
                    'conversionQualified' => ['fields' => ['id','employee','date','pitched','positive','qualified','lds_id','cst_id','cqd_id'], 'require' => 'pitched'],
                ];
                // Both conversion drill-downs read the same pitched rows
                $projections['conversionUnqualified'] = $projections['conversionQualified'];

                if (!isset($projections[$table]) || !is_array($rows)) {
                    return [];
                }
                $fields = $projections[$table]['fields'];
                $require = $projections[$table]['require'];

                $out = [];
                foreach ($rows as $row) {
                    if ($require !== null && intval($row[$require] ?? 0) !== 1) {
                        continue;
                    }
                    $projected = [];
                    foreach ($fields as $field) {
                        $projected[$field] = $row[$field] ?? null;
                    }
                    $out[] = $projected;
                }
                return $out;
            }
    }

    if (!function_exists('ccFinalizeResponse')) {
            /**
             * Last step before output. Either narrows the response to a single
             * drill-down table's rows, or replaces the bulky call arrays with
             * aggregates. Raw call rows are not returned by default: over a year they
             * are ~200x the size of the aggregates the metric cards actually need.
             */
            function ccFinalizeResponse($responseData, $rowsFor, $activeTab, $excludedCallIds) {
                $callKeysByTab = [
                    'setters'    => ['primary' => 'settersCalls',    'secondary' => 'secondarySettersCalls'],
                    'gsp'        => ['primary' => 'gspCalls',        'secondary' => 'secondaryGspCalls'],
                    'confirmers' => ['primary' => 'confirmersCalls', 'secondary' => 'secondaryConfirmersCalls'],
                ];

                if ($rowsFor !== null) {
                    $tab = isset($callKeysByTab[$activeTab]) ? $activeTab : 'setters';
                    $secondaryTables = ['conversionQualified', 'conversionUnqualified'];
                    $scope = in_array($rowsFor, $secondaryTables, true) ? 'secondary' : 'primary';
                    $sourceKey = $callKeysByTab[$tab][$scope];
                    return [
                        'rowsFor' => $rowsFor,
                        'tab' => $tab,
                        'rows' => ccProjectDrilldownRows($responseData[$sourceKey] ?? [], $rowsFor),
                    ];
                }

                foreach ($callKeysByTab as $keys) {
                    foreach ($keys as $callKey) {
                        if (!array_key_exists($callKey, $responseData)) {
                            continue;
                        }
                        $responseData[$callKey . 'Aggregate'] = ccAggregateCallRows($responseData[$callKey], $excludedCallIds);
                        $responseData[$callKey] = [];
                    }
                }
                return $responseData;
            }
    }

    $dispositions = [];

    $start = date('Y-m-d');
    $end = date('Y-m-d', strtotime("tomorrow"));

    if(array_key_exists('dateRange', $_GET)){
        switch ($_GET['dateRange']) {
        case 'Today':
            $start = date('Y-m-d');
            $end = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'Yesterday':
            $start = date('Y-m-d', strtotime('yesterday'));
            $end = date('Y-m-d');
            break;

        case 'Rolling 7':
        case 'Rolling 7 Days':
            $start = date('Y-m-d', strtotime('-6 days')); // includes today
            $end = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'This Week (Sun-Sat)':
            $start = date('Y-m-d', strtotime('last Sunday', strtotime('tomorrow')));
            $end = date('Y-m-d', strtotime('next Sunday'));
            break;

        case 'Last Week (Sun-Sat)':
            $start = date('Y-m-d', strtotime('last Sunday -7 days'));
            $end = date('Y-m-d', strtotime('last Sunday'));
            break;

        case 'Rolling 30':
        case 'Rolling 30 Days':
            $start = date('Y-m-d', strtotime('-29 days')); // includes today
            $end = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'This Month to Date':
            $start = date('Y-m-01');
            $end = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'Last Month':
            $start = date('Y-m-01', strtotime('first day of last month'));
            $end = date('Y-m-d', strtotime('first day of this month'));
            break;

        case 'Year to Date':
            $start = date('Y-01-01');
            $end = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'YTD':
            $start = date('Y-01-01');
            $end = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'Custom Dates': // ! need to test functionality after adding a calendar picker on the frontend
            // Expect custom start and end from query parameters
            $start = isset($_GET['startDate']) ? $_GET['startDate'] : date('Y-m-d');
            $end = isset($_GET['endDate']) ? $_GET['endDate'] : date('Y-m-d', strtotime('tomorrow'));
            break;

        default:
            // Default to Today if unknown option
            $start = date('Y-m-d');
            $end = date('Y-m-d', strtotime('tomorrow'));
            break;
        }
    }else{
        $start = date('Y-m-d');
        $end = date('Y-m-d', strtotime("tomorrow"));
    }

    // Handle secondary date range for performance metrics
    $secondaryStart = date('Y-m-d', strtotime('-29 days')); // Default to Rolling 30 Days
    $secondaryEnd = date('Y-m-d', strtotime('tomorrow'));
    
    if(array_key_exists('secondaryDateRange', $_GET)){
        switch ($_GET['secondaryDateRange']) {
        case 'Today':
            $secondaryStart = date('Y-m-d');
            $secondaryEnd = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'Yesterday':
            $secondaryStart = date('Y-m-d', strtotime('yesterday'));
            $secondaryEnd = date('Y-m-d');
            break;

        case 'Rolling 7':
        case 'Rolling 7 Days':
            $secondaryStart = date('Y-m-d', strtotime('-6 days')); // includes today
            $secondaryEnd = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'This Week (Sun-Sat)':
            $secondaryStart = date('Y-m-d', strtotime('last Sunday', strtotime('tomorrow')));
            $secondaryEnd = date('Y-m-d', strtotime('next Sunday'));
            break;

        case 'Last Week (Sun-Sat)':
            $secondaryStart = date('Y-m-d', strtotime('last Sunday -7 days'));
            $secondaryEnd = date('Y-m-d', strtotime('last Sunday'));
            break;

        case 'Rolling 30':
        case 'Rolling 30 Days':
            $secondaryStart = date('Y-m-d', strtotime('-29 days')); // includes today
            $secondaryEnd = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'This Month to Date':
            $secondaryStart = date('Y-m-01');
            $secondaryEnd = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'Last Month':
            $secondaryStart = date('Y-m-01', strtotime('first day of last month'));
            $secondaryEnd = date('Y-m-d', strtotime('first day of this month'));
            break;

        case 'Year to Date':
            $secondaryStart = date('Y-01-01');
            $secondaryEnd = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'YTD':
            $secondaryStart = date('Y-01-01');
            $secondaryEnd = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'Custom Dates':
            $secondaryStart = isset($_GET['secondaryStartDate']) ? $_GET['secondaryStartDate'] : date('Y-m-d', strtotime('-29 days'));
            $secondaryEnd = isset($_GET['secondaryEndDate']) ? $_GET['secondaryEndDate'] : date('Y-m-d', strtotime('tomorrow'));
            break;

        default:
            $secondaryStart = date('Y-m-d', strtotime('-29 days'));
            $secondaryEnd = date('Y-m-d', strtotime('tomorrow'));
            break;
        }
    }

    // Request scope flags (used by the dashboard to split primary vs secondary loads)
    $skipSecondary = !empty($_GET['skipSecondary']);
    $secondaryOnly = !empty($_GET['secondaryOnly']);
    $debugEnabled = !empty($_GET['debug']);

    // Drill-down tables ask for their raw rows on demand; everything else gets aggregates
    $rowsFor = isset($_GET['rowsFor']) && $_GET['rowsFor'] !== '' ? (string)$_GET['rowsFor'] : null;
    $activeTab = isset($_GET['tab']) ? (string)$_GET['tab'] : 'setters';
    // Records excluded by admins must be dropped before aggregating, since the
    // client can no longer subtract individual calls from a bucket total.
    $excludedCallIds = [];
    if (!empty($_GET['excludeCallIds'])) {
        foreach (explode(',', (string)$_GET['excludeCallIds']) as $excludedId) {
            $excludedId = trim($excludedId);
            if ($excludedId !== '') {
                $excludedCallIds[$excludedId] = true;
            }
        }
    }
    $lpId = isset($_GET['lpId']) ? intval($_GET['lpId']) : null;
    $scorecardFilterEmployeeName = null;

    // Raise limits for long windows (YTD / multi-month custom ranges)
    $primaryDays = ccDateRangeDayCount($start, $end);
    $secondaryDays = ccDateRangeDayCount($secondaryStart, $secondaryEnd);
    $longestDays = max($primaryDays, $secondaryDays);
    if ($longestDays > 60) {
        ini_set('memory_limit', '1024M');
        set_time_limit(300);
    }

    // GSP cold-call list IDs (cls_Calls.ccl_id) — shared by primary and secondary queries
    $gspCclIds = [10, 11, 18, 19];
    $gspCclSqlIn = implode(',', array_map('intval', $gspCclIds));
    $excludeGspCclSql = " AND (cls_Calls.ccl_id IS NULL OR cls_Calls.ccl_id NOT IN ($gspCclSqlIn))";
    // GSP calls: GSP cold-call lists and/or legacy IPP call type (cty_id)
    $gspCallsFilterSql = " AND cty_id NOT IN ('C') AND (cls_Calls.ccl_id IN ($gspCclSqlIn) OR cty_id = 'IPP')";

    if(array_key_exists('test', $_GET)){

    }else if($secondaryOnly){
        // Secondary-only request: skip primary horsepower window; still resolve agent name for filters
        if ($lpId !== null && $lpId > 0) {
            $empNameQuery = "SELECT FirstName, LastName FROM emp_Employees WHERE id = " . $lpId;
            $empNameResult = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($empNameQuery));
            if (!empty($empNameResult) && isset($empNameResult[0]['FirstName']) && isset($empNameResult[0]['LastName'])) {
                $scorecardFilterEmployeeName = trim($empNameResult[0]['FirstName']) . " " . trim($empNameResult[0]['LastName']);
            }
        }
        $responseData['settersCalls'] = [];
        $responseData['confirmersCalls'] = [];
        $responseData['gspCalls'] = [];
        $responseData['gspHours'] = [];
        $responseData['settersHours'] = [];
        $responseData['confirmersHours'] = [];
        $responseData['settersScorecards'] = [];
        $responseData['confirmersScorecards'] = [];
        $responseData['settersAppointments'] = [];
        $responseData['hours'] = [];
    }else{
        // STEP 1: Get unique deputy IDs and build Deputy-to-LP mapping from a lightweight query
        // This query gets all unique combinations of deputy ID and LP employee ID
        // If lpId is provided, filter to only that LP ID
        $deputyMappingQuery = "SELECT DISTINCT emp_user_12, emp_id, FirstName, LastName FROM cls_Calls LEFT JOIN emp_Employees ON emp_id = emp_Employees.id WHERE CallDate BETWEEN '$start' AND '$end' AND ResultCode NOT LIKE '%ND%' AND Dialer = 'True' AND emp_user_12 > 0";
        
        // If lpId is provided, filter to only that LP ID
        if ($lpId !== null && $lpId > 0) {
            $deputyMappingQuery .= " AND emp_id = " . $lpId;
        }
        
        $deputyMappingResults = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($deputyMappingQuery));
        if (!is_array($deputyMappingResults)) {
            $deputyMappingResults = [];
        }
        
        // Build mapping of Deputy ID to LP employee ID and collect all deputy IDs
        $deputyToLPMapping = [];
        $deputyToNameMapping = [];
        $deputyIDs = [];
        foreach($deputyMappingResults as $row){
            if(isset($row['emp_user_12']) && isset($row['emp_id'])){
                $deputyID = intval($row['emp_user_12']);
                $deputyToLPMapping[$deputyID] = intval($row['emp_id']);
                $deputyToNameMapping[$deputyID] = trim($row['FirstName'] . ' ' . $row['LastName']);
                if(!in_array($deputyID, $deputyIDs)){
                    $deputyIDs[] = $deputyID;
                }
            }
        }
        
        // STEP 2: Fetch timesheets for all deputy IDs to determine their operational unit and calculate hours
        $timesheets = [];
        $timesheetEmployees = [];
        $settersTimesheetEmployees = []; // Hours for employees clocked into Setter operational unit
        $confirmersTimesheetEmployees = []; // Hours for employees clocked into Confirmer operational unit
        $gspTimesheetEmployees = []; // Hours for employees clocked into GSP operational unit
        $employeeType = []; // Track if employee is setter or confirmer
        $employeeOperationalUnits = []; // Track operational units from timesheets
        $deputyIDOperationalUnits = []; // Track operational units per deputy ID to classify them

        $timesheetsByDeputy = ccFetchTimesheetsByDeputy($endpoint, $deputyIDs, $start, $end);
        foreach($deputyIDs as $deputyID){
            $theseTimesheets = $timesheetsByDeputy[intval($deputyID)] ?? [];
            if (!is_array($theseTimesheets)) {
                $theseTimesheets = [];
            }
            foreach($theseTimesheets as $timesheet){
                // Capture operational unit information
                $operationalUnitName = null;
                if(isset($timesheet['_DPMetaData']['OperationalUnitInfo']['OperationalUnitName'])){
                    $operationalUnitName = $timesheet['_DPMetaData']['OperationalUnitInfo']['OperationalUnitName'];
                }
                
                // Track operational units for this deputy ID (for classification)
                if($operationalUnitName){
                    if(!isset($deputyIDOperationalUnits[$deputyID])){
                        $deputyIDOperationalUnits[$deputyID] = [];
                    }
                    if(!in_array($operationalUnitName, $deputyIDOperationalUnits[$deputyID])){
                        $deputyIDOperationalUnits[$deputyID][] = $operationalUnitName;
                    }
                }
                
                // Determine if this timesheet is for a setter, confirmer, or GSP based on operational unit
                $isSetterOperationalUnit = isSetterOperationalUnit($operationalUnitName);
                $isConfirmerOperationalUnit = $operationalUnitName && (
                    $operationalUnitName === 'Confirmer' || 
                    $operationalUnitName === 'Confirmer - Office' ||
                    stripos($operationalUnitName, 'Confirmer') !== false
                );
                $isGSPOperationalUnit = isGspOperationalUnit($operationalUnitName);
                
                if($timesheet['IsInProgress']){
                    $timesheet['EndTimeLocalized'] = date('Y-m-d H:i:s');
                }
                $employeeID = $timesheet['Employee'];
                
                // Calculate hours for this timesheet
                $hoursToAdd = 0;
                if($timesheet['IsInProgress'] && isset($timesheet['StartTimeLocalized'])){
                    $currentTime = date('Y-m-d H:i:s');
                    $hoursToAdd = (strtotime($currentTime) - strtotime($timesheet['StartTimeLocalized'])) / 60 / 60;
                }else if(isset($timesheet['TotalTime']) && $timesheet['TotalTime'] !== '' && $timesheet['TotalTime'] !== null){
                    $hoursToAdd = floatval($timesheet['TotalTime']);
                }else if(isset($timesheet['StartTimeLocalized']) && isset($timesheet['EndTimeLocalized'])){
                    $hoursToAdd = (strtotime($timesheet['EndTimeLocalized']) - strtotime($timesheet['StartTimeLocalized'])) / 60 / 60;
                }
                
                // Add to general timesheetEmployees (for backward compatibility)
                if(!array_key_exists($employeeID, $timesheetEmployees)){
                    $timesheetEmployees[$employeeID] = ['hours' => 0];
                }
                $timesheetEmployees[$employeeID]['hours'] += $hoursToAdd;
                
                // Add to setter-specific hours if operational unit is Setter
                if($isSetterOperationalUnit){
                    if(!array_key_exists($employeeID, $settersTimesheetEmployees)){
                        $settersTimesheetEmployees[$employeeID] = ['hours' => 0];
                    }
                    $settersTimesheetEmployees[$employeeID]['hours'] += $hoursToAdd;
                }
                
                // Add to confirmer-specific hours if operational unit is Confirmer
                if($isConfirmerOperationalUnit){
                    if(!array_key_exists($employeeID, $confirmersTimesheetEmployees)){
                        $confirmersTimesheetEmployees[$employeeID] = ['hours' => 0];
                    }
                    $confirmersTimesheetEmployees[$employeeID]['hours'] += $hoursToAdd;
                }
                
                // Add to GSP-specific hours if operational unit is GSP (includes legacy IPP units)
                if($isGSPOperationalUnit){
                    if(!array_key_exists($employeeID, $gspTimesheetEmployees)){
                        $gspTimesheetEmployees[$employeeID] = ['hours' => 0];
                    }
                    $gspTimesheetEmployees[$employeeID]['hours'] += $hoursToAdd;
                }
                
                // Track operational units for this employee
                if($operationalUnitName){
                    if(!isset($employeeOperationalUnits[$employeeID])){
                        $employeeOperationalUnits[$employeeID] = [];
                    }
                    if(!in_array($operationalUnitName, $employeeOperationalUnits[$employeeID])){
                        $employeeOperationalUnits[$employeeID][] = $operationalUnitName;
                    }
                }
            }
        }
        
        // STEP 3: Classify deputy IDs based on operational unit
        $settersDeputyIDs = [];
        $confirmersDeputyIDs = [];
        $gspDeputyIDs = [];
        foreach($deputyIDs as $deputyID){
            $hasSetterUnit = false;
            $hasConfirmerUnit = false;
            $hasGSPUnit = false;
            
            if(isset($deputyIDOperationalUnits[$deputyID])){
                foreach($deputyIDOperationalUnits[$deputyID] as $unitName){
                    if(isSetterOperationalUnit($unitName)){
                        $hasSetterUnit = true;
                    }
                    if($unitName === 'Confirmer' || $unitName === 'Confirmer - Office' || stripos($unitName, 'Confirmer') !== false){
                        $hasConfirmerUnit = true;
                    }
                    if(isGspOperationalUnit($unitName)){
                        $hasGSPUnit = true;
                    }
                }
            }
            // Classify based on operational unit
            if($hasSetterUnit){
                $settersDeputyIDs[] = $deputyID;
            } 
            if($hasConfirmerUnit){
                $confirmersDeputyIDs[] = $deputyID;
            }
            if($hasGSPUnit){
                $gspDeputyIDs[] = $deputyID;
            }
        }
        
        // Make deputy ID arrays unique
        $settersDeputyIDs = array_unique($settersDeputyIDs);
        $confirmersDeputyIDs = array_unique($confirmersDeputyIDs);
        $gspDeputyIDs = array_unique($gspDeputyIDs);
        
        // DEBUG: Track employee types
        $debugInfo = [
            'settersDeputyIDs' => $settersDeputyIDs,
            'confirmersDeputyIDs' => $confirmersDeputyIDs,
            'gspDeputyIDs' => $gspDeputyIDs,
            'allDeputyIDs' => $deputyIDs,
            'deputyIDOperationalUnits' => $deputyIDOperationalUnits,
            'settersEmployeeNames' => [],
            'confirmersEmployeeNames' => [],
            'timesheetProcessing' => [],
            'timesheetEmployeesDetails' => [],
            'finalHoursBreakdown' => []
        ];

        // STEP 4: Fetch calls filtered by classified deputy IDs (at SQL level)
        $settersCalls = [];
        $confirmersCalls = [];
        $gspCalls = [];
        
        // Fetch calls in parallel month chunks for long ranges (avoids SQL/gateway timeouts on YTD)
        $settersCalls = [];
        $gspCalls = [];
        $confirmersCalls = [];
        if(!empty($settersDeputyIDs)){
            $settersDeputyIdsList = implode(',', $settersDeputyIDs);
            $settersCalls = ccFetchLpReportChunked($endpoint, function($chunkStart, $chunkEnd) use ($settersDeputyIdsList, $excludeGspCclSql) {
                return "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued, cls_Calls.lds_id, cls_Calls.cst_id, cls_Calls.cqd_id FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$chunkStart' AND '$chunkEnd' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($settersDeputyIdsList) AND cty_id NOT IN ('C', 'IPP')$excludeGspCclSql";
            }, $start, $end);
        }
        if(!empty($gspDeputyIDs)){
            $gspDeputyIdsList = implode(',', $gspDeputyIDs);
            $gspCalls = ccFetchLpReportChunked($endpoint, function($chunkStart, $chunkEnd) use ($gspDeputyIdsList, $gspCallsFilterSql) {
                return "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued, cls_Calls.lds_id, cls_Calls.cst_id, cls_Calls.cqd_id FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$chunkStart' AND '$chunkEnd' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($gspDeputyIdsList)$gspCallsFilterSql";
            }, $start, $end);
        }
        if(!empty($confirmersDeputyIDs)){
            $confirmersDeputyIdsList = implode(',', $confirmersDeputyIDs);
            $confirmersCalls = ccFetchLpReportChunked($endpoint, function($chunkStart, $chunkEnd) use ($confirmersDeputyIdsList, $excludeGspCclSql) {
                return "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued, cls_Calls.cqd_id FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$chunkStart' AND '$chunkEnd' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($confirmersDeputyIdsList) AND cty_id = 'C'$excludeGspCclSql";
            }, $start, $end);
        }

        // STEP 5: Process setters calls (already filtered by operational unit at SQL level)
        foreach($settersCalls as $call){
            $deputyID = $call['emp_user_12'];
            if(!array_key_exists(intval($deputyID), $timesheetEmployees)){
                continue;
            }
            $employeeName = $call['FirstName'] . " " . $call['LastName'];
            $employeeID = intval($deputyID);
            $timesheetEmployees[$employeeID]['employee'] = $employeeName;
            // Set employee name in setter-specific hours if they have setter hours
            if(array_key_exists($employeeID, $settersTimesheetEmployees)){
                $settersTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            }
            $employeeType[$employeeID] = 'setter';
            if(!in_array($employeeName, $debugInfo['settersEmployeeNames'])){
                $debugInfo['settersEmployeeNames'][] = $employeeName;
            }
            $responseData['settersCalls'][] = [
                'id' => $call['id'],
                'employee' => $employeeName,
                'date' => $call['CallDate'],
                'result' => $call['ResultCode'],
                'cty_id' => $call['cty_id'],
                'connected' => $call['Connected'],
                'pitched' => $call['Pitched'],
                'positive' => $call['Positive'],
                'qualified' => ($call['qualified'] == 1 ? true : false),
                'ApptSet' => $call['ApptSet'] ?? null,
                'Issued' => $call['Issued'] ?? null,
                'lds_id' => $call['lds_id'] ?? null,
                'cst_id' => $call['cst_id'] ?? null,
                'cqd_id' => $call['cqd_id'] ?? null,
            ];
        }

        // Process confirmers calls (already filtered by operational unit at SQL level)
        foreach($confirmersCalls as $call){
            $deputyID = $call['emp_user_12'];
            if(!array_key_exists(intval($deputyID), $timesheetEmployees)){
                continue;
            }

            $employeeName = $call['FirstName'] . " " . $call['LastName'];
            $employeeID = intval($deputyID);
            $timesheetEmployees[$employeeID]['employee'] = $employeeName;
            // Set employee name in confirmer-specific hours if they have confirmer hours
            if(array_key_exists($employeeID, $confirmersTimesheetEmployees)){
                $confirmersTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            }
            $employeeType[$employeeID] = 'confirmer';
            if(!in_array($employeeName, $debugInfo['confirmersEmployeeNames'])){
                $debugInfo['confirmersEmployeeNames'][] = $employeeName;
            }
            $responseData['confirmersCalls'][] = [
                'id' => $call['id'],
                'employee' => $employeeName,
                'date' => $call['CallDate'],
                'result' => $call['ResultCode'],
                'cty_id' => $call['cty_id'],
                'connected' => $call['Connected'],
                'pitched' => $call['Pitched'],
                'positive' => $call['Positive'],
                'qualified' => ($call['qualified'] == 1 ? true : false),
                'ApptSet' => $call['ApptSet'] ?? null,
                'Issued' => $call['Issued'] ?? null,
                'cqd_id' => $call['cqd_id'] ?? null,
            ];
        }

        // Process GSP calls (GSP deputies + GSP cold-call list IDs / legacy IPP call type)
        foreach($gspCalls as $call){
            $deputyID = $call['emp_user_12'];
            if(!array_key_exists(intval($deputyID), $gspTimesheetEmployees)){
                continue;
            }
            $employeeName = $call['FirstName'] . " " . $call['LastName'];
            $employeeID = intval($deputyID);
            $timesheetEmployees[$employeeID]['employee'] = $employeeName;
            if(array_key_exists($employeeID, $gspTimesheetEmployees)){
                $gspTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            }
            $employeeType[$employeeID] = 'gsp';
            $responseData['gspCalls'][] = [
                'id' => $call['id'],
                'employee' => $employeeName,
                'date' => $call['CallDate'],
                'result' => $call['ResultCode'],
                'cty_id' => $call['cty_id'],
                'connected' => $call['Connected'],
                'pitched' => $call['Pitched'],
                'positive' => $call['Positive'],
                'qualified' => ($call['qualified'] == 1 ? true : false),
                'ApptSet' => $call['ApptSet'] ?? null,
                'Issued' => $call['Issued'] ?? null,
                'lds_id' => $call['lds_id'] ?? null,
                'cst_id' => $call['cst_id'] ?? null,
                'cqd_id' => $call['cqd_id'] ?? null,
            ];
        }
        // DEBUG: Build detailed breakdown of timesheetEmployees
        foreach($timesheetEmployees as $empID => $empData){
            $debugInfo['timesheetEmployeesDetails'][] = [
                'employeeID' => $empID,
                'employeeName' => $empData['employee'] ?? 'UNKNOWN',
                'hours' => $empData['hours'] ?? 0,
                'type' => $employeeType[$empID] ?? 'UNKNOWN',
                'deputyID' => in_array($empID, $settersDeputyIDs) ? 'SETTER' : (in_array($empID, $confirmersDeputyIDs) ? 'CONFIRMER' : 'NEITHER'),
                'operationalUnits' => $employeeOperationalUnits[$empID] ?? [],
                'isConfirmerByOperationalUnit' => !empty($employeeOperationalUnits[$empID]) && 
                    (in_array('Confirmer - Office', $employeeOperationalUnits[$empID]) || 
                     in_array('Confirmer', $employeeOperationalUnits[$empID]) ||
                     preg_match('/confirmer/i', implode(' ', $employeeOperationalUnits[$empID])))
            ];
        }

        // Set employee names for setter hours (in case they have hours but no calls)
        foreach($settersTimesheetEmployees as $empID => $empData){
            if(!isset($empData['employee']) || empty($empData['employee'])){
                // Try to get name from timesheetEmployees
                if(isset($timesheetEmployees[$empID]['employee'])){
                    $settersTimesheetEmployees[$empID]['employee'] = $timesheetEmployees[$empID]['employee'];
                } else {
                    // Try to get name from setters calls
                    foreach($settersCalls as $call){
                        if(intval($call['emp_user_12']) == $empID){
                            $settersTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                            break;
                        }
                    }
                }
            }
        }
        
        // Set employee names for confirmer hours (in case they have hours but no confirmer calls)
        foreach($confirmersTimesheetEmployees as $empID => $empData){
            if(!isset($empData['employee']) || empty($empData['employee'])){
                // Try to get name from timesheetEmployees
                if(isset($timesheetEmployees[$empID]['employee'])){
                    $confirmersTimesheetEmployees[$empID]['employee'] = $timesheetEmployees[$empID]['employee'];
                } else {
                    // Try to get name from confirmers calls
                    foreach($confirmersCalls as $call){
                        if(intval($call['emp_user_12']) == $empID){
                            $confirmersTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                            break;
                        }
                    }
                    // If still not found, try setters calls (they might have setter calls but confirmer hours)
                    if(!isset($confirmersTimesheetEmployees[$empID]['employee'])){
                        foreach($settersCalls as $call){
                            if(intval($call['emp_user_12']) == $empID){
                                $confirmersTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        // Set employee names for GSP hours (in case they have hours but no calls)
        foreach($gspTimesheetEmployees as $empID => $empData){
            if(!isset($empData['employee']) || empty($empData['employee'])){
                if(isset($timesheetEmployees[$empID]['employee'])){
                    $gspTimesheetEmployees[$empID]['employee'] = $timesheetEmployees[$empID]['employee'];
                } else {
                    foreach($gspCalls as $call){
                        if(intval($call['emp_user_12']) == $empID){
                            $gspTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                            break;
                        }
                    }
                    if(!isset($gspTimesheetEmployees[$empID]['employee']) && isset($deputyToNameMapping[$empID])){
                        $gspTimesheetEmployees[$empID]['employee'] = $deputyToNameMapping[$empID];
                    }
                }
            }
        }
        
        // Use setter-specific hours array (based on operational unit) for setters dashboard
        // This ensures only employees clocked into "Setter" operational unit appear in setters hours
        $responseData['settersHours'] = array_values($settersTimesheetEmployees);
        $responseData['confirmersHours'] = array_values($confirmersTimesheetEmployees);
        $responseData['gspHours'] = array_values($gspTimesheetEmployees);
        
        // DEBUG: Analyze final hours array (now using setter-specific hours)
        $settersInHours = 0;
        $confirmersInHours = 0;
        $unknownInHours = 0;
        $mismatches = [];
        
        foreach($responseData['settersHours'] as $hourEntry){
            $empName = $hourEntry['employee'] ?? 'UNKNOWN';
            $empHours = $hourEntry['hours'] ?? 0;
            $isSetter = in_array($empName, $debugInfo['settersEmployeeNames']);
            $isConfirmer = in_array($empName, $debugInfo['confirmersEmployeeNames']);
            
            // Find employee ID to get operational unit info
            $empID = null;
            foreach($timesheetEmployees as $id => $data){
                if(($data['employee'] ?? '') === $empName){
                    $empID = $id;
                    break;
                }
            }
            
            $operationalUnits = $empID ? ($employeeOperationalUnits[$empID] ?? []) : [];
            $isConfirmerByOperationalUnit = !empty($operationalUnits) && 
                (in_array('Confirmer - Office', $operationalUnits) || 
                 in_array('Confirmer', $operationalUnits) ||
                 preg_match('/confirmer/i', implode(' ', $operationalUnits)));
            $isSetterByOperationalUnit = false;
            if(!empty($operationalUnits)){
                foreach($operationalUnits as $unitName){
                    if(isSetterOperationalUnit($unitName)){
                        $isSetterByOperationalUnit = true;
                        break;
                    }
                }
            }
            
            $issue = 'OK';
            if($isConfirmerByOperationalUnit && !$isSetterByOperationalUnit){
                $issue = 'SHOULD_NOT_BE_HERE: Clocked in as CONFIRMER but in setters hours array';
                $mismatches[] = $empName;
            } elseif($isConfirmer && !$isSetter){
                $issue = 'CONFIRMER_IN_SETTERS_HOURS';
            }
            
            if($isConfirmer && !$isSetter){
                $confirmersInHours++;
            } elseif($isSetter && !$isConfirmer){
                $settersInHours++;
            } else {
                $unknownInHours++;
            }
            
            $debugInfo['finalHoursBreakdown'][] = [
                'employee' => $empName,
                'hours' => $empHours,
                'isSetter' => $isSetter,
                'isConfirmer' => $isConfirmer,
                'operationalUnits' => $operationalUnits,
                'isConfirmerByOperationalUnit' => $isConfirmerByOperationalUnit,
                'isSetterByOperationalUnit' => $isSetterByOperationalUnit,
                'issue' => $issue
            ];
        }
        
        // DEBUG: Also show what's in the setter-specific hours array
        $debugInfo['settersHoursArray'] = [];
        foreach($settersTimesheetEmployees as $empID => $empData){
            $debugInfo['settersHoursArray'][] = [
                'employeeID' => $empID,
                'employeeName' => $empData['employee'] ?? 'UNKNOWN',
                'hours' => $empData['hours'] ?? 0,
                'operationalUnits' => $employeeOperationalUnits[$empID] ?? []
            ];
        }
        
        // DEBUG: Show what's in the confirmer-specific hours array
        $debugInfo['confirmersHoursArray'] = [];
        foreach($confirmersTimesheetEmployees as $empID => $empData){
            $debugInfo['confirmersHoursArray'][] = [
                'employeeID' => $empID,
                'employeeName' => $empData['employee'] ?? 'UNKNOWN',
                'hours' => $empData['hours'] ?? 0,
                'operationalUnits' => $employeeOperationalUnits[$empID] ?? []
            ];
        }
        
        // DEBUG: Add summary
        $debugInfo['summary'] = [
            'totalSettersDeputyIDs' => count($settersDeputyIDs),
            'totalConfirmersDeputyIDs' => count($confirmersDeputyIDs),
            'totalDeputyIDs' => count($deputyIDs),
            'totalSettersEmployees' => count($debugInfo['settersEmployeeNames']),
            'totalConfirmersEmployees' => count($debugInfo['confirmersEmployeeNames']),
            'totalTimesheetEmployees' => count($timesheetEmployees),
            'totalSettersHoursEntries' => count($settersTimesheetEmployees),
            'totalConfirmersHoursEntries' => count($confirmersTimesheetEmployees),
            'totalSettersHoursEntries' => count($responseData['settersHours']),
            'totalConfirmersHoursEntries' => count($responseData['confirmersHours']),
            'settersInHoursArray' => $settersInHours,
            'confirmersInHoursArray' => $confirmersInHours,
            'unknownInHoursArray' => $unknownInHours,
            'mismatches' => $mismatches,
            'mismatchCount' => count($mismatches),
            'problem' => count($mismatches) > 0 ? 'MISMATCHES_FOUND' : ($confirmersInHours > 0 ? 'CONFIRMERS_FOUND_IN_HOURS_ARRAY' : 'OK'),
            'note' => count($mismatches) > 0 ? 'Employees clocked in as Confirmer found in setters hours array (should not happen with operational unit filtering)' : 'Hours array now filtered by operational unit - only Setter operational unit employees appear'
        ];
        
        // Add debug info to response only when explicitly requested (it is large)
        if($debugEnabled){
            $responseData['_debug'] = $debugInfo;
        }

        // Get unique employee names for setters and confirmers
        $settersEmployeeNames = [];
        $confirmersEmployeeNames = [];
        
        foreach($settersCalls as $call){
            $employeeName = $call['FirstName'] . " " . $call['LastName'];
            if(!in_array($employeeName, $settersEmployeeNames)){
                $settersEmployeeNames[] = $employeeName;
            }
        }
        
        foreach($confirmersCalls as $call){
            $employeeName = $call['FirstName'] . " " . $call['LastName'];
            if(!in_array($employeeName, $confirmersEmployeeNames)){
                $confirmersEmployeeNames[] = $employeeName;
            }
        }

        // Query scorecards for setters and confirmers
        $integrityDB = new db(
            'dme_v2_integrity',   // database name
            '134.209.125.255',    // host
            'integrity',           // username
            'IvstNnK29kSE3l2T8mPl' // password
        );
        
        // Calculate end date for query (subtract 1 day since $end is exclusive "tomorrow")
        $queryEndDate = date('Y-m-d', strtotime($end . ' -1 day'));
        
        // Setters scorecards query - form_id = 11
        $settersScorecardsQuery = "SELECT id, form_id, status, created_at, updated_at, variables_used, form_data, responses FROM form_instances 
            WHERE DATE(STR_TO_DATE(variables_used->>'$.CallDate','%Y-%m-%d %H:%i:%s.%f')) BETWEEN '$start' AND '$queryEndDate'
            AND form_id = 11 
            AND status = 'completed'";
        
        $settersScorecardsRaw = $integrityDB->query($settersScorecardsQuery);
        
        // Confirmers scorecards query - form_id = 12
        $confirmersScorecardsQuery = "SELECT id, form_id, status, created_at, updated_at, variables_used, form_data, responses FROM form_instances 
            WHERE DATE(STR_TO_DATE(variables_used->>'$.CallDate','%Y-%m-%d %H:%i:%s.%f')) BETWEEN '$start' AND '$queryEndDate'
            AND form_id = 12 
            AND status = 'completed'";
        
        $confirmersScorecardsRaw = $integrityDB->query($confirmersScorecardsQuery);

        // Process and match scorecards to employees
        $responseData['settersScorecards'] = [];
        $responseData['confirmersScorecards'] = [];

        // Helper: extract per-criterion scorecard items + aggregate score totals.
        //
        // actualTotal uses the LEGACY summation (sum every type:'number' value in responses)
        // so the gauge math is bit-identical to the previous implementation, regardless of
        // whether the per-field matching below succeeds.
        //
        // items[] are a best-effort drill-down. Matching tries (in order): exact key/id/name,
        // label, then a positional queue of number-typed responses.
        // extractScorecardItems defined in efficiency helpers above

        // Helper: build an index of calls keyed by employee name for fast (name + time) lookups.
        // Each entry is an array of [ts => unix_timestamp, call => raw_call_row].
        // buildCallIndex defined in efficiency helpers above

        // Helper: given a call index, find the closest call to the given (employee, callDate)
        // within $toleranceSeconds. Returns null if no match.
        // findLinkedCall defined in efficiency helpers above

        // Get employee name for lpId filtering (if lpId is provided)
        if ($lpId !== null && $lpId > 0 && $scorecardFilterEmployeeName === null) {
            $empNameQuery = "SELECT FirstName, LastName FROM emp_Employees WHERE id = " . $lpId;
            $empNameResult = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($empNameQuery));
            if (!empty($empNameResult) && isset($empNameResult[0]['FirstName']) && isset($empNameResult[0]['LastName'])) {
                $scorecardFilterEmployeeName = trim($empNameResult[0]['FirstName']) . " " . trim($empNameResult[0]['LastName']);
            }
        }

        // Build (employee + CallDate) indexes for linking each scorecard back to a call/prospect.
        // Setters can be matched against either setters calls or GSP calls (some GSP setters score on form 11).
        $settersCallsIndex = buildCallIndex(array_merge(
            is_array($settersCalls) ? $settersCalls : [],
            is_array($gspCalls) ? $gspCalls : []
        ));
        $confirmersCallsIndex = buildCallIndex(is_array($confirmersCalls) ? $confirmersCalls : []);

        // Process setters scorecards
        foreach($settersScorecardsRaw as $scorecard){
            // Extract employee name from variables_used first (for filtering)
            $employeeName = null;
            $callDate = null;
            $variables = null;
            if(isset($scorecard['variables_used'])){
                $variables = is_string($scorecard['variables_used']) 
                    ? json_decode($scorecard['variables_used'], true) 
                    : $scorecard['variables_used'];
                
                if(is_array($variables)){
                    $callDate = $variables['CallDate'] ?? null;
                    $empFirstName = $variables['EmpFirstName'] ?? null;
                    $empLastName = $variables['EmpLastName'] ?? null;
                    if($empFirstName && $empLastName){
                        $employeeName = trim($empFirstName) . " " . trim($empLastName);
                    }
                }
            }
            
            // If lpId is provided, filter scorecards to only include those for that employee
            if ($scorecardFilterEmployeeName !== null && $employeeName !== $scorecardFilterEmployeeName) {
                continue;
            }
            
            $scorecardData = [
                'id' => $scorecard['id'] ?? null,
                'form_instance_id' => $scorecard['id'] ?? null,
                'form_id' => $scorecard['form_id'] ?? null,
                'status' => $scorecard['status'] ?? null,
                'created_at' => $scorecard['created_at'] ?? null,
                'updated_at' => $scorecard['updated_at'] ?? null,
            ];
            
            $scorecardData['callDate'] = $callDate;
            $scorecardData['employee'] = $employeeName;
            $scorecardData['variables'] = is_array($variables) ? $variables : null;

            $extracted = extractScorecardItems(
                $scorecard['form_data'] ?? null,
                $scorecard['responses'] ?? null
            );
            $maxTotal    = $extracted['maxTotal'];
            $actualTotal = $extracted['actualTotal'];
            $score = $maxTotal > 0 ? round(($actualTotal / $maxTotal) * 100, 2) : 0;

            $scorecardData['items']       = $extracted['items'];
            $scorecardData['maxTotal']    = $maxTotal;
            $scorecardData['actualTotal'] = $actualTotal;
            $scorecardData['score']       = $score;
            $scorecardData['linkedCall']  = findLinkedCall($settersCallsIndex, $employeeName, $callDate);

            $responseData['settersScorecards'][] = $scorecardData;
        }

        // Process confirmers scorecards
        foreach($confirmersScorecardsRaw as $scorecard){
            // Extract employee name from variables_used first (for filtering)
            $employeeName = null;
            $callDate = null;
            $variables = null;
            if(isset($scorecard['variables_used'])){
                $variables = is_string($scorecard['variables_used']) 
                    ? json_decode($scorecard['variables_used'], true) 
                    : $scorecard['variables_used'];
                
                if(is_array($variables)){
                    $callDate = $variables['CallDate'] ?? null;
                    $empFirstName = $variables['EmpFirstName'] ?? null;
                    $empLastName = $variables['EmpLastName'] ?? null;
                    if($empFirstName && $empLastName){
                        $employeeName = trim($empFirstName) . " " . trim($empLastName);
                    }
                }
            }
            
            // If lpId is provided, filter scorecards to only include those for that employee
            if ($scorecardFilterEmployeeName !== null && $employeeName !== $scorecardFilterEmployeeName) {
                continue;
            }
            
            $scorecardData = [
                'id' => $scorecard['id'] ?? null,
                'form_instance_id' => $scorecard['id'] ?? null,
                'form_id' => $scorecard['form_id'] ?? null,
                'status' => $scorecard['status'] ?? null,
                'created_at' => $scorecard['created_at'] ?? null,
                'updated_at' => $scorecard['updated_at'] ?? null,
            ];
            
            $scorecardData['callDate'] = $callDate;
            $scorecardData['employee'] = $employeeName;
            $scorecardData['variables'] = is_array($variables) ? $variables : null;

            $extracted = extractScorecardItems(
                $scorecard['form_data'] ?? null,
                $scorecard['responses'] ?? null
            );
            $maxTotal    = $extracted['maxTotal'];
            $actualTotal = $extracted['actualTotal'];
            $score = $maxTotal > 0 ? round(($actualTotal / $maxTotal) * 100, 2) : 0;

            $scorecardData['items']       = $extracted['items'];
            $scorecardData['maxTotal']    = $maxTotal;
            $scorecardData['actualTotal'] = $actualTotal;
            $scorecardData['score']       = $score;
            $scorecardData['linkedCall']  = findLinkedCall($confirmersCallsIndex, $employeeName, $callDate);

            $responseData['confirmersScorecards'][] = $scorecardData;
        }

        // Get LP employee IDs for employees in settersDeputyIDs array
        $setterLPEmployeeIds = [];
        foreach($settersDeputyIDs as $deputyID){
            if(isset($deputyToLPMapping[$deputyID])){
                $setterLPEmployeeIds[] = $deputyToLPMapping[$deputyID];
            }
        }
        $setterLPEmployeeIds = array_unique($setterLPEmployeeIds);
        
        // Fetch appointments for setters (for gross issue calculation)
        // Only include appointments where SetBy is an employee in settersDeputyIDs array
        // ApptSet is determined from disposition (not the ApptSet column), matching LeadProg sync
        $settersAppointments = [];
        if(!empty($setterLPEmployeeIds)){
            if (empty($dispositions)) {
                $dispositions = loadDispositionsByDescr($endpoint);
            }
            $setterLPEmployeeIdsList = implode(',', $setterLPEmployeeIds);
            $settersAppointments = ccFetchLpReportChunked($endpoint, function($chunkStart, $chunkEnd) use ($setterLPEmployeeIdsList) {
                return "SELECT app_Appointments.id, app_Appointments.lds_id, app_Appointments.cst_id, app_Appointments.ApptDate, app_Appointments.Dsp_ID, app_Appointments.SetBy, app_Appointments.ApptSet, app_Appointments.Issued, app_Appointments.NetIssued, emp_Employees.FirstName, emp_Employees.LastName FROM app_Appointments LEFT JOIN emp_Employees ON app_Appointments.SetBy = emp_Employees.id WHERE app_Appointments.ApptDate BETWEEN '$chunkStart' AND '$chunkEnd' AND emp_Employees.Dialer = '1' AND Dsp_ID NOT IN ('Set') AND app_Appointments.SetBy IN ($setterLPEmployeeIdsList) ORDER BY app_Appointments.id DESC";
            }, $start, $end);
            if(!is_array($settersAppointments)){
                $settersAppointments = [];
            }
            // Disposition-based ApptSet filter, then drop older/duplicate same-day appointments for the same lead
            $settersAppointments = filterAppointmentsSetByDisposition($settersAppointments, $dispositions);
            $settersAppointments = filterLatestAppointmentPerLeadPerDay($settersAppointments);
        }
        
        // Format appointments data
        $responseData['settersAppointments'] = [];
        foreach($settersAppointments as $appointment){
            $employeeName = null;
            if(isset($appointment['FirstName']) && isset($appointment['LastName'])){
                $employeeName = trim($appointment['FirstName']) . " " . trim($appointment['LastName']);
            }
            
            $responseData['settersAppointments'][] = [
                'id' => $appointment['id'] ?? null,
                'lds_id' => $appointment['lds_id'] ?? null,
                'cst_id' => $appointment['cst_id'] ?? null,
                'dsp_id' => $appointment['Dsp_ID'] ?? null,
                'employee' => $employeeName,
                'date' => $appointment['ApptDate'] ?? null,
                'ApptSet' => $appointment['ApptSet'] ?? null,
                'Issued' => $appointment['Issued'] ?? null,
                'NetIssued' => $appointment['NetIssued'] ?? null,
            ];
        }
        
        // Store the setter LP employee IDs for use in secondary queries
        if($debugEnabled){
            $responseData['_setterLPEmployeeIds'] = $setterLPEmployeeIds;
        }
    }

    // Fetch secondary data for performance metrics if secondaryDateRange is provided
    $responseData['secondarySettersCalls'] = [];
    $responseData['secondaryConfirmersCalls'] = [];
    $responseData['secondaryGspCalls'] = [];
    $responseData['secondaryGspHours'] = [];
    $responseData['secondarySettersHours'] = [];
    $responseData['secondaryConfirmersHours'] = [];
    $responseData['secondarySettersScorecards'] = [];
    $responseData['secondaryConfirmersScorecards'] = [];
    $responseData['secondarySettersAppointments'] = [];
    
    if(!$skipSecondary && array_key_exists('secondaryDateRange', $_GET)){
        $rangesMatch = (!$secondaryOnly && $start === $secondaryStart && $end === $secondaryEnd);
        if ($rangesMatch) {
            $responseData['secondarySettersCalls'] = $responseData['settersCalls'] ?? [];
            $responseData['secondaryConfirmersCalls'] = $responseData['confirmersCalls'] ?? [];
            $responseData['secondaryGspCalls'] = $responseData['gspCalls'] ?? [];
            $responseData['secondarySettersHours'] = $responseData['settersHours'] ?? [];
            $responseData['secondaryConfirmersHours'] = $responseData['confirmersHours'] ?? [];
            $responseData['secondaryGspHours'] = $responseData['gspHours'] ?? [];
            $responseData['secondarySettersScorecards'] = $responseData['settersScorecards'] ?? [];
            $responseData['secondaryConfirmersScorecards'] = $responseData['confirmersScorecards'] ?? [];
            $responseData['secondarySettersAppointments'] = $responseData['settersAppointments'] ?? [];
        } else {
        // STEP 1: Get unique deputy IDs for secondary date range
        $secondaryDeputyMappingQuery = "SELECT DISTINCT emp_user_12, emp_id, FirstName, LastName FROM cls_Calls LEFT JOIN emp_Employees ON emp_id = emp_Employees.id WHERE CallDate BETWEEN '$secondaryStart' AND '$secondaryEnd' AND ResultCode NOT LIKE '%ND%' AND Dialer = 'True' AND emp_user_12 > 0";
        
        // If lpId is provided, filter secondary data to only that LP ID
        if ($lpId !== null && $lpId > 0) {
            $secondaryDeputyMappingQuery .= " AND emp_id = " . $lpId;
        }
        
        $secondaryDeputyMappingResults = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($secondaryDeputyMappingQuery));
        if (!is_array($secondaryDeputyMappingResults)) {
            $secondaryDeputyMappingResults = [];
        }
        
        // Build mapping and collect deputy IDs
        $secondaryDeputyToLPMapping = [];
        $secondaryDeputyToNameMapping = [];
        $secondaryDeputyIDs = [];
        foreach($secondaryDeputyMappingResults as $row){
            if(isset($row['emp_user_12']) && isset($row['emp_id'])){
                $deputyID = intval($row['emp_user_12']);
                $secondaryDeputyToLPMapping[$deputyID] = intval($row['emp_id']);
                $secondaryDeputyToNameMapping[$deputyID] = trim($row['FirstName'] . ' ' . $row['LastName']);
                if(!in_array($deputyID, $secondaryDeputyIDs)){
                    $secondaryDeputyIDs[] = $deputyID;
                }
            }
        }

        // STEP 2: Fetch timesheets for secondary date range
        $secondaryTimesheetEmployees = [];
        $secondarySettersTimesheetEmployees = []; // Hours for employees clocked into Setter operational unit
        $secondaryConfirmersTimesheetEmployees = []; // Hours for employees clocked into Confirmer operational unit
        $secondaryGspTimesheetEmployees = []; // Hours for employees clocked into GSP operational unit
        $secondaryDeputyIDOperationalUnits = []; // Track operational units per deputy ID
        
        $secondaryTimesheetsByDeputy = ccFetchTimesheetsByDeputy($endpoint, $secondaryDeputyIDs, $secondaryStart, $secondaryEnd);
        foreach($secondaryDeputyIDs as $deputyID){
            $theseTimesheets = $secondaryTimesheetsByDeputy[intval($deputyID)] ?? [];
            if (!is_array($theseTimesheets)) {
                $theseTimesheets = [];
            }
            foreach($theseTimesheets as $timesheet){
                // Determine if this timesheet is for a setter, confirmer, or GSP based on operational unit
                $operationalUnitName = null;
                if(isset($timesheet['_DPMetaData']['OperationalUnitInfo']['OperationalUnitName'])){
                    $operationalUnitName = $timesheet['_DPMetaData']['OperationalUnitInfo']['OperationalUnitName'];
                }
                
                // Track operational units for this deputy ID (for classification)
                if($operationalUnitName){
                    if(!isset($secondaryDeputyIDOperationalUnits[$deputyID])){
                        $secondaryDeputyIDOperationalUnits[$deputyID] = [];
                    }
                    if(!in_array($operationalUnitName, $secondaryDeputyIDOperationalUnits[$deputyID])){
                        $secondaryDeputyIDOperationalUnits[$deputyID][] = $operationalUnitName;
                    }
                }
                
                $isSetterOperationalUnit = isSetterOperationalUnit($operationalUnitName);
                $isConfirmerOperationalUnit = $operationalUnitName && (
                    $operationalUnitName === 'Confirmer' || 
                    $operationalUnitName === 'Confirmer - Office' ||
                    stripos($operationalUnitName, 'Confirmer') !== false
                );
                $isGSPOperationalUnit = isGspOperationalUnit($operationalUnitName);
                
                if($timesheet['IsInProgress']){
                    $timesheet['EndTimeLocalized'] = date('Y-m-d H:i:s');
                }
                $employeeID = $timesheet['Employee'];
                
                // Calculate hours for this timesheet
                $hoursToAdd = 0;
                if($timesheet['IsInProgress'] && isset($timesheet['StartTimeLocalized'])){
                    $currentTime = date('Y-m-d H:i:s');
                    $hoursToAdd = (strtotime($currentTime) - strtotime($timesheet['StartTimeLocalized'])) / 60 / 60;
                }else if(isset($timesheet['TotalTime']) && $timesheet['TotalTime'] !== '' && $timesheet['TotalTime'] !== null){
                    $hoursToAdd = floatval($timesheet['TotalTime']);
                }else if(isset($timesheet['StartTimeLocalized']) && isset($timesheet['EndTimeLocalized'])){
                    $hoursToAdd = (strtotime($timesheet['EndTimeLocalized']) - strtotime($timesheet['StartTimeLocalized'])) / 60 / 60;
                }
                
                // Add to general secondaryTimesheetEmployees (for backward compatibility)
                if(!array_key_exists($employeeID, $secondaryTimesheetEmployees)){
                    $secondaryTimesheetEmployees[$employeeID] = ['hours' => 0];
                }
                $secondaryTimesheetEmployees[$employeeID]['hours'] += $hoursToAdd;
                
                // Add to setter-specific hours if operational unit is Setter
                if($isSetterOperationalUnit){
                    if(!array_key_exists($employeeID, $secondarySettersTimesheetEmployees)){
                        $secondarySettersTimesheetEmployees[$employeeID] = ['hours' => 0];
                    }
                    $secondarySettersTimesheetEmployees[$employeeID]['hours'] += $hoursToAdd;
                }
                
                // Add to confirmer-specific hours if operational unit is Confirmer
                if($isConfirmerOperationalUnit){
                    if(!array_key_exists($employeeID, $secondaryConfirmersTimesheetEmployees)){
                        $secondaryConfirmersTimesheetEmployees[$employeeID] = ['hours' => 0];
                    }
                    $secondaryConfirmersTimesheetEmployees[$employeeID]['hours'] += $hoursToAdd;
                }
                
                // Add to GSP-specific hours if operational unit is GSP (includes legacy IPP units)
                if($isGSPOperationalUnit){
                    if(!array_key_exists($employeeID, $secondaryGspTimesheetEmployees)){
                        $secondaryGspTimesheetEmployees[$employeeID] = ['hours' => 0];
                    }
                    $secondaryGspTimesheetEmployees[$employeeID]['hours'] += $hoursToAdd;
                }
            }
        }
        
        // STEP 3: Classify secondary deputy IDs based on operational unit
        $secondarySettersDeputyIDs = [];
        $secondaryConfirmersDeputyIDs = [];
        $secondaryGspDeputyIDs = [];
        foreach($secondaryDeputyIDs as $deputyID){
            $hasSetterUnit = false;
            $hasConfirmerUnit = false;
            $hasGSPUnit = false;
            
            if(isset($secondaryDeputyIDOperationalUnits[$deputyID])){
                foreach($secondaryDeputyIDOperationalUnits[$deputyID] as $unitName){
                    if(isSetterOperationalUnit($unitName)){
                        $hasSetterUnit = true;
                    }
                    if($unitName === 'Confirmer' || $unitName === 'Confirmer - Office' || stripos($unitName, 'Confirmer') !== false){
                        $hasConfirmerUnit = true;
                    }
                    if(isGspOperationalUnit($unitName)){
                        $hasGSPUnit = true;
                    }
                }
            }
            // Classify based on operational unit
            if($hasSetterUnit){
                $secondarySettersDeputyIDs[] = $deputyID;
            } 
            if($hasConfirmerUnit){
                $secondaryConfirmersDeputyIDs[] = $deputyID;
            }
            if($hasGSPUnit){
                $secondaryGspDeputyIDs[] = $deputyID;
            }
        }
        
        // Make arrays unique
        $secondarySettersDeputyIDs = array_unique($secondarySettersDeputyIDs);
        $secondaryConfirmersDeputyIDs = array_unique($secondaryConfirmersDeputyIDs);
        $secondaryGspDeputyIDs = array_unique($secondaryGspDeputyIDs);
        
        // STEP 4: Fetch secondary calls filtered by classified deputy IDs (at SQL level)
        $secondarySettersCalls = [];
        $secondaryConfirmersCalls = [];
        $secondaryGspCalls = [];
        
        // Fetch secondary calls in parallel month chunks for long ranges
        $secondarySettersCalls = [];
        $secondaryGspCalls = [];
        $secondaryConfirmersCalls = [];
        if(!empty($secondarySettersDeputyIDs)){
            $secondarySettersDeputyIdsList = implode(',', $secondarySettersDeputyIDs);
            $secondarySettersCalls = ccFetchLpReportChunked($endpoint, function($chunkStart, $chunkEnd) use ($secondarySettersDeputyIdsList, $excludeGspCclSql) {
                return "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued, cls_Calls.lds_id, cls_Calls.cst_id, cls_Calls.cqd_id FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$chunkStart' AND '$chunkEnd' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($secondarySettersDeputyIdsList) AND cty_id NOT IN ('C', 'IPP')$excludeGspCclSql";
            }, $secondaryStart, $secondaryEnd);
        }
        if(!empty($secondaryGspDeputyIDs)){
            $secondaryGspDeputyIdsList = implode(',', $secondaryGspDeputyIDs);
            $secondaryGspCalls = ccFetchLpReportChunked($endpoint, function($chunkStart, $chunkEnd) use ($secondaryGspDeputyIdsList, $gspCallsFilterSql) {
                return "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued, cls_Calls.lds_id, cls_Calls.cst_id, cls_Calls.cqd_id FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$chunkStart' AND '$chunkEnd' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($secondaryGspDeputyIdsList)$gspCallsFilterSql";
            }, $secondaryStart, $secondaryEnd);
        }
        if(!empty($secondaryConfirmersDeputyIDs)){
            $secondaryConfirmersDeputyIdsList = implode(',', $secondaryConfirmersDeputyIDs);
            $secondaryConfirmersCalls = ccFetchLpReportChunked($endpoint, function($chunkStart, $chunkEnd) use ($secondaryConfirmersDeputyIdsList, $excludeGspCclSql) {
                return "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued, cls_Calls.cqd_id FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$chunkStart' AND '$chunkEnd' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($secondaryConfirmersDeputyIdsList) AND cty_id = 'C'$excludeGspCclSql";
            }, $secondaryStart, $secondaryEnd);
        }

        // STEP 5: Process secondary setters calls (already filtered by operational unit at SQL level)
        foreach($secondarySettersCalls as $call){
            if(!array_key_exists(intval($call['emp_user_12']), $secondaryTimesheetEmployees)){
                continue;
            }
            $employeeName = $call['FirstName'] . " " . $call['LastName'];
            $employeeID = intval($call['emp_user_12']);
            $secondaryTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            // Set employee name in setter-specific hours if they have setter hours
            if(array_key_exists($employeeID, $secondarySettersTimesheetEmployees)){
                $secondarySettersTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            }
            $responseData['secondarySettersCalls'][] = [
                'id' => $call['id'],
                'employee' => $employeeName,
                'date' => $call['CallDate'],
                'result' => $call['ResultCode'],
                'cty_id' => $call['cty_id'],
                'connected' => $call['Connected'],
                'pitched' => $call['Pitched'],
                'positive' => $call['Positive'],
                'qualified' => ($call['qualified'] == 1 ? true : false),
                'ApptSet' => $call['ApptSet'] ?? null,
                'Issued' => $call['Issued'] ?? null,
                'lds_id' => $call['lds_id'] ?? null,
                'cst_id' => $call['cst_id'] ?? null,
                'cqd_id' => $call['cqd_id'] ?? null,
            ];
        }

        // Process secondary confirmers calls
        foreach($secondaryConfirmersCalls as $call){
            if(!array_key_exists(intval($call['emp_user_12']), $secondaryTimesheetEmployees)){
                continue;
            }
            $employeeName = $call['FirstName'] . " " . $call['LastName'];
            $employeeID = intval($call['emp_user_12']);
            $secondaryTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            // Set employee name in confirmer-specific hours if they have confirmer hours
            if(array_key_exists($employeeID, $secondaryConfirmersTimesheetEmployees)){
                $secondaryConfirmersTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            }
            $responseData['secondaryConfirmersCalls'][] = [
                'id' => $call['id'],
                'employee' => $employeeName,
                'date' => $call['CallDate'],
                'result' => $call['ResultCode'],
                'cty_id' => $call['cty_id'],
                'connected' => $call['Connected'],
                'pitched' => $call['Pitched'],
                'positive' => $call['Positive'],
                'qualified' => ($call['qualified'] == 1 ? true : false),
                'ApptSet' => $call['ApptSet'] ?? null,
                'Issued' => $call['Issued'] ?? null,
                'cqd_id' => $call['cqd_id'] ?? null,
            ];
        }

        foreach($secondaryGspCalls as $call){
            if(!array_key_exists(intval($call['emp_user_12']), $secondaryGspTimesheetEmployees)){
                continue;
            }
            $employeeName = $call['FirstName'] . " " . $call['LastName'];
            $employeeID = intval($call['emp_user_12']);
            $secondaryTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            if(array_key_exists($employeeID, $secondaryGspTimesheetEmployees)){
                $secondaryGspTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            }
            $responseData['secondaryGspCalls'][] = [
                'id' => $call['id'],
                'employee' => $employeeName,
                'date' => $call['CallDate'],
                'result' => $call['ResultCode'],
                'cty_id' => $call['cty_id'],
                'connected' => $call['Connected'],
                'pitched' => $call['Pitched'],
                'positive' => $call['Positive'],
                'qualified' => ($call['qualified'] == 1 ? true : false),
                'ApptSet' => $call['ApptSet'] ?? null,
                'Issued' => $call['Issued'] ?? null,
                'lds_id' => $call['lds_id'] ?? null,
                'cst_id' => $call['cst_id'] ?? null,
                'cqd_id' => $call['cqd_id'] ?? null,
            ];
        }
        
        // Set employee names for secondary setter hours (in case they have hours but no calls)
        foreach($secondarySettersTimesheetEmployees as $empID => $empData){
            if(!isset($empData['employee']) || empty($empData['employee'])){
                // Try to get name from secondaryTimesheetEmployees
                if(isset($secondaryTimesheetEmployees[$empID]['employee'])){
                    $secondarySettersTimesheetEmployees[$empID]['employee'] = $secondaryTimesheetEmployees[$empID]['employee'];
                } else {
                    // Try to get name from secondary setters calls
                    foreach($secondarySettersCalls as $call){
                        if(intval($call['emp_user_12']) == $empID){
                            $secondarySettersTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                            break;
                        }
                    }
                }
            }
        }
        
        // Set employee names for secondary GSP hours (in case they have hours but no calls)
        foreach($secondaryGspTimesheetEmployees as $empID => $empData){
            if(!isset($empData['employee']) || empty($empData['employee'])){
                if(isset($secondaryTimesheetEmployees[$empID]['employee'])){
                    $secondaryGspTimesheetEmployees[$empID]['employee'] = $secondaryTimesheetEmployees[$empID]['employee'];
                } else {
                    foreach($secondaryGspCalls as $call){
                        if(intval($call['emp_user_12']) == $empID){
                            $secondaryGspTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                            break;
                        }
                    }
                    if(!isset($secondaryGspTimesheetEmployees[$empID]['employee']) && isset($secondaryDeputyToNameMapping[$empID])){
                        $secondaryGspTimesheetEmployees[$empID]['employee'] = $secondaryDeputyToNameMapping[$empID];
                    }
                }
            }
        }

        // Use setter-specific hours array (based on operational unit) for secondary setters dashboard
        $responseData['secondarySettersHours'] = array_values($secondarySettersTimesheetEmployees);
        $responseData['secondaryConfirmersHours'] = array_values($secondaryConfirmersTimesheetEmployees);
        $responseData['secondaryGspHours'] = array_values($secondaryGspTimesheetEmployees);

        // Fetch secondary scorecards (chunk long windows — YTD JSON date scans are expensive)
        if (!isset($integrityDB)) {
            $integrityDB = new db(
                'dme_v2_integrity',
                '134.209.125.255',
                'integrity',
                'IvstNnK29kSE3l2T8mPl'
            );
        }
        $secondaryQueryEndDate = date('Y-m-d', strtotime($secondaryEnd . ' -1 day'));
        $secondaryScorecardChunks = ccDateRangeDayCount($secondaryStart, $secondaryEnd) > 45
            ? ccBuildDateChunks($secondaryStart, date('Y-m-d', strtotime($secondaryQueryEndDate . ' +1 day')), 31)
            : [[$secondaryStart, date('Y-m-d', strtotime($secondaryQueryEndDate . ' +1 day'))]];

        $secondarySettersScorecardsRaw = [];
        $secondaryConfirmersScorecardsRaw = [];
        foreach ($secondaryScorecardChunks as $scoreChunk) {
            $chunkStart = $scoreChunk[0];
            $chunkEndInclusive = date('Y-m-d', strtotime($scoreChunk[1] . ' -1 day'));
            if (strtotime($chunkEndInclusive) < strtotime($chunkStart)) {
                continue;
            }

            $secondarySettersScorecardsQuery = "SELECT id, form_id, status, created_at, updated_at, variables_used, form_data, responses FROM form_instances 
                WHERE DATE(STR_TO_DATE(variables_used->>'$.CallDate','%Y-%m-%d %H:%i:%s.%f')) BETWEEN '$chunkStart' AND '$chunkEndInclusive'
                AND form_id = 11 
                AND status = 'completed'";
            $settersChunkRows = $integrityDB->query($secondarySettersScorecardsQuery);
            if (is_array($settersChunkRows)) {
                foreach ($settersChunkRows as $row) {
                    $secondarySettersScorecardsRaw[] = $row;
                }
            }

            $secondaryConfirmersScorecardsQuery = "SELECT id, form_id, status, created_at, updated_at, variables_used, form_data, responses FROM form_instances 
                WHERE DATE(STR_TO_DATE(variables_used->>'$.CallDate','%Y-%m-%d %H:%i:%s.%f')) BETWEEN '$chunkStart' AND '$chunkEndInclusive'
                AND form_id = 12 
                AND status = 'completed'";
            $confirmersChunkRows = $integrityDB->query($secondaryConfirmersScorecardsQuery);
            if (is_array($confirmersChunkRows)) {
                foreach ($confirmersChunkRows as $row) {
                    $secondaryConfirmersScorecardsRaw[] = $row;
                }
            }
        }

        // Build (employee + CallDate) indexes for the secondary date range so each scorecard
        // can be linked back to a specific call/prospect.
        $secondarySettersCallsIndex = buildCallIndex(array_merge(
            is_array($secondarySettersCalls) ? $secondarySettersCalls : [],
            is_array($secondaryGspCalls) ? $secondaryGspCalls : []
        ));
        $secondaryConfirmersCallsIndex = buildCallIndex(is_array($secondaryConfirmersCalls) ? $secondaryConfirmersCalls : []);

        // Process secondary setters scorecards
        foreach($secondarySettersScorecardsRaw as $scorecard){
            // Extract employee name first for filtering
            $employeeName = null;
            $callDate = null;
            $variables = null;
            if(isset($scorecard['variables_used'])){
                $variables = is_string($scorecard['variables_used']) 
                    ? json_decode($scorecard['variables_used'], true) 
                    : $scorecard['variables_used'];
                
                if(is_array($variables)){
                    $callDate = $variables['CallDate'] ?? null;
                    $empFirstName = $variables['EmpFirstName'] ?? null;
                    $empLastName = $variables['EmpLastName'] ?? null;
                    if($empFirstName && $empLastName){
                        $employeeName = trim($empFirstName) . " " . trim($empLastName);
                    }
                }
            }
            
            // If lpId is provided, filter scorecards to only include those for that employee
            if ($scorecardFilterEmployeeName !== null && $employeeName !== $scorecardFilterEmployeeName) {
                continue;
            }
            
            $scorecardData = [
                'id' => $scorecard['id'] ?? null,
                'form_instance_id' => $scorecard['id'] ?? null,
                'form_id' => $scorecard['form_id'] ?? null,
                'status' => $scorecard['status'] ?? null,
                'created_at' => $scorecard['created_at'] ?? null,
                'updated_at' => $scorecard['updated_at'] ?? null,
            ];
            
            $scorecardData['callDate'] = $callDate;
            $scorecardData['employee'] = $employeeName;
            $scorecardData['variables'] = is_array($variables) ? $variables : null;

            $extracted = extractScorecardItems(
                $scorecard['form_data'] ?? null,
                $scorecard['responses'] ?? null
            );
            $maxTotal    = $extracted['maxTotal'];
            $actualTotal = $extracted['actualTotal'];
            $score = $maxTotal > 0 ? round(($actualTotal / $maxTotal) * 100, 2) : 0;

            $scorecardData['items']       = $extracted['items'];
            $scorecardData['maxTotal']    = $maxTotal;
            $scorecardData['actualTotal'] = $actualTotal;
            $scorecardData['score']       = $score;
            $scorecardData['linkedCall']  = findLinkedCall($secondarySettersCallsIndex, $employeeName, $callDate);

            $responseData['secondarySettersScorecards'][] = $scorecardData;
        }

        // Process secondary confirmers scorecards
        foreach($secondaryConfirmersScorecardsRaw as $scorecard){
            // Extract employee name first for filtering
            $employeeName = null;
            $callDate = null;
            $variables = null;
            if(isset($scorecard['variables_used'])){
                $variables = is_string($scorecard['variables_used']) 
                    ? json_decode($scorecard['variables_used'], true) 
                    : $scorecard['variables_used'];
                
                if(is_array($variables)){
                    $callDate = $variables['CallDate'] ?? null;
                    $empFirstName = $variables['EmpFirstName'] ?? null;
                    $empLastName = $variables['EmpLastName'] ?? null;
                    if($empFirstName && $empLastName){
                        $employeeName = trim($empFirstName) . " " . trim($empLastName);
                    }
                }
            }
            
            // If lpId is provided, filter scorecards to only include those for that employee
            if ($scorecardFilterEmployeeName !== null && $employeeName !== $scorecardFilterEmployeeName) {
                continue;
            }
            
            $scorecardData = [
                'id' => $scorecard['id'] ?? null,
                'form_instance_id' => $scorecard['id'] ?? null,
                'form_id' => $scorecard['form_id'] ?? null,
                'status' => $scorecard['status'] ?? null,
                'created_at' => $scorecard['created_at'] ?? null,
                'updated_at' => $scorecard['updated_at'] ?? null,
            ];
            
            $scorecardData['callDate'] = $callDate;
            $scorecardData['employee'] = $employeeName;
            $scorecardData['variables'] = is_array($variables) ? $variables : null;

            $extracted = extractScorecardItems(
                $scorecard['form_data'] ?? null,
                $scorecard['responses'] ?? null
            );
            $maxTotal    = $extracted['maxTotal'];
            $actualTotal = $extracted['actualTotal'];
            $score = $maxTotal > 0 ? round(($actualTotal / $maxTotal) * 100, 2) : 0;

            $scorecardData['items']       = $extracted['items'];
            $scorecardData['maxTotal']    = $maxTotal;
            $scorecardData['actualTotal'] = $actualTotal;
            $scorecardData['score']       = $score;
            $scorecardData['linkedCall']  = findLinkedCall($secondaryConfirmersCallsIndex, $employeeName, $callDate);

            $responseData['secondaryConfirmersScorecards'][] = $scorecardData;
        }

        // Get LP employee IDs for employees in secondarySettersDeputyIDs array
        // First build mapping from secondary calls
        $secondaryDeputyToLPMapping = [];
        foreach($secondarySettersCalls as $call){
            if(isset($call['emp_user_12']) && isset($call['emp_id'])){
                $secondaryDeputyToLPMapping[intval($call['emp_user_12'])] = intval($call['emp_id']);
            }
        }
        foreach($secondaryConfirmersCalls as $call){
            if(isset($call['emp_user_12']) && isset($call['emp_id'])){
                $secondaryDeputyToLPMapping[intval($call['emp_user_12'])] = intval($call['emp_id']);
            }
        }
        foreach($secondaryGspCalls as $call){
            if(isset($call['emp_user_12']) && isset($call['emp_id'])){
                $secondaryDeputyToLPMapping[intval($call['emp_user_12'])] = intval($call['emp_id']);
            }
        }
        
        // Get LP employee IDs for employees in secondarySettersDeputyIDs array
        $secondarySetterLPEmployeeIds = [];
        foreach($secondarySettersDeputyIDs as $deputyID){
            if(isset($secondaryDeputyToLPMapping[$deputyID])){
                $secondarySetterLPEmployeeIds[] = $secondaryDeputyToLPMapping[$deputyID];
            }
        }
        $secondarySetterLPEmployeeIds = array_unique($secondarySetterLPEmployeeIds);
        
        // Fetch secondary appointments for setters (for gross issue calculation)
        // Only include appointments where SetBy is an employee in secondarySettersDeputyIDs array
        // ApptSet is determined from disposition (not the ApptSet column), matching LeadProg sync
        $secondarySettersAppointments = [];
        if(!empty($secondarySetterLPEmployeeIds)){
            if (empty($dispositions)) {
                $dispositions = loadDispositionsByDescr($endpoint);
            }
            $secondarySetterLPEmployeeIdsList = implode(',', $secondarySetterLPEmployeeIds);
            $secondarySettersAppointments = ccFetchLpReportChunked($endpoint, function($chunkStart, $chunkEnd) use ($secondarySetterLPEmployeeIdsList) {
                return "SELECT app_Appointments.id, app_Appointments.lds_id, app_Appointments.cst_id, 
            app_Appointments.ApptDate, app_Appointments.Dsp_ID, app_Appointments.SetBy, app_Appointments.ApptSet, 
            app_Appointments.Issued, app_Appointments.NetIssued, emp_Employees.FirstName, emp_Employees.LastName, Lds_Leads.Productid, srs_SourceSubs.SourceCode, srs_SourceSubs.Descr
            FROM app_Appointments 
            LEFT JOIN emp_Employees ON app_Appointments.SetBy = emp_Employees.id 
            LEFT JOIN Lds_Leads ON app_Appointments.Lds_ID = Lds_Leads.id
            LEFT JOIN srs_SourceSubs ON Lds_Leads.srs_id = srs_SourceSubs.id
            WHERE app_Appointments.ApptDate BETWEEN '$chunkStart' AND '$chunkEnd' 
            AND CAST(app_Appointments.ApptDate AS date) <= CAST(GETDATE() AS date) 
            AND emp_Employees.Dialer = '1' 
            AND app_Appointments.SetBy IN ($secondarySetterLPEmployeeIdsList) 
            ORDER BY app_Appointments.id DESC";
            }, $secondaryStart, $secondaryEnd);
            if(!is_array($secondarySettersAppointments)){
                $secondarySettersAppointments = [];
            }
            // Disposition-based ApptSet filter, then drop older/duplicate same-day appointments for the same lead
            $secondarySettersAppointments = filterAppointmentsSetByDisposition($secondarySettersAppointments, $dispositions);
            $secondarySettersAppointments = filterLatestAppointmentPerLeadPerDay($secondarySettersAppointments);
        }
        
        // Format secondary appointments data
        $responseData['secondarySettersAppointments'] = [];
        foreach($secondarySettersAppointments as $appointment){
            $employeeName = null;
            if(isset($appointment['FirstName']) && isset($appointment['LastName'])){
                $employeeName = trim($appointment['FirstName']) . " " . trim($appointment['LastName']);
            }
            
            $responseData['secondarySettersAppointments'][] = [
                'id' => $appointment['id'] ?? null,
                'lds_id' => $appointment['lds_id'] ?? null,
                'cst_id' => $appointment['cst_id'] ?? null,
                'dsp_id' => $appointment['Dsp_ID'] ?? null,
                'employee' => $employeeName,
                'date' => $appointment['ApptDate'] ?? null,
                'ApptSet' => $appointment['ApptSet'] ?? null,
                'Issued' => $appointment['Issued'] ?? null,
                'NetIssued' => $appointment['NetIssued'] ?? null,
                'Productid' => $appointment['Productid'] ?? null,
                'SourceCode' => $appointment['SourceCode'] ?? null,
                'Descr' => $appointment['Descr'] ?? null,
            ];
        }
        } // end rangesMatch else
    }
    
    if ($secondaryOnly) {
        $responseData['stl'] = [];
        $responseData['levels'] = [];
        $responseData['lights'] = ['red' => [], 'green' => []];
        $callQueueDetailQuery = "SELECT id, Descr FROM cqd_CallQueueDetail";
        $callQueueDetailRows = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($callQueueDetailQuery));
        $responseData['callQueueDetails'] = [];
        if (!empty($callQueueDetailRows)) {
            foreach ($callQueueDetailRows as $row) {
                $responseData['callQueueDetails'][] = [
                    'id' => $row['id'] ?? $row['cqd_id'] ?? null,
                    'Descr' => $row['Descr'] ?? ''
                ];
            }
        }
        exit(json_encode(ccFinalizeResponse($responseData, $rowsFor, $activeTab, $excludedCallIds)));
    }

    $excludedStlSubsourceIds = [218];
    $excludedStlSubsourceSql = implode(',', array_map('intval', $excludedStlSubsourceIds));

    $query = "SELECT
                lds_Leads.id as 'leadId',
                lds_Leads.cst_id,
                lds_Leads.srs_id as 'srs_id',
                lds_Leads.DateEntered as 'DateEntered',
                in1_InboundQueue1.DateReceived as 'DateReceived',
                in1_InboundQueue1.CheckOutDate as 'CheckOutDate',
                firstCall.CallDate as 'CallDate',
                firstCall.FirstName as 'FirstName',
                firstCall.LastName as 'LastName'
            FROM
                lds_Leads
            INNER JOIN
                in1_InboundQueue1
            ON
                lds_Leads.id = in1_InboundQueue1.lds_id
            OUTER APPLY (
                SELECT TOP 1
                    cls_Calls.CallDate,
                    emp_Employees.FirstName,
                    emp_Employees.LastName
                FROM cls_Calls
                INNER JOIN emp_Employees ON cls_Calls.emp_id = emp_Employees.id
                WHERE cls_Calls.cst_id = lds_Leads.cst_id
                    AND cls_Calls.CallDate > in1_InboundQueue1.CheckOutDate
                    AND cls_Calls.ResultCode NOT IN ('*ND', 'ccND', 'NDDNC', 'NDLB', 'NDTR')
                ORDER BY cls_Calls.CallDate ASC
            ) AS firstCall
            WHERE
                in1_InboundQueue1.DateReceived IS NOT NULL
                AND firstCall.CallDate BETWEEN '$start' AND '$end'
                AND lds_Leads.srs_id NOT IN ($excludedStlSubsourceSql)
    ";

    $rtdData = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($query));
    if(!is_array($rtdData)){
        $rtdData = [];
    }
    $responseData['stl'] = [];
    
    // If lpId is provided, use the agent name already resolved for scorecard filtering
    $lpIdEmployeeName = $scorecardFilterEmployeeName;
    if ($lpIdEmployeeName === null && $lpId !== null && $lpId > 0) {
        $empNameQuery = "SELECT FirstName, LastName FROM emp_Employees WHERE id = " . $lpId;
        $empNameResult = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($empNameQuery));
        if (!empty($empNameResult) && isset($empNameResult[0]['FirstName']) && isset($empNameResult[0]['LastName'])) {
            $lpIdEmployeeName = trim($empNameResult[0]['FirstName']) . " " . trim($empNameResult[0]['LastName']);
        }
    }
    
    foreach($rtdData as $response){
        // Exclude records for blocked STL subsources (e.g. Radio Giveaways)
        if(isset($response['srs_id']) && in_array(intval($response['srs_id']), $excludedStlSubsourceIds, true)){
            continue;
        }

        // Exclude records matching srs_id == 6 exclusion criteria (matching getData.php logic)
        if(isset($response['srs_id']) && $response['srs_id'] == 6 && 
           isset($response['DateEntered']) && 
           strtotime($response['DateEntered']) >= strtotime("2024-01-01") && 
           strtotime($response['DateEntered']) <= strtotime("2025-03-26")){
            // Skip this record - matches exclusion criteria
            continue;
        }
        
        // Only calculate STL if CallDate exists (matching getData.php logic)
        if(!isset($response['CallDate']) || empty($response['CallDate'])){
            // Skip this record - no CallDate available
            continue;
        }
        
        // Only calculate if DateReceived exists (already filtered in WHERE clause, but double-check for safety)
        if(!isset($response['DateReceived']) || empty($response['DateReceived'])){
            continue;
        }
        
        $employeeName = $response['FirstName'] . " " . $response['LastName'];
        
        // If lpId is provided, filter STL data to only include records for that employee
        if ($lpIdEmployeeName !== null && $employeeName !== $lpIdEmployeeName) {
            continue;
        }
        
        // Calculate STL (checkout to dial time) using business hours
        $stlValue = getBusinessHourDiff($response['CheckOutDate'], $response['CallDate']);
        
        // Only add to array if we have a valid calculation
        if($stlValue !== null){
            $responseData['stl'][] = [
                'leadId' => $response['leadId'] ?? null,
                'employee' => $employeeName,
                'stl' => $stlValue,
                'cst_id' => $response['cst_id'],
                'dateReceived' => $response['DateReceived'] ?? null,
                'checkOutDate' => $response['CheckOutDate'] ?? null,
                'callDate' => $response['CallDate'] ?? null,
            ];
        }
    }

    $rtpDB = new db("promotion_flags", "intserver-intapps");

    $query = "SELECT * FROM `emp` LEFT JOIN `data`.`Employees` ON emp_id = id WHERE dialer = 'True'";

    $response = $rtpDB->query($query);

    $query = "SELECT * FROM rtp_numbers WHERE emp_type = 2";
    $response2 = $rtpDB->query($query);

    $rtpsNeeded = [];

    foreach($response2 as $level){
        $rtpsNeeded[$level['level']] = $level['number_required'];
    }

    $responseData['levels'] = [];

    foreach($response as $emp){
        if(array_key_exists($emp['current_level']+1, $rtpsNeeded)){
            $required = $emp['rtp_count'] - $rtpsNeeded[$emp['current_level']+1];
        }else{
            $required = 0;
        }
        $responseData['levels'][] = [
            'employee' => $emp['firstname'] . " " . $emp['lastname'],
            'level' => $emp['current_level'],
            'required' => $required,
        ];
    }

    $lightSheet = "1WgCpDpDJfWOzoQ5EfKrZlB5WgW7HZ0MZSK6HBoOfI7c";
    $lightRange = urlencode("'Red Light/Green Light'!B1:C4");

    $lightData = curlCall("$endpoint/google/v2/getSheet.php?sheetID=$lightSheet&range=$lightRange&majorDimension=COLUMNS");
    $responseData['lights'] = ['red' => [], 'green' => []];

    foreach($lightData['values'] as $column){
        $light = null;
        switch($column[0]){
            case 'Red Light':
                $light = 'red';
                break;
            case 'Green Light':
                $light = 'green';
                break;
        }

        if($light){
            unset($column[0]);
            $responseData['lights'][$light] = array_values($column);
        }
    }

    // Call queue details for dashboard call-bucket filter (id + Descr for dropdown)
    $callQueueDetailQuery = "SELECT id, Descr FROM cqd_CallQueueDetail";
    $callQueueDetailRows = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($callQueueDetailQuery));
    $responseData['callQueueDetails'] = [];
    if (!empty($callQueueDetailRows)) {
        foreach ($callQueueDetailRows as $row) {
            $responseData['callQueueDetails'][] = [
                'id' => $row['id'] ?? $row['cqd_id'] ?? null,
                'Descr' => $row['Descr'] ?? ''
            ];
        }
    }

    exit(json_encode(ccFinalizeResponse($responseData, $rowsFor, $activeTab, $excludedCallIds)));
    

    function isGspOperationalUnit($operationalUnitName){
        if(!$operationalUnitName){
            return false;
        }
        if($operationalUnitName === 'GSP' || stripos($operationalUnitName, 'GSP') !== false){
            return true;
        }
        // Legacy IPP operational units (renamed to GSP in Deputy)
        if($operationalUnitName === 'IPP' || $operationalUnitName === 'IPP Dialing - Office'){
            return true;
        }
        if(stripos($operationalUnitName, 'IPP Dialing') !== false || stripos($operationalUnitName, 'IPP') !== false){
            return true;
        }
        return false;
    }

    // Match Confirmer handling: include "Setter - Office" and other Setter* units
    function isSetterOperationalUnit($operationalUnitName){
        if(!$operationalUnitName){
            return false;
        }
        if($operationalUnitName === 'Setter' || $operationalUnitName === 'Setter - Office'){
            return true;
        }
        if(stripos($operationalUnitName, 'Setter') !== false){
            return true;
        }
        return false;
    }

    function isHoliday($date){
        global $holidays;
        
        if(empty($holidays)){
            return false;
        }
        
        $dateStr = date('Y-m-d', strtotime($date));
        $dateMD = date('m-d', strtotime($date));
        
        // Check for specific date match
        if(in_array($dateStr, $holidays)){
            return true;
        }
        
        // Check for recurring pattern match (MM-DD format)
        if(in_array($dateMD, $holidays)){
            return true;
        }
        
        return false;
    }

    function getBusinessHourDiff($start, $end){
		$ccHours = [
			'1' => [
				'start' => '08:30:00',
				'end' => '19:00:00',
			],
			'2' => [
				'start' => '08:30:00',
				'end' => '19:00:00',
			],
			'3' => [
				'start' => '08:30:00',
				'end' => '19:00:00',
			],
			'4' => [
				'start' => '08:30:00',
				'end' => '19:00:00',
			],
			'5' => [
				'start' => '08:30:00',
				'end' => '17:00:00',
			],
			'6' => [
				'start' => '10:30:00',
				'end' => '13:00:00',
			],
		];
		if(strtotime($end) > strtotime($start) && (strtotime($end) - strtotime($start)) <= 60){
			//Likely auto-processed
			return strtotime($end) - strtotime($start);
		}else if(strtotime($end) < strtotime($start)){
            return 0;
        }
		$startDOW = date('w', strtotime($start));
		$startDate = date('Y-m-d', strtotime($start));
		if(array_key_exists($startDOW, $ccHours) && !isHoliday($startDate)){
			//CC is open that day and it's not a holiday
	
			if(strtotime($start) < strtotime("$startDate " . $ccHours[$startDOW]['start'])){
				//Lead came in before CC opened
				$calculatedStart = "$startDate " . $ccHours[$startDOW]['start'];
			}else if(strtotime($start) > strtotime("$startDate " . $ccHours[$startDOW]['end'])){
				//Lead came in after CC closed
				$startDate = date('Y-m-d', strtotime("$start + 1 day"));
				$startDOW = date('w', strtotime($startDate));
				while(!array_key_exists($startDOW, $ccHours) || isHoliday($startDate)){
					$startDate = date('Y-m-d', strtotime("$startDate + 1 day"));
					$startDOW = date('w', strtotime($startDate));
				}
				$calculatedStart = "$startDate " . $ccHours[$startDOW]['start'];
			}else{
				$calculatedStart = $start;
			}
		}else{
			//CC is closed that day or it's a holiday
			$startDate = date('Y-m-d', strtotime("$start + 1 day"));
			$startDOW = date('w', strtotime($startDate));
			while(!array_key_exists($startDOW, $ccHours) || isHoliday($startDate)){
				$startDate = date('Y-m-d', strtotime("$startDate + 1 day"));
				$startDOW = date('w', strtotime($startDate));
			}
			$calculatedStart = "$startDate " . $ccHours[$startDOW]['start'];
		}
		
		$calculatedStartTs = strtotime($calculatedStart);
		$endTs = strtotime($end);

		// If the call happened before the next valid start window, treat as zero wait time
		if ($endTs <= $calculatedStartTs) {
			return 0;
		}

		$startDOW = date('w', $calculatedStartTs);
		$startDate = date('Y-m-d', strtotime($calculatedStart));
	
		$endDOW = date('w', $endTs);
		$endDate = date('Y-m-d', $endTs);
	
		if($startDOW == $endDOW){
			// Same day - check if it's a holiday
			if(isHoliday($startDate)){
				$difference = 0;
			}else{
				// Check if call time is within business hours
				if(array_key_exists($endDOW, $ccHours)){
					$endDayStart = strtotime("$endDate " . $ccHours[$endDOW]['start']);
					$endDayEnd = strtotime("$endDate " . $ccHours[$endDOW]['end']);
					$endTime = $endTs;
					$calculatedStartTime = $calculatedStartTs;
					
					// Ensure we don't count time before business hours start
					$actualStart = max($calculatedStartTime, $endDayStart);
					
					if($endTime <= $endDayStart){
						// Call was before business hours started - no time counted
						$difference = 0;
					}else if($endTime >= $endDayEnd){
						// Call was after business hours ended - cap at end of business day
						$difference = $endDayEnd - $actualStart;
					}else{
						// Call was during business hours
						$difference = $endTime - $actualStart;
					}
				}else{
					// Not a business day
					$difference = 0;
				}
			}
		}else{
			//Get the seconds between the start date and when the CC closed
			$startDayEnd = strtotime("$startDate " . $ccHours[$startDOW]['end']);
			$calculatedStartTime = strtotime($calculatedStart);
			// Only count time if calculatedStart is before end of business hours
			if($calculatedStartTime < $startDayEnd){
				$difference = $startDayEnd - $calculatedStartTime;
			}else{
				$difference = 0;
			}
	
			$startDate = date('Y-m-d', strtotime("$startDate + 1 day"));
			$startDOW = date('w', strtotime($startDate));
			while($startDOW != $endDOW){
				//Difference is greater than 1 day - add full business hours for this day
				if(array_key_exists($startDOW, $ccHours) && !isHoliday($startDate)){
					$difference += strtotime("$startDate " . $ccHours[$startDOW]['end']) - strtotime("$startDate " . $ccHours[$startDOW]['start']);
				}
				$startDate = date('Y-m-d', strtotime("$startDate + 1 day"));
				$startDOW = date('w', strtotime($startDate));         
			}
			if(array_key_exists($endDOW, $ccHours) && !isHoliday($endDate)){
				// Calculate time from start of business to call time
				$endDayStart = strtotime("$endDate " . $ccHours[$endDOW]['start']);
				$endDayEnd = strtotime("$endDate " . $ccHours[$endDOW]['end']);
				$endTime = strtotime($end);
				
				if($endTime <= $endDayStart){
					// Call was before business hours started - add nothing (call was "at" start of day)
					// No additional time to add
				}else if($endTime >= $endDayEnd){
					// Call was after business hours ended - cap at full business day
					$difference += $endDayEnd - $endDayStart;
				}else{
					// Call was during business hours
					$difference += $endTime - $endDayStart;
				}
			}
		}
		if($difference < 0){
			$difference = 0;
		}
		return $difference;
	}

?>