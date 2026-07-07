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
    "emi_filter_box" => ["4.0", "4.1", "4.2"],
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
    "4.0" => [4.1, 4.2],
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
     "1.1" => "Annexure of IC (Inspection Certificate) issued by RDSO.",
    "1.2" => "Loco Allocation Letter",
    "2.1" => "Ensure presence of Hologram and S/R Stamp on each equipment",
    "2.2" => "Loco KAVACH Main Unit:",
    "2.3" => "Relay Interface Box:",
    "2.4" => "Cab Input Box:",
    "2.5" => "RFID Reader 1:",
    "2.6" => "RFID Reader 2:",
    "2.7" => "LPOCIP (DMI) 1:",
    "2.8" => "LPOCIP (DMI) 2:",
    "2.9" => "Speedometer 1:",
    "2.10" => "Speedometer 2:",
    "2.11" => "GPS/GSM Antenna 1:",
    "2.12" => "GPS/GSM Antenna 2:",
    "2.13" => "UHF Radio Antenna 1:",
    "2.14" => "UHF Radio Antenna 2:",
    "2.15" => "UHF Radio Antenna 3:",
    "2.16" => "UHF Radio Antenna 4:",
    "2.17" => "RFID PS 1:",
    "2.18" => "RFID PS 2:",
    "2.19" => "Pulse Generator 1:",
    "2.20" => "Pulse Generator 2:",
    "2.21" => "PPC Card 1:",
    "2.22" => "PPC Card 2:",
    "2.23" => "VC Card 1:",
    "2.24" => "VC Card 2:",
    "2.25" => "VC Card 3:",
    "2.26" => "Voter Card 1:",
    "2.27" => "Voter Card 2:",
    "2.28" => "Vital Gate Way Card 1:",
    "2.29" => "Vital Gate Way Card 2:",
    "2.30" => "Cab I/P Card 1:",
    "2.31" => "Cab I/P Card 2:",
    "2.32" => "DPS Card 1:",
    "2.33" => "DPS Card 2:",
    "2.34" => "Radio unit:",
    "2.35" => "EMI Filter Unit:",
    "2.36" => "Radio Modem-1:",
    "2.37" => "Radio Modem-2:",
    "2.38" => "Interface Relay Unit Faiveley-1:",
    "2.39" => "Interface Relay Unit Faiveley-2 :",
    "2.40" => "IRAB Main Unit :",
    "3.1" => "Placement of LOCO KAVACH Equipment in Locomotive:Verify that all Loco KAVACH equipment and peripherals are installed and connected as per connectivity diagram",
    "3.2" => "Ensure that adequate space is available around the Loco KAVACH for ease of maintenance and service.",
    "3.3" => "Loco Stand:Loco Kavach Unit has been placed on the designated stand and secured using the mounting bolts supplied in the Loco Kavach Installation Kit?",
    "3.4" => "Welding between Loco surface and KAVACH fixing Stand:Inspect the welding between the Loco surface and the KAVACH stand. Ensure there are no sharp edges or gaps. Ensure 2.80 mm diameter E6013 welding electrodes are used.",
    "3.5" => "Welding Surface Treatment: Is Aerol Zinc3060 sprayed and the coating is extended up to 50 mm on both sides?",
    "3.5.1" => "Welding Surface Treatment: Verify whether second coat of Aerol Zinc 3060 is done over entire area? After 30 Minutes Gap",
    "3.5.2" => "Welding Surface Treatment: Verify whether Berger Red Oxide Primer is applied on all galvanized steel parts?",
    "3.6" => "Loco Stand fixing holes:Ensure that Loco stand fixing holes(M8) are exactly matching with Loco channel fixing holes(M8).",
    "3.7" => "Torque and Marking:Verify the torque Value of M8 Bolts (25 N.M) and mark with green/Yellow paint if the torque value is Ok.",
    "3.8" => "Cable connections:Verify the connections on the Loco external cable are made correctly according to the \"Loco KAVACH External Harness Connectivity Diagram\" without any overlaps.",
    "3.9" => "Wire Stress:Routing of wires to be done without stress and without sharp bends.",
    "3.10" => "Cable securing:Verify that all peripheral cables for the loco kavach unit are routed and securely fastened using the appropriate metal clamps.",
    "3.11" => "Connector fitment:Ensure that all the external cable circular connectors are fully locked properly with Loco Kavach receptacles.",
    "3.12" => "Earthing:Ensure that earthing done with 10Sq.mm Yellow/Green cable for Loco Kavach main unit.",
    "3.13" => "Earth Cable:Ensure that cable continuity,lug's crimping and tightness of earth cable.",
    "3.14" => "Earth Cable routing:Ensure that the earth cables are routed through the conduit and routed properly and tied with metal clamps / cable ties.",
    "4.1" => "EMI Filter Box Fixing:Fix M5x16mm Bolts on the EMI Filter Box to the loco stand with torque of 6 N-m and mark with green/yellow paint.",
    "4.2" => "Cable routing:Ensure all the cables routed through PG gland without sharp bends, stress and tied with metal clamps.",
    "5.1" => "Space between RIB and CAB Input:Ensure enough space available in-between cab input box and RIB unit for easy access of cables",
    "5.2" => "Welding:Ensure RIB and CAB Input box stand welding is without gap, cracks and joint breaks.",
    "5.3" => "Torque:The M5X16mm bolts shall be tightened with 6 N.m torque Wrench and mark with green/yellow paint after torque verification.",
    "5.4" => "Cable Connections:Verify the RIB Unit harness cable connections for MILB1, MILB2, MILB3, MC26, MC18 are properly terminated.",
    "5.5" => "Cable Routing:Verify proper routing through PG glands without sharp bends or stress. Cables must be tied using metal clamps.",
    "5.6" => "Connector fitment:Verify that cables are connected with respect to labels and ensure all the external cable circular connectors are fully locked properly with enclosure (LOCO KAVACH) receptacles.",
    "5.7" => "Earthing:Ensure that earthing done with 10Sq.mm Yellow/Green cable for Relay Interface Box and Cab Input box.",
    "5.8" => "Earth Cable:Ensure that cable continuity, lug's crimping and tightness of earth cable.",
    "5.9" => "Earth Cable routing:Ensure that the earth cables are routed through the conduit and routed properly and tied with metal clamps / cable ties.",
    "6.1" => "DMI Mounting Place:Check the DMI mounted place is good enough at driver desk, which can be operated easily by Loco pilot.",
    "6.2" => "DMI Mounting Stand:Ensure that DMI mounting stand is properly welded without any joint gaps and can be withstand to loco vibrations.",
    "6.3" => "Torque and Marking:Ensure M5x16mm Bolts are tightened to 6 N·m torque using a torque wrench, and mark screw heads with green/yellow paint after torque verification.",
    "6.4" => "DMI Cable:Make sure the DMI cable can be easily accessed by the projection at the bottom of the stand.",
    "6.5" => "DMI Stand Color:Ensure welded portions of the stand are treated with red oxide coating before applying RAL7032 (Pebble Grey/ Smoke Gray ) paint to prevent corrosion",
    "6.6" => "Cable routing:Ensure all the cables routed without any stress, without sharp bends and tied with metal clamps.",
    "6.7" => "Cable Booting:Verify that the cable booting is not damaged or peeled during and after cable routing, and ensure circular connectors are fully locked with the DMI unit enclosure receptacles",
    "6.8" => "DMI-1 Cable Connection:DMI-1 cable should be connected to MC1 at Loco Kavach unit.",
    "6.9" => "DMI 2 Cable Connection:DMI-2 cable should be connected to MC3 at Loco Kavach unit.",
    "6.10" => "Earthing:Ensure that earthing done with 10Sq.mm Yellow/Green cable for LP-OCIP -1 and LP-OCIP-2.",
    "6.11" => "Earth Cable:Ensure that cable continuity,lug's crimping and tightness of earth cable.",
    "6.12" => "Earth Cable routing:Ensure that the earth cables are routed through the conduit and routed properly and tied with metal clamps / cable ties.",
    "7.1" => "RFID PS Unit fixing:Ensure M5x16mm Bolts are tightened to 6 N·m torque using a torque wrench on the Loco Kavach stand, and mark screw heads with green/yellow paint after verifying the torque value",
    "7.2" => "Cable connections:Ensure that cable connections are given at the corresponding location with respect to labels provided at Loco Kavach.",
    "7.3" => "Cable routing:Ensure that cables are routed properly without hanging and tied properly with cables ties",
    "7.4" => "Connector locking:Ensure the circular connectors are properly locked with RFID box unit receptacles.",
    "8.1" => "Verify RF Antenna – TX1 from Base (From long-leg of antenna) height shall be <= 310mm.",
    "8.2" => "Verify RF Antenna – TX2 from Base (From long-leg of antenna) height shall be <= 310mm.",
    "8.3" => "Verify GPS-GSM Antenna1 from Base (From long-leg of antenna) height shall be <= 310mm.",
    "8.4" => "Verify GPS-GSM Antenna2 from Base (From long-leg of antenna) height shall be <= 310mm.",
    "8.5" => "Verify RF Antenna height – from Rail Level height shall be <= 3960mm.",
    "8.6" => "Verify GPS-GSM Antenna height – from Rail Level height shall be <= 3891mm.",
    "8.7" => "Are RF and GPS/GSM antennas properly leveled using a spirit level instrument?",
    "8.8" => "Radio Antenna Welding:Check that the radio antenna’s base plate welding is done properly, with no joint gaps or cracks.",
    "8.9" => "Welding:Ensure the welding is sufficient to withstand locomotive vibrations at higher speeds without affecting the antennas.",
    "8.10" => "Antenna Mounting:Antennas are to be mounted within stipulated height to avoid OHE line contact.",
    "8.11" => "RF Antenna Cable Connections:Are the Rx and Tx cables connected to their respective Rx and Tx antenna, as per the labels?",
    "8.12" => "GPS/GSM Antenna and Cable Installation:Are the GPS and GSM cables clearly labeled and correctly connected to their respective GPS and GSM antenna on both sides of the locomotive?",
    "8.13" => "Antenna Cables Routing: Verify that cables from the two RF antenna and GPS/GSM antennae are routed through a 2” steel-reinforced conduit.",
    "8.13.1" => "Antenna Cables Routing: Ensure the conduit is securely clamped to the roof using clamps welded to the rooftop, as per the installation drawing.",
    "8.13.2" => "Antenna Cables Routing: Confirm the conduit is routed into the Loco cabin through the elbow pipe installed in the flasher unit on the roof.",
    "8.13.3" => "Antenna Cables Routing: Ensure the conduit pipe and elbow are sourced from the Loco Kavach Installation Kit.",
    "8.13.4" => "Antenna Cables Routing: Verify that RTV Silicone compound (from the Loco Kavach Installation Kit) is applied around all open conduit and cable entry joints to prevent ingress of dust,water, etc.",
    "8.14" => "Red oxide coating:Ensure that all welded portions should be treated with red oxide coating, before painted with RAL7032 (pebble grey / Smoke Gray ) paint, to avoid corrosion.",
    "9.1" => "Pneumatic fittings:Confirm that all pipes and fittings used in the assembly are from the approved BOM and sourced from the I and C kit supplied by the factory.Any locally procured items must be checked for compliance with the approved BOM",
    "9.2" => "Copper Pipes:Ensure that copper pipes are bent using appropriate bending tool, and there no kinks or sharp bends in the pipe.",
    "9.3" => "Copper Tube:Ensure that copper tube length is measured with respect to the connectivity from loco pneumatic to EP Valve, BP cock, Horn cock and valve arrangements.",
    "9.4" => "Copper pipe connections:Ensure that copper pipe connections made properly with approved make (Ex. Fluid Control) ferrules and TEE-joints used.",
    "9.5" => "Threaded Connections:All threaded connections must be sealed with loctite 567 (Not With Teflon Tape), which is supplied in the IandC kit.",
    "9.6" => "Pneumatic Lines Connections:Check the pneumatic lines with a soap solution to make sure there are no loose connections and no air bubbles should be seen.",
    "9.7" => "Pneumatic Lines Connections:The soap solution must be cleaned after the test.",
    "10.1" => "Ensure all these pressure sensors shall be installed under CAB1 driver desk.",
    "10.2" => "Ensure MR sensor should be 16 bar, and remain BP,BC1,BC2 are 7 bar",
    "10.3" => "Ensure all pressure sensors should be installed on T-Joints",
    "10.4" => "Wiring Connections : Red (+V) to Terminal 1, Black (–V) to Terminal 2 & Black-White (Earth) to Terminal 3—Mention In Status",
    "11.1" => "IRU Fixing Place:Are two IRUs installed—one in CAB-I and one in CAB-II—as per installation instructions?",
    "11.1.1" => "IRU Fixing Place: Is the mounting frame fabricated using 50x50x5 mm galvanized steel tube or angle?",
    "11.2" => "Welding:Has the mounting frame been welded under the A9 Driver Brake Controller (DBC) of each cab and after welding has the frame been painted properly?",
    "11.3" => "Red oxide coating:Ensure that the welded portion should be coated with red oxide and painted with RAL7032 (Pebble grey/smoke gray) paint.",
    "11.4" => "Have the IRU units been fixed to the mounting frame using the bolts, nuts, and washers supplied in the Brake Interface Installation Kit?",
    "11.5" => "Cable connections:Ensure that cable connections are given at the corresponding location with respect to labels provided.",
    "11.6" => "Cable routing:Ensure that cables are routed properly without hanging on ground and tied properly with cable ties.",
    "11.7" => "EP Valve and Isolation Cock are installed on the stand where the IRU unit is mounted -- Mention In Status",
    "11.8" => "EP Solenoid Valve wiring: Red (+V) connected to Terminal 1, Black (–V) connected to Terminal 2 (Cable from MILB3)-- Mention In Status",
    "11.9" => "Isolation Cock (N/C type) wiring: Red (+V) connected to Terminal 1, Black (–V) to Terminal 2 (Cable from MC26)-- Mention In Status",
    "11.10" => "Verify that the existing D2 Relay Valve and Manifold Unit are removed from previous location and New D2 Relay Valve is installed on the LE (Locomotive Equipment) unit-- -- Mention In Status",
    "11.11" => "Wire connections: LE Unit Solenoid Valve wiring: Red (+V) connected to Terminal 1, Black (–V) to Terminal 2 (Cable from MILB1)-- Mention In Status",
    "12.1" => "PSJB Fixing:Ensure existing PSJB removed and Handed over to Loco Shed Rail team, And install factory supplied PSJB",
    "12.2" => "TPM Unit Fixing:Ensure that TPM module is installed right side to the MPIO module",
    "12.3" => "Fixing of PSJB and TPM:Ensure that PSJB and TPM units fixing holes are matching with supporting clamps",
    "12.4" => "Cable connections:Ensure that cable connections are given at the corresponding location with respect to labels provided.",
    "12.5" => "Cable routing:Ensure that cables are routed properly without hanging on ground and tied properly with cable ties.",
    "12.6" => "Ensure SIFA Valve is installed with mounting frame under DBC panel in CAB-1 side(NOTE: Ensure that SIFA VALVE SHOULD BE CLOSED CONDITION WHILE INSTALLATION)",
    "12.7" => "Ensure that mounting location of the SIFA valve should be easy for operations and maintenance",
    "12.8" => "Ensure SIFA valve manifold should be fixed to mounting frame by using hardware provided along with the installation Kit.",
    "12.9" => "Welding: Ensure that welded portion should be neat and clean. Check that there is no welding gaps and cracks.",
    "13.1" => "Check the Pneumatic connections are as per the connectivity diagram.",
    "13.2" => "Verify ball value installation on BP(3/4\") and MR (3/8\") pipes, and confirm Loctite 567 is used at every connection.",
    "13.3" => "Ensure BC pressure transducer reads 7 bar, BP is at 5 bar, and MR is at 16 bar.",
    "13.4" => "Check that all pipe joints are properly connected to the LPSR (MUB-2 and MUB-3).",
    "13.5" => "Check that the BP line is connected to the QRV (Quick Release Valve).",
    "13.6" => "Check if the ball valve electrical terminations are properly connected.",
    "14.1" => "PG1 and PG2 Installation:Ensure that PG1(Left from LP of CAB1) and PG2 (Right from LP of CAB1) are installed on allotted axles (WAP5=wheel 2and3, WAP7=whee2and5) of locomotives on left and right side.",
    "14.2" => "Washer Insertion:Verify that M12 spring is correctly inserted in the drive pin.",
    "14.3" => "Drive Pin Fixing: Ensure drive pin length before installation as per Loco type,(loco type WAP7=60 mm, WAP5=76mm, EMU=90mm). Ensure the drive pin is securely fixed with LOCTITE 542. Verify that the torque applied is 76N·m using a calibrated torque wrench.",
    "14.4" => "Gasket Lock Plate Placement:Ensure the Gasket Lock Plate is correctly positioned on the axle cover without any misalignment.",
    "14.5" => "PG Coupler Ring Placement: Verify that PG coupler ring is positioned correctly on the gasket. Ensure that the label (PG1 / PG2) is clearly visible at the top end.",
    "14.6" => "Coupler Ring Alignment:Confirm that the selected PG (PG1 / PG2) determines the alignment of four out of eight holes with the axle cover.",
    "14.7" => "Coupler Ring Fixing: Ensure the CSK Hex Socket screws size M10×30mm-SS are used to fix the coupler ring with LOCTITE 542. Check that screws are tightened to the specified torque of 40 N.m using a calibrated torque wrench.(Note: Bolthead surface should be flush.)",
    "14.8" => "Gasket PG Placement:Verify that \"Gasket PG\" is correctly placed on the coupler ring without any gaps or misalignment.",
    "14.9" => "PG1 / PG2 Insertion: Ensure PG1 / PG2 is inserted correctly into the axle cover. Confirm that driving fork is aligned with the drive pin before proceeding.",
    "14.10" => "PG Alignment:Ensure that all eight holes on PG align perfectly with holes on the gasket and coupler ring.",
    "14.11" => "PG Fixing with M8 Bolts: Check that the M8×25mm bolts are properly installed with LOCTITE 542. Ensure both spring and plain washers are used.",
    "14.12" => "M8 Bolt Torque Check:Verify that all M8 bolts are tightened to 25 N.m using a calibrated torque wrench.Marking with green/yellow paint.",
    "14.13" => "Final Position Check:Ensure that the final installed positions of PG1 and PG2 match the specified locations.",
    "14.14" => "Cable routing:Ensure that PG cables routing made properly with metal clamps / cable ties",
    "14.15" => "Speedometer Boxes fixing: Is each Speedometer Interface Unit mounted on the locomotive chassis near its corresponding Pulse Generator?",
    "14.15.1" => "Speedometer Boxes fixing: Is the Speedometer Interface Unit orientation such that cables connect to the Pulse Generator on one side and the Loco Kavach Unit on the other side without crisscrossing?",
    "14.15.2" => "Speedometer Boxes fixing: Speedometer holes and fixing clamp holes are to be matched evenly. Verify the M6 bolts torque 10 N-M.Marking with green/Yellow paint",
    "14.16" => "Welding of supporting clamps:Ensure that speedometer supporting clamps are welded without any gaps and cracks.",
    "14.17" => "Speedometer Cables:Ensure that cables from PG to Speedometers and from speedometer units to Loco Kavach unit are connected properly.",
    "14.18" => "Pulse Generator & Speedometer Interface Unit Connection: Is PG1 connected to the Speedometer Interface Unit with Part No.6000052976?",
    "14.18.1" => "Pulse Generator and Speedometer Interface Unit Connection: Is PG2 connected to the Speedometer Interface Unit with Part No.6000052977?",
    "14.19" => "Is each Speedometer Interface Unit correctly connected to the Loco Kavach Unit?",
    "14.20" => "Cable routing:Ensure that external cables are routed to their respective speedometer units",
    "14.21" => "Connector locking :Ensure that the external cable circular connectors are properly locked with speedometer box unit receptacles.",
    "15.1" => "Is each RFID reader installed at a distance of 1 to 3 meters from the end of cattle guard?",
    "15.2" => "Welding quality:Ensure Stud welding/Arc Welding is done properly, such that the RFID Reader can be withstand for loco vibrations during running and Carried out DPT Test.",
    "15.2.1" => "Welding quality: Has Ballata been placed between the RFID bracket and Loco chassis frame,M12 bolts tightened with Nylock nuts,torque verified at 20 N-m, and cotter pin inserted into the stud hole?",
    "15.3" => "Channels tightness:Verify the tightness for channels fixing screws (M8X16mm) by using torque wrench (25N-M).marking with green/yellow pain",
    "15.4" => "Has the bottom surface of the RFID reader been adjusted and fixed at a height of 400 ± 50 mm from the rail head?",
    "15.5" => "Is one end of the Chain/Sling welded to locomotive chassis, away from the mounting bracket weld joint?",
    "15.5.1" => "Is other end of the Chain/Sling securely fastened to RFID reader by using bolt provided in the Loco Kavach Installation Kit?",
    "15.6" => "Is mud guard (from the Loco Kavach Installation Kit) been fixed to RFID reader mounting bracket,installed in front of each RFID reader on the cattle guard side, using the supplied bolts and washers?",
    "15.7" => "Cable trench:Verify that RFID reader cables are routed properly through the loco trench without any overlaps and over-stress. Ensure that cable should not have any sharp bends in routing and mill connectors without any damage while routing.",
    "15.8" => "Connector connectivity:Ensure that MIL connectors connectivity as per the connectivity drawing.",
    "15.9" => "RFID -1 connectivity:Ensure that RFID Reader-1 is connected to MC6 at Loco Kavach.",
    "15.10" => "RFID -2 connectivity:Ensure that RFID Reader-2 is connected to MC7 at Loco Kavach.",
    "15.11" => "Circular connectors:Ensure that the circular connectors are properly locked with RFID box unit receptacles.",
    "16.1" => "Pneumatic fittings:Confirm that all pipes and fittings used in the assembly are from the approved BOM and sourced from the IandC kit supplied by the factory.",
    "16.2" => "Copper Pipes: Confirm that copper pipes are bent using appropriate bending tool, and that there no kinks or sharp bends in the pipe.",
    "16.3" => "Copper Tube :Ensure that copper tube length is measured with respect to the connectivity from loco pneumatics MR to ON/OFF Ball Cock, Solenoid Valve to HT Horn MR Pipe arrangements, as per approved drawing for WAP5, WAP7, WAG9, WAG7 and WAP4. This pneumatic arrangement is not required for Diesele locos.",
    "16.4" => "Copper pipe connections:Ensure that copper pipe connections made properly with approved make (Ex. Fluid Control) ferrules and TEE-joints used.",
    "16.5" => "Auto Horn Solenoid valve connections(Red +ve) to be connected at terminal1 and (Black -ve) to be connected at terminal2. This cable part of CAB I/P wiring of TB21 (Red +ve) & TB22 (Black -ve). This cable part of CAB I/P wiring of TB21 (Red +ve) & TB22 (Black -ve).",
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