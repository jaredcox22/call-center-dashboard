<?php
ini_set('memory_limit', '512M'); // or 1024M if needed
set_time_limit(120); // 2 minutes to avoid timeout


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
    }else{
        $responseData = [
            'settersCalls' => [],
            'confirmersCalls' => [],
            'ippCalls' => [],
            'hours' => [],
        ];
    }
    
    require_once(__DIR__ . "/../../shared/sharedFunctions.php");
    require_once(__DIR__ . "/../../shared/db.php");

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

        case 'Year to Date': // ! this and YTD aren't working
            $start = date('Y-01-01');
            $end = date('Y-m-d', strtotime('tomorrow'));
            break;

        case 'YTD': // ! not working
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

    if(array_key_exists('test', $_GET)){

    }else{
        // STEP 1: Get unique deputy IDs and build Deputy-to-LP mapping from a lightweight query
        // This query gets all unique combinations of deputy ID and LP employee ID
        // If lpId is provided, filter to only that LP ID
        $lpId = isset($_GET['lpId']) ? intval($_GET['lpId']) : null;
        $deputyMappingQuery = "SELECT DISTINCT emp_user_12, emp_id, FirstName, LastName FROM cls_Calls LEFT JOIN emp_Employees ON emp_id = emp_Employees.id WHERE CallDate BETWEEN '$start' AND '$end' AND ResultCode NOT LIKE '%ND%' AND Dialer = 'True' AND emp_user_12 > 0";
        
        // If lpId is provided, filter to only that LP ID
        if ($lpId !== null && $lpId > 0) {
            $deputyMappingQuery .= " AND emp_id = " . $lpId;
        }
        
        $deputyMappingResults = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($deputyMappingQuery));
        
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
        $ippTimesheetEmployees = []; // Hours for employees clocked into IPP Dialing - Office operational unit
        $employeeType = []; // Track if employee is setter or confirmer
        $employeeOperationalUnits = []; // Track operational units from timesheets
        $deputyIDOperationalUnits = []; // Track operational units per deputy ID to classify them

        foreach($deputyIDs as $deputyID){
            $theseTimesheets = curlCall("$endpoint/deputy/getTimesheets.php?startDate=$start&endDate=$end&id=" . intval($deputyID));
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
                
                // Determine if this timesheet is for a setter, confirmer, or IPP based on operational unit
                $isSetterOperationalUnit = $operationalUnitName === 'Setter';
                $isConfirmerOperationalUnit = $operationalUnitName && (
                    $operationalUnitName === 'Confirmer' || 
                    $operationalUnitName === 'Confirmer - Office' ||
                    stripos($operationalUnitName, 'Confirmer') !== false
                );
                $isIPPOperationalUnit = $operationalUnitName && (
                    $operationalUnitName === 'IPP' ||
                    $operationalUnitName === 'IPP Dialing - Office' ||
                    stripos($operationalUnitName, 'IPP Dialing') !== false ||
                    stripos($operationalUnitName, 'IPP') !== false
                );
                
                if($timesheet['IsInProgress']){
                    $timesheet['EndTimeLocalized'] = date('Y-m-d H:i:s');
                }
                $timesheets[] = $timesheet;
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
                
                // Add to IPP-specific hours if operational unit is IPP Dialing - Office
                if($isIPPOperationalUnit){
                    if(!array_key_exists($employeeID, $ippTimesheetEmployees)){
                        $ippTimesheetEmployees[$employeeID] = ['hours' => 0];
                    }
                    $ippTimesheetEmployees[$employeeID]['hours'] += $hoursToAdd;
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
        $ippDeputyIDs = [];
        foreach($deputyIDs as $deputyID){
            $hasSetterUnit = false;
            $hasConfirmerUnit = false;
            $hasIPPUnit = false;
            
            if(isset($deputyIDOperationalUnits[$deputyID])){
                foreach($deputyIDOperationalUnits[$deputyID] as $unitName){
                    if($unitName === 'Setter'){
                        $hasSetterUnit = true;
                    }
                    if($unitName === 'Confirmer' || $unitName === 'Confirmer - Office' || stripos($unitName, 'Confirmer') !== false){
                        $hasConfirmerUnit = true;
                    }
                    if($unitName === 'IPP' || $unitName === 'IPP Dialing - Office' || stripos($unitName, 'IPP Dialing') !== false || stripos($unitName, 'IPP') !== false){
                        $hasIPPUnit = true;
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
            if($hasIPPUnit){
                $ippDeputyIDs[] = $deputyID;
            }
        }
        
        // Make deputy ID arrays unique
        $settersDeputyIDs = array_unique($settersDeputyIDs);
        $confirmersDeputyIDs = array_unique($confirmersDeputyIDs);
        $ippDeputyIDs = array_unique($ippDeputyIDs);
        
        // DEBUG: Track employee types
        $debugInfo = [
            'settersDeputyIDs' => $settersDeputyIDs,
            'confirmersDeputyIDs' => $confirmersDeputyIDs,
            'ippDeputyIDs' => $ippDeputyIDs,
            'allDeputyIDs' => $deputyIDs,
            'deputyIDOperationalUnits' => $deputyIDOperationalUnits,
            'settersEmployeeNames' => [],
            'confirmersEmployeeNames' => [],
            'ippEmployeeNames' => [],
            'timesheetProcessing' => [],
            'timesheetEmployeesDetails' => [],
            'finalHoursBreakdown' => []
        ];

        // STEP 4: Fetch calls filtered by classified deputy IDs (at SQL level)
        $settersCalls = [];
        $confirmersCalls = [];
        $ippCalls = [];
        
        // Fetch setters calls - only for employees clocked into Setter operational unit
        if(!empty($settersDeputyIDs)){
            $settersDeputyIdsList = implode(',', $settersDeputyIDs);
            $settersCallsQuery = "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$start' AND '$end' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($settersDeputyIdsList) AND cty_id NOT IN ('C', 'IPP')";
            $settersCalls = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($settersCallsQuery));
        }
        
        // Fetch confirmers calls - only for employees clocked into Confirmer operational unit
        if(!empty($confirmersDeputyIDs)){
            $confirmersDeputyIdsList = implode(',', $confirmersDeputyIDs);
            $confirmersCallsQuery = "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$start' AND '$end' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($confirmersDeputyIdsList) AND cty_id = 'C'";
            $confirmersCalls = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($confirmersCallsQuery));
        }
        
        // Fetch IPP calls - only for employees clocked into IPP operational unit
        if(!empty($ippDeputyIDs)){
            $ippDeputyIdsList = implode(',', $ippDeputyIDs);
            $ippCallsQuery = "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$start' AND '$end' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($ippDeputyIdsList) AND cty_id = 'IPP'";
            $ippCalls = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($ippCallsQuery));
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
            ];
        }

        // Process IPP calls (already filtered by operational unit at SQL level)
        foreach($ippCalls as $call){
            $deputyID = $call['emp_user_12'];
            if(!array_key_exists(intval($deputyID), $timesheetEmployees)){
                continue;
            }

            $employeeName = $call['FirstName'] . " " . $call['LastName'];
            $employeeID = intval($deputyID);
            $timesheetEmployees[$employeeID]['employee'] = $employeeName;
            // Set employee name in IPP-specific hours if they have IPP hours
            if(array_key_exists($employeeID, $ippTimesheetEmployees)){
                $ippTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            }
            $employeeType[$employeeID] = 'ipp';
            if(!in_array($employeeName, $debugInfo['ippEmployeeNames'])){
                $debugInfo['ippEmployeeNames'][] = $employeeName;
            }
            $responseData['ippCalls'][] = [
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
        
        // Set employee names for IPP hours (in case they have hours but no calls)
        foreach($ippTimesheetEmployees as $empID => $empData){
            if(!isset($empData['employee']) || empty($empData['employee'])){
                // Try to get name from timesheetEmployees
                if(isset($timesheetEmployees[$empID]['employee'])){
                    $ippTimesheetEmployees[$empID]['employee'] = $timesheetEmployees[$empID]['employee'];
                } else {
                    // Try to get name from IPP calls first (most relevant)
                    foreach($ippCalls as $call){
                        if(intval($call['emp_user_12']) == $empID){
                            $ippTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                            break;
                        }
                    }
                    // If still not found, try setters calls
                    if(!isset($ippTimesheetEmployees[$empID]['employee'])){
                        foreach($settersCalls as $call){
                            if(intval($call['emp_user_12']) == $empID){
                                $ippTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                                break;
                            }
                        }
                    }
                    // If still not found, try confirmers calls
                    if(!isset($ippTimesheetEmployees[$empID]['employee'])){
                        foreach($confirmersCalls as $call){
                            if(intval($call['emp_user_12']) == $empID){
                                $ippTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                                break;
                            }
                        }
                    }
                    // If still not found, try to get from deputy mapping
                    if(!isset($ippTimesheetEmployees[$empID]['employee']) && isset($deputyToNameMapping[$empID])){
                        $ippTimesheetEmployees[$empID]['employee'] = $deputyToNameMapping[$empID];
                    }
                }
            }
        }
        
        // Use setter-specific hours array (based on operational unit) for setters dashboard
        // This ensures only employees clocked into "Setter" operational unit appear in setters hours
        $responseData['settersHours'] = array_values($settersTimesheetEmployees);
        $responseData['confirmersHours'] = array_values($confirmersTimesheetEmployees);
        $responseData['IPPHours'] = array_values($ippTimesheetEmployees);
        
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
            $isSetterByOperationalUnit = !empty($operationalUnits) && 
                in_array('Setter', $operationalUnits);
            
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
        
        // Add debug info to response
        $responseData['_debug'] = $debugInfo;

        // Get unique employee names for setters, confirmers, and IPP
        $settersEmployeeNames = [];
        $confirmersEmployeeNames = [];
        $ippEmployeeNames = [];
        
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
        
        // Get IPP employee names from IPP hours array
        foreach($ippTimesheetEmployees as $empData){
            $employeeName = $empData['employee'] ?? null;
            if($employeeName && !in_array($employeeName, $ippEmployeeNames)){
                $ippEmployeeNames[] = $employeeName;
            }
        }
        
        // Add IPPEmployees to response
        $responseData['IPPEmployees'] = $ippEmployeeNames;

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

        // Helper function to calculate max total from form_data
        function calculateMaxTotal($formData) {
            if(empty($formData)) return 0;
            
            $formDataObj = is_string($formData) ? json_decode($formData, true) : $formData;
            if(!is_array($formDataObj) || !isset($formDataObj['fields'])) return 0;
            
            $maxTotal = 0;
            foreach($formDataObj['fields'] as $field) {
                if(isset($field['type']) && $field['type'] === 'number' && isset($field['validation']['max'])) {
                    $maxTotal += (float)$field['validation']['max'];
                }
            }
            
            return $maxTotal;
        }
        
        // Helper function to calculate actual total from responses
        function calculateActualTotal($responses) {
            if(empty($responses)) return 0;
            
            $responsesObj = is_string($responses) ? json_decode($responses, true) : $responses;
            if(!is_array($responsesObj)) return 0;
            
            $actualTotal = 0;
            foreach($responsesObj as $field) {
                if(isset($field['type']) && $field['type'] === 'number' && isset($field['value'])) {
                    $actualTotal += (float)$field['value'];
                }
            }
            
            return $actualTotal;
        }

        // Get employee name for lpId filtering (if lpId is provided)
        $scorecardFilterEmployeeName = null;
        if ($lpId !== null && $lpId > 0) {
            $empNameQuery = "SELECT FirstName, LastName FROM emp_Employees WHERE id = " . $lpId;
            $empNameResult = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($empNameQuery));
            if (!empty($empNameResult) && isset($empNameResult[0]['FirstName']) && isset($empNameResult[0]['LastName'])) {
                $scorecardFilterEmployeeName = trim($empNameResult[0]['FirstName']) . " " . trim($empNameResult[0]['LastName']);
            }
        }

        // Process setters scorecards
        foreach($settersScorecardsRaw as $scorecard){
            // Extract employee name from variables_used first (for filtering)
            $employeeName = null;
            $callDate = null;
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
            
            // Calculate score totals
            $maxTotal = calculateMaxTotal($scorecard['form_data'] ?? null);
            $actualTotal = calculateActualTotal($scorecard['responses'] ?? null);
            $score = $maxTotal > 0 ? round(($actualTotal / $maxTotal) * 100, 2) : 0;
            
            $scorecardData['maxTotal'] = $maxTotal;
            $scorecardData['actualTotal'] = $actualTotal;
            $scorecardData['score'] = $score;
            
            $responseData['settersScorecards'][] = $scorecardData;
        }

        // Process confirmers scorecards
        foreach($confirmersScorecardsRaw as $scorecard){
            // Extract employee name from variables_used first (for filtering)
            $employeeName = null;
            $callDate = null;
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
            
            // Calculate score totals
            $maxTotal = calculateMaxTotal($scorecard['form_data'] ?? null);
            $actualTotal = calculateActualTotal($scorecard['responses'] ?? null);
            $score = $maxTotal > 0 ? round(($actualTotal / $maxTotal) * 100, 2) : 0;
            
            $scorecardData['maxTotal'] = $maxTotal;
            $scorecardData['actualTotal'] = $actualTotal;
            $scorecardData['score'] = $score;
            
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
        $settersAppointments = [];
        if(!empty($setterLPEmployeeIds)){
            $setterLPEmployeeIdsList = implode(',', $setterLPEmployeeIds);
            $settersAppointmentsQuery = "SELECT app_Appointments.id, app_Appointments.lds_id, app_Appointments.cst_id, app_Appointments.ApptDate, app_Appointments.Dsp_ID, app_Appointments.SetBy, app_Appointments.ApptSet, app_Appointments.Issued, app_Appointments.NetIssued, emp_Employees.FirstName, emp_Employees.LastName FROM app_Appointments LEFT JOIN emp_Employees ON app_Appointments.SetBy = emp_Employees.id WHERE app_Appointments.ApptDate BETWEEN '$start' AND '$end' AND emp_Employees.Dialer = '1' AND Dsp_ID NOT IN ('Set') AND ApptSet = '1' AND app_Appointments.SetBy IN ($setterLPEmployeeIdsList) ORDER BY app_Appointments.id DESC";
            $settersAppointments = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($settersAppointmentsQuery));
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
        $responseData['_setterLPEmployeeIds'] = $setterLPEmployeeIds;
    }

    // Fetch secondary data for performance metrics if secondaryDateRange is provided
    $responseData['secondarySettersCalls'] = [];
    $responseData['secondaryConfirmersCalls'] = [];
    $responseData['secondaryIPPCalls'] = [];
    $responseData['secondarySettersHours'] = [];
    $responseData['secondaryConfirmersHours'] = [];
    $responseData['secondaryIPPHours'] = [];
    $responseData['secondarySettersScorecards'] = [];
    $responseData['secondaryConfirmersScorecards'] = [];
    $responseData['secondarySettersAppointments'] = [];
    
    if(array_key_exists('secondaryDateRange', $_GET)){
        // STEP 1: Get unique deputy IDs for secondary date range
        $secondaryDeputyMappingQuery = "SELECT DISTINCT emp_user_12, emp_id, FirstName, LastName FROM cls_Calls LEFT JOIN emp_Employees ON emp_id = emp_Employees.id WHERE CallDate BETWEEN '$secondaryStart' AND '$secondaryEnd' AND ResultCode NOT LIKE '%ND%' AND Dialer = 'True' AND emp_user_12 > 0";
        
        // If lpId is provided, filter secondary data to only that LP ID
        if ($lpId !== null && $lpId > 0) {
            $secondaryDeputyMappingQuery .= " AND emp_id = " . $lpId;
        }
        
        $secondaryDeputyMappingResults = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($secondaryDeputyMappingQuery));
        
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
        $secondaryIPPTimesheetEmployees = []; // Hours for employees clocked into IPP Dialing - Office operational unit
        $secondaryDeputyIDOperationalUnits = []; // Track operational units per deputy ID
        
        foreach($secondaryDeputyIDs as $deputyID){
            $theseTimesheets = curlCall("$endpoint/deputy/getTimesheets.php?startDate=$secondaryStart&endDate=$secondaryEnd&id=" . intval($deputyID));
            foreach($theseTimesheets as $timesheet){
                // Determine if this timesheet is for a setter, confirmer, or IPP based on operational unit
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
                
                $isSetterOperationalUnit = $operationalUnitName === 'Setter';
                $isConfirmerOperationalUnit = $operationalUnitName && (
                    $operationalUnitName === 'Confirmer' || 
                    $operationalUnitName === 'Confirmer - Office' ||
                    stripos($operationalUnitName, 'Confirmer') !== false
                );
                $isIPPOperationalUnit = $operationalUnitName && (
                    $operationalUnitName === 'IPP' ||
                    $operationalUnitName === 'IPP Dialing - Office' ||
                    stripos($operationalUnitName, 'IPP Dialing') !== false ||
                    stripos($operationalUnitName, 'IPP') !== false
                );
                
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
                
                // Add to IPP-specific hours if operational unit is IPP Dialing - Office
                if($isIPPOperationalUnit){
                    if(!array_key_exists($employeeID, $secondaryIPPTimesheetEmployees)){
                        $secondaryIPPTimesheetEmployees[$employeeID] = ['hours' => 0];
                    }
                    $secondaryIPPTimesheetEmployees[$employeeID]['hours'] += $hoursToAdd;
                }
            }
        }
        
        // STEP 3: Classify secondary deputy IDs based on operational unit
        $secondarySettersDeputyIDs = [];
        $secondaryConfirmersDeputyIDs = [];
        $secondaryIPPDeputyIDs = [];
        foreach($secondaryDeputyIDs as $deputyID){
            $hasSetterUnit = false;
            $hasConfirmerUnit = false;
            $hasIPPUnit = false;
            
            if(isset($secondaryDeputyIDOperationalUnits[$deputyID])){
                foreach($secondaryDeputyIDOperationalUnits[$deputyID] as $unitName){
                    if($unitName === 'Setter'){
                        $hasSetterUnit = true;
                    }
                    if($unitName === 'Confirmer' || $unitName === 'Confirmer - Office' || stripos($unitName, 'Confirmer') !== false){
                        $hasConfirmerUnit = true;
                    }
                    if($unitName === 'IPP' || $unitName === 'IPP Dialing - Office' || stripos($unitName, 'IPP Dialing') !== false || stripos($unitName, 'IPP') !== false){
                        $hasIPPUnit = true;
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
            if($hasIPPUnit){
                $secondaryIPPDeputyIDs[] = $deputyID;
            }
        }
        
        // Make arrays unique
        $secondarySettersDeputyIDs = array_unique($secondarySettersDeputyIDs);
        $secondaryConfirmersDeputyIDs = array_unique($secondaryConfirmersDeputyIDs);
        $secondaryIPPDeputyIDs = array_unique($secondaryIPPDeputyIDs);
        
        // STEP 4: Fetch secondary calls filtered by classified deputy IDs (at SQL level)
        $secondarySettersCalls = [];
        $secondaryConfirmersCalls = [];
        $secondaryIPPCalls = [];
        
        // Fetch secondary setters calls - only for employees clocked into Setter operational unit
        if(!empty($secondarySettersDeputyIDs)){
            $secondarySettersDeputyIdsList = implode(',', $secondarySettersDeputyIDs);
            $secondarySettersCallsQuery = "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$secondaryStart' AND '$secondaryEnd' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($secondarySettersDeputyIdsList) AND cty_id NOT IN ('C', 'IPP')";
            $secondarySettersCalls = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($secondarySettersCallsQuery));
        }
        
        // Fetch secondary confirmers calls - only for employees clocked into Confirmer operational unit
        if(!empty($secondaryConfirmersDeputyIDs)){
            $secondaryConfirmersDeputyIdsList = implode(',', $secondaryConfirmersDeputyIDs);
            $secondaryConfirmersCallsQuery = "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$secondaryStart' AND '$secondaryEnd' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($secondaryConfirmersDeputyIdsList) AND cty_id = 'C'";
            $secondaryConfirmersCalls = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($secondaryConfirmersCallsQuery));
        }
        
        // Fetch secondary IPP calls - only for employees clocked into IPP operational unit
        if(!empty($secondaryIPPDeputyIDs)){
            $secondaryIPPDeputyIdsList = implode(',', $secondaryIPPDeputyIDs);
            $secondaryIPPCallsQuery = "SELECT emp_user_12, emp_id, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified, lds_Leads.ApptSet, lds_Leads.Issued FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$secondaryStart' AND '$secondaryEnd' AND ResultCode NOT IN ('*ND', 'TXT') AND Dialer = 'True' AND emp_user_12 IN ($secondaryIPPDeputyIdsList) AND cty_id = 'IPP'";
            $secondaryIPPCalls = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($secondaryIPPCallsQuery));
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
            ];
        }

        // Process secondary IPP calls
        foreach($secondaryIPPCalls as $call){
            if(!array_key_exists(intval($call['emp_user_12']), $secondaryTimesheetEmployees)){
                continue;
            }
            $employeeName = $call['FirstName'] . " " . $call['LastName'];
            $employeeID = intval($call['emp_user_12']);
            $secondaryTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            // Set employee name in IPP-specific hours if they have IPP hours
            if(array_key_exists($employeeID, $secondaryIPPTimesheetEmployees)){
                $secondaryIPPTimesheetEmployees[$employeeID]['employee'] = $employeeName;
            }
            $responseData['secondaryIPPCalls'][] = [
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
        
        // Set employee names for secondary IPP hours (in case they have hours but no calls)
        foreach($secondaryIPPTimesheetEmployees as $empID => $empData){
            if(!isset($empData['employee']) || empty($empData['employee'])){
                // Try to get name from secondaryTimesheetEmployees
                if(isset($secondaryTimesheetEmployees[$empID]['employee'])){
                    $secondaryIPPTimesheetEmployees[$empID]['employee'] = $secondaryTimesheetEmployees[$empID]['employee'];
                } else {
                    // Try to get name from secondary IPP calls first (most relevant)
                    foreach($secondaryIPPCalls as $call){
                        if(intval($call['emp_user_12']) == $empID){
                            $secondaryIPPTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                            break;
                        }
                    }
                    // If still not found, try secondary setters calls
                    if(!isset($secondaryIPPTimesheetEmployees[$empID]['employee'])){
                        foreach($secondarySettersCalls as $call){
                            if(intval($call['emp_user_12']) == $empID){
                                $secondaryIPPTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                                break;
                            }
                        }
                    }
                    // If still not found, try secondary confirmers calls
                    if(!isset($secondaryIPPTimesheetEmployees[$empID]['employee'])){
                        foreach($secondaryConfirmersCalls as $call){
                            if(intval($call['emp_user_12']) == $empID){
                                $secondaryIPPTimesheetEmployees[$empID]['employee'] = $call['FirstName'] . " " . $call['LastName'];
                                break;
                            }
                        }
                    }
                    // If still not found, try to get from secondary deputy mapping
                    if(!isset($secondaryIPPTimesheetEmployees[$empID]['employee']) && isset($secondaryDeputyToNameMapping[$empID])){
                        $secondaryIPPTimesheetEmployees[$empID]['employee'] = $secondaryDeputyToNameMapping[$empID];
                    }
                }
            }
        }

        // Use setter-specific hours array (based on operational unit) for secondary setters dashboard
        $responseData['secondarySettersHours'] = array_values($secondarySettersTimesheetEmployees);
        $responseData['secondaryConfirmersHours'] = array_values($secondaryConfirmersTimesheetEmployees);
        $responseData['secondaryIPPHours'] = array_values($secondaryIPPTimesheetEmployees);

        // Fetch secondary scorecards
        $secondaryQueryEndDate = date('Y-m-d', strtotime($secondaryEnd . ' -1 day'));
        
        $secondarySettersScorecardsQuery = "SELECT id, form_id, status, created_at, updated_at, variables_used, form_data, responses FROM form_instances 
            WHERE DATE(STR_TO_DATE(variables_used->>'$.CallDate','%Y-%m-%d %H:%i:%s.%f')) BETWEEN '$secondaryStart' AND '$secondaryQueryEndDate'
            AND form_id = 11 
            AND status = 'completed'";
        
        $secondarySettersScorecardsRaw = $integrityDB->query($secondarySettersScorecardsQuery);
        
        $secondaryConfirmersScorecardsQuery = "SELECT id, form_id, status, created_at, updated_at, variables_used, form_data, responses FROM form_instances 
            WHERE DATE(STR_TO_DATE(variables_used->>'$.CallDate','%Y-%m-%d %H:%i:%s.%f')) BETWEEN '$secondaryStart' AND '$secondaryQueryEndDate'
            AND form_id = 12 
            AND status = 'completed'";
        
        $secondaryConfirmersScorecardsRaw = $integrityDB->query($secondaryConfirmersScorecardsQuery);

        // Process secondary setters scorecards
        foreach($secondarySettersScorecardsRaw as $scorecard){
            // Extract employee name first for filtering
            $employeeName = null;
            $callDate = null;
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
            
            $maxTotal = calculateMaxTotal($scorecard['form_data'] ?? null);
            $actualTotal = calculateActualTotal($scorecard['responses'] ?? null);
            $score = $maxTotal > 0 ? round(($actualTotal / $maxTotal) * 100, 2) : 0;
            
            $scorecardData['maxTotal'] = $maxTotal;
            $scorecardData['actualTotal'] = $actualTotal;
            $scorecardData['score'] = $score;
            
            $responseData['secondarySettersScorecards'][] = $scorecardData;
        }

        // Process secondary confirmers scorecards
        foreach($secondaryConfirmersScorecardsRaw as $scorecard){
            // Extract employee name first for filtering
            $employeeName = null;
            $callDate = null;
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
            
            $maxTotal = calculateMaxTotal($scorecard['form_data'] ?? null);
            $actualTotal = calculateActualTotal($scorecard['responses'] ?? null);
            $score = $maxTotal > 0 ? round(($actualTotal / $maxTotal) * 100, 2) : 0;
            
            $scorecardData['maxTotal'] = $maxTotal;
            $scorecardData['actualTotal'] = $actualTotal;
            $scorecardData['score'] = $score;
            
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
        foreach($secondaryIPPCalls as $call){
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
        $secondarySettersAppointments = [];
        if(!empty($secondarySetterLPEmployeeIds)){
            $secondarySetterLPEmployeeIdsList = implode(',', $secondarySetterLPEmployeeIds);
            $secondarySettersAppointmentsQuery = "SELECT app_Appointments.id, app_Appointments.lds_id, app_Appointments.cst_id, app_Appointments.ApptDate, app_Appointments.Dsp_ID, app_Appointments.SetBy, app_Appointments.ApptSet, app_Appointments.Issued, app_Appointments.NetIssued, emp_Employees.FirstName, emp_Employees.LastName FROM app_Appointments LEFT JOIN emp_Employees ON app_Appointments.SetBy = emp_Employees.id WHERE app_Appointments.ApptDate BETWEEN '$secondaryStart' AND '$secondaryEnd' AND emp_Employees.Dialer = '1' AND Dsp_ID NOT IN ('Set') AND ApptSet = '1' AND app_Appointments.SetBy IN ($secondarySetterLPEmployeeIdsList) ORDER BY app_Appointments.id DESC";
            $secondarySettersAppointments = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($secondarySettersAppointmentsQuery));
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
            ];
        }
    }
    
    $query = "SELECT
                lds_Leads.id as 'leadId',
                lds_Leads.cst_id,
                lds_Leads.srs_id as 'srs_id',
                lds_Leads.DateEntered as 'DateEntered',
                in1_InboundQueue1.DateReceived as 'DateReceived',
                in1_InboundQueue1.CheckOutDate as 'CheckOutDate',
                (
                    SELECT TOP 1 CallDate
                    FROM cls_Calls
                    WHERE cst_id = lds_Leads.cst_id
                        AND CallDate > in1_InboundQueue1.CheckOutDate
                        AND ResultCode NOT IN ('*ND', 'ccND', 'NDDNC', 'NDLB', 'NDTR')
                    ORDER BY CallDate ASC
                ) as 'CallDate',
                (
                    SELECT TOP 1 emp_Employees.FirstName
                    FROM cls_Calls
                    INNER JOIN emp_Employees ON cls_Calls.emp_id = emp_Employees.id
                    WHERE cst_id = lds_Leads.cst_id
                        AND CallDate > in1_InboundQueue1.CheckOutDate
                        AND ResultCode NOT IN ('*ND', 'ccND', 'NDDNC', 'NDLB', 'NDTR')
                    ORDER BY CallDate ASC
                ) as 'FirstName',
                (
                    SELECT TOP 1 emp_Employees.LastName
                    FROM cls_Calls
                    INNER JOIN emp_Employees ON cls_Calls.emp_id = emp_Employees.id
                    WHERE cst_id = lds_Leads.cst_id
                        AND CallDate > in1_InboundQueue1.CheckOutDate
                        AND ResultCode NOT IN ('*ND', 'ccND', 'NDDNC', 'NDLB', 'NDTR')
                    ORDER BY CallDate ASC
                ) as 'LastName'
            FROM
                lds_Leads
            LEFT JOIN
                in1_InboundQueue1
            ON
                lds_Leads.id = in1_InboundQueue1.lds_id
            WHERE
                in1_InboundQueue1.DateReceived IS NOT NULL
                AND (
                    SELECT TOP 1 CallDate
                    FROM cls_Calls
                    WHERE cst_id = lds_Leads.cst_id
                        AND CallDate > in1_InboundQueue1.CheckOutDate
                        AND ResultCode NOT IN ('*ND', 'ccND', 'NDDNC', 'NDLB', 'NDTR')
                    ORDER BY CallDate ASC
                ) BETWEEN '$start' AND '$end'
    ";

    $rtdData = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($query));
    $responseData['stl'] = [];
    
    // If lpId is provided, get the employee name to filter STL data
    $lpIdEmployeeName = null;
    if ($lpId !== null && $lpId > 0) {
        $empNameQuery = "SELECT FirstName, LastName FROM emp_Employees WHERE id = " . $lpId;
        $empNameResult = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($empNameQuery));
        if (!empty($empNameResult) && isset($empNameResult[0]['FirstName']) && isset($empNameResult[0]['LastName'])) {
            $lpIdEmployeeName = trim($empNameResult[0]['FirstName']) . " " . trim($empNameResult[0]['LastName']);
        }
    }
    
    foreach($rtdData as $response){
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

    $query = "SELECT * FROM `emp` LEFT JOIN `data`.`Employees` ON emp_id = id WHERE dialer = 'True' AND active = 'True'";

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

    exit(json_encode($responseData));
    

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