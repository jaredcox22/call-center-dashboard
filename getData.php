<?php

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

		$uri = $_SERVER['REQUEST_URI'];
        $headers = getallheaders();
        $dateTime = date("Y-m-d H:i:s",strtotime('now'));

        if(isset($headers['Authorization']) || isset($headers['authorization'])){
                if(isset($headers['Authorization'])){
                        $auth = $headers['Authorization'];
                }elseif(isset($headers['authorization'])){
                        $auth = $headers['authorization'];
                }
                $matches = array();
                preg_match('/Bearer (.*)/', $auth, $matches);
                if(isset($matches[1])){
                        $token = $matches[1];
                }
        }else{
                $error = array('error' => 'Authentication Bearer not found');
                print_r(json_encode($error));
                http_response_code(401);
                die;
        }

	if($token != 'b2749415-7da8-475c-b4e2-f340677b1342'){
		$error = array('error' => 'Not Authorized');
		exit(json_encode($error));
	}
	if(!isset($_GET['table']) && !in_array($_GET['type'], array('LPLeads', 'sql', 'aspire'))){
		exit("BAD");
	}

	if(isset($_GET['type']) && $_GET['type'] == 'LP'){
		require_once("/home/shared/functions.php");
		$query = urlencode("SELECT * FROM " . $_GET['table']);
		if(isset($_GET['where'])){
			$query .= urlencode(" WHERE " . $_GET['where']);
		}
		if(isset($_GET['Offset'])){
			$query .= urlencode(" ORDER BY id OFFSET " . $_GET['Offset'] . " ROWS");
		}
		if(isset($_GET['Limit'])){
			$query .= urlencode("  FETCH NEXT " . $_GET['Limit'] . " ROWS ONLY");
		}
		$response = curlCall("http://intserver-api/lp/customReport.php?rptSQL=$query");
		exit(json_encode($response));

	}else if(isset($_GET['type']) && $_GET['type'] == 'LPLeads'){
		$startDate = $_GET['date'];
		require_once("/home/shared/functions.php");
		$query = urlencode("Select
					l.id,
					MAX(j.ils_id) as ils_id,
					l.cst_id,
					l.Productid as 'Product',
					l.EntryDate as 'Entry Date',
					l.dsp_id as 'Disposition',
					l.src_id as 'Source',
					l.brn_id,
					l.srs_id,
					l.ApptDate as 'Appointment Date',
					l.slr_id,
					l.SetBy as 'setby',
					l.VerifiedBy as 'verifiedby',
					l.ConfirmedBy as 'confirmedby',
					l.ApptSet as 'Appointment Set?',
					l.Verified as 'Verified?',
					l.Confirmed as 'Confirmed?',
					l.Issued as 'Issued?',
					l.NetIssued as 'Net Issued?',
					l.Sat as 'Sat?',
					l.Sold as 'Sold?',
					SUM(j.GrossAmount) as 'Gross Revenue',
					SUM(CASE WHEN JobStatus NOT LIKE '%Hold%' AND JobStatus NOT LIKE '%Cancel%' AND JobStatus != 'Credit Decline' THEN j.GrossAmount END) as 'Net Revenue',
					l.LastChangedOn as 'lastchangedon',
					l.pro_id,
					SUM(CASE WHEN JobStatus LIKE '%Hold%' THEN j.GrossAmount END) as 'Hold Revenue',
					CASE WHEN l.EverIssued = 1 THEN 'True' ELSE 'False' END as 'Ever Issued?',
					l.prod3,
					l.prod2,
					iq1.DateReceived as 'ReceivedDate',
					iq1.emp_id as 'Processed By',
					l.DateEntered as 'DateEntered',
					l.prod4,
					c.CallDate,
					iq1.CheckOutDate,
					(SELECT productid FROM ProspectJobs WHERE lds_id = l.id ORDER BY GSA DESC OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY) as 'Biggest Sold Product'
				from
					Lds_Leads as l
				LEFT JOIN
					ProspectJobs as j ON l.id = j.lds_id
				LEFT JOIN
                	in1_InboundQueue1 as iq1 ON l.id = iq1.lds_id
                LEFT JOIN
                	(Select
					l.id as 'otherID',
					MIN(c.CallDate) as 'CallDate'
				from
					Lds_Leads as l
				LEFT JOIN
					ProspectJobs as j
				ON
					l.cst_id = j.cst_id
				LEFT JOIN
					cls_Calls as c
				ON
					c.cst_id = l.cst_id AND c.CallDate > l.DateEntered
				WHERE
					(l.LastChangedOn >= '$startDate' OR lastchanged >= '$startDate')
				AND NOT
					(l.srs_id IN (266) AND l.EntryDate = '2024-02-19' AND l.dsp_id = 'Data')
				AND NOT
					(l.srs_id IN (294) AND l.dsp_id = 'Data')
				GROUP BY
					l.id) as c
				ON c.otherID = l.id
				WHERE
					(l.LastChangedOn >= '$startDate' OR lastchanged >= '$startDate')
				AND NOT
					(l.srs_id IN (266) AND l.EntryDate = '2024-02-19' AND l.dsp_id = 'Data')
				AND NOT
					(l.srs_id IN (294) AND l.dsp_id = 'Data')
				GROUP BY
					l.id, l.cst_id, l.Productid, l.Prod2, l.Prod3, l.Prod4, l.EntryDate, l.dsp_id, l.src_id, l.brn_id, l.srs_id, l.ApptDate, l.slr_id, l.SetBy, l.VerifiedBy, l.ConfirmedBy, l.ApptSet, l.Verified, l.Confirmed, l.Issued, l.NetIssued, l.Sat, l.Sold, l.GSA, l.LastChangedOn, l.pro_id, iq1.DateReceived, iq1.CheckOutDate, l.EverIssued, l.DateEntered, c.CallDate, iq1.emp_id ORDER BY id");
                if(isset($_GET['Offset'])){
                        $query .= urlencode(" OFFSET " . $_GET['Offset'] . " ROWS");
                }
                if(isset($_GET['Limit'])){
                        $query .= urlencode("  FETCH NEXT " . $_GET['Limit'] . " ROWS ONLY");
                }
                $response = curlCall("http://intserver-api/lp/customReport.php?rptSQL=$query");
		$leadProgArray = array(
			"setappt" => "Appointment Set?",
			"verification" => "Verified?",
			"confirmation" => "Confirmed?",
			"issue" => "Issued?"
		);
		$query = urlencode("SELECT * FROM dsp_dispositions ORDER BY id DESC");
		$dispositions = curlCall("http://intserver-api/lp/customReport.php?rptSQL=$query");
		foreach ($dispositions as $index => $dispo) {
			foreach($dispo as $key => $value){
				if(strtolower($key) != $key){
					$dispo[strtolower($key)] = $value;
					unset($dispo[$key]);
				}
			}
			$dispositions[$dispo['descr']] = $dispo;
			unset($dispositions[$index]);
		}
		require_once(__DIR__ . "/../shared/db.php");
		$db = new db();
		$query = "SELECT
					srs_id,
					brn_id,
					YEAR(Date) as 'Year',
					MONTH(Date) as 'Month',
					(SUM(Cost) / SUM(`Number of Leads`)) as 'Average Lead Cost'
				FROM
					MarketingGroupSubSources
				LEFT JOIN
					marketingCostData
				ON
					marketing_group_id = marketingCostData.ID
				GROUP BY srs_id, brn_id, YEAR(Date), MONTH(Date)";
		$costData = $db->query($query);
		$marketingCosts = [];
		foreach($costData as $data){
			$key = $data['srs_id'] . "_" . $data['brn_id'] . "_" . $data['Year'] . "_" . $data['Month'];
			$marketingCosts[$key] = $data['Average Lead Cost'];
		}
		foreach($response as $index => $lead){
/*			if($response[$index]['ApptSet'] == 1){
				$response[$index]['ApptSet'] = 'True';
			}else{
				$response[$index]['ApptSet'] = 'False';
			}
			if($response[$index]['Verified'] == 1){
				$response[$index]['Verified'] = 'True';
			}else{
				$response[$index]['Verified'] = 'False';
			}
			if($response[$index]['Confirmed'] == 1){
				$response[$index]['Confirmed'] = 'True';
			}else{
				$response[$index]['Confirmed'] = 'False';
			}
			if($response[$index]['Issued'] == 1){
				$response[$index]['Issued'] = 'True';
			}else{
				$response[$index]['Issued'] = 'False';
			}
			if($response[$index]['NetIssued'] == 1){
				$response[$index]['NetIssued'] = 'True';
			}else{
				$response[$index]['NetIssued'] = 'False';
			}
			if($response[$index]['Sat'] == 1){
				$response[$index]['Sat'] = 'True';
			}else{
				$response[$index]['Sat'] = 'False';
			}
			if($response[$index]['Sold'] == 1){
				$response[$index]['Sold'] = 'True';
			}else{
				$response[$index]['Sold'] = 'False';
			}*/

			$dispo = $dispositions[trim($lead['Disposition'])];
			$response[$index]['Appointment Set?'] = 'False';
			$response[$index]['Verified?'] = 'False';
			$response[$index]['Confirmed?'] = 'False';
			$response[$index]['Issued?'] = 'False';
			$response[$index]['Net Issued?'] = 'False';
			$response[$index]['Sat?'] = 'False';
			$response[$index]['Sold?'] = 'False';
			switch ($dispo['dct_id']) {
				case 0:
					foreach ($leadProgArray as $dspKey => $apptKey) {
						if ($dispo[$dspKey] > 0) {
							$response[$index][$apptKey] = 'True';
						}
					}
					if ($response[$index]['setby'] == 0) {
						$response[$index]['Appointment Set?'] = 'False';
					}
					if ($response[$index]['verifiedby'] == 0) {
						$response[$index]['Verified?'] = 'False';
					}
					if ($response[$index]['confirmedby'] == 0) {
						$response[$index]['Confirmed?'] = 'False';
					}
					break;
				case 4:
					$response[$index]['Sold?'] = 'True';
				case 3:
					$response[$index]['Sat?'] = 'True';
				case 2:
					$response[$index]['Net Issued?'] = 'True';
				case 1:
					$response[$index]['Issued?'] = 'True';
					$response[$index]['Confirmed?'] = 'True';
					$response[$index]['Verified?'] = 'True';
					$response[$index]['Appointment Set?'] = 'True';
					break;
			}

			if($response[$index]['Gross Revenue'] == ".0000"){
				$response[$index]['Gross Revenue'] = 0;
			}
			if($response[$index]['Net Revenue'] == ".0000"){
				$response[$index]['Net Revenue'] = 0;
			}
			$response[$index]['Gross Revenue'] = "$" . round($response[$index]['Gross Revenue'], 2);
			$response[$index]['Net Revenue'] = "$" . round($response[$index]['Net Revenue'], 2);
			$key = $response[$index]['srs_id'] . "_" . $response[$index]['brn_id'] . "_" . date('Y_n', strtotime($response[$index]['Entry Date']));
			if(array_key_exists($key, $marketingCosts)){
				$response[$index]['Estimated Lead Cost'] = $marketingCosts[$key];
			}

			if($response[$index]['srs_id'] == 6 && strtotime($response[$index]['DateEntered']) >= strtotime("2024-01-01") && strtotime($response[$index]['DateEntered']) <= strtotime("2025-03-26")){
				$response[$index]['Received To Checkout'] = null;
				$response[$index]['Checkout To Dial'] = null;
				$response[$index]['Received To Dial'] = null;

			}else{
				if($response[$index]['ReceivedDate']){
					$response[$index]['Received To Checkout'] = getBusinessHourDiff($response[$index]['ReceivedDate'], $response[$index]['CheckOutDate']);
					if($response[$index]['CallDate']){
						$response[$index]['Checkout To Dial'] = getBusinessHourDiff($response[$index]['CheckOutDate'], $response[$index]['CallDate']);
						$response[$index]['Received To Dial'] = getBusinessHourDiff($response[$index]['ReceivedDate'], $response[$index]['CallDate']);
					}else{
						$response[$index]['Checkout To Dial'] = null;
						$response[$index]['Received To Dial'] = null;
					}
				}else{
					$response[$index]['Received To Checkout'] = null;
					$response[$index]['Checkout To Dial'] = null;
					if($response[$index]['CallDate']){
						$response[$index]['Received To Dial'] = getBusinessHourDiff($response[$index]['DateEntered'], $response[$index]['CallDate']);
					}else{
						$response[$index]['Received To Dial'] = null;
					}
				}
			}
		}
                exit(json_encode($response));
	}else if(isset($_GET['type']) && $_GET['type'] == 'sql'){
		require_once("/home/shared/functions.php");
                if(isset($_GET['Offset'])){
                        $query .= urlencode(" ORDER BY id OFFSET " . $_GET['Offset'] . " ROWS");
                }
                if(isset($_GET['Limit'])){
                        $query .= urlencode("  FETCH NEXT " . $_GET['Limit'] . " ROWS ONLY");
                }
		$query = urlencode($_GET['query']);
        $response = curlCall("http://intserver-api/lp/customReport.php?rptSQL=$query");
		if(isset($_GET['dtcalc']) && $_GET['dtcalc'] == true){
			foreach($_GET as $key => $value){
				if(substr($key, 0, 7) == 'dtfield'){
					$details = explode(":", $value);
					foreach($response as $index => $row){
						if(array_key_exists($details[0], $row) && array_key_exists($details[1], $row)){
							$response[$index][$details[2]] = getBusinessHourDiff($row[$details[0]], $row[$details[1]]);
						}
					}
				}
			}
		}
		exit(json_encode($response));
	}else if(isset($_GET['type']) && $_GET['type'] == 'aspire' && isset($_GET['object'])){
		require_once("/home/shared/functions.php");
		$url = "http://intserver-api/aspire/get" . $_GET['object'] . ".php?";
		if(isset($_GET['filter'])){
			$url .= "\$filter=" . urlencode($_GET['filter']) . "&";
		}
		if(isset($_GET['select'])){
			$url .= "\$select=" . urlencode($_GET['select']) . "&";
		}
                if(isset($_GET['Offset'])){
			$url .= "\$skip=" . urlencode($_GET['Offset']) . "&";
                }
                if(isset($_GET['Limit'])){
			$url .= "\$top=" . urlencode($_GET['Limit']) . "&";
                }
		if(isset($_GET['Page'])){
			$url .= "\$pageNumber=" . urlencode($_GET['Page']) . "&";
		}
		if($_GET['object'] == 'WorkTickets'){
			$url .= "\$orderby=+LastModifiedDateTime+desc";
		}
		else if($_GET['object'] == 'ClockTimes'){
			$url .= "\$orderby=+ClockTimeID+desc";
		}
		else if($_GET['object'] == 'Properties'){
			$url .= "\$orderBy=+PropertyID+asc";
		}
		else if($_GET['object'] != 'Routes' && $_GET['object'] != 'Properties'){
			$url .= "\$orderby=+StartTime+desc";
		}
        $response = curlCall($url);
        exit(json_encode($response));
	}else{

		$query = "SELECT * FROM " . $_GET['table'];

		if(isset($_GET['sortBy']) && isset($_GET['order'])){
			$query .= " ORDER BY " . $_GET['sortBy'] . " " . $_GET['order'];
		}

		require_once("/home/shared/db.php");
		$db = new db();

		exit(json_encode($db->query($query)));
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
		if((strtotime($end) - strtotime($start)) <= 60){
			//Likely auto-processed
			return strtotime($end) - strtotime($start);
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
		
		$calculatedStartTs = strtotime($calculatedStart);
		$endTs = strtotime($end);

		// If the call happened before the next valid business start window, no wait time
		if ($endTs <= $calculatedStartTs) {
			return 0;
		}

		$startDOW = date('w', $calculatedStartTs);
		$startDate = date('Y-m-d', strtotime($calculatedStart));
	
		$endDOW = date('w', $endTs);
		$endDate = date('Y-m-d', $endTs);
	
		if($startDOW == $endDOW){
			$difference = strtotime($end) - strtotime($calculatedStart);
		}else{
			//Get the seconds between the start date and when the CC closed
			$difference = strtotime("$startDate " . $ccHours[$startDOW]['end']) - strtotime($calculatedStart);
	
			$startDate = date('Y-m-d', strtotime("$startDate + 1 day"));
			$startDOW = date('w', strtotime($startDate));
			while($startDOW != $endDOW){
				//Difference is greater than 1 day - add full business hours for this day
				if(array_key_exists($startDOW, $ccHours)){
					$difference += strtotime("$startDate " . $ccHours[$startDOW]['end']) - strtotime("$startDate " . $ccHours[$startDOW]['start']);
				}
				$startDate = date('Y-m-d', strtotime("$startDate + 1 day"));
				$startDOW = date('w', strtotime($startDate));         
			}
			if(array_key_exists($endDOW, $ccHours)){
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
