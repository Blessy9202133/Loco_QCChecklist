<?php
$servername = "localhost";
$username = "root";
$password = "Hbl@1234";
$dbname = "loco_info"; // Change this to your actual DB name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// List of 17 tables and their specific sections
$tables_and_sections = [
    "document_verification_table" => ["1.0", "1.1", "1.2"],
    "verify_serial_numbers_of_equipment_as_per_ic" => ["2.0", "2.1", "2.2", "2.3", "2.4", "2.5"],
    "loco_kavach" =>["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13"],
    "emi_filter_box" => ["4.0", "4.1", "4.2", "4.3"],
    "rib_cab_input_box" => ["5.0", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9"],
    "dmi_lp_ocip" => ["6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10"],
    "rfid_ps_unit" => ["7.0", "7.1", "7.2","7.3","7.4","7.5"],
    "loco_antenna_and_gps_gsm_antenna" => ["8.0", "8.1", "8.2", "8.3" ,"8.4", "8.5", "8.6", "8.7", "8.8"],
    "pneumatic_fittings_and_ep_valve_cocks_fixing" => ["9.0", "9.1", "9.2", "9.4", "9.5", "9.6", "9.7"],
    "pressure_sensors_installation_in_loco" => ["10.0", "10.1", "10.2","10.3"],
    "iru_faviely_units_fixing_for_e70_type_loco" => ["11.0", "11.1", "11.2", "11.3", "11.4", "11.5", "11.6", "11.7"],
    "psjb_tpm_units_fixing_for_ccb_type_loco" => ["12.0", "12.1", "12.2", "12.3", "12.4", "12.5"],
    "sifa_valve_fixing_for_ccb_type_loco" => ["13.0", "13.1", "13.2","13.3","13.4"],
    "pgs_and_speedo_meter_units_fixing" => ["14.0", "14.1", "14.2","14.3", "14.4", "14.5", "14.6", "14.7", "14.8", "14.9","14.10","14.11","14.12","14.13"],
    "rfid_reader_assembly" => ["15.0", "15.1", "15.2","15.3", "15.4", "15.5", "15.6", "15.7", "15.8", "15.9","15.10","15.11"],
    "earthing" => ["16.0", "16.1","16.2","16.3"],
    "radio_power" => ["17.0", "17.1","17.2"],
];

// S_no ranges (manually defined since range() doesn't support decimals)
$s_no_ranges = [
    "1.0" => [1.1, 1.2, 1.3],
    "2.0" => array_map(fn($i) => 2 + $i / 10, range(1, 19)),
    "3.0" => array_map(fn($i) => 3 + $i / 10, range(1, 13)),
    "4.0" => [4.1, 4.2, 4.3],
    "5.0" => array_map(fn($i) => 5 + $i / 10, range(1, 9)),
    "6.0" => array_map(fn($i) => 6 + $i / 10, range(1, 10)),
    "7.0" => array_map(fn($i) => 7 + $i / 10, range(1, 5)),
    "8.0" => array_map(fn($i) => 8 + $i / 10, range(1, 8)),
    "9.0" => array_map(fn($i) => 9 + $i / 10, range(1, 7)),
    "10.0" => [10.1, 10.2, 10.3],
    "11.0" => array_map(fn($i) => 11 + $i / 10, range(1, 7)),
    "12.0" => array_map(fn($i) => 12 + $i / 10, range(1, 5)),
    "13.0" => array_map(fn($i) => 13 + $i / 10, range(1, 4)),
    "14.0" => array_map(fn($i) => 14 + $i / 10, range(1, 13)),
    "15.0" => array_map(fn($i) => 15 + $i / 10, range(1, 11)),
    "16.0" => [16.1, 16.2, 16.3],
    "17.0" => [17.1, 17.2],
];


// Description text for specific S_no values
$observation_text = [
    "1.1" => "Is the annexure of the IC (Inspection Certificate) issued by RDSO available?",
    "1.2" => "Is the Loco Allocation Letter available?",
    "1.3" => "Is the Loco KAVACH External Harness Connectivity Diagram available?",
    "2.1" => "Is the presence of a hologram and S/R stamp verified on each equipment?",
    "2.2" => "Loco  KAVACH Main Unit :  ",
    "2.3" => "Relay Interface Box : ",
    "2.4" => "Cab Input Box : ",
    "2.5" => "RFID Readers 1: ","RFID Readers 2:",
    "2.6" => "LPOCIP (DMI) 1 : ","LPOCIP (DMI) 2 :",
    "2.7" => "Speedometer 1: ","Speedometer 2 : ",
    "2.8" => "GPS & GSM Antenna 1: ","GPS & GSM Antenna 2: ",
    "2.9" => "UHF  Radio Antenna 1:","UHF  Radio Antenna 2","UHF  Radio Antenna 3","UHF  Radio Antenna 4",
    "2.10" => "RFID PS 1:","RFID PS 2",
    "2.11" => "PG 1:","PG 2 : ",
    "2.12" => "PPC Card 1:", "PPC Card 1:",
    "2.13" => "VC Card 1:","VC Card 1:_","VC Card 1:_",
    "2.14" => "Voter Card 1:"," Voter Card 2 : ",
    "2.15" => " Vital Gate Way Card 1:","Vital Gate Way Card 2:",
    "2.16" => "Cab I/P Card 1:__","Cab I/P Card 2:_",
    "2.17" => "DPS Card 1:","DPS Card 2:",
    "2.18" => "Radio unit :_",
    "2.19" => "EMI Filter Unit :",
    "3.1" => "Has the placement of all LOCO KAVACH equipment and peripherals been verified in the locomotive as per the connectivity drawing?",
    "3.2" => "Is the power  supply connections of the loco kavach done as per ‘LOCO Kavach Power supply Connectivity Diagram(5 16 49 0426) ?",
    "3.3" => "Is there adequate maintenance space available surrounding the LOCO KAVACH to facilitate efficient servicing?",
    "3.4" => "Are all welded loco stands constructed with four legs of 5 MM thick steel as required, and not as cantilever structures with two legs?",
    "3.5" => "Are there any sharp edges or gaps present in the welding of the Loco KAVACH unit stand to the loco surface? ",
    "3.6" => "Has the red oxide coating been applied to the welded portions before painting with RAL7032 (pebble grey color) to prevent corrosion?",
    "3.7" => "Are the M8 fixing holes on the loco stand matching precisely with the M8 fixing holes on the loco channel?",
    "3.8" => "Is the correct torque value (20 N-M) applied to the M8 bolts, and is it confirmed with green paint marking?",
    "3.9" => "Are the interconnections done as per Loco Kavach inter connectivity diagram for E-70
(5 16 49 0608) / for CCB (5 16 49 0618)?",
    "3.10" => "Is the LOCO Kavach Cable installation done as per “Loco Kavach Cable Routing Plan for WAP-7/WAP-5/WAG-9 locomotives with E-70 braking system (5 16 49 0620) / with CCB braking system (5 16 49 0621)?",
    "3.11" => "Are all wires routed correctly, ensuring no stress is applied and there are no sharp bends?",
    "3.12" => "Are the peripheral cables of the LOCO KAVACH unit properly secured with metal clamps to ensure stability and safety?",
    "3.13" =>"Are all external cable connectors securely locked into place with the Loco KAVACH receptacles to ensure proper functionality?",
    "4.1" => "Is the EMI filter box properly fixed to the loco stand using M5x16mm screws and nuts, torqued to 5 N-m?",
    "4.2" => "Are all cables routed through the PG gland in compliance with the standards, ensuring no sharp bends or stress, and secured using metal clamps? ",
    "4.3" => "Is the LOCO Kavach Cable installation done as per “Loco Kavach Cable Routing Plan for WAP-7/WAP-5/WAG-9 locomotives with E-70 braking system (5 16 49 0620) / 
with CCB braking system (5 16 49 0621)?",
    "5.1" => "Is the RIB & CAB IP box stand made with the required thickness of 5 mm?",
    "5.2" => "Is there sufficient space between the RIB unit and CAB input box for smooth cable handling and easy access?",
    "5.3" => "Is the welding on the RIB and CAB input box stand free from gaps, cracks, or joint breaks?",
    "5.4" => "Are the M5X16mm bolts torqued to the specified 5 N-m and marked with green paint after proper verification using a torque spanner?",
    "5.5" => "Are all cables routed correctly, ensuring there is no stress, sharp bends, and secured with cable ties?",
    "5.6" => "Are all external cable circular connectors properly locked into the LOCO KAVACH receptacles, with the cables connected according to the labels?",
    "5.7" => "Is the LOCO Kavach Cable installation done as per “Loco Kavach Cable Routing Plan for WAP-7/WAP-5/WAG-9 locomotives with E-70 braking system (5 16 49 0620) / with CCB braking system (5 16 49 0621)?",
    "5.8" =>"Is the arrangement of Kavach interfacing with the E70 brake system in WAP-5, WAP-7, and WAG-9 locomotives done as per 2454245/2023/O/o PED/Traction/RDSO? ",
    "5.9" => "Are the interconnection between Inter-connection drawing from Cab Termination Unit and SB Panels E-70 (5 16 49 0624) / CCB (5 16 49 0625)",
    "6.1" => "Has the DMI been mounted in a location at the driver’s desk that is easily accessible and operable by the loco pilot?",
    "6.2" => "Has the DMI mounting stand been properly welded without any joint gaps and verified to withstand loco vibrations?",
    "6.3" => "Have the M5X16mm screws been tightened to 5 N-m using a torque spanner, and are their heads marked with green paint after torque verification?",
    "6.4" => "Has the DMI cable been installed in a way that it can be easily accessed through the projection at the bottom of the stand?",
    "6.5" => "Has the welded portion of the DMI stand been coated with red oxide and then painted with RAL7032 (Pebble Grey) to ensure corrosion prevention?",
    "6.6" => "Is the cable routing done in such a way that there is no stress or sharp bends, and all cables are properly secured with metal clamps?",
    "6.7" => "Is the cable booting intact and undamaged, and are the circular connectors securely locked into the DMI unit enclosure receptacles?",
    "6.8" => "Is the DMI-1 cable correctly connected to MC1 at the Loco Kavach unit as per the requirements?",
    "6.9" => "Is the DMI-2 cable securely connected to MC3 at the Loco Kavach unit as required?",
    "6.10" => "Is the LOCO Kavach Cable installation done as per “Loco Kavach Cable Routing Plan for 
WAP-7/WAP-5/WAG-9 locomotives with E-70 braking system (5 16 49 0620) / with CCB braking system (5 16 49 0621).",
    "7.1" => "Is the RFID PS unit fixed to the Loco Kavach stand with M5X16mm screws tightened to 5 N-m torque, and are the screws heads properly marked with green paint?",
    "7.2" => "Are all cable connections properly routed to the corresponding locations as per the labels provided on the Loco Kavach unit?",
    "7.3" => "Have the cables been routed in a way that prevents hanging, and are they properly secured with cable ties?",
    "7.4" => "Are the circular connectors properly locked with the RFID box unit receptacles?",
    "7.5" => "Is the LOCO Kavach Cable installation done as per “Loco Kavach Cable Routing Plan for WAP-7/WAP-5/WAG-9 locomotives with E-70 braking system (5 16 49 0620) / with CCB braking system (5 16 49 0621)?",
    "8.1" => "Has the radio antenna base plate welding been done properly without any joint gaps or cracks?",
    "8.2" => "Is the welding done to a standard that ensures the antennas will remain secure and functional despite high-speed loco vibrations?",
    "8.3" => "Are the antennas mounted within the stipulated height to avoid contact with the OHE line?",
    "8.4" => "Have the LMR400 cables (TX-1, TX-2, RX-1, and RX-2) been connected to their respective locations?",
    "8.5" => "Are the LMR200 cables (GSM1, GPS1, GSM2, and GPS2) properly routed and connected to their correct locations?",
    "8.6"=> " Has the routing of LOCO antenna cables through the 2 steel reinforced pipe/hose been done correctly to prevent environmental damage, with the pipe/hose properly secured using cable ties?",
    "8.7" => "Has all the welded portions been treated with red oxide coating before being painted with RAL7032 (pebble grey color) to prevent corrosion? ",
    "8.8" => "Is the LOCO Kavach Cable installation done as per “Loco Kavach Cable Routing Plan for WAP-7/WAP-5/WAG-9 locomotives with E-70 braking system (5 16 49 0620) / with CCB braking system (5 16 49 0621)? ",
    "9.1" => "Are all pneumatic pipes and fittings verified to be from the approved BOM and obtained from the factory-supplied I&C kit?",
    "9.2" =>  "Have the copper pipes been bent using the appropriate bending tool, ensuring there are no kinks or sharp bends in the pipe",
    "9.3" => "Has the copper tube length been measured correctly to ensure proper connectivity from loco pneumatics to the EP valve, BP cock, horn cock, and valve arrangements?",
    "9.4" => "Have the copper pipe connections been made properly using approved ferrules and TEE-joints (e.g., Fluid Control)?",
    "9.5" => "Is Teflon paste, supplied in the I&C kit, used to seal all threaded connections instead of Teflon tape?",
    "9.6" => "Have the pneumatic line connections been checked with a soap solution to ensure there are no loose connections, with no air bubbles seen at the joints?",
    "9.7" => "Is the LOCO Kavach Cable installation done as per “Loco Kavach Cable Routing Plan for WAP-7/WAP-5/WAG-9 locomotives with E-70 braking system (5 16 49 0620) / with CCB braking system (5 16 49 0621).   ",
    "10.1" => "Have all the pressure sensors been installed under the CAB1 driver desk as required?",
    "10.2" => "Are the MR sensor (16 bar) and BP, BC1, BC2 sensors (7 bar) installed as specified in Manual For Installation of Loco KAVACH V2.0 5 53 76 0014?",
    "10.3" => "Are all pressure sensors installed on T-joints as specified in Manual For Installation Of
Loco KAVACH V2.0 5 53 76 0014?",
    "11.1" => "Has the area at the bottom of the driver desk in both CABs been verified to have enough space for IRU fixing?",
    "11.2" => "Is the welding of the supporting angles for the IRU units verified to ensure they can withstand loco vibrations?",
    "11.3" => "Has the welded portion been checked to ensure it is neat and clean, with no gaps or cracks?",
    "11.4" => "Are the IRU unit fixing holes properly aligned with the supporting angles?",
    "11.5" => "Is the red oxide coating applied to the welded portions before being painted with RAL7032 (Pebble Grey) color paint?",
    "11.6" => "Are the cable connections correctly made at the corresponding locations as per the labels provided?",
    "11.7" => "Have the cables been routed properly, without hanging on the ground, and securely tied with cable ties?",
    "12.1" => "Has the existing PSJB been removed and handed over to the Loco Shed Rail team, and has the factory-supplied PSJB been installed?",
    "12.2" => "Has the TPM module been installed on the right side of the MPIO module?",
    "12.3" => "Do the fixing holes of the PSJB and TPM units match with the supporting clamps?",
    "12.4" => "Is the LOCO Kavach Cable installation done as per “Loco Kavach Cable Routing Plan for WAP-7/WAP-5/WAG-9 locomotives with E-70 braking system (5 16 49 0620) / with CCB braking system (5 16 49 0621)?",
    "12.5" => "Have the cables been routed properly, ensuring they are not hanging on the ground and are securely tied with cable ties?",
    "13.1" => "Is the SIFA valve installed with the mounting frame under the DBC panel on the CAB-1 side?",
    "13.2" => "Is the mounting location of the SIFA valve easy for operations and maintenance?",
    "13.3" => "Is the SIFA valve manifold securely fixed to the mounting frame using the hardware provided in the installation kit?",
    "13.4" => "Is the welded portion neat and clean, with no welding gaps or cracks?",
    "14.1" => "Have PG1 and PG2 been installed on the allotted axles (1/2/3/4/5/6) of the locomotives on the left and right side?",
    "14.2" => "Is PG1 connected to the left side and PG2 to the right side when seated at the LP desk on the CAB-A side?",
    "14.3" => "Have the M8X16mm screws been tightened with a torque of 20 N-m using a torque spanner, and are the bolts/screws marked with green paint after torque verification?",
    "14.4" => "Is the PG head (sensor) positioned to the top side from the ground/rail or on the left/right side for safety purposes?",
    "14.5" => "Have the PG cables been routed properly and secured with metal clamps or cable ties?",
    "14.6" => "Are the speedometer boxes fixed near the PG, with the speedometer holes and fixing clamp holes aligned evenly and the M5 Allen key bolts been torqued to 12 N-m?",
    "14.7" => "Are the speedometer supporting clamps welded without any gaps or cracks?",
    "14.8" => "Are the cables from the PG to the speedometers, and from the speedometer units to the Loco Kavach unit, connected properly?",
    "14.9" => "Is PG1 / SPD Meter 1 connected to MC8 at the Loco Kavach unit?",
    "14.10" => "Is PG2 / SPD Meter 2 connected to MC22 at the Loco Kavach unit?",
    "14.11" => "Are the external cables routed to their respective speedometer units?",
    "14.12" => "Are the external cable circular connectors properly locked with the speedometer box unit receptacles?",
    "14.13" => "Is the LOCO Kavach Cable installation done as per “Loco Kavach Cable Routing Plan for WAP-7/WAP-5/WAG-9 locomotives with E-70 braking system (5 16 49 0620) / with CCB braking system (5 16 49 0621)?",
    "15.1" => "Are the RFID Reader brackets welded to the bottom of the locomotive at both CABs?",
    "15.2" => "Has the welding been done properly to ensure the RFID Reader can withstand the vibrations during loco operation?",
    "15.3" => "Has the tightness of the channel fixing screws (M8X16mm) been verified using a torque wrench at 20 N-m?",
    "15.4" => "Is the height from the rail to the bottom of the RFID Reader maintained at 450mm ± 50mm for proper tag reading at high speeds?",
    "15.5" => "Has the welded portion been coated with red oxide and painted with RAL7032 (Pebble Grey color) paint?",
    "15.6" => "Are the RFID reader cables routed properly through the loco trench without any overlaps or over-stress, and are there no sharp bends or damage to the MIL connectors during routing?",
    "15.7" => "Is the MIL connectors' connectivity as per the connectivity drawing?",
    "15.8" => "Is RFID Reader-1 connected to MC6 at the Loco Kavach unit?",
    "15.9" => "Is RFID Reader-2 connected to MC7 at the Loco Kavach unit?",
    "15.10" => "Are the circular connectors properly locked with the RFID box unit receptacles?",
    "15.11" => "Is the LOCO Kavach Cable installation done as per “Loco Kavach Cable Routing Plan for WAP-7/WAP-5/WAG-9 locomotives with E-70 braking system (5 16 49 0620) / with CCB braking system (5 16 49 0621). ",
    "16.1" => "Has the earthing been done with a 4 Sq.mm Yellow/Green cable for the following units: 
(a) Loco Kavach main unit,(b) Relay Interface Box,
(c) CAB Input Box,(d) LP-OCIP-1 unit, and (e) LP-OCIP-2 unit?",
   "16.2" => "Has the continuity of the earth cable been ensured, with lugs properly crimped and the tightness verified?",
   "16.3" => "Are the earth cables routed through the conduit correctly, properly arranged, and securely tied with metal clamps or cable ties?",
   "17.1" => "Has the RADIO-1 Power been configured to 10 Watts if the radio shows 1 Watt?",
   "17.2" => "Has the RADIO-2 Power been configured to 10 Watts if the radio shows 1 Watt?",
];

// Sample data
$loco_type = "WDG";
$brake_type = "CCB";
$railway_division = "SER";
$shed_name = "Deen Dayal Upadhyay (DDUE)";
$inspection_date = date('Y-m-d'); // Auto-generate today's date
$remarks = "Good";
$image_path = "img-1.jpeg";
$observation_status = "Available";

// Starting loco_id
$loco_id = 100; // Start with Loco ID 3000

// Loop for inserting data for 20 Loco IDs
for ($i = 0; $i < 5; $i++) {
    // Insert sample data into loco table
    $loco_sql = "INSERT INTO loco (Loco_Id, Loco_type, Brake_type, Railway_Division, Shed_name, inspection_Date) 
                 VALUES ('$loco_id', '$loco_type', '$brake_type', '$railway_division', '$shed_name', '$inspection_date')";

    if ($conn->query($loco_sql) === TRUE) {
        echo "Loco data inserted successfully for Loco ID: " . htmlspecialchars($loco_id) . "<br>";
    } else {
        echo "Error inserting into loco table: " . $conn->error . "<br>";
    }

    // Loop through tables and insert data for relevant sections
    foreach ($tables_and_sections as $table => $sections) {
        foreach ($sections as $section_id) {
            // Check if the section_id exists in the $s_no_ranges
            if (isset($s_no_ranges[$section_id])) {
                foreach ($s_no_ranges[$section_id] as $s_no) {
                    // Get the description text for the current S_no
                    $current_observation_text = isset($observation_text[(string)$s_no]) ? $observation_text[(string)$s_no] : 'No description available';

                    // Escape variables to prevent SQL injection
                    $current_observation_text = mysqli_real_escape_string($conn, $current_observation_text);
                    $remarks = mysqli_real_escape_string($conn, $remarks);
                    $image_path = mysqli_real_escape_string($conn, $image_path);
                    $acceptance_criteria = mysqli_real_escape_string($conn, "Criteria not defined");

                    // Prepare the insert statement
                    $sql = "INSERT INTO $table 
                            (loco_id, section_id, loco_type, brake_type, railway_division, shed_name, 
                             inspection_date, observation_text, remarks, S_no, image_path, observation_status, created_at) 
                            VALUES 
                            ('$loco_id', '$section_id', '$loco_type', '$brake_type', '$railway_division', '$shed_name', 
                             '$inspection_date', '$current_observation_text', '$remarks', '$s_no', '$image_path', '$observation_status', NOW())";

                    if ($conn->query($sql) === TRUE) {
                        echo "Data inserted into " . htmlspecialchars($table) . " successfully for Section: " . htmlspecialchars($section_id) . ", S_no: " . htmlspecialchars($s_no) . ", Loco ID: " . htmlspecialchars($loco_id) . "<br>";
                    } else {
                        echo "Error inserting into $table: " . $conn->error . "<br>";
                    }
                }
            }
        }
    }

    $loco_id++;  // Increment loco_id after each loop iteration
}

$conn->close();
?>