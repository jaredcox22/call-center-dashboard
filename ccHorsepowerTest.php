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

    if($_GET['test']){
        $responseData = json_decode('{"calls":[{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:10:31.330","result":"CB","cty_id":"B","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:12:37.873","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:13:09.803","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:13:54.400","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:15:34.813","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:17:21.237","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 08:20:07.230","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 08:20:49.810","result":"ccOoA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:22:22.747","result":"MobHM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:23:36.990","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 08:23:55.113","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:25:40.567","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 08:26:30.960","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 08:40:46.153","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 08:42:41.777","result":"ccOoA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:16:30.830","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:17:15.733","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:18:32.510","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:23:34.967","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:26:41.160","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:29:17.827","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:29:47.890","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:30:14.690","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:32:54.457","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:33:02.167","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:33:55.890","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:34:42.090","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:35:17.280","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:36:05.040","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:38:26.283","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:38:28.563","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:39:18.687","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:40:39.907","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:41:48.610","result":"ccNO","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:41:50.373","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:42:15.683","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:48:23.027","result":"AP","cty_id":"D","connected":1,"pitched":1,"positive":1},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:48:48.317","result":"CB","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:49:07.567","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:49:36.347","result":"ccOoS","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:50:23.803","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:50:38.373","result":"ccNO","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:53:41.367","result":"ccNIy","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:53:55.187","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 09:57:43.267","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:58:11.660","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 09:58:40.993","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:02:42.943","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:05:08.657","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:06:13.987","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:07:22.040","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:10:05.163","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:11:08.160","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:12:08.937","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:12:22.610","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:13:09.383","result":"ccNI6","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:13:11.870","result":"ccNIy","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:13:29.663","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:16:07.870","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:16:21.107","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:17:05.100","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:17:27.803","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:18:43.837","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:21:59.750","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:22:41.323","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:22:56.153","result":"ccNI6","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:24:28.717","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:24:31.173","result":"ccOoS","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:25:43.480","result":"ccNA","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:25:48.717","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:26:46.130","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:27:07.020","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:28:17.320","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:28:35.420","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:28:44.993","result":"ccNO","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:29:26.330","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:29:40.373","result":"ccHU","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:31:01.140","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:33:48.583","result":"ccNI6","cty_id":"B","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:34:18.210","result":"ccNIy","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:37:15.073","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:37:30.330","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:37:44.707","result":"ccDNC","cty_id":"R","connected":1,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:39:35.757","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:40:48.873","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:43:00.160","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:43:40.230","result":"ccHU","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:44:16.310","result":"WN","cty_id":"D","connected":1,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:45:08.300","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:48:34.720","result":"ccLM","cty_id":"B","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:49:31.780","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 10:49:57.760","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:52:55.760","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 10:56:07.910","result":"ccNI3","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:00:52.617","result":"ccNIy","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:04:06.283","result":"ccLM","cty_id":"B","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:05:26.580","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:05:49.493","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:08:55.120","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:10:07.177","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:11:04.520","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:11:17.900","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:12:17.887","result":"ccNIy","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:12:59.600","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:13:26.553","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:14:26.523","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:16:10.760","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:16:33.790","result":"ccNI6","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:18:19.720","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:20:36.503","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:22:28.773","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:26:53.757","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:27:18.343","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:27:41.777","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:28:54.503","result":"ccOoA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:29:48.523","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:34:30.080","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:35:05.893","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:35:06.953","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:36:30.443","result":"ccLM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:37:11.080","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:39:04.630","result":"ccNIy","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:41:06.027","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:42:36.427","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:43:07.623","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:45:23.503","result":"ccNIy","cty_id":"R","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:48:08.733","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:49:13.630","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:49:32.097","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 11:50:10.907","result":"ccNIy","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 11:53:29.530","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:00:07.620","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:06:09.283","result":"ccVM","cty_id":"B","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:10:32.007","result":"AP","cty_id":"D","connected":1,"pitched":1,"positive":1},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:10:57.590","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:11:42.993","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:12:12.573","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:13:01.420","result":"ccVM","cty_id":"R","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:13:23.410","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:13:50.100","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:14:39.193","result":"ccNIy","cty_id":"D","connected":1,"pitched":1,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:22:24.490","result":"ccVM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":1461,"employee":"Phenick Thongpasouk","date":"2025-04-09 12:43:23.000","result":"AP","cty_id":"CI","connected":1,"pitched":1,"positive":1},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 12:46:47.977","result":"ccLM","cty_id":"D","connected":0,"pitched":0,"positive":0},{"id":2635,"employee":"Audra Radwanski","date":"2025-04-09 12:47:20.540","result":"ccNA","cty_id":"D","connected":0,"pitched":0,"positive":0}],"hours":[{"hours":4.7075,"employee":"Phenick Thongpasouk"},{"hours":4.691111111111111,"employee":"Audra Radwanski"}]}', TRUE);
        // Initialize scorecard arrays for test mode
        $responseData['settersScorecards'] = [];
        $responseData['confirmersScorecards'] = [];
    }else{
        $responseData = [
            'settersCalls' => [],
            'confirmersCalls' => [],
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
        $settersCallsQuery = "SELECT emp_user_12, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$start' AND '$end' AND ResultCode NOT LIKE '%ND%' AND Dialer = 'True' AND emp_user_12 > 0 AND cty_id != 'C'";
        $settersCalls = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($settersCallsQuery));

        $confirmersCallsQuery = "SELECT emp_user_12, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$start' AND '$end' AND ResultCode NOT LIKE '%ND%' AND Dialer = 'True' AND emp_user_12 > 0 AND cty_id = 'C'";
        $confirmersCalls = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($confirmersCallsQuery));

        $deputyIDs = [];

        foreach($settersCalls as $call){
            if(!in_array($call['emp_user_12'], $deputyIDs)){
                $deputyIDs[] = $call['emp_user_12'];
            }
        }

        foreach($confirmersCalls as $call){
            if(!in_array($call['emp_user_12'], $deputyIDs)){
                $deputyIDs[] = $call['emp_user_12'];
            }
        }

        $timesheets = [];
        $timesheetEmployees = [];

        foreach($deputyIDs as $deputyID){
            $theseTimesheets = curlCall("$endpoint/deputy/getTimesheets.php?startDate=$start&endDate=$end&id=" . intval($deputyID));
            foreach($theseTimesheets as $timesheet){
                // if($timesheet['_DPMetaData']['OperationalUnitInfo']['OperationalUnitName'] != 'Setter'){
                //     continue;
                // }
                if($timesheet['IsInProgress']){
                    $timesheet['EndTimeLocalized'] = date('Y-m-d H:i:s');
                }
                $timesheets[] = $timesheet;
                $employeeID = $timesheet['Employee'];
                if(!array_key_exists($employeeID, $timesheetEmployees)){
                    $timesheetEmployees[$employeeID] = ['hours' => 0];
                }
                // For in-progress timesheets, calculate from start time to current time for live updates
                if($timesheet['IsInProgress'] && isset($timesheet['StartTimeLocalized'])){
                    $currentTime = date('Y-m-d H:i:s');
                    $timesheetEmployees[$employeeID]['hours'] += (strtotime($currentTime) - strtotime($timesheet['StartTimeLocalized'])) / 60 / 60;
                }else if(isset($timesheet['TotalTime']) && $timesheet['TotalTime'] !== '' && $timesheet['TotalTime'] !== null){
                    // Use TotalTime for completed timesheets
                    $timesheetEmployees[$employeeID]['hours'] += floatval($timesheet['TotalTime']);
                }else if(isset($timesheet['StartTimeLocalized']) && isset($timesheet['EndTimeLocalized'])){
                    // Fallback: calculate from start/end times if TotalTime not available
                    $timesheetEmployees[$employeeID]['hours'] += (strtotime($timesheet['EndTimeLocalized']) - strtotime($timesheet['StartTimeLocalized'])) / 60 / 60;
                }
            }
        }

        foreach($settersCalls as $call){
            if(!array_key_exists(intval($call['emp_user_12']), $timesheetEmployees)){
                continue;
            }
            $timesheetEmployees[intval($call['emp_user_12'])]['employee'] = $call   ['FirstName'] . " " . $call['LastName'];
            $responseData['settersCalls'][] = [
                'id' => $call['id'],
                'employee' => $call['FirstName'] . " " . $call['LastName'],
                'date' => $call['CallDate'],
                'result' => $call['ResultCode'],
                'cty_id' => $call['cty_id'],
                'connected' => $call['Connected'],
                'pitched' => $call['Pitched'],
                'positive' => $call['Positive'],
                'qualified' => ($call['qualified'] == 1 ? true : false),
            ];
        }

        foreach($confirmersCalls as $call){
            if(!array_key_exists(intval($call['emp_user_12']), $timesheetEmployees)){
                continue;
            }

            $timesheetEmployees[intval($call['emp_user_12'])]['employee'] = $call   ['FirstName'] . " " . $call['LastName'];
            $responseData['confirmersCalls'][] = [
                'id' => $call['id'],
                'employee' => $call['FirstName'] . " " . $call['LastName'],
                'date' => $call['CallDate'],
                'result' => $call['ResultCode'],
                'cty_id' => $call['cty_id'],
                'connected' => $call['Connected'],
                'pitched' => $call['Pitched'],
                'positive' => $call['Positive'],
                'qualified' => ($call['qualified'] == 1 ? true : false),
            ];
        }

        $responseData['hours'] = array_values($timesheetEmployees);

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

        // Process setters scorecards
        foreach($settersScorecardsRaw as $scorecard){
            $scorecardData = [
                'id' => $scorecard['id'] ?? null,
                'form_instance_id' => $scorecard['id'] ?? null,
                'form_id' => $scorecard['form_id'] ?? null,
                'status' => $scorecard['status'] ?? null,
                'created_at' => $scorecard['created_at'] ?? null,
                'updated_at' => $scorecard['updated_at'] ?? null,
            ];
            
            // Extract employee name from variables_used
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
            $scorecardData = [
                'id' => $scorecard['id'] ?? null,
                'form_instance_id' => $scorecard['id'] ?? null,
                'form_id' => $scorecard['form_id'] ?? null,
                'status' => $scorecard['status'] ?? null,
                'created_at' => $scorecard['created_at'] ?? null,
                'updated_at' => $scorecard['updated_at'] ?? null,
            ];
            
            // Extract employee name from variables_used
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
    }

    // Fetch secondary data for performance metrics if secondaryDateRange is provided
    $responseData['secondarySettersCalls'] = [];
    $responseData['secondaryConfirmersCalls'] = [];
    $responseData['secondaryHours'] = [];
    $responseData['secondarySettersScorecards'] = [];
    $responseData['secondaryConfirmersScorecards'] = [];
    
    if(array_key_exists('secondaryDateRange', $_GET)){
        // Fetch secondary setters calls
        $secondarySettersCallsQuery = "SELECT emp_user_12, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$secondaryStart' AND '$secondaryEnd' AND ResultCode NOT LIKE '%ND%' AND Dialer = 'True' AND emp_user_12 > 0 AND cty_id != 'C'";
        $secondarySettersCalls = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($secondarySettersCallsQuery));

        // Fetch secondary confirmers calls
        $secondaryConfirmersCallsQuery = "SELECT emp_user_12, LastName, cls_Calls.id as id, FirstName, CallDate, ResultCode, cty_id, Connected, Pitched, Positive, qualified FROM cls_Calls LEFT JOIN clr_CallResults ON ResultCode = clr_CallResults.id LEFT JOIN emp_Employees ON emp_id = emp_Employees.id LEFT JOIN lds_Leads ON cls_Calls.lds_id = lds_Leads.id LEFT JOIN srs_SourceSubs ON lds_Leads.srs_id = srs_SourceSubs.id WHERE CallDate BETWEEN '$secondaryStart' AND '$secondaryEnd' AND ResultCode NOT LIKE '%ND%' AND Dialer = 'True' AND emp_user_12 > 0 AND cty_id = 'C'";
        $secondaryConfirmersCalls = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($secondaryConfirmersCallsQuery));

        // Get deputy IDs for secondary data
        $secondaryDeputyIDs = [];
        foreach($secondarySettersCalls as $call){
            if(!in_array($call['emp_user_12'], $secondaryDeputyIDs)){
                $secondaryDeputyIDs[] = $call['emp_user_12'];
            }
        }
        foreach($secondaryConfirmersCalls as $call){
            if(!in_array($call['emp_user_12'], $secondaryDeputyIDs)){
                $secondaryDeputyIDs[] = $call['emp_user_12'];
            }
        }

        // Fetch timesheets for secondary date range
        $secondaryTimesheetEmployees = [];
        foreach($secondaryDeputyIDs as $deputyID){
            $theseTimesheets = curlCall("$endpoint/deputy/getTimesheets.php?startDate=$secondaryStart&endDate=$secondaryEnd&id=" . intval($deputyID));
            foreach($theseTimesheets as $timesheet){
                if($timesheet['IsInProgress']){
                    $timesheet['EndTimeLocalized'] = date('Y-m-d H:i:s');
                }
                $employeeID = $timesheet['Employee'];
                if(!array_key_exists($employeeID, $secondaryTimesheetEmployees)){
                    $secondaryTimesheetEmployees[$employeeID] = ['hours' => 0];
                }
                if($timesheet['IsInProgress'] && isset($timesheet['StartTimeLocalized'])){
                    $currentTime = date('Y-m-d H:i:s');
                    $secondaryTimesheetEmployees[$employeeID]['hours'] += (strtotime($currentTime) - strtotime($timesheet['StartTimeLocalized'])) / 60 / 60;
                }else if(isset($timesheet['TotalTime']) && $timesheet['TotalTime'] !== '' && $timesheet['TotalTime'] !== null){
                    $secondaryTimesheetEmployees[$employeeID]['hours'] += floatval($timesheet['TotalTime']);
                }else if(isset($timesheet['StartTimeLocalized']) && isset($timesheet['EndTimeLocalized'])){
                    $secondaryTimesheetEmployees[$employeeID]['hours'] += (strtotime($timesheet['EndTimeLocalized']) - strtotime($timesheet['StartTimeLocalized'])) / 60 / 60;
                }
            }
        }

        // Process secondary setters calls
        foreach($secondarySettersCalls as $call){
            if(!array_key_exists(intval($call['emp_user_12']), $secondaryTimesheetEmployees)){
                continue;
            }
            $secondaryTimesheetEmployees[intval($call['emp_user_12'])]['employee'] = $call['FirstName'] . " " . $call['LastName'];
            $responseData['secondarySettersCalls'][] = [
                'id' => $call['id'],
                'employee' => $call['FirstName'] . " " . $call['LastName'],
                'date' => $call['CallDate'],
                'result' => $call['ResultCode'],
                'cty_id' => $call['cty_id'],
                'connected' => $call['Connected'],
                'pitched' => $call['Pitched'],
                'positive' => $call['Positive'],
                'qualified' => ($call['qualified'] == 1 ? true : false),
            ];
        }

        // Process secondary confirmers calls
        foreach($secondaryConfirmersCalls as $call){
            if(!array_key_exists(intval($call['emp_user_12']), $secondaryTimesheetEmployees)){
                continue;
            }
            $secondaryTimesheetEmployees[intval($call['emp_user_12'])]['employee'] = $call['FirstName'] . " " . $call['LastName'];
            $responseData['secondaryConfirmersCalls'][] = [
                'id' => $call['id'],
                'employee' => $call['FirstName'] . " " . $call['LastName'],
                'date' => $call['CallDate'],
                'result' => $call['ResultCode'],
                'cty_id' => $call['cty_id'],
                'connected' => $call['Connected'],
                'pitched' => $call['Pitched'],
                'positive' => $call['Positive'],
                'qualified' => ($call['qualified'] == 1 ? true : false),
            ];
        }

        $responseData['secondaryHours'] = array_values($secondaryTimesheetEmployees);

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
            $scorecardData = [
                'id' => $scorecard['id'] ?? null,
                'form_instance_id' => $scorecard['id'] ?? null,
                'form_id' => $scorecard['form_id'] ?? null,
                'status' => $scorecard['status'] ?? null,
                'created_at' => $scorecard['created_at'] ?? null,
                'updated_at' => $scorecard['updated_at'] ?? null,
            ];
            
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
            $scorecardData = [
                'id' => $scorecard['id'] ?? null,
                'form_instance_id' => $scorecard['id'] ?? null,
                'form_id' => $scorecard['form_id'] ?? null,
                'status' => $scorecard['status'] ?? null,
                'created_at' => $scorecard['created_at'] ?? null,
                'updated_at' => $scorecard['updated_at'] ?? null,
            ];
            
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
    }
    
    $query = "SELECT
                lds_Leads.cst_id,
                in1_InboundQueue1.DateReceived as 'DateReceived',
                in1_InboundQueue1.CheckOutDate as 'CheckOutDate',
                cRef.CallDate as 'CallDate',
                emp_Employees.FirstName as 'FirstName',
                emp_Employees.LastName as 'LastName'
            FROM
                lds_Leads
            LEFT JOIN
                (
                    SELECT
                        MAX(id) as id,
                        lds_id,
                        MIN(CallDate) as CallDate
                    FROM
                        cls_Calls
                    WHERE
                        ResultCode NOT IN ('*ND', 'ccND', 'NDDNC', 'NDLB', 'NDTR')
                    GROUP BY
                        lds_id
                ) as cRef
                ON
                    lds_Leads.id = cRef.lds_id
                LEFT JOIN
                    cls_Calls
                ON
                    cRef.id = cls_Calls.id
                LEFT JOIN
                    emp_Employees
                ON
                    cls_Calls.emp_id = emp_Employees.id
                LEFT JOIN
                    in1_InboundQueue1
                ON
                    lds_Leads.id = in1_InboundQueue1.lds_id
                WHERE
                    in1_InboundQueue1.CheckOutDate
                BETWEEN
                    '$start' AND '$end' AND
                    in1_InboundQueue1.DateReceived IS NOT NULL
    ";

    $rtdData = curlCall("$endpoint/lp/customReport.php?rptSQL=" . urlencode($query));
    $responseData['stl'] = [];
    foreach($rtdData as $response){
        $responseData['stl'][] = [
            'employee' => $response['FirstName'] . " " . $response['LastName'],
            'stl' => getBusinessHourDiff($response['CheckOutDate'], $response['CallDate']),
            'cst_id' => $response['cst_id'],
        ];
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
		if(array_key_exists($startDOW, $ccHours)){
			//CC is open that day
	
			if(strtotime($start) < strtotime("$startDate " . $ccHours[$startDOW]['start'])){
				//Lead came in before CC opened
				$calculatedStart = "$startDate " . $ccHours[$startDOW]['start'];
			}else if(strtotime($start) > strtotime("$startDate " . $ccHours[$startDOW]['end'])){
				//Lead came in after CC closed
				$startDate = date('Y-m-d', strtotime("$start + 1 day"));
				$startDOW = date('w', strtotime($startDate));
				while(!array_key_exists($startDOW, $ccHours)){
					$startDate = date('Y-m-d', strtotime("$startDate + 1 day"));
					$startDOW = date('w', strtotime($startDate));
				}
				$calculatedStart = "$startDate " . $ccHours[$startDOW]['start'];
			}else{
				$calculatedStart = $start;
			}
		}else{
			//CC is closed that day
			$startDate = date('Y-m-d', strtotime("$start + 1 day"));
			$startDOW = date('w', strtotime($startDate));
			while(!array_key_exists($startDOW, $ccHours)){
				$startDate = date('Y-m-d', strtotime("$startDate + 1 day"));
				$startDOW = date('w', strtotime($startDate));
			}
			$calculatedStart = "$startDate " . $ccHours[$startDOW]['start'];
		}
		
		$startDOW = date('w', strtotime($calculatedStart));
		$startDate = date('Y-m-d', strtotime($calculatedStart));
	
		$endDOW = date('w', strtotime($end));
		$endDate = date('Y-m-d', strtotime($end));
	
		if($startDOW == $endDOW){
			$difference = strtotime($end) - strtotime($calculatedStart);
		}else{
			//Get the seconds between the start date and when the CC closed
			$difference = strtotime("$startDate " . $ccHours[$startDOW]['end']) - strtotime($calculatedStart);
	
			$startDate = date('Y-m-d', strtotime("$startDate + 1 day"));
			$startDOW = date('w', strtotime($startDate));
			while($startDOW != $endDOW){
				//Difference is greater than 1 day
				if(array_key_exists($startDOW, $ccHours)){
					$difference += strtotime("$startDate " . $ccHours[$startDOW]['start']) - strtotime("$startDate " . $ccHours[$startDOW]['end']);
				}
				$startDate = date('Y-m-d', strtotime("$startDate + 1 day"));
				$startDOW = date('w', strtotime($startDate));         
			}
			if(array_key_exists($endDOW, $ccHours)){
				$difference += strtotime($end) - strtotime("$endDate " . $ccHours[$endDOW]['start']);
			}
		}
		if($difference < 0){
			$difference = 0;
		}
		return $difference;
	}

?>