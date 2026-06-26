
let unsavedChanges = false;
const rowImages = new Map(); // Store images for each row

// Delegated event listener: if an <input>, <select>, or <textarea> changes anywhere
// in the document, set unsavedChanges=true. You could refine the selector if needed.
document.addEventListener("change", function (event) {
  // Only if the target is an input, select, or textarea:
  if (event.target.matches("input, select, textarea")) {
    unsavedChanges = true;
  }
});

// A variable to store loco info from session or none
let locoID = "";
let locoType = [];
let brakeType = [];
let railwayDivision = "";
let shedName = "";
let inspectionDate = "";

var data = [];

// ----------------------------------------------------------------------------
// showSection() is your main function that loads HTML content by 'section' key
// We will add the logic to confirm unsaved changes here.
// Remove the code that toggles 'active' inside document.addEventListener("DOMContentLoaded", ...)
// You can still do something like add a 'hover' style in CSS, but don't modify 'active' here.
document.addEventListener("DOMContentLoaded", function () {
  // No need to toggle .active in the click events.
  // Instead, rely on showSection to do it conditionally.
});

// In showSection, decide if it's okay to switch sections, and if so, highlight the new button.
async function showSection(section) {
  // 1) If user tries to navigate away with unsaved changes, confirm
  if (unsavedChanges) {
    const proceed = confirm("You have unsaved changes in this section. Do you want to continue?");
    if (!proceed) {
      // The user canceled -> do not change sections and do NOT highlight new button
      return;
    } else {
      // The user chose to continue -> discard unsaved changes
      unsavedChanges = false;
    }
  }

  

  // 2) Now it's safe to switch sections AND highlight the new button
  const buttons = document.querySelectorAll(".sidebar .button");
  buttons.forEach(btn => btn.classList.remove("active")); // remove from all

  // 3) Find the clicked button that triggered showSection('X') by matching the 'section' somehow
  // For example, if each button's onclick calls showSection with a unique section ID, you can
  // compare that ID to something stored in a data attribute:
  const newActiveBtn = [...buttons].find(btn => {
    // If your button code is `onclick="showSection('1_0')"`,
    // you might store data-section="1_0" or parse the onclick attribute.
    return btn.getAttribute('onclick') === `showSection('${section}')`;
  });

  if (newActiveBtn) {
    newActiveBtn.classList.add("active");
  }

  // 4) Finally, do the rest of your code that actually loads the new section's content
  console.log("Showing section:", section);
  // ... your logic to fetch or display that section's data ...


  console.log(new Date().toISOString(), "Intiali timing of section: ",section);

  const mainContent = document.getElementById("main-content");
  const currentDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  //const locoInfo = JSON.parse(sessionStorage.getItem("locoInfo")); // Get saved loco info
  //const locoInfo = JSON.parse(localStorage.getItem("locoDetails") || "{}");

  // console.log("locoInfo is:", locoInfo);
  // First, try to get loco info from sessionStorage (for a fresh page)
  const storedLocal = localStorage.getItem("locoDetails");
  const storedSession = sessionStorage.getItem("locoInfo");

  let locoInfo = {};
  if (storedLocal) {
    // If localStorage has data, use it (edit mode)
    locoInfo = JSON.parse(storedLocal);
  } else if (storedSession) {
    // Otherwise, if sessionStorage is present, use that (fresh page)
    locoInfo = JSON.parse(storedSession);
  } else {
    // Otherwise, nothing is set → use empty defaults
    locoInfo = {
      locoID: "",
      locoType: "",
      brakeType: "",
      railwayDivision: "",
      shedName: "",
      inspectionDate: ""
    };
  }

  

  
  // Get current loco details to check if observations exist
  const locoId = document.getElementById("loco-id")?.value;
  const shedName = document.getElementById("shed-name")?.value;
  const railwayDivision = document.getElementById("railway-division")?.value;

  // Check if observations exist for this section
  const exists = await checkExistingObservations(locoId, shedName, railwayDivision, section);
  
  // Set button visibility based on whether observations exist
  setTimeout(() => {
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
      const saveBtn = actionButtons.querySelector('#save-btn');
      const getDetailsBtn = actionButtons.querySelector('#get-details-btn');
      const updateBtn = actionButtons.querySelector('#update-btn');
      
      if (exists) {
        // If observations exist, show Get Details button and hide Save button
        if (saveBtn) saveBtn.style.display = 'none';
        if (getDetailsBtn) getDetailsBtn.style.display = 'inline-block';
        if (updateBtn) updateBtn.style.display = 'none';
      } else {
        // If no observations exist, show Save button and hide others
        if (saveBtn) saveBtn.style.display = 'inline-block';
        if (getDetailsBtn) getDetailsBtn.style.display = 'none';
        if (updateBtn) updateBtn.style.display = 'none';
      }
    }
  }, 100); // Small delay to ensure DOM is updated




  // Now wherever you insert your form fields:
  // e.g. if you have an input with id="loco-id", do:
  const locoIdElem = document.getElementById("loco-id");
  if (locoIdElem) {
    // Use locoInfo.locoID OR a fallback empty string
    locoIdElem.value = locoInfo.locoID || "";
  }

  // And similarly for the other fields:
  const locoTypeElem = document.getElementById("loco-type");
  if (locoTypeElem) {
    locoTypeElem.value = locoInfo.locoType || "";
  }

  const brakeTypeElem = document.getElementById("brake-type");
  if (brakeTypeElem) {
    brakeTypeElem.value = locoInfo.brakeType || "";
  }

  const divisionElem = document.getElementById("railway-division");
  if (divisionElem) {
    divisionElem.value = locoInfo.railwayDivision || "";
  }

  const shedElem = document.getElementById("shed-name");
  if (shedElem) {
    shedElem.value = locoInfo.shedName || "";
  }

  const dateElem = document.getElementById("date");
  if (dateElem) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    dateElem.value = `${year}-${month}-${day}`;
  }
  // HTML Content
  const locoDetailsHTML = `
    <div id="form-container">
      <section>
        <form id="locoForm" action="connect.php" method="POST">
          <table class="detail-box loco-table">
            <tr>
              <td id = "locoid"><strong>Loco ID:</strong><input type="text" id="loco-id" placeholder="Enter the Loco ID" value="${locoInfo ? locoInfo.locoID : ""
    }"></td>
              <div class="loco-type-options">
              <td><strong>Loco Type:</strong>
                <select id="loco-type" name="loco-type">
      <option value="" disabled selected>Select</option>
                     
      <option value="WAP-7" ${locoInfo && locoInfo.locoType === "WAP-7" ? "selected" : ""}>WAP-7</option>
      <option value="WAP-5" ${locoInfo && locoInfo.locoType === "WAP-5" ? "selected" : ""}>WAP-5</option>
      <option value="WAP-9" ${locoInfo && locoInfo.locoType === "WAP-9" ? "selected" : ""}>WAP-9</option>
      <option value="WAP-4" ${locoInfo && locoInfo.locoType === "WAP-4" ? "selected" : ""}>WAP-4</option>
      <option value="WAG-7" ${locoInfo && locoInfo.locoType === "WAG-7" ? "selected" : ""}>WAG-7</option>
      <option value="WAG-9" ${locoInfo && locoInfo.locoType === "WAG-9" ? "selected" : ""}>WAG-9</option>
      <option value="WAG-9I" ${locoInfo && locoInfo.locoType === "WAG-9I" ? "selected" : ""}>WAG-9I</option>
      <option value="WAG-9H" ${locoInfo && locoInfo.locoType === "WAG-9H" ? "selected" : ""}>WAG-9H</option>
      <option value="WAG-9HC" ${locoInfo && locoInfo.locoType === "WAG-9HC" ? "selected" : ""}>WAG-9HC</option>
      <option value="WAG-10HC" ${locoInfo && locoInfo.locoType === "WAG-10HC" ? "selected" : ""}>WAG-10HC</option>
      <option value="WDG" ${locoInfo && locoInfo.locoType === "WDG" ? "selected" : ""}>WDG</option>
      <option value="WDG-2" ${locoInfo && locoInfo.locoType === "WDG-2" ? "selected" : ""}>WDG-2</option>
      <option value="WDG-3" ${locoInfo && locoInfo.locoType === "WDG-3" ? "selected" : ""}>WDG-3</option>
      <option value="WDG-3A" ${locoInfo && locoInfo.locoType === "WDG-3A" ? "selected" : ""}>WDG-3A</option>
      <option value="WDM" ${locoInfo && locoInfo.locoType === "WDM" ? "selected" : ""}>WDM</option>
      <option value="WDM-3" ${locoInfo && locoInfo.locoType === "WDM-3" ? "selected" : ""}>WDM-3</option>
    
                </select>
                </div>
              </td>
             <td>
               <strong>Brake Type:</strong>
               <select name="brake-type" id="brake-type">
                  <option value="" disabled selected>Select</option>
                  <option value="E-70" ${locoInfo && locoInfo.brakeType === "E-70" ? "selected" : ""
    }>E-70</option>
                  <option value="CCB" ${locoInfo && locoInfo.brakeType === "CCB" ? "selected" : ""
    }>CCB</option>
                  <option value="IRAB" ${locoInfo && locoInfo.brakeType === "IRAB" ? "selected" : ""
    }>IRAB</option>
                  <option value="RCCB" ${locoInfo && locoInfo.brakeType === "RCCB" ? "selected" : ""  
    }>RCCB</option>
                  <option value="ESCORT" ${locoInfo && locoInfo.brakeType === "ESCORT" ? "selected" : ""
    }>ESCORT</option>
               </select>
             </td>
             <td>
                <strong>Railway Division:</strong>
                <select id="railway-division" onchange="updateShedNames()">
                    <option value="" disabled selected>Select</option>
                    <option value="CR" ${locoInfo && locoInfo.railwayDivision === "CR"
      ? "selected"
      : ""
    }>CR</option>
                    <option value="ER"  ${locoInfo && locoInfo.railwayDivision === "ER"
      ? "selected"
      : ""
    }>ER</option>
                    <option value="NFR"  ${locoInfo && locoInfo.railwayDivision === "NFR"
      ? "selected"
      : ""
    }>NFR</option>
                    <option value="SER"  ${locoInfo && locoInfo.railwayDivision === "SER"
      ? "selected"
      : ""
    }>SER</option>
                    <option value="ECR"  ${locoInfo && locoInfo.railwayDivision === "ECR"
      ? "selected"
      : ""
    }>ECR</option>
                    <option value="NR"  ${locoInfo && locoInfo.railwayDivision === "NR"
      ? "selected"
      : ""
    }>NR</option>
                    <option value="NCR"  ${locoInfo && locoInfo.railwayDivision === "NCR"
      ? "selected"
      : ""
    }>NCR</option>
                    <option value="WCR"  ${locoInfo && locoInfo.railwayDivision === "WCR"
      ? "selected"
      : ""
    }>WCR</option>
                </select>
            </td>
            
            <td>
              <strong>Shed Name:</strong>
              <select id="shed-name">
                <option value="" disabled selected>Select</option>
                
                <!-- For CR Division -->
                <option value="Bhusaval(BSLL)" data-division="CR" ${locoInfo && locoInfo.shedName === "Bhusaval(BSLL)"
      ? "selected"
      : ""
    }>Bhusaval(BSLL)</option>
                <option value="Kalyan(KYNE)" data-division="CR" ${locoInfo && locoInfo.shedName === "Kalyan(KYNE)"
      ? "selected"
      : ""
    }>Kalyan(KYNE)</option>

                <!-- For ER Division -->
               <!-- For ER Division -->
<option value="Asansol(ASNL)" data-division="ER" ${locoInfo && locoInfo.shedName === "Asansol(ASNL)" ? "selected" : ""}>Asansol(ASNL)</option>
<option value="Howrah(HWHE)" data-division="ER" ${locoInfo && locoInfo.shedName === "Howrah(HWHE)" ? "selected" : ""}>Howrah(HWHE)</option>
<option value="Howrah(HWHD)" data-division="ER" ${locoInfo && locoInfo.shedName === "Howrah(HWHD)" ? "selected" : ""}>Howrah(HWHD)</option>
<option value="jamalpur(JMPD)" data-division="ER" ${locoInfo && locoInfo.shedName === "jamalpur(JMPD)" ? "selected" : ""}>jamalpur(JMPD)</option>
<option value="Barddhaman(BWNX)" data-division="ER" ${locoInfo && locoInfo.shedName === "Barddhaman(BWNX)" ? "selected" : ""}>Barddhaman(BWNX)</option>
<option value="CLW-Dankuni" data-division="ER" ${locoInfo && locoInfo.shedName === "CLW-Dankuni" ? "selected" : ""}>CLW-Dankuni</option>


                <!-- For NFR Division -->
                <option value="Malda(MLDD)" data-division="NFR" ${locoInfo && locoInfo.shedName === "Malda(MLDD)"
      ? "selected"
      : ""
    }>Malda(MLDD)</option>

                <!-- For SER Division -->
                <option value="Tatanagar(TATE)" data-division="SER" ${locoInfo && locoInfo.shedName === "Tatanagar(TATE)"
      ? "selected"
      : ""
    }>Tatanagar(TATE)</option>

                <!-- For ECR Division -->
                <option value="Deen Dayal Upadhyay(DDUE)" data-division="ECR" ${locoInfo && locoInfo.shedName === "Deen Dayal Upadhyay(DDUE)"
      ? "selected"
      : ""
    }>Deen Dayal Upadhyay(DDUE)</option>
                <option value="Gomoh(GMOE)" data-division="ECR" ${locoInfo && locoInfo.shedName === "Gomoh(GMOE)"
      ? "selected"
      : ""
    }>Gomoh(GMOE)</option>
                <option value="Deen Dayal Upadhyay(DDUX)" data-division="ECR" ${locoInfo && locoInfo.shedName === "Deen Dayal Upadhyay(DDUX)"
      ? "selected"
      : ""
    }>Deen Dayal Upadhyay(DDUX)</option>
                <option value="Patratu(PTRX)" data-division="ECR" ${locoInfo && locoInfo.shedName === "Patratu(PTRX)"
      ? "selected"
      : ""
    }>Patratu(PTRX)</option>

                <!-- For NR Division -->
                <option value="Ludhiana(LDHE)" data-division="NR" ${locoInfo && locoInfo.shedName === "Ludhiana(LDHE)"
      ? "selected"
      : ""
    }>Ludhiana(LDHE)</option>
                <option value="Lucknow(AMVD)" data-division="NR" ${locoInfo && locoInfo.shedName === "Lucknow(AMVD)"
      ? "selected"
      : ""
    }>Lucknow(AMVD)</option>

                <!-- For NCR Division -->
                <option value="Jhansi(JHSE)" data-division="NCR" ${locoInfo && locoInfo.shedName === "Jhansi(JHSE)"
      ? "selected"
      : ""
    }>Jhansi(JHSE)</option>
                <option value="Jhansi(JHSD)" data-division="NCR" ${locoInfo && locoInfo.shedName === "Jhansi(JHSD)"
      ? "selected"
      : ""
    }>Jhansi(JHSD)</option>

                <!-- For WCR Division -->
                <option value="Itarsi(ETE)" data-division="WCR" ${locoInfo && locoInfo.shedName === "Itarsi(ETE)"
      ? "selected"
      : ""
    }>Itarsi(ETE)</option>
                <option value="Tuglakabad(TKDE)" data-division="WCR" ${locoInfo && locoInfo.shedName === "Tuglakabad(TKDE)"
      ? "selected"
      : ""
    }>Tuglakabad(TKDE)</option>
              </select>
            </td>
                        
            <td><strong>Inspection Date:</strong><input type="date" id="date" style="font-family: inherit; font-size: inherit; color: inherit; border: 1px solid #ccc; padding: 5px 10px;" /></td>

          </tr>
          </table>
        </form>
      </section>
    </div>
  `;

  // Insert static loco details
  mainContent.innerHTML = locoDetailsHTML;

  setTimeout(() => {
    const dateInput = document.getElementById("date");
    if (dateInput) {
      let dateValue =
        locoInfo && locoInfo.inspectionDate
          ? new Date(locoInfo.inspectionDate)
          : new Date(currentDate);

      // Format the date as yyyy-MM-dd for the input field
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, "0");
      const day = String(dateValue.getDate()).padStart(2, "0");

      const formattedDateForInput = `${year}-${month}-${day}`;

      // Set the formatted date to the input field
      dateInput.value = formattedDateForInput;

      // Optionally, log the date in dd-MM-yyyy format
      const formattedDateForDisplay = `${day}-${month}-${year}`;
      
    } else {
      console.error('Input with id="date" not found.');
    }
  }, 0);


  // Dynamically load content based on the section clicked
  if (section === "0.0") {
    let saveBtnDisplay = "inline-block";
    let getDetailsBtnDisplay = "none";
    
    // Check if we came from the Edit button in viewReports.php
    const urlParams = new URLSearchParams(window.location.search);
    const locoIdFromUrl = urlParams.get('loco_id');
    
    // If we came from the Edit button, show Get Details and hide Save
    if (locoIdFromUrl) {
      saveBtnDisplay = "none";
      getDetailsBtnDisplay = "inline-block";
    }
    mainContent.innerHTML += `
      <div class="actio-buttons">
         <button
          id="save-loco-info-btn"
          type="button"
          onclick="saveLocoInfo('loco-info')"
          style="display:${saveBtnDisplay};"
        >
          Save Loco Info
        </button>
        <button
          id="get-details-btn"
          data-section="0.0"
          onclick="getDetails()"
          style="display:${getDetailsBtnDisplay};"
        >
          Get Details
        </button>
        
      </div>
    `;
  }else if (section === "1_0") {
    // For section 1_0
    mainContent.innerHTML += `
      <h3 class="document-heading"><b>Document verification:</b> Verify availability of the following documents:</h3>
      <div id="section-1_0">
        <table class="observations" id="observations-section-1_0">
          <thead>
            <tr>
              <th>S_No</th>
              <th>Description</th>
              <th>Observation</th>
              <th>Remarks/Comments</th> 
            </tr>
          </thead>
          <tbody id="observations-tbody-1_0">
            <!-- Row 1 -->
            <tr id="row-1">
              <td>1.1</td>
              <td class="observation_text">Annexure of IC (Inspection Certificate) issued by RDSO.</td>
              <td class="select">
                <select id="status-dropdown" onchange="highlightSelect(this)">
                  <option value="Select">Select</option>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </td>
              <td class="remarks">
                <textarea placeholder="Add comments here if NOT OK..." rows="2" cols="20"></textarea><br>
              </td>
            </tr>
             <tr id="row-2">
      <td>1.2</td>
      <td class="observation_text">Loco Allocation Letter</td>
      <td>
        <select id="status-dropdown" onchange="highlightSelect(this)">
                  <option value="Select">Select</option>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>

      </td>
      <td class ="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      

            </tr>
          </tbody>
        </table>
      </div>
  
      <div class="action-buttons">
    <!-- Update Button: Hidden by default -->
    <button type="button" 
            id="update-btn" 
            style="background-color: blue; color: white; display: none;" 
            onclick="updateObservation('1_0')">
      Update
    </button>

    <!-- Save Button: Visible by default -->
    <button type="button" 
            id="save-btn" 
            style="display: inline-block;" 
            onclick="saveObservation('1_0')">
      Save
    </button>

    <!-- Get Details Button: Visible by default -->
    <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>`;

  } else if (section === "2.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading">Equipment serial number verification:</h3>
      <div class="table-container">
      <table class="observations" id="observations-section-2_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="observations-tbody-2_0">
        <tr id="row-4">
        <td>2.1</td>
      <td class="observation_text">Ensure presence of Hologram and S/R Stamp on each equipment</td>
      <td>
        <select id="status-dropdown" onchange="highlightSelect(this)">
           <option value="Select">Select</option>
           <option value="Present">Present</option>
           <option value="Not Present">Not Present</option>
        </select>
      </td>
      <td class ="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td style="padding-right: 10px;">
    <button class="add-image" onclick="showUploadOptions(4)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Add Image</button>
    <div class="upload-options" id="upload-options-4" style="display: none;">
      <button class="add-image" onclick="startCamera(4)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Camera</button>
      <label for="file-input-4" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
      <input type="file" id="file-input-4" accept="image/*" multiple onchange="displayImages(this, 4)" style="display: none;">
    </div>
      <!-- Container for multiple images --> 
      <div id="image-container-4"></div>
      <!-- Camera Container -->
    <div id="camera-container-4" style="display: none;">
      <video id="camera-4" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(4)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Capture Image</button>
      <button class="add-image" onclick="stopCamera(4)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(4)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">🔄 Switch Camera</button>
      <canvas id="canvas-4" style="display: none;"></canvas>
    </div>
  </td>

    </tr>

    <tr id="row-5">
  <td>2.2</td>
  <td class="observation_text" style="padding-right: 10px;">
    Loco KAVACH Main Unit:
  <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
    oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "/>
  </td>
  

  
  <td class="select" style="padding-right: 10px;">
    <select id="status-dropdown" onchange="highlightSelect(this)" style="width: 180px; padding: 5px; font-size: 14px;">
      <option value="Select">Select</option>
      <option value="Matching">Matching</option>
      <option value="Not Matching">Not Matching</option>
      <option value="Not Installed">Not Installed</option>
    </select>
  </td>
  
  <td class="remarks" style="padding-right: 10px;">
    <textarea placeholder="Verify with IC" rows="2" cols="20" style="width: 180px; padding: 5px; font-size: 14px;"></textarea><br>
  </td>
  
  <td style="padding-right: 10px;">
    <button class="add-image" onclick="showUploadOptions(5)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Add Image</button>
    <div class="upload-options" id="upload-options-5" style="display: none;">
      <button class="add-image" onclick="startCamera(5)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Camera</button>
      <label for="file-input-5" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
      <input type="file" id="file-input-5" accept="image/*" multiple onchange="displayImages(this, 5)" style="display: none;">
    </div>
      <!-- Container for multiple images --> 
      <div id="image-container-5"></div>
      <!-- Camera Container -->
    <div id="camera-container-5" style="display: none;">
      <video id="camera-5" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(5)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Capture Image</button>
      <button class="add-image" onclick="stopCamera(5)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(5)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">🔄 Switch Camera</button>
      <canvas id="canvas-5" style="display: none;"></canvas>
    </div>
  </td>
</tr>
<tr id="row-6">
  <td>2.3</td>
  <td class="observation_text" style="padding-right: 10px;">
    Relay Interface Box:
    <input 
      type="text" 
      id="kavach-main-unit" 
      name="barcode_kavach_main_unit" 
      pattern="^\d{10,15}$" 
      title="Enter a number between 10 to 15 digits" 
      placeholder="Scan Barcode" 
      style="width:180px; padding:5px; font-size:14px;" 
      oninput="
        if (this.value.length > 15) this.value = this.value.slice(-15);
        toggleNotInstalledOption(this);
      "
    >
  </td>
  <td class="select" style="padding-right: 10px;">
    <select id="status-dropdown" onchange="highlightSelect(this)" style="width: 180px; padding: 5px; font-size: 14px;">
      <option value="Select">Select</option>
      <option value="Matching">Matching</option>
      <option value="Not Matching">Not Matching</option>
      <option value="Not Installed">Not Installed</option>
    </select>
  </td>
  
  <td class="remarks" style="padding-right: 10px;">
    <textarea placeholder="Verify with IC" rows="2" cols="20" style="width: 180px; padding: 5px; font-size: 14px;"></textarea><br>
  </td>
  
  <td style="padding-right: 10px;">
    <button class="add-image" onclick="showUploadOptions(6)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Add Image</button>
    <div class="upload-options" id="upload-options-6" style="display: none;">
      <button class="add-image" onclick="startCamera(6)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Camera</button>
      <label for="file-input-6" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
      <input type="file" id="file-input-6" accept="image/*" multiple onchange="displayImages(this, 6)" style="display: none;">
   </div>
      <!-- Container for multiple images --> 
      <div id="image-container-6"></div>
      <!-- Camera Container -->
    <div id="camera-container-6" style="display: none;">
      <video id="camera-6" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(6)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Capture Image</button>
      <button class="add-image" onclick="stopCamera(6)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(6)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">🔄 Switch Camera</button>
      <canvas id="canvas-6" style="display: none;"></canvas>
    </div>
  </td>
</tr>
<tr id="row-7">
  <td>2.4</td>
  <td class="observation_text">
    Cab Input Box: 
    <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
  <td class="select">
    <select id="status-dropdown" onchange="highlightSelect(this)" style="width: 180px; padding: 5px; font-size: 14px; margin-bottom: 10px;">
      <option value="Select">Select</option>
      <option value="Matching">Matching</option>
      <option value="Not Matching">Not Matching</option>
      <option value="Not Installed">Not Installed</option>
    </select>
  </td>
  <td class="remarks">
    <textarea placeholder="Verify with IC" rows="2" cols="20" style="width: 180px; height: 50px; padding: 5px; font-size: 14px; margin-bottom: 10px;"></textarea><br>
  </td>
 <td style="padding-right: 10px;">
    <button class="add-image" onclick="showUploadOptions(7)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Add Image</button>
    <div class="upload-options" id="upload-options-7" style="display: none;">
      <button class="add-image" onclick="startCamera(7)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Camera</button>
      <label for="file-input-7" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
      <input type="file" id="file-input-7" accept="image/*" multiple onchange="displayImages(this, 7)" style="display: none;">
   </div>
      <!-- Container for multiple images --> 
      <div id="image-container-7"></div>
      <!-- Camera Container -->
    <div id="camera-container-7" style="display: none;">
      <video id="camera-7" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(7)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Capture Image</button>
      <button class="add-image" onclick="stopCamera(7)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(7)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">🔄 Switch Camera</button>
      <canvas id="canvas-7" style="display: none;"></canvas>
    </div>
  </td>
</tr>
<tr id="row-8">
  <td>2.5</td>
   <td class="observation_text">
    RFID Reader 1: <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
   oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
  
  </td>
  <td class="select">
    <select id="status-dropdown" onchange="highlightSelect(this)" style="width: 180px; padding: 5px; font-size: 14px; margin-bottom: 10px;">
      <option value="Select">Select</option>
      <option value="Matching">Matching</option>
      <option value="Not Matching">Not Matching</option>
      <option value="Not Installed">Not Installed</option>
    </select>
  </td>
  <td class="remarks">
    <textarea placeholder="Verify with IC" rows="2" cols="20" style="width: 180px; height: 50px; padding: 5px; font-size: 14px; margin-bottom: 10px;"></textarea><br>
  </td>
  <td style="padding-right: 10px;">
    <button class="add-image" onclick="showUploadOptions(8)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Add Image</button>
    <div class="upload-options" id="upload-options-8" style="display: none;">
      <button class="add-image" onclick="startCamera(8)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Camera</button>
      <label for="file-input-8" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
      <input type="file" id="file-input-8" accept="image/*" multiple onchange="displayImages(this, 8)" style="display: none;">
   </div>
      <!-- Container for multiple images --> 
      <div id="image-container-8"></div>
      <!-- Camera Container -->
    <div id="camera-container-8" style="display: none;">
      <video id="camera-8" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(8)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Capture Image</button>
      <button class="add-image" onclick="stopCamera(8)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(8)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">🔄 Switch Camera</button>
      <canvas id="canvas-8" style="display: none;"></canvas>
    </div>
  </td>
</tr>

<tr id="row-9">
  <td>2.6</td>
   <td class="observation_text">
    RFID Reader 2: <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
  </td>
  
  <td class="select">
    <select id="status-dropdown" onchange="highlightSelect(this)" style="width: 180px; padding: 5px; font-size: 14px; margin-bottom: 10px;">
      <option value="Select">Select</option>
      <option value="Matching">Matching</option>
      <option value="Not Matching">Not Matching</option>
      <option value="Not Installed">Not Installed</option>
    </select>
  </td>
  <td class="remarks">
    <textarea placeholder="Verify with IC" rows="2" cols="20" style="width: 180px; height: 50px; padding: 5px; font-size: 14px; margin-bottom: 10px;"></textarea><br>
  </td>
  <td style="padding-right: 10px;">
    <button class="add-image" onclick="showUploadOptions(9)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Add Image</button>
    <div class="upload-options" id="upload-options-9" style="display: none;">
      <button class="add-image" onclick="startCamera(9)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Camera</button>
      <label for="file-input-9" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
      <input type="file" id="file-input-9" accept="image/*" multiple onchange="displayImages(this, 9)" style="display: none;">
    </div>
      <!-- Container for multiple images --> 
      <div id="image-container-9"></div>
      <!-- Camera Container -->
    <div id="camera-container-9" style="display: none;">
      <video id="camera-9" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(9)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Capture Image</button>
      <button class="add-image" onclick="stopCamera(9)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(9)" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">🔄 Switch Camera</button>
      <canvas id="canvas-9" style="display: none;"></canvas>
    </div>
  </td>
</tr>
<tr id="row-10">
  <td>2.7</td>
  <td class="observation_text">
     LPOCIP (DMI) 1: <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
  </td>
  <td class="select">
    <select id="status-dropdown" onchange="highlightSelect(this)">
      <option value="Select">Select</option>
      <option value="Matching">Matching</option>
      <option value="Not Matching">Not Matching</option>
      <option value="Not Installed">Not Installed</option>
    </select>
  </td>
  <td class="remarks">
    <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
  </td>
  <td>
    <button class="add-image" onclick="showUploadOptions(10)">Add Image</button>
    <div class="upload-options" id="upload-options-10" style="display: none;">
      <button class="add-image" onclick="startCamera(10)">Camera</button>
      <label for="file-input-10" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
      <input type="file" id="file-input-10" accept="image/*" multiple onchange="displayImages(this, 10)">
   </div>
      <!-- Container for multiple images --> 
      <div id="image-container-10"></div>
      <!-- Camera Container -->
    <div id="camera-container-10" style="display: none;">
      <video id="camera-10" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(10)">Capture Image</button>
      <button class="add-image" onclick="stopCamera(10)">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(10)">🔄 Switch Camera</button>
      <canvas id="canvas-10" style="display: none;"></canvas>
    </div>
  </td>
</tr>

<tr id="row-11">
  <td>2.8</td>
  <td class="observation_text">
    LPOCIP (DMI) 2:<input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
  </td>
  <td class="select">
    <select id="status-dropdown" onchange="highlightSelect(this)">
      <option value="Select">Select</option>
      <option value="Matching">Matching</option>
      <option value="Not Matching">Not Matching</option>
      <option value="Not Installed">Not Installed</option>
    </select>
  </td>
  <td class="remarks">
    <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
  </td>
  <td>
    <button class="add-image" onclick="showUploadOptions(11)">Add Image</button>
    <div class="upload-options" id="upload-options-11" style="display: none;">
      <button class="add-image" onclick="startCamera(11)">Camera</button>
      <label for="file-input-11" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
      <input type="file" id="file-input-11" accept="image/*" multiple onchange="displayImages(this, 11)">
    </div>
      <!-- Container for multiple images --> 
      <div id="image-container-11"></div>
      <!-- Camera Container -->
    <div id="camera-container-11" style="display: none;">
      <video id="camera-11" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(11)">Capture Image</button>
      <button class="add-image" onclick="stopCamera(11)">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(11)">🔄 Switch Camera</button>
      <canvas id="canvas-11" style="display: none;"></canvas>
    </div>
  </td>
</tr>

<tr id="row-12">
  <td>2.9</td>
  <td class="observation_text">
   Speedometer 1: <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
  
  </td>
  <td class="select">
    <select id="status-dropdown" onchange="highlightSelect(this)">
      <option value="Select">Select</option>
      <option value="Matching">Matching</option>
      <option value="Not Matching">Not Matching</option>
      <option value="Not Installed">Not Installed</option>
    </select>
  </td>
  <td class="remarks">
    <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
  </td>
  <td>
    <button class="add-image" onclick="showUploadOptions(12)">Add Image</button>
    <div class="upload-options" id="upload-options-12" style="display: none;">
      <button class="add-image" onclick="startCamera(12)">Camera</button>
      <label for="file-input-12" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
      <input type="file" id="file-input-12" accept="image/*" multiple onchange="displayImages(this, 12)">
    </div>
      <!-- Container for multiple images --> 
      <div id="image-container-12"></div>
      <!-- Camera Container -->
    <div id="camera-container-12" style="display: none;">
      <video id="camera-12" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(12)">Capture Image</button>
      <button class="add-image" onclick="stopCamera(12)">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(12)">🔄 Switch Camera</button>
      <canvas id="canvas-12" style="display: none;"></canvas>
    </div>
  </td>
</tr>

          </tr>
          <tr id="row-13">
            <td>2.10</td>
           <td class="observation_text">Speedometer 2:
           <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
           
          </td>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
              <td>
       <button class="add-image" onclick="showUploadOptions(13)">Add Image</button>
<div class="upload-options" id="upload-options-13" style="display: none;">
  <button class="add-image" onclick="startCamera(13)">Camera</button>
  <label for="file-input-13" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
  <input type="file" id="file-input-13" accept="image/*" multiple onchange="displayImages(this, 13)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-13"></div>
      <!-- Camera Container -->
<div id="camera-container-13" style="display: none;">
  <video id="camera-13" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(13)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(13)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(13)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-13" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>

          </tr>
          <tr id="row-14">
            <td >2.11</td>
           <td class="observation_text"> GPS/GSM Antenna 1:
           <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
   oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/> 
          </td>

        
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
             <td>
       <button class="add-image" onclick="showUploadOptions(14)">Add Image</button>
<div class="upload-options" id="upload-options-14" style="display: none;">
  <button class="add-image" onclick="startCamera(14)">Camera</button>
  <label for="file-input-14" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
  <input type="file" id="file-input-14" accept="image/*" multiple onchange="displayImages(this, 14)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-14"></div>
      <!-- Camera Container -->
<div id="camera-container-14" style="display: none;">
  <video id="camera-14" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(14)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(14)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(14)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-14" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>


          </tr>
          <tr id="row-15">
            <td>2.12</td>
           <td class="observation_text"> GPS/GSM Antenna 2:
        <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>  

            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
          <td>
       <button class="add-image" onclick="showUploadOptions(15)">Add Image</button>
<div class="upload-options" id="upload-options-15" style="display: none;">
  <button class="add-image" onclick="startCamera(15)">Camera</button>
 <label for="file-input-15" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
  <input type="file" id="file-input-15" accept="image/*" multiple onchange="displayImages(this, 15)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-15"></div>
      <!-- Camera Container -->
<div id="camera-container-15" style="display: none;">
  <video id="camera-15" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(15)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(15)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(15)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-15" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>


          </tr>
          <tr id="row-16">
            <td>2.13</td>
           <td class="observation_text">
  UHF Radio Antenna 1:
  <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
  </div>
</td>

            <td class="select">
             <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
            <td>
       <button class="add-image" onclick="showUploadOptions(16)">Add Image</button>
<div class="upload-options" id="upload-options-16" style="display: none;">
  <button class="add-image" onclick="startCamera(16)">Camera</button>
  <label for="file-input-16" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
  <input type="file" id="file-input-16" accept="image/*" multiple onchange="displayImages(this, 16)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-16"></div>
      <!-- Camera Container -->
<div id="camera-container-16" style="display: none;">
  <video id="camera-16" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(16)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(16)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(16)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-16" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>


          </tr>
          <tr id="row-17">
            <td>2.14</td>
           <td class="observation_text">UHF Radio Antenna 2:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
   oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
            <td>
       <button class="add-image" onclick="showUploadOptions(17)">Add Image</button>
<div class="upload-options" id="upload-options-17" style="display: none;">
  <button class="add-image" onclick="startCamera(17)">Camera</button>
 <label for="file-input-17" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
  <input type="file" id="file-input-17" accept="image/*" multiple onchange="displayImages(this, 17)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-17"></div>
      <!-- Camera Container -->
<div id="camera-container-17" style="display: none;">
  <video id="camera-17" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(17)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(17)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(17)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-17" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>

          </tr>
          <tr id="row-18">
            <td>2.15</td>
           <td class="observation_text">UHF Radio Antenna 3:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(18)">Add Image</button>
<div class="upload-options" id="upload-options-18" style="display: none;">
  <button class="add-image" onclick="startCamera(18)">Camera</button>
<label for="file-input-18" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
  <input type="file" id="file-input-18" accept="image/*" onchange="displayImages(this, 18)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-18"></div>
      <!-- Camera Container -->
<div id="camera-container-18" style="display: none;">
  <video id="camera-18" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(18)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(18)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(18)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-18" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>


          </tr>
          <tr id="row-19">
            <td>2.16</td>
           <td class="observation_text">UHF Radio Antenna 4:
           <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(19)">Add Image</button>
<div class="upload-options" id="upload-options-19" style="display: none;">
  <button class="add-image" onclick="startCamera(19)">Camera</button>
  <label for="file-input-19" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
  <input type="file" id="file-input-19" accept="image/*" multiple onchange="displayImages(this, 19)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-19"></div>
      <!-- Camera Container -->
<div id="camera-container-19" style="display: none;">
  <video id="camera-19" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(19)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(19)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(19)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-19" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>

          </tr>
          <tr id="row-20">
            <td>2.17</td>
           <td class="observation_text">RFID PS 1:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
    oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
            <td>
       <button class="add-image" onclick="showUploadOptions(20)">Add Image</button>
<div class="upload-options" id="upload-options-20" style="display: none;">
  <button class="add-image" onclick="startCamera(20)">Camera</button>
 <label for="file-input-20" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
  <input type="file" id="file-input-20" accept="image/*" multiple onchange="displayImages(this, 20)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-20"></div>
      <!-- Camera Container -->
<div id="camera-container-20" style="display: none;">
  <video id="camera-20" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(20)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(20)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(20)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-20" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>


          </tr>
          <tr id="row-21">
            <td>2.18</td>
           <td class="observation_text">RFID PS 2:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
            <td>
       <button class="add-image" onclick="showUploadOptions(21)">Add Image</button>
<div class="upload-options" id="upload-options-21" style="display: none;">
  <button class="add-image" onclick="startCamera(21)">Camera</button>
 <label for="file-input-21" class="upload-label" style="cursor: pointer; padding: 5px 10px; font-size: 14px;">Upload from Device</label>
  <input type="file" id="file-input-21" accept="image/*" multiple onchange="displayImages(this, 21)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-21"></div>
      <!-- Camera Container -->
<div id="camera-container-21" style="display: none;">
  <video id="camera-21" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(21)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(21)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(21)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-21" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>

          </tr>

          <tr id="row-22">
            <td>2.19</td>
           <td class = "observation_text">Pulse Generator 1:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(22)">Add Image</button>
<div class="upload-options" id="upload-options-22" style="display: none;">
  <button class="add-image" onclick="startCamera(22)">Camera</button>
  <label for="file-input-22" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-22" accept="image/*" multiple onchange="displayImages(this, 22)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-22"></div>
      <!-- Camera Container -->
<div id="camera-container-22" style="display: none;">
  <video id="camera-22" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(22)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(22)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(22)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-22" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          
          <tr id="row-222">
            <td>2.20</td>
           <td class = "observation_text">Pulse Generator 2:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(222)">Add Image</button>
<div class="upload-options" id="upload-options-222" style="display: none;">
  <button class="add-image" onclick="startCamera(222)">Camera</button>
  <label for="file-input-222" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-222" accept="image/*" multiple onchange="displayImages(this, 222)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-222"></div>
      <!-- Camera Container -->
<div id="camera-container-222" style="display: none;">
  <video id="camera-222" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(222)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(222)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(222)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-222" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          
          <tr id="row-223">
            <td>2.21</td>
           <td class = "observation_text">PPC Card 1:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(223)">Add Image</button>
<div class="upload-options" id="upload-options-223" style="display: none;">
  <button class="add-image" onclick="startCamera(223)">Camera</button>
  <label for="file-input-223" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-223" accept="image/*" multiple onchange="displayImages(this, 223)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-223"></div>
      <!-- Camera Container -->
<div id="camera-container-223" style="display: none;">
  <video id="camera-223" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(223)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(223)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(223)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-223" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

            <tr id="row-224">
            <td>2.22</td>
           <td class = "observation_text">PPC Card 2:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(224)">Add Image</button>
<div class="upload-options" id="upload-options-224" style="display: none;">
  <button class="add-image" onclick="startCamera(224)">Camera</button>
  <label for="file-input-224" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-224" accept="image/*" multiple onchange="displayImages(this, 224)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-224"></div>
      <!-- Camera Container -->
<div id="camera-container-224" style="display: none;">
  <video id="camera-224" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(224)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(224)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(224)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-224" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

            <tr id="row-225">
            <td>2.23</td>
           <td class = "observation_text">VC Card 1:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(225)">Add Image</button>
<div class="upload-options" id="upload-options-225" style="display: none;">
  <button class="add-image" onclick="startCamera(225)">Camera</button>
  <label for="file-input-225" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-225" accept="image/*" multiple onchange="displayImages(this, 225)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-225"></div>
      <!-- Camera Container -->
<div id="camera-container-225" style="display: none;">
  <video id="camera-225" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(225)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(225)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(225)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-225" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

           <tr id="row-226">
            <td>2.24</td>
           <td class = "observation_text">VC Card 2:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(226)">Add Image</button>
<div class="upload-options" id="upload-options-226" style="display: none;">
  <button class="add-image" onclick="startCamera(226)">Camera</button>
  <label for="file-input-226" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-226" accept="image/*" multiple onchange="displayImages(this, 226)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-226"></div>
      <!-- Camera Container -->
<div id="camera-container-226" style="display: none;">
  <video id="camera-226" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(226)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(226)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(226)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-226" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

           <tr id="row-227">
            <td>2.25</td>
           <td class = "observation_text">VC Card 3:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(227)">Add Image</button>
<div class="upload-options" id="upload-options-227" style="display: none;">
  <button class="add-image" onclick="startCamera(227)">Camera</button>
  <label for="file-input-227" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-227" accept="image/*" multiple onchange="displayImages(this, 227)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-227"></div>
      <!-- Camera Container -->
<div id="camera-container-227" style="display: none;">
  <video id="camera-227" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(227)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(227)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(227)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-227" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

           <tr id="row-228">
            <td>2.26</td>
           <td class = "observation_text">Voter Card 1:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(228)">Add Image</button>
<div class="upload-options" id="upload-options-228" style="display: none;">
  <button class="add-image" onclick="startCamera(228)">Camera</button>
  <label for="file-input-228" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-228" accept="image/*" multiple onchange="displayImages(this, 228)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-228"></div>
      <!-- Camera Container -->
<div id="camera-container-228" style="display: none;">
  <video id="camera-228" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(228)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(228)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(228)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-228" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          <tr id="row-2229">
            <td>2.27</td>
           <td class = "observation_text">Voter Card 2:
          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(2229)">Add Image</button>
<div class="upload-options" id="upload-options-2229" style="display: none;">
  <button class="add-image" onclick="startCamera(2229)">Camera</button>
  <label for="file-input-2229" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-2229" accept="image/*" multiple onchange="displayImages(this, 2229)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-2229"></div>
      <!-- Camera Container -->
<div id="camera-container-2229" style="display: none;">
  <video id="camera-2229" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(2229)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(2229)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(2229)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-2229" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          <tr id="row-229">
            <td>2.28</td>
           <td class = "observation_text">Vital Gate Way Card 1:

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(229)">Add Image</button>
<div class="upload-options" id="upload-options-229" style="display: none;">
  <button class="add-image" onclick="startCamera(229)">Camera</button>
  <label for="file-input-229" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-229" accept="image/*" multiple onchange="displayImages(this, 229)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-229"></div>
      <!-- Camera Container -->
<div id="camera-container-229" style="display: none;">
  <video id="camera-229" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(229)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(229)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(229)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-229" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          <tr id="row-230">
            <td>2.29</td>
           <td class = "observation_text">Vital Gate Way Card 2:

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(230)">Add Image</button>
<div class="upload-options" id="upload-options-230" style="display: none;">
  <button class="add-image" onclick="startCamera(230)">Camera</button>
  <label for="file-input-230" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-230" accept="image/*" multiple onchange="displayImages(this, 230)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-230"></div>
      <!-- Camera Container -->
<div id="camera-container-230" style="display: none;">
  <video id="camera-230" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(230)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(230)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(230)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-230" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          <tr id="row-231">
            <td>2.30</td>
           <td class = "observation_text">Cab I/P Card 1:

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(231)">Add Image</button>
<div class="upload-options" id="upload-options-231" style="display: none;">
  <button class="add-image" onclick="startCamera(231)">Camera</button>
  <label for="file-input-231" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-231" accept="image/*" multiple onchange="displayImages(this, 231)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-231"></div>
      <!-- Camera Container -->
<div id="camera-container-231" style="display: none;">
  <video id="camera-231" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(231)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(231)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(231)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-231" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

            <tr id="row-232">
            <td>2.31</td>
           <td class = "observation_text">Cab I/P Card 2:

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(232)">Add Image</button>
<div class="upload-options" id="upload-options-232" style="display: none;">
  <button class="add-image" onclick="startCamera(232)">Camera</button>
  <label for="file-input-232" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-232" accept="image/*" multiple onchange="displayImages(this, 232)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-232"></div>
      <!-- Camera Container -->
<div id="camera-container-232" style="display: none;">
  <video id="camera-232" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(232)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(232)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(232)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-232" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

            <tr id="row-233">
            <td>2.32</td>
           <td class = "observation_text">DPS Card 1:

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(233)">Add Image</button>
<div class="upload-options" id="upload-options-233" style="display: none;">
  <button class="add-image" onclick="startCamera(233)">Camera</button>
  <label for="file-input-233" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-233" accept="image/*" multiple onchange="displayImages(this, 233)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-233"></div>
      <!-- Camera Container -->
<div id="camera-container-233" style="display: none;">
  <video id="camera-233" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(233)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(233)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(233)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-233" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          
            <tr id="row-234">
            <td>2.33</td>
           <td class = "observation_text">DPS Card 2:

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(234)">Add Image</button>
<div class="upload-options" id="upload-options-234" style="display: none;">
  <button class="add-image" onclick="startCamera(234)">Camera</button>
  <label for="file-input-234" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-234" accept="image/*" multiple onchange="displayImages(this, 234)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-234"></div>
      <!-- Camera Container -->
<div id="camera-container-234" style="display: none;">
  <video id="camera-234" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(234)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(234)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(234)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-234" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

           <tr id="row-235">
            <td>2.34</td>
           <td class = "observation_text">Radio unit:

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(235)">Add Image</button>
<div class="upload-options" id="upload-options-235" style="display: none;">
  <button class="add-image" onclick="startCamera(235)">Camera</button>
  <label for="file-input-235" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-235" accept="image/*" multiple onchange="displayImages(this, 235)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-235"></div>
      <!-- Camera Container -->
<div id="camera-container-235" style="display: none;">
  <video id="camera-235" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(235)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(235)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(235)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-235" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          <tr id="row-240">
            <td>2.35</td>
           <td class = "observation_text">EMI Filter Unit:

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(240)">Add Image</button>
<div class="upload-options" id="upload-options-240" style="display: none;">
  <button class="add-image" onclick="startCamera(240)">Camera</button>
  <label for="file-input-240" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-240" accept="image/*" multiple onchange="displayImages(this, 240)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-240"></div>
      <!-- Camera Container -->
<div id="camera-container-240" style="display: none;">
  <video id="camera-240" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(240)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(240)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(240)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-240" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          <tr id="row-236">
            <td>2.36</td>
           <td class = "observation_text">Radio Modem-1:

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(236)">Add Image</button>
<div class="upload-options" id="upload-options-236" style="display: none;">
  <button class="add-image" onclick="startCamera(236)">Camera</button>
  <label for="file-input-236" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-236" accept="image/*" multiple onchange="displayImages(this, 236)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-236"></div>
      <!-- Camera Container -->
<div id="camera-container-236" style="display: none;">
  <video id="camera-236" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(236)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(236)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(236)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-236" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          
          <tr id="row-237">
            <td>2.37</td>
           <td class = "observation_text">Radio Modem-2:

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(237)">Add Image</button>
<div class="upload-options" id="upload-options-237" style="display: none;">
  <button class="add-image" onclick="startCamera(237)">Camera</button>
  <label for="file-input-237" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-237" accept="image/*" multiple onchange="displayImages(this, 237)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-237"></div>
      <!-- Camera Container -->
<div id="camera-container-237" style="display: none;">
  <video id="camera-237" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(237)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(237)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(237)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-237" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          
          <tr id="row-238">
            <td>2.38</td>
           <td class = "observation_text">Interface Relay Unit Faiveley-1:

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/>
            <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(238)">Add Image</button>
<div class="upload-options" id="upload-options-238" style="display: none;">
  <button class="add-image" onclick="startCamera(238)">Camera</button>
  <label for="file-input-238" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-238" accept="image/*" multiple onchange="displayImages(this, 238)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-238"></div>
      <!-- Camera Container -->
<div id="camera-container-238" style="display: none;">
  <video id="camera-238" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(238)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(238)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(238)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-238" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>

          
          <tr id="row-239">
            <td>2.39</td>
           <td class = "observation_text">Interface Relay Unit Faiveley-2 :

          <input 
  type="text" 
  id="kavach-main-unit" 
  name="barcode_kavach_main_unit" 
  pattern="^\d{10,15}$" 
  title="Enter a number between 10 to 15 digits" 
  placeholder="Scan Barcode" 
  style="width: 180px; padding: 5px; font-size: 14px;" 
  oninput="
    if(this.value.length > 15) {
      this.value = this.value.slice(-15);
    }
    toggleNotInstalledOption(this);
  "
/> <td class="select">
              <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Matching">Matching</option>
                <option value="Not Matching">Not Matching</option>
                <option value="Not Installed">Not Installed</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </td>
            <td class="remarks">
              <textarea placeholder="Verify with IC" rows="2" cols="20"></textarea><br>
            </td>
           <td>
       <button class="add-image" onclick="showUploadOptions(239)">Add Image</button>
<div class="upload-options" id="upload-options-239" style="display: none;">
  <button class="add-image" onclick="startCamera(239)">Camera</button>
  <label for="file-input-239" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-239" accept="image/*" multiple onchange="displayImages(this, 239)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-239"></div>
      <!-- Camera Container -->
<div id="camera-container-239" style="display: none;">
  <video id="camera-239" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(239)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(239)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(239)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-239" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
          </tr>


          
        </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display: none;" 
              onclick="updateObservation('2_0')">
        Update
      </button>
    <button type="button" id= "save-btn" style = "display: inline-block;" onclick="saveObservation('2_0')">Save</button>
     <button id="get-details-btn" onclick="getDetails()">Get Details</button>
</div>`;


  } else if (section === "3.0") {
   // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading" > Loco Kavach Observations</h3>
       <div class="table-container">
      <table class="observations" id="observations-section-3_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="observations-tbody-3_0">
          <tr id="row-23">
              <td>3.1</td>
              <td class="observation_text"><b>Placement of LOCO KAVACH Equipment in Locomotive:</b>Verify that all Loco KAVACH equipment and peripherals are installed and connected as per connectivity diagram</td>
              <td class="select">
                 <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Connected">Connected</option>
                <option value="Not Connected">Not Connected</option>
              </select>
              </td>
              <td class="remarks">
                  <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
              </td>
             <td>
       <button class="add-image" onclick="showUploadOptions(23)">Add Image</button>
<div class="upload-options" id="upload-options-23" style="display: none;">
  <button class="add-image" onclick="startCamera(23)">Camera</button>
  <label for="file-input-23" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-23" accept="image/*" multiple onchange="displayImages(this, 23)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-23"></div>
      <!-- Camera Container -->
<div id="camera-container-23" style="display: none;">
  <video id="camera-23" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(23)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(23)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(23)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-23" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
</tr>
<tr id="row-24">
      <td>3.2</td>
      <td class="observation_text">Ensure that adequate space is available around the Loco KAVACH for ease of maintenance and service.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(24)">Add Image</button>
<div class="upload-options" id="upload-options-24" style="display: none;">
  <button class="add-image" onclick="startCamera(24)">Camera</button>
  <label for="file-input-24" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-24" accept="image/*" multiple onchange="displayImages(this, 24)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-24"></div>
      <!-- Camera Container -->
<div id="camera-container-24" style="display: none;">
  <video id="camera-24" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(24)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(24)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(24)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-24" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>

    <tr id="row-25">
      <td>3.3</td>
      <td class="observation_text"><b>Loco Stand:</b>Loco Kavach Unit has been placed on the designated stand and secured using the mounting bolts supplied in the Loco Kavach Installation Kit?</td>
      <td class="select">
     <select id="status-dropdown"  onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(25)">Add Image</button>
<div class="upload-options" id="upload-options-25" style="display: none;">
  <button class="add-image" onclick="startCamera(25)">Camera</button>
  <label for="file-input-25" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-25" accept="image/*" multiple onchange="displayImages(this, 25)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-25"></div>
      <!-- Camera Container -->
<div id="camera-container-25" style="display: none;">
  <video id="camera-25" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(25)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(25)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(25)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-25" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-26">
      <td>3.4</td>
      <td class="observation_text"><b>Welding between Loco surface and KAVACH fixing Stand:</b>Inspect the welding between the Loco surface and the KAVACH stand. Ensure there are no sharp edges or gaps.
Ensure 2.80 mm diameter E6013 welding electrodes are used.</td>
      <td>
         <select id="status-dropdown"  onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(26)">Add Image</button>
<div class="upload-options" id="upload-options-26" style="display: none;">
  <button class="add-image" onclick="startCamera(26)">Camera</button>
  <label for="file-input-26" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-26" accept="image/*" multiple onchange="displayImages(this, 26)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-26"></div>
<!-- Camera Container -->
<div id="camera-container-26" style="display: none;">
  <video id="camera-26" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(26)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(26)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(26)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-26" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
  <tr id="row-27">
      <td>3.5</td>
      <td class="observation_text"><b>Welding Surface Treatment:</b><br>
    Is Aerol Zinc3060 sprayed and the coating is extended up to 50 mm on both sides?</td>
      <td>
         <select id="status-dropdown"  onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(27)">Add Image</button>
<div class="upload-options" id="upload-options-27" style="display: none;">
  <button class="add-image" onclick="startCamera(27)">Camera</button>
  <label for="file-input-27" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-27" accept="image/*" multiple onchange="displayImages(this, 27)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-27"></div>
<!-- Camera Container -->
<div id="camera-container-27" style="display: none;">
  <video id="camera-27" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(27)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(27)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(27)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-27" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
  </tr>
<tr id="row-435">
      <td>3.5.1</td>
      <td class="observation_text"><b>Welding Surface Treatment:</b><br>
    Verify whether second coat of Aerol Zinc 3060 is done over entire area? After 30 Minutes Gap
      <td>
         <select id="status-dropdown"  onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(435)">Add Image</button>
<div class="upload-options" id="upload-options-435" style="display: none;">
  <button class="add-image" onclick="startCamera(435)">Camera</button>
  <label for="file-input-435" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-435" accept="image/*" multiple onchange="displayImages(this, 435)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-435"></div>
<!-- Camera Container -->
<div id="camera-container-435" style="display: none;">
  <video id="camera-435" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(435)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(435)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(435)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-435" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
  </tr>
<tr id="row-436">
      <td>3.5.2</td>
      <td class="observation_text"><b>Welding Surface Treatment:</b><br>
   Verify whether Berger Red Oxide Primer is applied on all galvanized steel parts?
      <td>
         <select id="status-dropdown"  onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(436)">Add Image</button>
<div class="upload-options" id="upload-options-436" style="display: none;">
  <button class="add-image" onclick="startCamera(436)">Camera</button>
  <label for="file-input-436" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-436" accept="image/*" multiple onchange="displayImages(this, 436)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-436"></div>
<!-- Camera Container -->
<div id="camera-container-436" style="display: none;">
  <video id="camera-436" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(436)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(436)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(436)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-436" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
  </tr>

    <tr id="row-28">
      <td>3.6</td>
      <td class="observation_text"><b>Loco Stand fixing holes:</b>Ensure that Loco stand fixing holes(M8) are exactly matching with Loco channel fixing holes(M8).</td>
      <td>
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Matching">Matching</option>
          <option value="Not Matching">Not Matching</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(28)">Add Image</button>
<div class="upload-options" id="upload-options-28" style="display: none;">
  <button class="add-image" onclick="startCamera(28)">Camera</button>
  <label for="file-input-28" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-28" accept="image/*" multiple onchange="displayImages(this, 28)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-28"></div>
      <!-- Camera Container -->
<div id="camera-container-28" style="display: none;">
  <video id="camera-28" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(28)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(28)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(28)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-28" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-29">
      <td>3.7</td>
      <td class="observation_text"><b>Torque and Marking:</b>Verify the torque Value of M8 Bolts (25 N.M) and mark with green/Yellow paint if the torque value is Ok.</td>
      <td class="select">
           <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Torquing done">Torquing done</option>
          <option value="Torquing Not done">Torquing Not done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(29)">Add Image</button>
<div class="upload-options" id="upload-options-29" style="display: none;">
  <button class="add-image" onclick="startCamera(29)">Camera</button>
  <label for="file-input-29" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-29" accept="image/*" multiple onchange="displayImages(this, 29)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-29"></div>
      <!-- Camera Container -->
<div id="camera-container-29" style="display: none;">
  <video id="camera-29" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(29)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(29)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(29)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-29" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-30">
      <td>3.8</td>
      <td class="observation_text"><b>Cable connections:</b>Verify the connections on the Loco external cable are made correctly according to the "Loco KAVACH External Harness Connectivity Diagram" without any overlaps. </td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Connected">Connected</option>
                <option value="Not Connected">Not Connected</option>
              </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
     <td>
       <button class="add-image" onclick="showUploadOptions(30)">Add Image</button>
<div class="upload-options" id="upload-options-30" style="display: none;">
  <button class="add-image" onclick="startCamera(30)">Camera</button>
  <label for="file-input-30" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-30" accept="image/*" multiple onchange="displayImages(this, 30)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-30"></div>
      <!-- Camera Container -->
<div id="camera-container-30" style="display: none;">
  <video id="camera-30" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(30)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(30)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(30)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-30" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-31">
      <td>3.9</td>
      <td class="observation_text"><b>Wire Stress:</b>Routing of wires to be done without stress and without sharp bends.</td>
      <td>
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing Done</option>
          <option value="Routing Not Done">Routing Not Done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(31)">Add Image</button>
<div class="upload-options" id="upload-options-31" style="display: none;">
  <button class="add-image" onclick="startCamera(31)">Camera</button>
  <label for="file-input-31" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-31" accept="image/*" multiple onchange="displayImages(this, 31)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-31"></div>
      <!-- Camera Container -->
<div id="camera-container-31" style="display: none;">
  <video id="camera-31" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(31)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(31)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(31)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-31" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-32">
      <td>3.10</td>
      <td class="observation_text"><b>Cable securing:</b>Verify that all peripheral cables for the loco kavach unit are routed and securely fastened using the appropriate metal clamps.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Metal clamps implemented">Metal clamps implemented</option>
          <option value="Metal clamps not implemented">Metal clamps not implemented</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(32)">Add Image</button>
<div class="upload-options" id="upload-options-32" style="display: none;">
  <button class="add-image" onclick="startCamera(32)">Camera</button>
  <label for="file-input-32" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-32" accept="image/*" multiple onchange="displayImages(this, 32)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-32"></div>
      <!-- Camera Container -->
<div id="camera-container-32" style="display: none;">
  <video id="camera-32" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(32)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(32)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(32)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-32" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-33">
      <td>3.11</td>
      <td class ="observation_text"><b>Connector fitment:</b>Ensure that all the external cable circular connectors are fully locked properly with Loco Kavach receptacles.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Cables Connected">Cables Connected</option>
          <option value="Cables Not Connected">Cables Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
     <td>
       <button class="add-image" onclick="showUploadOptions(33)">Add Image</button>
<div class="upload-options" id="upload-options-33" style="display: none;">
  <button class="add-image" onclick="startCamera(33)">Camera</button>
  <label for="file-input-33" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-33" accept="image/*" multiple onchange="displayImages(this, 33)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-33"></div>
      <!-- Camera Container -->
<div id="camera-container-33" style="display: none;">
  <video id="camera-33" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(33)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(33)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(33)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-33" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
  <tr id="row-1333">
      <td>3.12</td>
      <td class ="observation_text"><b>Earthing:</b>Ensure that earthing done with 10Sq.mm Yellow/Green cable for Loco Kavach main unit.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
     <td>
       <button class="add-image" onclick="showUploadOptions(1333)">Add Image</button>
<div class="upload-options" id="upload-options-1333" style="display: none;">
  <button class="add-image" onclick="startCamera(1333)">Camera</button>
  <label for="file-input-1333" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-1333" accept="image/*" multiple onchange="displayImages(this, 1333)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-1333"></div>
      <!-- Camera Container -->
<div id="camera-container-1333" style="display: none;">
  <video id="camera-1333" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(1333)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(1333)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(1333)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-1333" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
 <tr id="row-2333">
      <td>3.13</td>
      <td class ="observation_text"><b>Earth Cable:</b>Ensure that cable continuity,lug's crimping and tightness of earth cable.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
     <td>
       <button class="add-image" onclick="showUploadOptions(2333)">Add Image</button>
<div class="upload-options" id="upload-options-2333" style="display: none;">
  <button class="add-image" onclick="startCamera(2333)">Camera</button>
  <label for="file-input-2333" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-2333" accept="image/*" multiple onchange="displayImages(this, 2333)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-2333"></div>
      <!-- Camera Container -->
<div id="camera-container-2333" style="display: none;">
  <video id="camera-2333" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(2333)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(2333)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(2333)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-2333" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
 <tr id="row-3333">
      <td>3.14</td>
      <td class ="observation_text"><b>Earth Cable routing:</b>Ensure that the earth cables are routed through the conduit and routed properly and tied with metal clamps / cable ties.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing Done</option>
          <option value="Routing Not Done">Routing Not Done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
     <td>
       <button class="add-image" onclick="showUploadOptions(3333)">Add Image</button>
<div class="upload-options" id="upload-options-3333" style="display: none;">
  <button class="add-image" onclick="startCamera(3333)">Camera</button>
  <label for="file-input-3333" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-3333" accept="image/*" multiple onchange="displayImages(this, 3333)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-3333"></div>
      <!-- Camera Container -->
<div id="camera-container-3333" style="display: none;">
  <video id="camera-3333" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(3333)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(3333)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(3333)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-3333" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
        </tbody>
      </table>
      </div>
     <div class="action-buttons">
       <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display:none;" 
              onclick="updateObservation('3_0')">
        Update
      </button>
        <button type="button" id= "save-btn" style = "display: inline-block;" onclick="if(validateMandatoryImages('3_0')) { saveObservation('3_0'); }">Save</button>
        <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`

  } else if (section === "4.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading" > EMI Filter Box Observations</h3>
       <div class="table-container">
      <table class="observations" id="observations-section-4_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="observations-tbody-4_0">
          <tr id="row-34">
      <td>4.1</td>
      <td class="observation_text"><b>EMI Filter Box Fixing:</b>Fix M5x16mm Bolts on the EMI Filter Box to the loco stand with torque of 6 N-m and mark with green/yellow paint.</td>
       <td class = "select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Fixed">Fixed</option>
          <option value="Not Fixed">Not Fixed</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(34)">Add Image</button>
<div class="upload-options" id="upload-options-34" style="display: none;">
  <button class="add-image" onclick="startCamera(34)">Camera</button>
  <label for="file-input-34" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-34" accept="image/*" multiple onchange="displayImages(this, 34)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-34"></div>
      <!-- Camera Container -->
<div id="camera-container-34" style="display: none;">
  <video id="camera-34" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(34)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(34)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(34)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-34" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>


    <tr id="row-35">
      <td>4.2</td>
      <td class="observation_text"><b>Cable routing:</b>Ensure all the cables routed through PG gland without sharp bends, stress and tied with metal clamps.</td>
        <td class = "select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing Done</option>
          <option value="Routing Not Done">Routing Not Done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(35)">Add Image</button>
<div class="upload-options" id="upload-options-35" style="display: none;">
  <button class="add-image" onclick="startCamera(35)">Camera</button>
  <label for="file-input-35" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-35" accept="image/*" multiple onchange="displayImages(this, 35)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-35"></div>
      <!-- Camera Container -->
<div id="camera-container-35" style="display: none;">
  <video id="camera-35" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(35)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(35)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(35)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-35" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
        </tbody>
      </table>
      </div>
     <div class="action-buttons">
       <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display:none;" 
              onclick="updateObservation('4_0')">
        Update
      </button>
        <button type="button" id= "save-btn" style = "display: inline-block;" onclick="if(validateMandatoryImages('4_0')) { saveObservation('4_0'); }">Save</button>
        <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`
  } else if (section === "5.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading">RIB AND CAB INPUT BOX Observations</h3>
       <div class="table-container">
      <table class="observations" id="observations-section-5_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="observations-tbody-5_0">
          <tr id="row-36">
      <td>5.1</td>
      <td class="observation_text"><b>Space between RIB and CAB Input:</b>Ensure enough space available in-between cab input box and RIB unit for easy access of cables</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
     <td>
       <button class="add-image" onclick="showUploadOptions(36)">Add Image</button>
<div class="upload-options" id="upload-options-36" style="display: none;">
  <button class="add-image" onclick="startCamera(36)">Camera</button>
  <label for="file-input-36" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-36" accept="image/*" multiple onchange="displayImages(this, 36)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-36"></div>
      <!-- Camera Container -->
<div id="camera-container-36" style="display: none;">
  <video id="camera-36" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(36)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(36)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(36)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-36" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>

    <tr id="row-37">
      <td>5.2</td>
      <td class="observation_text"><b>Welding:</b>Ensure RIB and CAB Input box stand welding is without gap, cracks and joint breaks.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(37)">Add Image</button>
<div class="upload-options" id="upload-options-37" style="display: none;">
  <button class="add-image" onclick="startCamera(37)">Camera</button>
  <label for="file-input-37" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-37" accept="image/*" multiple onchange="displayImages(this, 37)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-37"></div>
      <!-- Camera Container -->
<div id="camera-container-37" style="display: none;">
  <video id="camera-37" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(37)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(37)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(37)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-37" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-38">
      <td>5.3</td>
      <td class="observation_text"><b>Torque:</b>The M5X16mm bolts shall be tightened with 6 N.m  torque Wrench and mark with green/yellow paint after torque verification.</td>
      <td class="select">
        <select id="status-dropdown"  onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(38)">Add Image</button>
<div class="upload-options" id="upload-options-38" style="display: none;">
  <button class="add-image" onclick="startCamera(38)">Camera</button>
  <label for="file-input-38" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-38" accept="image/*" multiple onchange="displayImages(this, 38)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-38"></div>
      <!-- Camera Container -->
<div id="camera-container-38" style="display: none;">
  <video id="camera-38" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(38)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(38)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(38)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-38" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-39">
      <td>5.4</td>
      <td class="observation_text"><b>Cable Connections:</b>Verify the RIB Unit harness cable connections for MILB1, MILB2, MILB3, MC26, MC18 are properly terminated.</td>
      <td class="select">
           <select id="status-dropdown"  onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>     
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(39)">Add Image</button>
<div class="upload-options" id="upload-options-39" style="display: none;">
  <button class="add-image" onclick="startCamera(39)">Camera</button>
  <label for="file-input-39" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-39" accept="image/*" multiple onchange="displayImages(this, 39)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-39"></div>
      <!-- Camera Container -->
<div id="camera-container-39" style="display: none;">
  <video id="camera-39" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(39)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(39)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(39)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-39" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
<tr id="row-1339">
      <td>5.5</td>
      <td class="observation_text"><b>Cable Routing:</b>Verify proper routing through PG glands without sharp bends or stress. Cables must be tied using metal clamps. </td>
      <td class="select">
          <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing done</option>
          <option value="Routing Not Done">Routing Not done</option>
        </select>     
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(1339)">Add Image</button>
<div class="upload-options" id="upload-options-1339" style="display: none;">
  <button class="add-image" onclick="startCamera(1339)">Camera</button>
  <label for="file-input-1339" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-1339" accept="image/*" multiple onchange="displayImages(this, 1339)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-1339"></div>
      <!-- Camera Container -->
<div id="camera-container-1339" style="display: none;">
  <video id="camera-1339" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(1339)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(1339)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(1339)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-1339" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>

    <tr id="row-40">
      <td>5.6</td>
      <td class="observation_text"><b>Connector fitment:</b>Verify that cables are connected with respect to labels and ensure all the external cable circular connectors are fully locked properly with enclosure (LOCO KAVACH) receptacles.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>

      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(40)">Add Image</button>
<div class="upload-options" id="upload-options-40" style="display: none;">
  <button class="add-image" onclick="startCamera(40)">Camera</button>
  <label for="file-input-40" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-40" accept="image/*" multiple onchange="displayImages(this, 40)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-40"></div>
      <!-- Camera Container -->
<div id="camera-container-40" style="display: none;">
  <video id="camera-40" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(40)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(40)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(40)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-40" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
   
    </tr>
    <tr id="row-1140">
      <td>5.7</td>
      <td class="observation_text"><b>Earthing:</b>Ensure that earthing done with 10Sq.mm Yellow/Green cable for Relay Interface Box and Cab Input box.</td>
      <td class="select">
        <select id="status-dropdown"  onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(1140)">Add Image</button>
<div class="upload-options" id="upload-options-1140" style="display: none;">
  <button class="add-image" onclick="startCamera(1140)">Camera</button>
  <label for="file-input-1140" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-1140" accept="image/*" multiple onchange="displayImages(this, 1140)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-1140"></div>
      <!-- Camera Container -->
<div id="camera-container-1140" style="display: none;">
  <video id="camera-1140" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(1140)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(1140)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(1140)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-1140" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
   
    </tr>
    <tr id="row-1240">
      <td>5.8</td>
      <td class="observation_text"><b>Earth Cable:</b>Ensure that cable continuity, lug's crimping and tightness of earth cable.</td>
      <td class="select">
        <select id="status-dropdown"  onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(1240)">Add Image</button>
<div class="upload-options" id="upload-options-1240" style="display: none;">
  <button class="add-image" onclick="startCamera(1240)">Camera</button>
  <label for="file-input-1240" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-1240" accept="image/*" multiple onchange="displayImages(this, 1240)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-1240"></div>
      <!-- Camera Container -->
<div id="camera-container-1240" style="display: none;">
  <video id="camera-1240" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(1240)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(1240)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(1240)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-1240" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
   
    </tr>
    <tr id="row-1340">
      <td>5.9</td>
      <td class="observation_text"><b>Earth Cable routing:</b>Ensure that the earth cables are routed through the conduit and routed properly and tied with metal clamps / cable ties.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing done</option>
          <option value="Routing Not Done">Routing Not done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(1340)">Add Image</button>
<div class="upload-options" id="upload-options-1340" style="display: none;">
  <button class="add-image" onclick="startCamera(1340)">Camera</button>
  <label for="file-input-1340" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-1340" accept="image/*" multiple onchange="displayImages(this, 1340)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-1340"></div>
      <!-- Camera Container -->
<div id="camera-container-1340" style="display: none;">
  <video id="camera-1340" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(1340)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(1340)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(1340)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-1340" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
   
    </tr>
    </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display: none;" 
              onclick="updateObservation('5_0')">
        Update
      </button>
       <button type="button" id= "save-btn" style = "display: inline-block;"  onclick="if(validateMandatoryImages('5_0')) { saveObservation('5_0'); }">Save</button>
        <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`

  }
  else if (section === "6.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading" > DMI (LP-OCIP) Observations</h3>
       <div  class="table-container">
      <table class="observations" id="observations-section-6_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="observations-tbody-6_0">
          <tr id="row-41">
      <td>6.1</td>
      <td class="observation_text"><b>DMI Mounting Place:</b>Check the DMI mounted place is good enough at driver desk, which can be operated easily by Loco pilot.</td>
       <td class="select">
       <select id="status-dropdown" onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
     <td>
       <button class="add-image" onclick="showUploadOptions(41)">Add Image</button>
<div class="upload-options" id="upload-options-41" style="display: none;">
  <button class="add-image" onclick="startCamera(41)">Camera</button>
  <label for="file-input-41" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-41" accept="image/*" multiple onchange="displayImages(this, 41)">
</div>
      <!-- Container for multiple images --> 
      <div id="image-container-41"></div>
      <!-- Camera Container -->
<div id="camera-container-41" style="display: none;">
  <video id="camera-41" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(41)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(41)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(41)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-41" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>

    <tr id="row-42">
      <td>6.2</td>
      <td class="observation_text"><b>DMI Mounting Stand:</b>Ensure that DMI mounting stand is properly welded without any joint gaps and can be withstand to loco vibrations.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(42)">Add Image</button>
<div class="upload-options" id="upload-options-42" style="display: none;">
  <button class="add-image" onclick="startCamera(42)">Camera</button>
  <label for="file-input-42" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-42" accept="image/*" multiple onchange="displayImages(this, 42)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-42"></div>
<!-- Camera Container -->
<div id="camera-container-42" style="display: none;">
  <video id="camera-42" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(42)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(42)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(42)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-42" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-43">
      <td>6.3</td>
      <td class="observation_text"><b>Torque and Marking:</b>Ensure M5x16mm Bolts are tightened to 6 N·m torque using a torque wrench, and mark screw heads with green/yellow paint after torque verification.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Torquing done">Torquing done</option>
          <option value="Torquing Not done">Torquing Not done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(43)">Add Image</button>
<div class="upload-options" id="upload-options-43" style="display: none;">
  <button class="add-image" onclick="startCamera(43)">Camera</button>
  <label for="file-input-43" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-43" accept="image/*" multiple onchange="displayImages(this, 43)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-43"></div>
<!-- Camera Container -->
<div id="camera-container-43" style="display: none;">
  <video id="camera-43" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(43)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(43)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(43)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-43" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-44">
      <td>6.4</td>
      <td class="observation_text"><b>DMI Cable:</b>Make sure the DMI cable can be easily accessed by the projection at the bottom of the stand.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(44)">Add Image</button>
<div class="upload-options" id="upload-options-44" style="display: none;">
  <button class="add-image" onclick="startCamera(44)">Camera</button>
  <label for="file-input-44" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-44" accept="image/*" multiple onchange="displayImages(this, 44)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-44"></div>
<!-- Camera Container -->
<div id="camera-container-44" style="display: none;">
  <video id="camera-44" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(44)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(44)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(44)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-44" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-45">
      <td>6.5</td>
      <td class="observation_text"><b>DMI Stand Color:</b>Ensure welded portions of the stand are treated with red oxide coating before applying RAL7032 (Pebble Grey/ Smoke Gray ) paint to prevent corrosion</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Applied">Applied</option>
          <option value="Not Applied">Not Applied</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(45)">Add Image</button>
<div class="upload-options" id="upload-options-45" style="display: none;">
  <button class="add-image" onclick="startCamera(45)">Camera</button>
  <label for="file-input-45" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-45" accept="image/*" multiple onchange="displayImages(this, 45)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-45"></div>
<!-- Camera Container -->
<div id="camera-container-45" style="display: none;">
  <video id="camera-45" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(45)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(45)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(45)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-45" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-46">
      <td>6.6</td>
      <td class="observation_text"><b>Cable routing:</b>Ensure all the cables routed without any stress, without sharp bends and tied with metal clamps.</td>
     <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing done</option>
          <option value="Routing Not Done">Routing Not done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
     <td>
       <button class="add-image" onclick="showUploadOptions(46)">Add Image</button>
<div class="upload-options" id="upload-options-46" style="display: none;">
  <button class="add-image" onclick="startCamera(46)">Camera</button>
  <label for="file-input-46" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-46" accept="image/*" multiple onchange="displayImages(this, 46)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-46"></div>
<!-- Camera Container -->
<div id="camera-container-46" style="display: none;">
  <video id="camera-46" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(46)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(46)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(46)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-46" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-47">
      <td>6.7</td>
      <td class="observation_text"><b>Cable Booting:</b>Verify that the cable booting is not damaged or peeled during and after cable routing, and ensure circular connectors are fully locked with the DMI unit enclosure receptacles</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
    <td>
       <button class="add-image" onclick="showUploadOptions(47)">Add Image</button>
<div class="upload-options" id="upload-options-47" style="display: none;">
  <button class="add-image" onclick="startCamera(47)">Camera</button>
  <label for="file-input-47" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-47" accept="image/*" multiple onchange="displayImages(this, 47)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-47"></div>
<!-- Camera Container -->
<div id="camera-container-47" style="display: none;">
  <video id="camera-47" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(47)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(47)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(47)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-47" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-48">
      <td>6.8</td>
      <td class="observation_text"><b>DMI-1 Cable Connection:</b>DMI-1 cable should be connected to MC1 at Loco Kavach unit.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(48)">Add Image</button>
<div class="upload-options" id="upload-options-48" style="display: none;">
  <button class="add-image" onclick="startCamera(48)">Camera</button>
  <label for="file-input-48" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-48" accept="image/*" multiple onchange="displayImages(this, 48)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-48"></div>
<!-- Camera Container -->
<div id="camera-container-48" style="display: none;">
  <video id="camera-48" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(48)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(48)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(48)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-48" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-49">
      <td>6.9</td>
      <td class="observation_text"><b>DMI 2 Cable Connection:</b>DMI-2 cable should be connected to MC3 at Loco Kavach unit.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(49)">Add Image</button>
<div class="upload-options" id="upload-options-49" style="display: none;">
  <button class="add-image" onclick="startCamera(49)">Camera</button>
  <label for="file-input-49" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-49" accept="image/*" multiple onchange="displayImages(this, 49)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-49"></div>
<!-- Camera Container -->
<div id="camera-container-49" style="display: none;">
  <video id="camera-49" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(49)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(49)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(49)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-49" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
       </tr>
 <tr id="row-1449">
      <td>6.10</td>
      <td class="observation_text"><b>Earthing:</b>Ensure that earthing done with 10Sq.mm Yellow/Green cable for
 LP-OCIP -1 and LP-OCIP-2.</td>
      <td class="select">
      <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(1449)">Add Image</button>
<div class="upload-options" id="upload-options-1449" style="display: none;">
  <button class="add-image" onclick="startCamera(1449)">Camera</button>
  <label for="file-input-1449" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-1449" accept="image/*" multiple onchange="displayImages(this, 1449)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-1449"></div>
<!-- Camera Container -->
<div id="camera-container-1449" style="display: none;">
  <video id="camera-1449" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(1449)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(1449)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(1449)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-1449" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
       </tr>
 <tr id="row-1549">
      <td>6.11</td>
      <td class="observation_text"><b>Earth Cable:</b>Ensure that cable continuity,lug's crimping and tightness of earth cable.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(1549)">Add Image</button>
<div class="upload-options" id="upload-options-1549" style="display: none;">
  <button class="add-image" onclick="startCamera(1549)">Camera</button>
  <label for="file-input-1549" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-1549" accept="image/*" multiple onchange="displayImages(this, 1549)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-1549"></div>
<!-- Camera Container -->
<div id="camera-container-1549" style="display: none;">
  <video id="camera-1549" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(1549)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(1549)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(1549)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-1549" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
       </tr>
 <tr id="row-1649">
      <td>6.12</td>
      <td class="observation_text"><b>Earth Cable routing:</b>Ensure that the earth cables are routed through the conduit and routed properly and tied with metal clamps / cable ties.</td>
      <td class="select">
        
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing done</option>
          <option value="Routing Not Done">Routing Not done</option>
        </select>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(1649)">Add Image</button>
<div class="upload-options" id="upload-options-1649" style="display: none;">
  <button class="add-image" onclick="startCamera(1649)">Camera</button>
  <label for="file-input-1649" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-1649" accept="image/*" multiple onchange="displayImages(this, 1649)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-1649"></div>
<!-- Camera Container -->
<div id="camera-container-1649" style="display: none;">
  <video id="camera-1649" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(1649)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(1649)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(1649)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-1649" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
       </tr>
    </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display: none;" 
              onclick="updateObservation('6_0')">
        Update
      </button>
         <button type="button" id= "save-btn" style = "display: inline-block;" onclick="if(validateMandatoryImages('6_0')) { saveObservation('6_0'); }">Save</button>
         <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`
  } else if (section === "7.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading">RFID PS Unit Observations</h3>
      <div class="table-container"> 
      <table class="observations" id="observations-section-7_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="observations-tbody-7_0">
          <tr id="row-51">
      <td>7.1</td>
      <td class="observation_text"><b>RFID PS Unit fixing:</b>Ensure M5x16mm Bolts are tightened to 6 N·m torque using a torque wrench on the Loco Kavach stand, and mark screw heads with green/yellow paint after verifying the torque value</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Torquing done">Torquing done</option>
          <option value="Torquing Not done">Torquing Not done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(51)">Add Image</button>
<div class="upload-options" id="upload-options-51" style="display: none;">
  <button class="add-image" onclick="startCamera(51)">Camera</button>
  <label for="file-input-51" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-51" accept="image/*" multiple onchange="displayImages(this, 51)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-51"></div>
<!-- Camera Container -->
<div id="camera-container-51" style="display: none;">
  <video id="camera-51" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(51)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(51)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(51)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-51" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>

    <tr id="row-52">
      <td>7.2</td>
      <td class="observation_text"><b>Cable connections:</b>Ensure that cable connections are given at the corresponding location with respect to labels provided at Loco Kavach.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(52)">Add Image</button>
<div class="upload-options" id="upload-options-52" style="display: none;">
  <button class="add-image" onclick="startCamera(52)">Camera</button>
  <label for="file-input-52" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-52" accept="image/*" multiple onchange="displayImages(this, 52)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-52"></div>
<!-- Camera Container -->
<div id="camera-container-52" style="display: none;">
  <video id="camera-52" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(52)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(52)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(52)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-52" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-53">
      <td>7.3</td>
      <td class="observation_text"><b>Cable routing:</b>Ensure that cables are routed properly without hanging and tied properly with cables ties</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing done</option>
          <option value="Routing Not Done">Routing Not done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(53)">Add Image</button>
       <div class="upload-options" id="upload-options-53" style="display: none;">
       <button class="add-image" onclick="startCamera(53)">Camera</button>
       <label for="file-input-53" class="upload-label">Upload from Device</label>
       <input type="file" id="file-input-53" accept="image/*" multiple onchange="displayImages(this, 53)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-53"></div>
      <!-- Camera Container -->
      <div id="camera-container-53" style="display: none;">
      <video id="camera-53" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(53)">Capture Image</button>
      <button class="add-image" onclick="stopCamera(53)">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(53)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
      <canvas id="canvas-53" style="display: none;"></canvas> <!-- Canvas to capture the image -->
      </div>
    </tr>
    <tr id="row-54">
      <td>7.4</td>
      <td class="observation_text"><b>Connector locking:</b>Ensure the circular connectors are properly locked with RFID box unit receptacles.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Locked">Locked</option>
          <option value="Not Locked">Not Locked</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(54)">Add Image</button>
<div class="upload-options" id="upload-options-54" style="display: none;">
  <button class="add-image" onclick="startCamera(54)">Camera</button>
  <label for="file-input-54" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-54" accept="image/*" multiple onchange="displayImages(this, 54)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-54"></div>
<!-- Camera Container -->
<div id="camera-container-54" style="display: none;">
  <video id="camera-54" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(54)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(54)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(54)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-54" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
       </tr>
     </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display:none;" 
              onclick="updateObservation('7_0')">
        Update
      </button>
        <button type="button" id= "save-btn" style = "display: inline-block;"  onclick="if(validateMandatoryImages('7_0')) { saveObservation('7_0'); }">Save</button>
         <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`
  } else if (section === "8.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading"> LOCO Antenna and GPS/GSM Antenna Observations</h3>
       <div class="table-container">
      <table class="observations" id="observations-section-8_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="observations-tbody-8_0">
          <tr id="row-56">
      <td>8.1</td>
      <td class="observation_text">Are RF and GPS/GSM antennas properly leveled using a spirit level instrument?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(56)">Add Image</button>
<div class="upload-options" id="upload-options-56" style="display: none;">
  <button class="add-image" onclick="startCamera(56)">Camera</button>
  <label for="file-input-56" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-56" accept="image/*" multiple onchange="displayImages(this, 56)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-56"></div>
<!-- Camera Container -->
<div id="camera-container-56" style="display: none;">
  <video id="camera-56" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(56)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(56)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(56)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-56" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>

    <tr id="row-57">
      <td>8.2</td>
      <td class="observation_text"><b>Radio Antenna Welding:</b>Check that the radio antenna’s base plate welding is done properly, with no joint gaps or cracks.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(57)">Add Image</button>
<div class="upload-options" id="upload-options-57" style="display: none;">
  <button class="add-image" onclick="startCamera(57)">Camera</button>
  <label for="file-input-57" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-57" accept="image/*" multiple onchange="displayImages(this, 57)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-57"></div>
<!-- Camera Container -->
<div id="camera-container-57" style="display: none;">
  <video id="camera-57" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(57)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(57)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(57)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-57" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-58">
      <td>8.3</td>
      <td class="observation_text"><b>Welding:</b>Ensure the welding is sufficient to withstand locomotive vibrations at higher speeds without affecting the antennas.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(58)">Add Image</button>
<div class="upload-options" id="upload-options-58" style="display: none;">
  <button class="add-image" onclick="startCamera(58)">Camera</button>
  <label for="file-input-58 " class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-58" accept="image/*" multiple onchange="displayImages(this, 58)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-58"></div>
<!-- Camera Container -->
<div id="camera-container-58" style="display: none;">
  <video id="camera-58" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(58)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(58)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(58)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-58" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-59">
      <td>8.4</td>
      <td class="observation_text"><b>Antenna Mounting:</b>Antennas are to be mounted within stipulated height to avoid OHE line contact.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(59)">Add Image</button>
<div class="upload-options" id="upload-options-59" style="display: none;">
  <button class="add-image" onclick="startCamera(59)">Camera</button>
  <label for="file-input-59" class="upload-label">Upload from Device</label>
  <input type="file" id="file-input-59" accept="image/*" multiple onchange="displayImages(this, 59)">
</div>
<!-- Container for multiple images --> 
<div id="image-container-59"></div>
<!-- Camera Container -->
<div id="camera-container-59" style="display: none;">
  <video id="camera-59" width="100%" height="auto" autoplay></video>
  <button class="add-image" onclick="captureImage(59)">Capture Image</button>
  <button class="add-image" onclick="stopCamera(59)">Stop Camera</button>
  <button class="reverse-camera" onclick="switchCamera(59)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
  <canvas id="canvas-59" style="display: none;"></canvas> <!-- Canvas to capture the image -->
</div>
    </tr>
    <tr id="row-60">
      <td>8.5</td>
      <td class="observation_text"><b>RF Antenna Cable Connections:</b>Are the Rx and Tx cables connected to their respective Rx and Tx antenna, as per the labels?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(60)">Add Image</button>
       <div class="upload-options" id="upload-options-60" style="display: none;">
       <button class="add-image" onclick="startCamera(60)">Camera</button>
       <label for="file-input-60" class="upload-label">Upload from Device</label>
       <input type="file" id="file-input-60" accept="image/*" multiple onchange="displayImages(this, 60)">
       </div>
       <!-- Container for multiple images --> 
       <div id="image-container-60"></div>
       <!-- Camera Container -->
       <div id="camera-container-60" style="display: none;">
      <video id="camera-60" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(60)">Capture Image</button>
      <button class="add-image" onclick="stopCamera(60)">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(60)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
      <canvas id="canvas-60" style="display: none;"></canvas> <!-- Canvas to capture the image -->
      </div>
    </tr>
    <tr id="row-61">
      <td>8.6</td>
      <td class="observation_text"><b>GPS/GSM Antenna and Cable Installation:</b>Are the GPS and GSM cables clearly labeled and correctly connected to their respective GPS and GSM antenna on both sides of the locomotive?</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(61)">Add Image</button>
       <div class="upload-options" id="upload-options-61" style="display: none;">
       <button class="add-image" onclick="startCamera(61)">Camera</button>
       <label for="file-input-61" class="upload-label">Upload from Device</label>
       <input type="file" id="file-input-61" accept="image/*" multiple onchange="displayImages(this, 61)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-61"></div>
      <!-- Camera Container -->
      <div id="camera-container-61" style="display: none;">
      <video id="camera-61" width="100%" height="auto" autoplay></video>
      <button class="add-image" onclick="captureImage(61)">Capture Image</button>
      <button class="add-image" onclick="stopCamera(61)">Stop Camera</button>
      <button class="reverse-camera" onclick="switchCamera(61)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
      <canvas id="canvas-61" style="display: none;"></canvas> <!-- Canvas to capture the image -->
      </div>
    </tr>
  <tr id="row-62">
      <td>8.7</td>
      <td class="observation_text"> 
      <b>Antenna Cables Routing:</b><br>
      Verify that cables from the two RF antenna and GPS/GSM antennae are routed through a 2” steel-reinforced conduit.
      </td>
        <td class = "select">
           <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing done</option>
          <option value="Routing Not Done">Routing Not done</option>
        </select>


      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(62)">Add Image</button>
       <div class="upload-options" id="upload-options-62" style="display: none;">
      <button class="add-image" onclick="startCamera(62)">Camera</button>
      <label for="file-input-62" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-62" accept="image/*" multiple onchange="displayImages(this, 62)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-62"></div>
      <!-- Camera Container -->
     <div id="camera-container-62" style="display: none;">
     <video id="camera-62" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(62)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(62)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(62)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-62" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-623">
      <td>8.7.1</td>
      <td class="observation_text"> 
      <b>Antenna Cables Routing:</b><br>
     Ensure the conduit is securely clamped to the roof using clamps welded to the rooftop, as per the installation drawing.
      </td>
        <td class = "select">
           <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(623)">Add Image</button>
       <div class="upload-options" id="upload-options-623" style="display: none;">
      <button class="add-image" onclick="startCamera(623)">Camera</button>
      <label for="file-input-623" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-623" accept="image/*" multiple onchange="displayImages(this, 623)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-623"></div>
      <!-- Camera Container -->
     <div id="camera-container-623" style="display: none;">
     <video id="camera-623" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(623)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(623)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(623)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-623" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
<tr id="row-624">
      <td>8.7.2</td>
      <td class="observation_text"> 
      <b>Antenna Cables Routing:</b><br>
     Confirm the conduit is routed into the Loco cabin through the elbow pipe installed in the flasher unit on the roof.
      </td>
        <td class = "select">
          <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(624)">Add Image</button>
       <div class="upload-options" id="upload-options-624" style="display: none;">
      <button class="add-image" onclick="startCamera(624)">Camera</button>
      <label for="file-input-624" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-624" accept="image/*" multiple onchange="displayImages(this, 624)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-624"></div>
      <!-- Camera Container -->
     <div id="camera-container-624" style="display: none;">
     <video id="camera-624" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(624)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(624)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(624)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-624" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-625">
      <td>8.7.3</td>
      <td class="observation_text"> 
      <b>Antenna Cables Routing:</b><br>
     Ensure the conduit pipe and elbow are sourced from the Loco Kavach Installation Kit.
      </td>
        <td class = "select">
          <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(625)">Add Image</button>
       <div class="upload-options" id="upload-options-625" style="display: none;">
      <button class="add-image" onclick="startCamera(625)">Camera</button>
      <label for="file-input-625" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-625" accept="image/*" multiple onchange="displayImages(this, 625)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-625"></div>
      <!-- Camera Container -->
     <div id="camera-container-625" style="display: none;">
     <video id="camera-625" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(625)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(625)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(625)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-625" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
  <tr id="row-699">
      <td>8.7.4</td>
      <td class="observation_text"> 
      <b>Antenna Cables Routing:</b><br>
    Verify that RTV Silicone compound (from the Loco Kavach Installation Kit) is applied around all open conduit and cable entry joints to prevent ingress of dust,water, etc.
      </td>
        <td class = "select">
       <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(699)">Add Image</button>
       <div class="upload-options" id="upload-options-699" style="display: none;">
      <button class="add-image" onclick="startCamera(699)">Camera</button>
      <label for="file-input-699" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-699" accept="image/*" multiple onchange="displayImages(this, 699)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-699"></div>
      <!-- Camera Container -->
     <div id="camera-container-699" style="display: none;">
     <video id="camera-699" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(699)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(699)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(699)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-699" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>


    <tr id="row-63">
      <td>8.8</td>
      <td class="observation_text"><b>Red oxide coating:</b>Ensure that all welded portions should be treated with red oxide coating, before painted with RAL7032 (pebble grey / Smoke Gray ) paint, to avoid corrosion. </td>
        <td class = "select">
          <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Applied">Applied</option>
          <option value="Not Applied">Not Applied</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(63)">Add Image</button>
       <div class="upload-options" id="upload-options-63" style="display: none;">
      <button class="add-image" onclick="startCamera(63)">Camera</button>
      <label for="file-input-63" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-63" accept="image/*" multiple onchange="displayImages(this, 63)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-63"></div>
      <!-- Camera Container -->
     <div id="camera-container-63" style="display: none;">
     <video id="camera-63" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(63)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(63)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(63)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-63" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
     </tbody>
      </table>
       </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display:none;" 
              onclick="updateObservation('8_0')">
        Update
      </button>
        <button type="button" id= "save-btn" style = "display: inline-block;"  onclick="if(validateMandatoryImages('8_0')) { saveObservation('8_0'); }">Save</button>
         <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>

    ;`
  }  else if (section === "9.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading">Pneumatic Fittings and Ep Valve Cocks Fixing Observations</h3>
       <div  class="table-container">
      <table class="observations" id="observations-section-9_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="observations-tbody-9_0">
          <tr id="row-64">
      <td>9.1</td>
      <td class="observation_text"><b>Pneumatic fittings:</b>Confirm that all pipes and fittings used in the assembly are from the approved BOM and sourced from the I and C kit supplied by the factory.Any locally procured items must be checked for compliance with the approved BOM</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(64)">Add Image</button>
       <div class="upload-options" id="upload-options-64" style="display: none;">
      <button class="add-image" onclick="startCamera(64)">Camera</button>
      <label for="file-input-64" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-64" accept="image/*" multiple onchange="displayImages(this, 64)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-64"></div>
      <!-- Camera Container -->
     <div id="camera-container-64" style="display: none;">
     <video id="camera-64" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(64)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(64)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(64)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-64" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>

    <tr id="row-65">
      <td>9.2</td>
      <td class="observation_text"><b>Copper Pipes:</b>Ensure that copper pipes are bent using appropriate bending tool, and there no kinks or sharp bends in the pipe.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(65)">Add Image</button>
       <div class="upload-options" id="upload-options-65" style="display: none;">
      <button class="add-image" onclick="startCamera(65)">Camera</button>
      <label for="file-input-65" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-65" accept="image/*" multiple onchange="displayImages(this, 65)">
     </div>
      <!-- Container for multiple images --> 
      <div id="image-container-65"></div>
      <!-- Camera Container -->
     <div id="camera-container-65" style="display: none;">
     <video id="camera-65" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(65)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(65)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(65)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-65" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-66">
      <td>9.3</td>
      <td class="observation_text"><b>Copper Tube:</b>Ensure that copper tube length is measured with respect to the connectivity from loco pneumatic to EP Valve, BP cock, Horn cock and valve arrangements.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(66)">Add Image</button>
       <div class="upload-options" id="upload-options-66" style="display: none;">
      <button class="add-image" onclick="startCamera(66)">Camera</button>
      <label for="file-input-66" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-66" accept="image/*" multiple onchange="displayImages(this, 66)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-66"></div>
      <!-- Camera Container -->
     <div id="camera-container-66" style="display: none;">
     <video id="camera-66" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(66)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(66)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(66)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-66" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-67">
      <td>9.4</td>
      <td class="observation_text"><b>Copper pipe connections:</b>Ensure that copper pipe connections made properly with approved make (Ex. Fluid Control) ferrules and TEE-joints used.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(67)">Add Image</button>
       <div class="upload-options" id="upload-options-67" style="display: none;">
      <button class="add-image" onclick="startCamera(67)">Camera</button>
      <label for="file-input-67" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-67" accept="image/*" multiple onchange="displayImages(this, 67)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-67"></div>
      <!-- Camera Container -->
     <div id="camera-container-67" style="display: none;">
     <video id="camera-67" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(67)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(67)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(67)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-67" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-68">
      <td>9.5</td>
      <td class="observation_text"><b>Threaded Connections:</b>All threaded connections must be sealed with loctite 567 (Not With Teflon Tape), which is supplied in the IandC kit.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(68)">Add Image</button>
       <div class="upload-options" id="upload-options-68" style="display: none;">
      <button class="add-image" onclick="startCamera(68)">Camera</button>
      <label for="file-input-68" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-68" accept="image/*" multiple onchange="displayImages(this, 68)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-68"></div>
      <!-- Camera Container -->
     <div id="camera-container-68" style="display: none;">
     <video id="camera-68" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(68)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(68)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(68)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-68" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
     <tr id="row-69">
      <td>9.6</td>
      <td class="observation_text"><b>Pneumatic Lines Connections:</b>Check the pneumatic lines with a soap solution to make sure there are no loose connections and no air bubbles should be seen.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(69)">Add Image</button>
       <div class="upload-options" id="upload-options-69" style="display: none;">
      <button class="add-image" onclick="startCamera(69)">Camera</button>
      <label for="file-input-69" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-69" accept="image/*" multiple onchange="displayImages(this, 69)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-69"></div>
      <!-- Camera Container -->
     <div id="camera-container-69" style="display: none;">
     <video id="camera-69" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(69)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(69)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(69)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-69" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
<tr id="row-969">
      <td>9.7</td>
      <td class="observation_text"><b>Pneumatic Lines Connections:</b>The soap solution must be cleaned after the test.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(969)">Add Image</button>
       <div class="upload-options" id="upload-options-969" style="display: none;">
      <button class="add-image" onclick="startCamera(969)">Camera</button>
      <label for="file-input-969" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-969" accept="image/*" multiple onchange="displayImages(this, 969)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-969"></div>
      <!-- Camera Container -->
     <div id="camera-container-969" style="display: none;">
     <video id="camera-969" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(969)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(969)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(969)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-969" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
         </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display:none;" 
              onclick="updateObservation('9_0')">
        Update
      </button>
       <button type="button" id= "save-btn" style = "display: inline-block;" onclick="if(validateMandatoryImages('9_0')){ saveObservation('9_0'); }">Save</button>
       <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`
  } else if (section === "10.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading"> Pressure sensors Installation in LOCO Observations</h3>
       <div  class="table-container">
      <table class="observations" id="observations-section-10_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="observations-tbody-10_0">
          <tr id="row-71">
      <td>10.1</td>
      <td class="observation_text">Ensure all these pressure sensors shall be installed under CAB1 driver desk.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Installed">Installed</option>
          <option value="Not Installed">Not Installed</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(71)">Add Image</button>
       <div class="upload-options" id="upload-options-71" style="display: none;">
      <button class="add-image" onclick="startCamera(71)">Camera</button>
      <label for="file-input-71" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-71" accept="image/*" multiple onchange="displayImages(this, 71)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-71"></div>
      <!-- Camera Container -->
     <div id="camera-container-71" style="display: none;">
     <video id="camera-71" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(71)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(71)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(71)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-71" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>

    <tr id="row-72">
      <td>10.2</td>
      <td class="observation_text">Ensure MR sensor should be 16 bar, and remain BP,BC1,BC2 are 7 bar</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Installed">Installed</option>
          <option value="Not Installed">Not Installed</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(72)">Add Image</button>
       <div class="upload-options" id="upload-options-72" style="display: none;">
      <button class="add-image" onclick="startCamera(72)">Camera</button>
      <label for="file-input-72" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-72" accept="image/*" multiple onchange="displayImages(this, 72)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-72"></div>
      <!-- Camera Container -->
     <div id="camera-container-72" style="display: none;">
     <video id="camera-72" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(72)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(72)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(72)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-72" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-73">
      <td>10.3</td>
      <td class="observation_text">Ensure all pressure sensors should be installed on T-Joints</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Installed">Installed</option>
          <option value="Not Installed">Not Installed</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(73)">Add Image</button>
       <div class="upload-options" id="upload-options-73" style="display: none;">
      <button class="add-image" onclick="startCamera(73)">Camera</button>
      <label for="file-input-73" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-73" accept="image/*" multiple onchange="displayImages(this, 73)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-73"></div>
      <!-- Camera Container -->
      <div id="camera-container-73" style="display: none;">
     <video id="camera-73" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(73)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(73)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(73)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-73" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-7323">
      <td>10.4</td>
      <td class="observation_text"><b>Wiring Connections :</b> Red (+V) to Terminal 1,  Black (–V) to Terminal 2 & Black-White (Earth) to Terminal 3—Mention In Status</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>

</td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(7323)">Add Image</button>
       <div class="upload-options" id="upload-options-7323" style="display: none;">
      <button class="add-image" onclick="startCamera(7323)">Camera</button>
      <label for="file-input-7323" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-7323" accept="image/*" multiple onchange="displayImages(this, 7323)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-7323"></div>
      <!-- Camera Container -->
      <div id="camera-container-7323" style="display: none;">
     <video id="camera-7323" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(7323)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(7323)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(7323)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-7323" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display:none;" 
              onclick="updateObservation('10_0')">
        Update
      </button>
        <button type="button" id= "save-btn" style = "display: inline-block;" onclick="if(validateMandatoryImages('10_0')) { saveObservation('10_0'); }">Save</button>
         <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`
  } else if (section === "11.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading">IRU Faiveley Units Fixing For E70 Type Loco Observations</h3>
       <div  class="table-container">
      <table class="observations" id="observations-section-11_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="observations-tbody-11_0">
          <tr id="row-74">
      <td>11.1</td>
      <td class="observation_text"><b>IRU Fixing Place:</b>Are two IRUs installed—one in CAB-I and one in CAB-II—as per installation instructions?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(74)">Add Image</button>
       <div class="upload-options" id="upload-options-74" style="display: none;">
      <button class="add-image" onclick="startCamera(74)">Camera</button>
      <label for="file-input-74" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-74" accept="image/*" multiple onchange="displayImages(this, 74)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-74"></div>
      <!-- Camera Container -->
     <div id="camera-container-74" style="display: none;">
     <video id="camera-74" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(74)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(74)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(74)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-74" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
  <tr id="row-774">
      <td>11.1.1</td>
      <td class="observation_text"><b>IRU Fixing Place</b>:
Is the mounting frame fabricated using 50x50x5 mm galvanized steel tube or angle?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not Applicable">Not Applicable</option>

        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(774)">Add Image</button>
       <div class="upload-options" id="upload-options-774" style="display: none;">
      <button class="add-image" onclick="startCamera(774)">Camera</button>
      <label for="file-input-774" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-774" accept="image/*" multiple onchange="displayImages(this, 774)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-774"></div>
      <!-- Camera Container -->
     <div id="camera-container-774" style="display: none;">
     <video id="camera-774" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(774)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(774)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(774)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-774" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>



    <tr id="row-75">
      <td>11.2</td>
      <td class="observation_text"><b>Welding:</b>Has the mounting frame been welded under the A9 Driver Brake Controller (DBC) of each cab and after welding has the frame been painted properly?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(75)">Add Image</button>
       <div class="upload-options" id="upload-options-75" style="display: none;">
      <button class="add-image" onclick="startCamera(75)">Camera</button>
      <label for="file-input-75" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-75" accept="image/*" multiple onchange="displayImages(this, 75)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-75"></div>
      <!-- Camera Container -->
     <div id="camera-container-75" style="display: none;">
     <video id="camera-75" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(75)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(75)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(75)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-75" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-78">
      <td>11.3</td>
      <td class="observation_text"><b>Red oxide coating:</b>Ensure that the welded portion should be coated with red oxide and painted with RAL7032 (Pebble grey/smoke gray) paint.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Applied">Applied</option>
          <option value="Not Applied">Not Applied</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(78)">Add Image</button>
       <div class="upload-options" id="upload-options-78" style="display: none;">
      <button class="add-image" onclick="startCamera(78)">Camera</button>
      <label for="file-input-78" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-78" accept="image/*" multiple onchange="displayImages(this, 78)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-78"></div>
      <!-- Camera Container -->
     <div id="camera-container-78" style="display: none;">
     <video id="camera-78" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(78)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(78)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(78)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-78" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    
    <tr id="row-76">
      <td>11.4</td>
      <td class="observation_text">Have the IRU units been fixed to the mounting frame using the bolts, nuts, and washers supplied in the Brake Interface Installation Kit?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(76)">Add Image</button>
       <div class="upload-options" id="upload-options-76" style="display: none;">
      <button class="add-image" onclick="startCamera(76)">Camera</button>
      <label for="file-input-76" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-76" accept="image/*" multiple onchange="displayImages(this, 76)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-76"></div>
      <!-- Camera Container -->
     <div id="camera-container-76" style="display: none;">
     <video id="camera-76" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(76)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(76)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(76)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-76" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
       <tr id="row-79">
      <td>11.5</td>
      <td class="observation_text"><b>Cable connections:</b>Ensure that cable connections are given at the corresponding location with respect to labels provided.</td>
     <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
     <td>
       <button class="add-image" onclick="showUploadOptions(79)">Add Image</button>
       <div class="upload-options" id="upload-options-79" style="display: none;">
      <button class="add-image" onclick="startCamera(79)">Camera</button>
      <label for="file-input-79" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-79" accept="image/*" multiple onchange="displayImages(this, 79)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-79"></div>
      <!-- Camera Container -->
     <div id="camera-container-79" style="display: none;">
     <video id="camera-79" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(79)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(79)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(79)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-79" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-80">
      <td>11.6</td>
      <td class="observation_text"><b>Cable routing:</b>Ensure that cables are routed properly without hanging on ground and tied properly with cable ties.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing Done</option>
          <option value="Routing Not Done">Routing Not Done</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(80)">Add Image</button>
       <div class="upload-options" id="upload-options-80" style="display: none;">
      <button class="add-image" onclick="startCamera(80)">Camera</button>
      <label for="file-input-80" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-80" accept="image/*" multiple onchange="displayImages(this, 80)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-80"></div>
      <!-- Camera Container -->
     <div id="camera-container-80" style="display: none;">
     <video id="camera-80" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(80)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(80)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(80)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-80" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-8022">
      <td>11.7</td>
      <td class="observation_text">EP Valve and Isolation Cock are installed on the stand where the IRU unit is mounted -- Mention In Status</td>
      <td class="select">
<select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Installed">Installed</option>
          <option value="Not Installed">Not Installed</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(8022)">Add Image</button>
       <div class="upload-options" id="upload-options-8022" style="display: none;">
      <button class="add-image" onclick="startCamera(8022)">Camera</button>
      <label for="file-input-8022" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-8022" accept="image/*" multiple onchange="displayImages(this, 8022)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-8022"></div>
      <!-- Camera Container -->
     <div id="camera-container-8022" style="display: none;">
     <video id="camera-80" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(8022)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(8022)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(8022)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-8022" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
     <tr id="row-8023">
      <td>11.8</td>
      <td class="observation_text">EP Solenoid Valve wiring: Red (+V) connected to Terminal 1, Black (–V) connected to Terminal 2 (Cable from MILB3)-- Mention In Status </td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>

      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(8023)">Add Image</button>
       <div class="upload-options" id="upload-options-8023" style="display: none;">
      <button class="add-image" onclick="startCamera(8023 )">Camera</button>
      <label for="file-input-8023" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-8023" accept="image/*" multiple onchange="displayImages(this, 8023)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-8023"></div>
      <!-- Camera Container -->
     <div id="camera-container-8023" style="display: none;">
     <video id="camera-8023" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(8023)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(8023)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(8023)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-8023" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
     <tr id="row-8024">
      <td>11.9</td>
      <td class="observation_text">Isolation Cock (N/C type) wiring: Red (+V) connected to Terminal 1, Black (–V) to Terminal 2 (Cable from MC26)-- Mention In Status </td>
      <td class="select">
       <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>

      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(8024)">Add Image</button>
       <div class="upload-options" id="upload-options-8024" style="display: none;">
      <button class="add-image" onclick="startCamera(8024)">Camera</button>
      <label for="file-input-8024" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-8024" accept="image/*" multiple onchange="displayImages(this, 8024)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-8024"></div>
      <!-- Camera Container -->
     <div id="camera-container-8024" style="display: none;">
     <video id="camera-8024" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(8024)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(8024)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(8024)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-8024" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
     <tr id="row-8025">
      <td>11.10</td>
      <td class="observation_text">Verify that the existing D2 Relay Valve and Manifold Unit are removed from previous location and New D2 Relay Valve is installed on the LE (Locomotive Equipment) unit-- -- Mention In Status</td>
      <td class="select">
<select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Installed">Installed</option>
          <option value="Not Installed">Not Installed</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(8025)">Add Image</button>
       <div class="upload-options" id="upload-options-8025" style="display: none;">
      <button class="add-image" onclick="startCamera(8025)">Camera</button>
      <label for="file-input-8025" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-8025" accept="image/*" multiple onchange="displayImages(this, 8025)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-8025"></div>
      <!-- Camera Container -->
     <div id="camera-container-8025" style="display: none;">
     <video id="camera-8025" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(8025)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(8025)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(8025)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-8025" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
     </tr>
     <tr id="row-8026">
      <td>11.11</td>
      <td class="observation_text">Wire connections: LE Unit Solenoid Valve wiring: Red (+V) connected to Terminal 1, Black (–V) to Terminal 2 (Cable from MILB1)-- Mention In Status </td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>

      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(8026)">Add Image</button>
       <div class="upload-options" id="upload-options-8026" style="display: none;">
      <button class="add-image" onclick="startCamera(8026)">Camera</button>
      <label for="file-input-8026" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-8026" accept="image/*" multiple onchange="displayImages(this, 8026)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-8026"></div>
      <!-- Camera Container -->
     <div id="camera-container-8026" style="display: none;">
     <video id="camera-8026" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(8026)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(8026)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(8026)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-8026" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
     
     </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display: none;" 
              onclick="updateObservation('11_0')">
        Update
      </button>
        <button type="button" id= "save-btn" style = "display: inline-block;" onclick="if(validateMandatoryImages('11_0')) { saveObservation('11_0'); }">Save</button>
        <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`
  } else if (section === "12.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading">PSJB TPM Units Fixing For CCB Type Loco Observations</h3>
       <div  class="table-container">
      <table class="observations" id="observations-section-12_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
         <tbody id="observations-tbody-12_0">
          <tr id="row-81">
      <td>12.1</td>
      <td class="observation_text"><b>PSJB Fixing:</b>Ensure existing PSJB removed and Handed over to Loco Shed Rail team, And install factory supplied PSJB</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Installed">Installed</option>
          <option value="Not Installed">Not Installed</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
        <button class="add-image" onclick="showUploadOptions(81)">Add Image</button>
        <div class="upload-options" id="upload-options-81" style="display: none;">
          <button class="add-image" onclick="startCamera(81)">Camera</button>
          <label for="file-input-81" class="upload-label">Upload from Device</label>
          <input type="file" id="file-input-81" accept="image/*" multiple onchange="displayImages(this, 81)">
        </div>
      <!-- Container for multiple images --> 
      <div id="image-container-81"></div>
      <!-- Camera Container -->
      <div id="camera-container-81" style="display: none;">
        <video id="camera-81" width="100%" height="auto" autoplay></video>
        <button class="add-image" onclick="captureImage(81)">Capture Image</button>
        <button class="add-image" onclick="stopCamera(81)">Stop Camera</button>
        <canvas id="canvas-81" style="display: none;"></canvas> <!-- Canvas to capture the image -->
      </div>
    </tr>

    <tr id="row-82">
      <td>12.2</td>
      <td class="observation_text"><b>TPM Unit Fixing:</b>Ensure that TPM module is installed right side to the MPIO module</td>
      <td class="select">
       <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Installed">Installed</option>
          <option value="Not Installed">Not Installed</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
        <button class="add-image" onclick="showUploadOptions(82)">Add Image</button>
        <div class="upload-options" id="upload-options-82" style="display: none;">
          <button class="add-image" onclick="startCamera(82)">Camera</button>
          <label for="file-input-82" class="upload-label">Upload from Device</label>
          <input type="file" id="file-input-82" accept="image/*" multiple onchange="displayImages(this, 82)">
         </div>
      <!-- Container for multiple images --> 
      <div id="image-container-82"></div>
      <!-- Camera Container -->
      <div id="camera-container-82" style="display: none;">
        <video id="camera-82" width="100%" height="auto" autoplay></video>
        <button class="add-image" onclick="captureImage(82)">Capture Image</button>
        <button class="add-image" onclick="stopCamera(82)">Stop Camera</button>
        <canvas id="canvas-82" style="display: none;"></canvas> <!-- Canvas to capture the image -->
      </div>
    </tr>
    <tr id="row-83">
      <td>12.3</td>
      <td class="observation_text"><b>Fixing of PSJB and TPM:</b>Ensure that PSJB and TPM units fixing holes are matching with supporting clamps</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Matching">Matching</option>
          <option value="Not Matching">Not Matching</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(83)">Add Image</button>
       <div class="upload-options" id="upload-options-83" style="display: none;">
      <button class="add-image" onclick="startCamera(83)">Camera</button>
      <label for="file-input-83" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-83" accept="image/*" multiple onchange="displayImages(this, 83)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-83"></div>
      <!-- Camera Container -->
     <div id="camera-container-83" style="display: none;">
     <video id="camera-83" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(83)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(83)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(83)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-83" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-84">
      <td>12.4</td>
      <td class="observation_text"><b>Cable connections:</b>Ensure that cable connections are given at the corresponding location with respect to labels provided.</td>
      <td class="select">
           <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(84)">Add Image</button>
       <div class="upload-options" id="upload-options-84" style="display: none;">
      <button class="add-image" onclick="startCamera(84)">Camera</button>
      <label for="file-input-84" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-84" accept="image/*" multiple onchange="displayImages(this, 84)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-84"></div>
      <!-- Camera Container -->
     <div id="camera-container-84" style="display: none;">
     <video id="camera-84" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(84)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(84)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(84)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-84" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-85">
      <td>12.5</td>
      <td class="observation_text"><b>Cable routing:</b>Ensure that cables are routed properly without hanging on ground and tied properly with cable ties.</td>
      <td class="select">
          <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing Done</option>
          <option value="Routing Not Done">Routing Not Done</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(85)">Add Image</button>
       <div class="upload-options" id="upload-options-85" style="display: none;">
      <button class="add-image" onclick="startCamera(85)">Camera</button>
      <label for="file-input-85" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-85" accept="image/*" multiple onchange="displayImages(this, 85)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-85"></div>
      <!-- Camera Container -->
     <div id="camera-container-85" style="display: none;">
     <video id="camera-85" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(85)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(85)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(85)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-85" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
     </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display: none;" 
              onclick="updateObservation('12_0')">
        Update
      </button>
        <button type="button" id= "save-btn" style = "display: inline-block;"  onclick="saveObservation('12_0')">Save</button>
        <button id="get-details-btn" onclick="getDetails()">Get Details</button>
        
      </div>
    ;`
  } else if (section === "13.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading"> SIFA Valve Fixing For CCB Type Loco Observations</h3>
       <div class="table-container">
      <table class="observations" id="observations-section-13_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
         <tbody id="observations-tbody-13_0">
          <tr id="row-86">
      <td>13.1</td>
      <td class="observation_text">Ensure SIFA Valve is installed with mounting frame under DBC panel in CAB-1 side(NOTE: Ensure that SIFA VALVE SHOULD BE CLOSED CONDITION WHILE INSTALLATION)</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Installed">Installed</option>
          <option value="Not Installed">Not Installed</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(86)">Add Image</button>
       <div class="upload-options" id="upload-options-86" style="display: none;">
      <button class="add-image" onclick="startCamera(86)">Camera</button>
      <label for="file-input-86" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-86" accept="image/*" multiple onchange="displayImages(this, 86)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-86"></div>
      <!-- Camera Container -->
     <div id="camera-container-86" style="display: none;">
     <video id="camera-86" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(86)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(86)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(86)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-86" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>

    <tr id="row-87">
      <td>13.2</td>
      <td class="observation_text">Ensure that mounting location of the SIFA valve should be easy for operations and maintenance.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(87)">Add Image</button>
       <div class="upload-options" id="upload-options-87" style="display: none;">
      <button class="add-image" onclick="startCamera(87)">Camera</button>
      <label for="file-input-87" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-87" accept="image/*" multiple onchange="displayImages(this, 87)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-87"></div>
      <!-- Camera Container -->
     <div id="camera-container-87" style="display: none;">
     <video id="camera-87" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(87)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(87)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(87)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-87" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-88">
      <td>13.3</td>
      <td class="observation_text">Ensure SIFA valve manifold should be fixed to mounting frame by using hardware provided along with the installation Kit.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Fixed">Fixed</option>
          <option value="Not Fixed">Not Fixed</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
        <button class="add-image" onclick="showUploadOptions(88)">Add Image</button>
        <div class="upload-options" id="upload-options-88" style="display: none;">
          <button class="add-image" onclick="startCamera(88)">Camera</button>
          <label for="file-input-88" class="upload-label">Upload from Device</label>
          <input type="file" id="file-input-88" accept="image/*" multiple onchange="displayImages(this, 88)">
         </div>
        <!-- Container for multiple images --> 
        <div id="image-container-88"></div>
        <!-- Camera Container -->
      <div id="camera-container-88" style="display: none;">
        <video id="camera-88" width="100%" height="auto" autoplay></video>
        <button class="add-image" onclick="captureImage(88)">Capture Image</button>
        <button class="add-image" onclick="stopCamera(88)">Stop Camera</button>
        <canvas id="canvas-88" style="display: none;"></canvas> <!-- Canvas to capture the image -->
      </div>
    </tr>
    <tr id="row-89">
      <td>13.4</td>
      <td class="observation_text"><b>Welding:</b>Ensure that welded portion should be neat and clean.Check that there is no welding gaps and cracks</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(89)">Add Image</button>
       <div class="upload-options" id="upload-options-89" style="display: none;">
      <button class="add-image" onclick="startCamera(89)">Camera</button>
      <label for="file-input-89" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-89" accept="image/*" multiple onchange="displayImages(this, 89)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-89"></div>
      <!-- Camera Container -->
     <div id="camera-container-89" style="display: none;">
     <video id="camera-89" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(89)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(89)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(89)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-89" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
     </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display: none;" 
              onclick="updateObservation('13_0')">
        Update
      </button>
        <button type="button" id= "save-btn" style = "display: inline-block;"  onclick="saveObservation('13_0')">Save</button>
        <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`
  } else if (section === "14.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading">PGs and SpeedoMeter Units Fixing Observations</h3>
       <div class="table-container">
      <table class="observations" id="observations-section-14_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
         <tbody id="observations-tbody-14_0">
          <tr id="row-90">
      <td>14.1</td>
      <td class="observation_text"<b>PG1 and PG2 Installation:</b>Ensure that PG1(Left from LP of CAB1) and PG2 (Right from LP of CAB1) are installed on allotted axles (WAP5=wheel 2and3, WAP7=whee2and5) of locomotives on left and right side.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Installed">Installed</option>
          <option value="Not Installed">Not Installed</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(90)">Add Image</button>
       <div class="upload-options" id="upload-options-90" style="display: none;">
      <button class="add-image" onclick="startCamera(90)">Camera</button>
      <label for="file-input-90" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-90" accept="image/*" multiple onchange="displayImages(this, 90)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-90"></div>
      <!-- Camera Container -->
     <div id="camera-container-90" style="display: none;">
     <video id="camera-90" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(90)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(90)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(90)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-90" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>

    <tr id="row-91">
      <td>14.2</td>
      <td class="observation_text"><b>Washer Insertion:</b>Verify that M12 spring is correctly inserted in the drive pin.</td>
     <td class="select">
        <select id="status-dropdown"  onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(91)">Add Image</button>
       <div class="upload-options" id="upload-options-91" style="display: none;">
      <button class="add-image" onclick="startCamera(91)">Camera</button>
      <label for="file-input-91" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-91" accept="image/*" multiple onchange="displayImages(this, 91)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-91"></div>
      <!-- Camera Container -->
     <div id="camera-container-91" style="display: none;">
     <video id="camera-91" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(91)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(91)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(91)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-91" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-92">
      <td>14.3</td>
      <td class="observation_text"><b>Drive Pin Fixing:</b><br>
Ensure drive pin length before installation as per Loco type,(loco type WAP7=60 mm, WAP5=76mm, EMU=90mm).<br>
Ensure the drive pin is securely fixed with LOCTITE 542.<br>
Verify that the torque applied is 76N·m using a calibrated torque wrench.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Torquing done">Torquing done</option>
          <option value="Torquing Not done">Torquing Not done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(92)">Add Image</button>
       <div class="upload-options" id="upload-options-92" style="display: none;">
      <button class="add-image" onclick="startCamera(92)">Camera</button>
      <label for="file-input-92" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-92" accept="image/*" multiple onchange="displayImages(this, 92)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-92"></div>
      <!-- Camera Container -->
     <div id="camera-container-92" style="display: none;">
     <video id="camera-92" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(92)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(92)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(92)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-92" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-93">
      <td>14.4</td>
      <td class="observation_text"><b>Gasket Lock Plate Placement:</b>Ensure the Gasket Lock Plate is correctly positioned on the axle cover without any misalignment.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Positioning done">Positioning done</option>
          <option value="Positioning Not done">Positioning Not done </option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(93)">Add Image</button>
       <div class="upload-options" id="upload-options-93" style="display: none;">
      <button class="add-image" onclick="startCamera(93)">Camera</button>
      <label for="file-input-93" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-93" accept="image/*" multiple onchange="displayImages(this, 93)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-93"></div>
      <!-- Camera Container -->
     <div id="camera-container-93" style="display: none;">
     <video id="camera-93" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(93)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(93)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(93)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-93" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-94">
      <td>14.5</td>
      <td class="observation_text"><b>PG Coupler Ring Placement:</b><br>
Verify that PG coupler ring is positioned correctly on the gasket.<br>
Ensure that the label (PG1 / PG2) is clearly visible at the top end.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Positioning done">Positioning done</option>
          <option value="Positioning Not done">Positioning Not done </option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(94)">Add Image</button>
       <div class="upload-options" id="upload-options-94" style="display: none;">
      <button class="add-image" onclick="startCamera(94)">Camera</button>
      <label for="file-input-94" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-94" accept="image/*" multiple onchange="displayImages(this, 94)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-94"></div>
      <!-- Camera Container -->
     <div id="camera-container-94" style="display: none;">
     <video id="camera-94" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(94)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(94)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(94)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-94" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-95">
      <td>14.6</td>
      <td class="observation_text"><b>Coupler Ring Alignment:</b>Confirm that the selected PG (PG1 / PG2) determines the alignment of four out of eight holes with the axle cover.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(95)">Add Image</button>
       <div class="upload-options" id="upload-options-95" style="display: none;">
      <button class="add-image" onclick="startCamera(95)">Camera</button>
      <label for="file-input-95" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-95" accept="image/*" multiple onchange="displayImages(this, 95)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-95"></div>
      <!-- Camera Container -->
     <div id="camera-container-95" style="display: none;">
     <video id="camera-95" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(95)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(95)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(95)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-95" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-96">
      <td>14.7</td>
      <td class="observation_text"><b>Coupler Ring Fixing:</b><br>
Ensure the CSK Hex Socket screws size M10×30mm-SS are used to fix the coupler ring with LOCTITE 542.<br>
Check that screws are tightened to the specified torque of 40 N.m using a calibrated torque wrench.(Note: Bolthead surface should be flush.)</td>
      <td class="select">
          <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Torquing done">Torquing done</option>
          <option value="Torquing Not done">Torquing Not done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(96)">Add Image</button>
       <div class="upload-options" id="upload-options-96" style="display: none;">
      <button class="add-image" onclick="startCamera(96)">Camera</button>
      <label for="file-input-96" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-96" accept="image/*" multiple onchange="displayImages(this, 96)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-96"></div>
      <!-- Camera Container -->
     <div id="camera-container-96" style="display: none;">
     <video id="camera-96" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(96)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(96)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(96)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-96" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-97">
      <td>14.8</td>
      <td class="observation_text"><b>Gasket PG Placement:</b>Verify that "Gasket PG" is correctly placed on the coupler ring without any gaps or misalignment.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(97)">Add Image</button>
       <div class="upload-options" id="upload-options-97" style="display: none;">
      <button class="add-image" onclick="startCamera(97)">Camera</button>
      <label for="file-input-97" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-97" accept="image/*" multiple onchange="displayImages(this, 97)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-97"></div>
      <!-- Camera Container -->
     <div id="camera-container-97" style="display: none;">
     <video id="camera-97" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(97)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(97)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(97)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-97" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-98">
      <td>14.9</td>
      <td class="observation_text"><b>PG1 / PG2 Insertion:</b><br>
Ensure PG1 / PG2 is inserted correctly into the axle cover.<br>
Confirm that driving fork is aligned with the drive pin before proceeding.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Aligned">Aligned</option>
          <option value="Not Aligned">Not Aligned</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(98)">Add Image</button>
       <div class="upload-options" id="upload-options-98" style="display: none;">
      <button class="add-image" onclick="startCamera(98)">Camera</button>
      <label for="file-input-98" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-98" accept="image/*" multiple onchange="displayImages(this, 98)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-98"></div>
      <!-- Camera Container -->
     <div id="camera-container-98" style="display: none;">
     <video id="camera-98" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(98)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(98)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(98)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-98" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-99">
      <td>14.10</td>
      <td class="observation_text"><b>PG Alignment:</b>Ensure that all eight holes on PG align perfectly with holes on the gasket and coupler ring.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Aligned">Aligned</option>
          <option value="Not Aligned">Not Aligned</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(99)">Add Image</button>
       <div class="upload-options" id="upload-options-99" style="display: none;">
      <button class="add-image" onclick="startCamera(99)">Camera</button>
      <label for="file-input-99" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-99" accept="image/*" multiple onchange="displayImages(this, 99)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-99"></div>
      <!-- Camera Container -->
     <div id="camera-container-99" style="display: none;">
     <video id="camera-99" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(99)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(99)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(99)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-99" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-100">
      <td>14.11</td>
      <td class="observation_text"><b>PG Fixing with M8 Bolts:</b><br>
Check that the M8×25mm bolts are properly installed with LOCTITE 542.<br>
Ensure both spring and plain washers are used.</td>
      <td class="select">
       <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Installed">Installed</option>
          <option value="Not Installed">Not Installed</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(100)">Add Image</button>
       <div class="upload-options" id="upload-options-100" style="display: none;">
      <button class="add-image" onclick="startCamera(100)">Camera</button>
      <label for="file-input-100" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-100" accept="image/*" multiple onchange="displayImages(this, 100)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-100"></div>
      <!-- Camera Container -->
     <div id="camera-container-100" style="display: none;">
     <video id="camera-100" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(100)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(100)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(100)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-100" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-101">
      <td>14.12</td>
      <td class="observation_text"><b>M8 Bolt Torque Check:</b>Verify that all M8 bolts are tightened to 25 N.m using a calibrated torque wrench.Marking with green/yellow paint.</td>
      <td class="select">
       <select id="status-dropdown"  onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Torquing done">Torquing done</option>
                <option value="Torquing Not done">Torquing Not done</option>
              </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(101)">Add Image</button>
       <div class="upload-options" id="upload-options-101" style="display: none;">
      <button class="add-image" onclick="startCamera(101)">Camera</button>
      <label for="file-input-101" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-101" accept="image/*" multiple onchange="displayImages(this, 101)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-101"></div>
      <!-- Camera Container -->
     <div id="camera-container-101" style="display: none;">
     <video id="camera-101" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(101)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(101)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(101)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-101" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
      <tr id="row-340">
      <td>14.13</td>
      <td class="observation_text"><b>Final Position Check:</b>Ensure that the final installed positions of PG1 and PG2 match the specified locations.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Matching">Matching</option>
          <option value="Not Matching">Not Matching</option>
        </select>

      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(340)">Add Image</button>
       <div class="upload-options" id="upload-options-340" style="display: none;">
      <button class="add-image" onclick="startCamera(340)">Camera</button>
      <label for="file-input-340" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-340" accept="image/*" multiple onchange="displayImages(this, 340)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-340"></div>
      <!-- Camera Container -->
     <div id="camera-container-340" style="display: none;">
     <video id="camera-340" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(340)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(340)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(340)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-340" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-341">
      <td>14.14</td>
      <td class="observation_text"><b>Cable routing:</b>Ensure that PG cables routing made properly with metal clamps / cable ties</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing Done</option>
          <option value="Routing Not Done">Routing Not Done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(341)">Add Image</button>
       <div class="upload-options" id="upload-options-341" style="display: none;">
      <button class="add-image" onclick="startCamera(341)">Camera</button>
      <label for="file-input-341" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-341" accept="image/*" multiple onchange="displayImages(this, 341)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-341"></div>
      <!-- Camera Container -->
     <div id="camera-container-341" style="display: none;">
     <video id="camera-341" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(341)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(341)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(341)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-341" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-342">
      <td>14.15</td>
      <td class="observation_text"><b>Speedometer Boxes fixing:</b>
Is each Speedometer Interface Unit mounted on the locomotive chassis near its corresponding Pulse Generator?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(342)">Add Image</button>
       <div class="upload-options" id="upload-options-342" style="display: none;">
      <button class="add-image" onclick="startCamera(342)">Camera</button>
      <label for="file-input-342" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-342" accept="image/*" multiple onchange="displayImages(this, 342)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-342"></div>
      <!-- Camera Container -->
     <div id="camera-container-342" style="display: none;">
     <video id="camera-342" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(342)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(342)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(342)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-342" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
<tr id="row-392">
      <td>14.15.1</td>
      <td class="observation_text"><b>Speedometer Boxes fixing</b>: 
Is the Speedometer Interface Unit orientation such that cables connect to the Pulse Generator on one side and the Loco Kavach Unit on the other side without crisscrossing?
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(392)">Add Image</button>
       <div class="upload-options" id="upload-options-392" style="display: none;">
      <button class="add-image" onclick="startCamera(392)">Camera</button>
      <label for="file-input-392" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-392" accept="image/*" multiple onchange="displayImages(this, 392)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-392"></div>
      <!-- Camera Container -->
     <div id="camera-container-392" style="display: none;">
     <video id="camera-392" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(392)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(392)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(392)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-392" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>

<tr id="row-382">
      <td>14.15.2</td>
      <td class="observation_text"><b>Speedometer Boxes fixing</b>: 
Speedometer holes and fixing clamp holes are to be matched evenly. Verify the M6 bolts torque 10 N-M.Marking with green/Yellow paint</td>
      <td class="select">   
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Torquing done">Torquing done</option>
          <option value="Torquing Not done">Torquing Not done</option>
        </select>

      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(382)">Add Image</button>
       <div class="upload-options" id="upload-options-382" style="display: none;">
      <button class="add-image" onclick="startCamera(382)">Camera</button>
      <label for="file-input-382" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-382" accept="image/*" multiple onchange="displayImages(this, 382)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-382"></div>
      <!-- Camera Container -->
     <div id="camera-container-382" style="display: none;">
     <video id="camera-382" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(382)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(382)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(382)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-382" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>

    <tr id="row-343">
      <td>14.16</td>
      <td class="observation_text"><b>Welding of supporting clamps:</b>Ensure that speedometer supporting clamps are welded without any gaps and cracks.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Welding done">Welding Done </option>
          <option value="Welding not done">Welding not done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(343)">Add Image</button>
       <div class="upload-options" id="upload-options-343" style="display: none;">
      <button class="add-image" onclick="startCamera(343)">Camera</button>
      <label for="file-input-343" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-343" accept="image/*" multiple onchange="displayImages(this, 343)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-343"></div>
      <!-- Camera Container -->
     <div id="camera-container-343" style="display: none;">
     <video id="camera-343" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(343)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(343)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(343)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-343" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
   <tr id="row-344">
      <td>14.17</td>
      <td class="observation_text"><b>Speedometer Cables:</b>Ensure that cables from PG to Speedometers and from speedometer units to Loco Kavach unit are connected properly.</td>
      <td class="select">
       <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(344)">Add Image</button>
       <div class="upload-options" id="upload-options-344" style="display: none;">
      <button class="add-image" onclick="startCamera(344)">Camera</button>
      <label for="file-input-344" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-344" accept="image/*" multiple onchange="displayImages(this, 344)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-344"></div>
      <!-- Camera Container -->
     <div id="camera-container-344" style="display: none;">
     <video id="camera-344" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(344)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(344)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(344)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-344" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-345">
      <td>14.18</td>
      <td class="observation_text"><b>Pulse Generator & Speedometer Interface Unit Connection:</b><br>
Is PG1 connected to the Speedometer Interface Unit with Part No.6000052976?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(345)">Add Image</button>
       <div class="upload-options" id="upload-options-345" style="display: none;">
      <button class="add-image" onclick="startCamera(345)">Camera</button>
      <label for="file-input-345" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-345" accept="image/*" multiple onchange="displayImages(this, 345)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-345"></div>
      <!-- Camera Container -->
     <div id="camera-container-345" style="display: none;">
     <video id="camera-345" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(345)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(345)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(345)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-345" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-3450">
      <td>14.18.1</td>
      <td class="observation_text"><b>Pulse Generator and Speedometer Interface Unit Connection:</b><br>
Is PG2  connected to the Speedometer Interface Unit with Part No.6000052977?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(3450)">Add Image</button>
       <div class="upload-options" id="upload-options-3450" style="display: none;">
      <button class="add-image" onclick="startCamera(3450)">Camera</button>
      <label for="file-input-3450" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-3450" accept="image/*" multiple onchange="displayImages(this, 34500)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-3450"></div>
      <!-- Camera Container -->
     <div id="camera-container-3450" style="display: none;">
     <video id="camera-3450" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(3450)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(3450)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(3450)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-3450" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-3476">
      <td>14.19</td>
      <td class="observation_text">Is each Speedometer Interface Unit correctly connected to the Loco Kavach Unit?</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(3476)">Add Image</button>
       <div class="upload-options" id="upload-options-3476" style="display: none;">
      <button class="add-image" onclick="startCamera(3476)">Camera</button>
      <label for="file-input-3476" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-3476" accept="image/*" multiple onchange="displayImages(this, 3476)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-3476"></div>
      <!-- Camera Container -->
     <div id="camera-container-3476" style="display: none;">
     <video id="camera-3476" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(3476)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(3476)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(3476)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-3476" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-346">
      <td>14.20</td>
      <td class="observation_text"><b>Cable routing:</b>Ensure that external cables are routed to their respective speedometer units</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing Done</option>
          <option value="Routing Not Done">Routing Not Done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(346)">Add Image</button>
       <div class="upload-options" id="upload-options-346" style="display: none;">
      <button class="add-image" onclick="startCamera(346)">Camera</button>
      <label for="file-input-346" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-346" accept="image/*" multiple onchange="displayImages(this, 346)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-346"></div>
      <!-- Camera Container -->
     <div id="camera-container-346" style="display: none;">
     <video id="camera-346" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(346)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(346)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(346)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-346" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
   <tr id="row-347">
      <td>14.21</td>
      <td class="observation_text"><b>Connector locking :</b>Ensure that the external cable circular connectors are properly locked with speedometer box unit receptacles.</td>
      <td class="select">
         <select id="status-dropdown"  onchange="highlightSelect(this)">
                <option value="Select">Select</option>
                <option value="Locked">Locked</option>
                <option value="Not Locked">Not Locked</option>
              </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(347)">Add Image</button>
       <div class="upload-options" id="upload-options-347" style="display: none;">
      <button class="add-image" onclick="startCamera(347)">Camera</button>
      <label for="file-input-347" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-347" accept="image/*" multiple onchange="displayImages(this, 347)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-347"></div>
      <!-- Camera Container -->
     <div id="camera-container-347" style="display: none;">
     <video id="camera-347" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(347)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(347)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(347)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-347" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
     </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display: none;" 
              onclick="updateObservation('14_0')">
        Update
      </button>
        <button type="button" id= "save-btn" style = "display: inline-block;" onclick="if(validateMandatoryImages('14_0')) { saveObservation('14_0'); }">Save</button>
         <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`
  } else if (section === "15.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading">RFID Reader Assembly Observations</h3>
       <div  class="table-container">
      <table class="observations" id="observations-section-15_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
         <tbody id="observations-tbody-15_0">
          <tr id="row-102">
      <td>15.1</td>
      <td class="observation_text">Is each RFID reader installed at a distance of 1 to 3 meters from the end of cattle guard?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Installed">Installed</option>
          <option value="Not Installed">Not Installed</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(102)">Add Image</button>
       <div class="upload-options" id="upload-options-102" style="display: none;">
      <button class="add-image" onclick="startCamera(102)">Camera</button>
      <label for="file-input-102" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-102" accept="image/*" multiple onchange="displayImages(this, 102)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-102"></div>
      <!-- Camera Container -->
     <div id="camera-container-102" style="display: none;">
     <video id="camera-102" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(102)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(102)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(102)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-102" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>

    <tr id="row-103">
      <td>15.2</td>
      <td class="observation_text"><b>Welding quality:</b>Ensure Stud welding/Arc Welding is done properly, such that the RFID Reader can be  withstand for loco vibrations during running and Carried out DPT Test. </td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(103)">Add Image</button>
       <div class="upload-options" id="upload-options-103" style="display: none;">
      <button class="add-image" onclick="startCamera(103)">Camera</button>
      <label for="file-input-103" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-103" accept="image/*" multiple onchange="displayImages(this, 103)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-103"></div>
      <!-- Camera Container -->
     <div id="camera-container-103" style="display: none;">
     <video id="camera-103" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(103)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(103)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(103)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-103" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-10333">
      <td>15.2.1</td>
      <td class="observation_text"><b>Welding quality:</b> Has Ballata been placed between the RFID bracket and Loco chassis frame,M12 bolts tightened with Nylock nuts,torque verified at 20 N-m, and cotter pin inserted into the stud hole? </td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(10333)">Add Image</button>
       <div class="upload-options" id="upload-options-10333" style="display: none;">
      <button class="add-image" onclick="startCamera(10333)">Camera</button>
      <label for="file-input-10333" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-10333" accept="image/*" multiple onchange="displayImages(this, 10333)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-10333"></div>
      <!-- Camera Container -->
     <div id="camera-container-10333" style="display: none;">
     <video id="camera-10333" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(10333)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(10333)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(10333)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-10333" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    
    <tr id="row-104">
      <td>15.3</td>
      <td class="observation_text"><b>Channels tightness:</b>Verify the tightness for channels fixing screws (M8X16mm) by using torque wrench (25N-M).marking with green/yellow pain</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Torquing done">Torquing done</option>
          <option value="Torquing Not done">Torquing Not done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
     <td>
       <button class="add-image" onclick="showUploadOptions(104)">Add Image</button>
       <div class="upload-options" id="upload-options-104" style="display: none;">
      <button class="add-image" onclick="startCamera(104)">Camera</button>
      <label for="file-input-104" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-104" accept="image/*" multiple onchange="displayImages(this, 104)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-104"></div>
      <!-- Camera Container -->
     <div id="camera-container-104" style="display: none;">
     <video id="camera-104" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(104)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(104)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(104)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-104" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-105">
      <td>15.4</td>
      <td class="observation_text">Has the bottom surface of the RFID reader been adjusted and fixed at a height of 450 ± 50 mm from the rail head?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(105)">Add Image</button>
       <div class="upload-options" id="upload-options-105" style="display: none;">
      <button class="add-image" onclick="startCamera(105)">Camera</button>
      <label for="file-input-105" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-105" accept="image/*" multiple onchange="displayImages(this, 105)">
      </div>
      <!-- Container for multiple images --> 
     <div id="image-container-105"></div>
     <!-- Camera Container -->
     <div id="camera-container-105" style="display: none;">
     <video id="camera-105" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(105)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(105)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(105)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-105" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-507">
      <td>15.5</td>
      <td class="observation_text">Is one end of the Chain/Sling welded to locomotive chassis, away from the mounting bracket weld joint?</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(507)">Add Image</button>
       <div class="upload-options" id="upload-options-507" style="display: none;">
      <button class="add-image" onclick="startCamera(507)">Camera</button>
      <label for="file-input-507" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-507" accept="image/*" multiple onchange="displayImages(this, 507)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-507"></div>
      <!-- Camera Container -->
     <div id="camera-container-507" style="display: none;">
     <video id="camera-507" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(507)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(507)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(507)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-507" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
<tr id="row-607">
      <td>15.5.1</td>
      <td class="observation_text">
Is other end of the Chain/Sling securely fastened to RFID reader by using bolt provided in the Loco Kavach Installation Kit?</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(607)">Add Image</button>
       <div class="upload-options" id="upload-options-607" style="display: none;">
      <button class="add-image" onclick="startCamera(607)">Camera</button>
      <label for="file-input-607" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-607" accept="image/*" multiple onchange="displayImages(this, 607)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-607"></div>
      <!-- Camera Container -->
     <div id="camera-container-607" style="display: none;">
     <video id="camera-607" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(607)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(607)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(607)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-607" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>

    <tr id="row-108">
      <td>15.6</td>
      <td class="observation_text">Is mud guard (from the Loco Kavach Installation Kit) been fixed to RFID reader mounting bracket,installed in front of each RFID reader on the cattle guard side, using the supplied bolts and washers?</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Fixed">Fixed</option>
          <option value="Not Fixed">Not Fixed</option>
        </select>

      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(108)">Add Image</button>
       <div class="upload-options" id="upload-options-108" style="display: none;">
      <button class="add-image" onclick="startCamera(108)">Camera</button>
      <label for="file-input-108" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-108" accept="image/*" multiple onchange="displayImages(this, 108)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-108"></div>
      <!-- Camera Container -->
     <div id="camera-container-108" style="display: none;">
     <video id="camera-108" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(108)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(108)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(108)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-108" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
     <tr id="row-109">
      <td>15.7</td>
      <td class="observation_text"><b>Cable trench:</b>Verify that RFID reader cables are routed properly through the loco trench without any overlaps and over-stress. Ensure that cable should not have any sharp bends in routing and mill connectors without any damage while routing.</td>
      <td class="select"><select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Routing Done">Routing Done</option>
          <option value="Routing Not Done">Routing Not Done</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(109)">Add Image</button>
       <div class="upload-options" id="upload-options-109" style="display: none;">
      <button class="add-image" onclick="startCamera(109)">Camera</button>
      <label for="file-input-109" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-109" accept="image/*" multiple onchange="displayImages(this, 109)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-109"></div>
      <!-- Camera Container -->
     <div id="camera-container-109" style="display: none;">
     <video id="camera-109" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(109)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(109)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(109)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-109" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-110">
      <td>15.8</td>
      <td class="observation_text"><b>Connector connectivity:</b>Ensure that MIL connectors connectivity as per the connectivity drawing.</td>
      <td class="select">
         <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(110)">Add Image</button>
       <div class="upload-options" id="upload-options-110" style="display: none;">
      <button class="add-image" onclick="startCamera(110)">Camera</button>
      <label for="file-input-110" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-110" accept="image/*" multiple onchange="displayImages(this, 110)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-110"></div>
      <!-- Camera Container -->
     <div id="camera-container-110" style="display: none;">
     <video id="camera-110" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(110)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(110)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(110)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-110" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-111">
      <td>15.9</td>
      <td class="observation_text"><b>RFID -1 connectivity:</b>Ensure that RFID Reader-1 is connected to MC6 at Loco Kavach.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(111)">Add Image</button>
       <div class="upload-options" id="upload-options-111" style="display: none;">
      <button class="add-image" onclick="startCamera(111)">Camera</button>
      <label for="file-input-111" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-111" accept="image/*" multiple onchange="displayImages(this, 111)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-111"></div>
      <!-- Camera Container -->
     <div id="camera-container-111" style="display: none;">
     <video id="camera-111" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(111)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(111)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(111)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-111" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-112">
      <td>15.10</td>
      <td class="observation_text"><b>RFID -2 connectivity:</b>Ensure that RFID Reader-2 is connected to MC7 at Loco Kavach.</td>
        <td class = "select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(112)">Add Image</button>
       <div class="upload-options" id="upload-options-112" style="display: none;">
      <button class="add-image" onclick="startCamera(112)">Camera</button>
      <label for="file-input-112" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-112" accept="image/*" multiple onchange="displayImages(this, 112)">
       </div>
       <!-- Container for multiple images --> 
       <div id="image-container-112"></div>
       <!-- Camera Container -->
     <div id="camera-container-112" style="display: none;">
     <video id="camera-112" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(112)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(112)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(112)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-112" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
   
   <tr id="row-765">
      <td>15.11</td>
      <td class="observation_text"><b>Circular connectors:</b>Ensure that the circular connectors are properly locked with RFID box unit receptacles.</td>
        <td class = "select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Locked">Locked</option>
          <option value="Not Locked">Not Locked</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(765)">Add Image</button>
       <div class="upload-options" id="upload-options-765" style="display: none;">
      <button class="add-image" onclick="startCamera(765)">Camera</button>
      <label for="file-input-765" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-765" accept="image/*" multiple onchange="displayImages(this, 765)">
       </div>
       <!-- Container for multiple images --> 
       <div id="image-container-765"></div>
       <!-- Camera Container -->
     <div id="camera-container-765" style="display: none;">
     <video id="camera-765" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(765)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(765)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(765)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-765" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>

     </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display : none;" 
              onclick="updateObservation('15_0')">
        Update
      </button>
       <button type="button" id= "save-btn" style = "display: inline-block;" onclick="if(validateMandatoryImages('15_0')) { saveObservation('15_0'); }">Save</button>
       <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`
  }  
else if (section === "16.0") {
    // For all other sections, add Save Observation button
    mainContent.innerHTML += `
      <h3 class="section-heading"> Auto Horn Installation </h3>
       <div  class="table-container">
      <table class="observations" id="observations-section-16_0">
        <thead>
          <tr>
            <th>S_No</th>
            <th>Description</th>
            <th>Observation</th>
            <th>Remarks/Comments</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody id="observations-tbody-16_0">
          <tr id="row-766">
      <td>16.1</td>
      <td class="observation_text"><b>Pneumatic fittings:</b>Confirm that all pipes and fittings used in the assembly are from the approved BOM and sourced from the IandC kit supplied by the factory.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(766)">Add Image</button>
       <div class="upload-options" id="upload-options-766" style="display: none;">
      <button class="add-image" onclick="startCamera(766)">Camera</button>
      <label for="file-input-766" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-766" accept="image/*" multiple onchange="displayImages(this, 766)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-766"></div>
      <!-- Camera Container -->
     <div id="camera-container-766" style="display: none;">
     <video id="camera-766" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(766)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(766)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(766)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-766" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>

    <tr id="row-767">
      <td>16.2</td>
      <td class="observation_text"><b>Copper Pipes:</b> Confirm that copper pipes are bent using appropriate bending tool, and that  there no kinks or sharp bends in the pipe.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
       <td>
       <button class="add-image" onclick="showUploadOptions(767)">Add Image</button>
       <div class="upload-options" id="upload-options-767" style="display: none;">
      <button class="add-image" onclick="startCamera(767)">Camera</button>
      <label for="file-input-767" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-767" accept="image/*" multiple onchange="displayImages(this, 767)">
      </div>
      <!-- Container for multiple images --> 
      <div id="image-container-72"></div>
      <!-- Camera Container -->
     <div id="camera-container-72" style="display: none;">
     <video id="camera-72" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(72)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(72)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(72)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-72" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-768">
      <td>16.3</td>
      <td class="observation_text"><b>Copper Tube :</b>Ensure that copper tube length is measured with respect to the connectivity  from loco pneumatics MR to ON/OFF Ball Cock, Solenoid Valve to HT Horn MR Pipe arrangements, as per approved drawing for WAP5, WAP7, WAG9, WAG7 and WAP4. This pneumatic arrangement is not required for Diesele locos.</td>
      <td class="select">
       <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(768)">Add Image</button>
       <div class="upload-options" id="upload-options-768" style="display: none;">
      <button class="add-image" onclick="startCamera(768)">Camera</button>
      <label for="file-input-768" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-768" accept="image/*" multiple onchange="displayImages(this, 768)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-768"></div>
      <!-- Camera Container -->
      <div id="camera-container-768" style="display: none;">
     <video id="camera-768" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(768)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(768)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(768)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-768" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
   <tr id="row-769">
      <td>16.4</td>
      <td class="observation_text"><b>Copper pipe connections:</b>Ensure that copper pipe connections made properly with                        approved make (Ex. Fluid Control) ferrules and TEE-joints used.</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(769)">Add Image</button>
       <div class="upload-options" id="upload-options-769" style="display: none;">
      <button class="add-image" onclick="startCamera(769)">Camera</button>
      <label for="file-input-768" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-768" accept="image/*" multiple onchange="displayImages(this, 769)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-769"></div>
      <!-- Camera Container -->
      <div id="camera-container-769" style="display: none;">
     <video id="camera-769" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(769)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(769)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(769)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-769" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    <tr id="row-800">
      <td>16.5</td>
      <td class="observation_text">Auto Horn Solenoid valve connections(Red +ve) to be connected at terminal1 and (Black -ve) to be connected at terminal2. This cable part of CAB I/P wiring of TB21 (Red +ve) & TB22 (Black -ve). This cable part of CAB I/P wiring of TB21 (Red +ve) & TB22 (Black -ve).</td>
      <td class="select">
        <select id="status-dropdown" onchange="highlightSelect(this)">
          <option value="Select">Select</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
      </td>
      <td class="remarks">
        <textarea placeholder="Add comments here if Not OK..." rows="2" cols="20"></textarea><br>
      </td>
      <td>
       <button class="add-image" onclick="showUploadOptions(800)">Add Image</button>
       <div class="upload-options" id="upload-options-800" style="display: none;">
      <button class="add-image" onclick="startCamera(800)">Camera</button>
      <label for="file-input-800" class="upload-label">Upload from Device</label>
      <input type="file" id="file-input-800" accept="image/*" multiple onchange="displayImages(this, 800)">
       </div>
      <!-- Container for multiple images --> 
      <div id="image-container-800"></div>
      <!-- Camera Container -->
      <div id="camera-container-800" style="display: none;">
     <video id="camera-768" width="100%" height="auto" autoplay></video>
     <button class="add-image" onclick="captureImage(800)">Capture Image</button>
     <button class="add-image" onclick="stopCamera(800)">Stop Camera</button>
     <button class="reverse-camera" onclick="switchCamera(800)">🔄 Switch Camera</button> <!-- Reverse Camera Icon -->
     <canvas id="canvas-800" style="display: none;"></canvas> <!-- Canvas to capture the image -->
     </div>
    </tr>
    </tbody>
      </table>
      </div>
      <div class="action-buttons">
        <!-- New UPDATE button: -->
      <button type="button" 
              id="update-btn" 
              style="background-color: blue; color: white; display:none;" 
              onclick="updateObservation('16_0')">
        Update
      </button>
        <button type="button" id= "save-btn" style = "display: inline-block;" onclick="if(validateMandatoryImages('16_0')) { saveObservation('16_0'); }">Save</button>
         <button id="get-details-btn" onclick="getDetails()">Get Details</button>
      </div>
    ;`
  }
}

// Function to handle the logout
function logout() {
  window.location.href = "login.html"; // Replace with your actual login page URL
}

// Event listener for dynamic shed name update

document.addEventListener("DOMContentLoaded", function () {
  function initShedLogic() {
    // Attempt to get the newly loaded or dynamically injected selects
    const divisionSelect = document.getElementById("railway-division");
    const shedSelect = document.getElementById("shed-name");

    // If they don't exist yet (because the form is injected later), re-check soon
    if (!divisionSelect || !shedSelect) {
      
      setTimeout(initShedLogic, 100);
      return;
    }

    // Now that we have them, gather the <option data-division="...">
    const allShedOptions = Array.from(
      shedSelect.querySelectorAll("option[data-division]")
    );

    // Expose a global function so inline onchange="updateShedNames()" works
    window.updateShedNames = function () {
      if (!divisionSelect || !shedSelect) return;

      const selectedDivision = divisionSelect.value;
      

      // Reset to a single 'Select' placeholder
      shedSelect.innerHTML = '<option value="" disabled selected>Select</option>';

      // Inject only those options whose data-division matches
      allShedOptions.forEach(option => {
        if (option.getAttribute("data-division") === selectedDivision) {
          shedSelect.appendChild(option.cloneNode(true));
        }
      });

      // Optionally disable if no valid division
      shedSelect.disabled = !selectedDivision;
    };

    // If a division is already selected (e.g. from session), update immediately
    window.updateShedNames();
  }

  // Try to attach logic now; if the elements aren't there, we'll retry
  initShedLogic();
});


async function generateReport() {
  // Remove the beforeunload listener so that it won't trigger when clicking the button.
  window.removeEventListener("beforeunload", beforeUnloadHandler);

  const locoId = document.getElementById("loco-id").value;
  const railwayDivision = document.getElementById("railway-division").value;
  const shedName = document.getElementById("shed-name").value;

  if (!locoId || !railwayDivision || !shedName) {
    alert("Please fill all the fields.");
    return;
  }

  const response = await fetch("generateReport.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "loco-id": locoId,
      "railway-division": railwayDivision,
      "shed-name": shedName,
    }),
  });

  const data = await response.json();

  if (data.success) {
    // Store the fetched data in sessionStorage
    sessionStorage.setItem("locoDetails", JSON.stringify(data.locoDetails));
    sessionStorage.setItem(
      "observationsData",
      JSON.stringify(data.observations)
    );

    // Redirect to the observations page
    window.location.href = "observations.html";
  } else {
    alert(data.message || "Failed to generate the report");
  }

  if (data.success) {
    // Optional: Display Loco Details and Observations on console
  } else {
    alert(data.message);
  }
}


function showUploadOptions(rowId) {
  const uploadOptions = document.getElementById(`upload-options-${rowId}`);
  if (!uploadOptions) return;
  uploadOptions.style.display =
    uploadOptions.style.display === "none" ? "block" : "none";
}

function highlightSelect(selectElement) {
  selectElement.style.backgroundColor = ""; // default

  const value = selectElement.value;
  if (
    value === "Not Available" ||
    value === "No" ||
    value === "Not Connected" ||
    value === "Not Secured" ||
    value === "Not Fixed" ||
    value === "Not Applied" ||
    value === "Routing Not Done" ||
    value === "Torquing Not done" ||
    value === "Not Matching" ||
    value === "Not Installed"
  ) {
    selectElement.style.backgroundColor = "red";
  } else if (
    value === "Available" ||
    value === "Yes" ||
    value === "Secured" ||
    value === "Fixed" ||
    value === "Applied" ||
    value === "Routing Done" ||
    value === "Torquing done" ||
    value === "Matching" ||
    value === "Installed" ||
    value === "Not Applicable" ||
    value === "Connected"
  ) {
    selectElement.style.backgroundColor = "green";
  } else if (value === "Positioning done") {
    selectElement.style.backgroundColor = "green";
  } else if (value === "Positioning Not done") {
    selectElement.style.backgroundColor = "red";
  } else if (value === "Earthing Done") {
    selectElement.style.backgroundColor = "green";
  } else if (value === "Earthing not done") {
    selectElement.style.backgroundColor = "red";
  } else if (value === "Installed") {
    selectElement.style.backgroundColor = "yellow";
  } else if (value === "Welding done") {
    selectElement.style.backgroundColor = "green";
  } else if (value === "Welding not done") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Locked") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Not Locked") {
    selectElement.style.backgroundColor = "red";
  }else if (selectElement.value === "Metal clamps implemented") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Metal clamps not implemented") {
    selectElement.style.backgroundColor = "red";
  }else if (selectElement.value === "Cables Connected") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Cables Not Connected") {
    selectElement.style.backgroundColor = "red";
  }
}

// ---------------------------------------------------------------------------
// The "completeData" function
function completeData() {
  sessionStorage.removeItem("locoInfo");
  sessionStorage.removeItem("observations");
  alert(
    "Data has been saved and cleared. You can now enter information for a new loco."
  );
  document.getElementById("main-content").innerHTML = "";
}

function validateBarcode(input) {
  // Get the value from the input
  let value = input.value;

  // Remove any non-numeric characters
  value = value.replace(/\D/g, '');

  // Trim to the last 15 digits
  if (value.length > 15) {
    value = value.slice(-15);
  }

  // Update the input value with the last 15 digits
  input.value = value;
}

// ---------------------------------------------------------------------------
// Save Loco Info
async function saveLocoInfo(section) {
  const locoID = document.getElementById("loco-id").value;
  const railwayDivision = document.getElementById("railway-division").value;
  const shedName = document.getElementById("shed-name").value;
  const inspectionDate = document.getElementById("date").value;
  const locoType = document.getElementById("loco-type").value;
  const brakeType = document.getElementById("brake-type").value;

  if (
    !locoID ||
    !railwayDivision ||
    !shedName ||
    !inspectionDate ||
    !locoType ||
    !brakeType
  ) {
    alert("Please fill out all fields before saving.");
    return;
  }

  const locoData = {
    locoID: locoID,
    locoType: locoType,
    brakeType: brakeType,
    railwayDivision: railwayDivision,
    shedName: shedName,
    inspectionDate: inspectionDate,
  };

  // Save to sessionStorage
  sessionStorage.setItem("locoInfo", JSON.stringify(locoData));

  try {
    const response = await fetch("connect.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "loco-id": locoID,
        "loco-type": locoType,
        "brake-type": brakeType,
        "railway-division": railwayDivision,
        "shed-name": shedName,
        "inspection-date": inspectionDate,
      }),
    });

    const data = await response.json();
    

    if (data.success) {
      showModal("Loco info saved successfully!");
      // Once saved, no unsaved changes
      unsavedChanges = false;
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while saving the data.");
  }

  enableButtons();
}
document.addEventListener("click", function (event) {
  // Check if a "Get Details" button was clicked
  if (event.target.id === "get-details-btn") {
    // Remove highlight from all buttons
    document.querySelectorAll("#get-details-btn").forEach(btn => btn.classList.remove("highlight"));

    // Check if the button belongs to section "0.0" (using a data attribute)
    if (event.target.dataset.section === "0.0") {
      event.target.classList.add("highlight");
    }
  }
});


async function checkAndHighlightSections(locoId, shedName, railwayDivision) {
  // List of section IDs you want to check.
  // Adjust this list as needed.
  const sectionIds = ['1_0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0', '8.0', '9.0', '10.0', '11.0', '12.0', '13.0', '14.0', '15.0', '16.0'];

  for (const sectionId of sectionIds) {
    // Check if observations exist for this section.
    const exists = await checkExistingObservations(locoId, shedName, railwayDivision, sectionId);

    // Convert sectionId to a button ID.
    // For example: "1_0" becomes "button-1" and "2.0" becomes "button-2".
    let buttonId;
    if (sectionId.indexOf('_') !== -1) {
      buttonId = "button-" + sectionId.split('_')[0];
    } else if (sectionId.indexOf('.') !== -1) {
      buttonId = "button-" + sectionId.split('.')[0];
    } else {
      buttonId = "button-" + sectionId;
    }

    // Get the sidebar button by its ID.
    const button = document.getElementById(buttonId);

    if (button) {
      if (exists) {
        // When the section is filled, change the background color (light green) and enable the button.
        button.style.backgroundColor = "#b2ebf2";
        button.disabled = false;
      } else {
        // Otherwise, reset the background and keep it disabled.
        button.style.backgroundColor = "";
        button.disabled = false;
      }
    }
  }
}


// Function to check if observations exist for a given section
async function checkExistingObservations(locoId, shedName, railwayDivision, sectionId) {
  try {
    const requestData = { locoId, shedName, railwayDivision, sectionId };

    

    const response = await fetch("checkObservations.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    

    return data.exists;
  } catch (error) {
    console.error("❌ Error checking existing observations:", error);
    return false;
  }
}

async function saveObservation(section) {
  const locoId = document.getElementById("loco-id")?.value.trim();
  const shedName = document.getElementById("shed-name")?.value.trim();
  const railwayDivision = document.getElementById("railway-division")?.value.trim();

  const saveBtn = document.querySelector(`#save-btn`);
  if (saveBtn) saveBtn.disabled = true;

  // ✅ Validate loco info
  if (!locoId || !shedName || !railwayDivision) {
    alert("⚠️ Please enter Loco ID, Shed Name, and Railway Division.");
    if (saveBtn) saveBtn.disabled = false;
    return;
  }

  try {
    const exists = await checkExistingObservations(locoId, shedName, railwayDivision, section);
    if (exists === true) {
      alert("⚠️ Observations already exist for this section.");
      if (saveBtn) saveBtn.disabled = false;
      return;
    }
  } catch (e) {
    alert("⚠️ Unable to verify existing observations. Try again.");
    console.error("Check failed:", e);
    if (saveBtn) saveBtn.disabled = false;
    return;
  }

  const formData = new FormData();
  formData.append("loco-id", locoId);
  formData.append("loco-type", document.getElementById("loco-type")?.value || "");
  formData.append("brake-type", document.getElementById("brake-type")?.value || "");
  formData.append("railway-division", railwayDivision);
  formData.append("shed-name", shedName);
  formData.append("inspection-date", document.getElementById("date")?.value || "");
  formData.append("section-id", section);

  const rows = document.querySelectorAll(`#observations-section-${section} tbody tr`);
  const observations = [];

  let anyFieldFilled = false;
  let anyDropdownSelected = false;

  for (const row of rows) {
    const S_no = row.querySelector("td:first-child")?.innerText.trim() || "";
    const obsField = row.querySelector(".observation_text");

    if (!obsField) {
      alert(`❌ Missing description field for S.No ${S_no}`);
      if (saveBtn) saveBtn.disabled = false;
      return;
    }

    const clone = obsField.cloneNode(true);
    clone.querySelectorAll("input").forEach(i => i.remove());
    const descriptionHtml = clone.innerHTML.trim();

    if (!descriptionHtml || descriptionHtml.toUpperCase() === "N/A") {
      alert(`⚠️ Description cannot be empty or "N/A" for S.No ${S_no}`);
      if (saveBtn) saveBtn.disabled = false;
      return;
    }

    const barcode = row.querySelector("input[type='text']")?.value.trim() || "";
    const text = (descriptionHtml + " " + barcode).trim();
    const remarks = row.querySelector(".remarks textarea")?.value.trim() || "";
    const status = row.querySelector("select")?.value || "";

    if (status && status !== "Select") {
      anyDropdownSelected = true;
    }

    if (text || remarks || (status && status !== "Select")) {
      anyFieldFilled = true;
    }

    const rowId = row.id.replace("row-", "");
    let imagePaths = [];

    try {
      imagePaths = await uploadDeviceImages(rowId);
    } catch (e) {
      alert(`❌ Image upload failed for row ${S_no}`);
      console.error("Image upload error:", e);
      if (saveBtn) saveBtn.disabled = false;
      return;
    }

    observations.push({
      S_no,
      observation_text: text,
      remarks,
      observation_status: status,
      image_paths: imagePaths,
    });
  }

  if (!anyDropdownSelected) {
    alert("⚠️ Please select at least one observation status.");
    if (saveBtn) saveBtn.disabled = false;
    return;
  }

  if (!anyFieldFilled) {
    alert("⚠️ Please enter at least one observation or remark.");
    if (saveBtn) saveBtn.disabled = false;
    return;
  }

  formData.append("observations", JSON.stringify(observations));

  if (!confirm("💾 Do you want to save observations?")) {
    if (saveBtn) saveBtn.disabled = false;
    return;
  }

  try {
    const response = await fetch(`section${section}.php`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("❌ Network error while saving observations.");

    const data = await response.json();

    if (data.success) {
      document.getElementById("messageBox").innerText = "🎉 Observations saved successfully!";
      setTimeout(() => {
        document.getElementById("messageBox").innerText = "";
      }, 2000);

      unsavedChanges = false;

      const getDetailsBtn = document.querySelector(`#get-details-btn`);
      const updateBtn = document.querySelector(`#update-btn`);

      if (saveBtn) saveBtn.style.display = 'none';
      if (getDetailsBtn) getDetailsBtn.style.display = 'inline-block';
      if (updateBtn) updateBtn.style.display = 'none';
    } else {
      alert(data.message || "❌ Server returned failure.");
    }
  } catch (error) {
    alert("❌ Error saving observations.");
    console.error(error);
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
}

// Function to get unique section_ids along with their S_no
function getSectionIDWithSno(observations) {
  const sectionMap = {};
  observations.forEach(observation => {
    if (!sectionMap[observation.section_id]) {
      sectionMap[observation.section_id] = [];
    }
    sectionMap[observation.section_id].push(observation.S_no);
  });
  return Object.keys(sectionMap).map(section_id => ({
    section_id: section_id,
    sno: sectionMap[section_id]
  }));
}

// Function to populate loco details
function populateLocoDetails(locoDetails) {
  

  // Check if session storage already contains loco details
  sessionStorage.setItem("locoDetails", JSON.stringify(locoDetails));

  // Populate the form fields with the loco details
  const locoTypeInput = document.getElementById("loco-type");
  const brakeTypeInput = document.getElementById("brake-type");
  const inspectionDateInput = document.getElementById("date");

  if (locoTypeInput) locoTypeInput.value = locoDetails.loco_type || "";
  if (brakeTypeInput) brakeTypeInput.value = locoDetails.brake_type || "";
  
  // Always use current date when editing
  if (inspectionDateInput) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    inspectionDateInput.value = `${year}-${month}-${day}`;
  }
}

// Enable buttons dynamically based on section IDs
function enableSectionButtons(sectionID) {
  const button = document.getElementById(`button-${sectionID}`);
  if (button) {
    button.disabled = false;
  } else {
    console.warn(`Button not found for section: ${sectionID}`);
  }
}

// — after you fetch your data, do something like:
//    window.allObservations = fetchedArray;
//    updateSections(window.allObservations, "2_0", ["2.1","2.2",…]);

// Global store of everything you've fetched
window.allObservations = [];

// Enable buttons dynamically based on section IDs
function enableSectionButtons(sectionID) {
  const button = document.getElementById(`button-${sectionID}`);
  if (button) {
    button.disabled = false;
  } else {
    console.warn(`Button not found for section: ${sectionID}`);
  }
}

// Global object to store edited barcode values keyed by rowId.
window.editedBarcodes = window.editedBarcodes || {};

/**
 * Called on each barcode input. Saves the new value, then re-renders
 * just that section so the table reflects the fresh code.
 */
function updateEditedBarcode(rowId, value, sectionID, sno) {
  window.editedBarcodes[rowId] = value;
  // re-render only this section:
  updateSections(window.allObservations, sectionID, sno);
}

/**
 * Filter & render a single section's table.
 */
function updateSections(observations, sectionID, sno) {
  const sectionContainer = document.getElementById(`observations-section-${sectionID}`);
  if (!sectionContainer) {
    console.warn(`⚠️ Section container not found for sectionID: ${sectionID}`);
    return;
  }
  enableSectionButtons(sectionID);
  const filtered = observations.filter(o => o.section_id === sectionID);
  if (filtered.length) {
    updateObservationsTable(sectionID, filtered, sno);
  } else {
    console.warn(`⚠️ No observations for section ${sectionID}`);
  }
}

/**
 * Rebuilds the <tbody> for one section.
 */
// Call this on input so the updated value is saved globally.
function updateEditedBarcode(rowId, value) {
  
  window.editedBarcodes[rowId] = value;
}

function updateObservationsTable(sectionID, observations, sno) {
  const tbody = document.getElementById(`observations-tbody-${sectionID}`);
  if (!tbody) {
    console.error(`Table body #observations-tbody-${sectionID} not found.`);
    return;
  }

  tbody.innerHTML = "";

  // Filter observations for the current section.
  const filteredObservations = observations.filter(obs => obs.section_id === sectionID);

  // For each serial number, find an existing observation or create a default one.
  const allRows = sno.map(snoValue => {
    return filteredObservations.find(obs => obs.S_no === snoValue) || { S_no: snoValue, section_id: sectionID };
  });

  allRows.forEach((observation) => {
    const S_no = observation.S_no;
    let rowId = observation.rowId || S_no;

    // Only for section "2_0", override the barcode with any edited value.
    if (sectionID === "2_0" && S_no !== "2.1" && window.editedBarcodes && window.editedBarcodes[rowId] !== undefined) {
      
      observation.barcode = window.editedBarcodes[rowId];
    }

    const dropdownOptions = getDropdownOptions(S_no, observation.observation_status);

    let imageHTML = "";
    if (observation.images && observation.images.length > 0) {
      imageHTML = observation.images
        .map((imgPath, idx) => `
          <div class="image-container" style="position: relative; display: inline-block;">
            <img
              id="captured-image-${rowId}-${idx}"
              src="${imgPath}"
              alt="Uploaded Image"
              width="100"
              style="margin:5px;"
              onerror="console.error('Error loading image:', this.src')">
            <span style="position:absolute; top:0; right:0; cursor:pointer; color:red; font-weight:bold;" onclick="deleteImage(event, '${sectionID}', '${S_no}', '${imgPath}')">&times;</span>
          </div>
        `).join("");
    }

    const imageUploadBlock = `
      <div class="image-container" id="image-container-${rowId}">
        ${imageHTML}
      </div>
      <button type="button" class="add-image" onclick="showUploadOptions('${rowId}')">
        Add/Update Image
      </button>
      <div class="upload-options" id="upload-options-${rowId}" style="display: none;">
        <button class="add-image" onclick="startCamera('${rowId}')">Camera</button>
        <label for="file-input-${rowId}" class="upload-label">Upload from Device</label>
        <input
          type="file"
          id="file-input-${rowId}"
          name="images[]"
          accept="image/*"
          multiple
          style="display:none;"
          onchange="displayImages(this, '${rowId}')">
      </div>
      <div id="camera-container-${rowId}" style="display: none;">
        <video id="camera-${rowId}" width="100%" height="auto" autoplay></video>
        <button class="add-image" onclick="captureImage('${rowId}')">Capture Image</button>
        <button class="add-image" onclick="stopCamera('${rowId}')">Stop Camera</button>
        <button class="reverse-camera" onclick="switchCamera('${rowId}')">🔄 Switch Camera</button>
        <canvas id="canvas-${rowId}" style="display: none;"></canvas>
      </div>
    `;

    // For the observation text cell, include the barcode input field only for section "2_0"
    let observationContent = observation.observation_text || "N/A";
    if (sectionID === "2_0" && S_no !== "2.1") {
      observationContent += `<br>
        <input
          type="text"
          id="barcode-input-${rowId}"
          name="barcode_kavach_main_unit"
          pattern="^\\d{10,15}$"
          title="Enter a number between 10 to 15 digits"
          placeholder="Scan Barcode"
          style="width: 180px; padding: 5px; font-size: 14px;"
          value="${observation.barcode || ''}"
oninput="
  // Keep only digits
  let cleaned = this.value.replace(/\D/g, '');
  if (cleaned.length > 15) cleaned = cleaned.slice(-15);
  this.value = cleaned;

  // Only update if barcode is between 10 and 15 digits
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    updateEditedBarcode('${rowId}', cleaned);
  } else {
    delete window.editedBarcodes['${rowId}'];
  }

  toggleNotInstalledOption(this);
"
/>`;
    }

    const row = document.createElement("tr");
    row.setAttribute("data-sno", S_no);
    row.setAttribute("id", `row-${rowId}`);

    row.innerHTML = `
      <td>${S_no}</td>
      <td class="observation_text">${observationContent}</td>
      <td>
        <select name="observation-status-${rowId}" id="status-${rowId}" onchange="highlightSelect(this); markDataAsUnsaved();">
          ${dropdownOptions}
        </select>
      </td>
      <td class="remarks">
        <textarea rows="2" cols="20" oninput="enableUpdateButton(); markDataAsUnsaved();">${observation.remarks || ""}</textarea>
      </td>
      ${sectionID !== "1_0" ? `<td>${imageUploadBlock}</td>` : ""}
    `;
        // ❌ Skip appending the row if description is empty or "N/A"
    if (!observationContent || observationContent.trim() === "N/A") {
      console.warn(`❌ Skipping row ${S_no} due to invalid description`);
      return;
    }


    tbody.appendChild(row);

    setTimeout(() => {
      const statusDropdown = document.getElementById(`status-${rowId}`);
      if (statusDropdown) {
        let valueToSet = observation.observation_status?.trim() || "Select";
        
        statusDropdown.value = valueToSet;

        const optionsArray = Array.from(statusDropdown.options).map(opt => opt.value);
        

        highlightSelect(statusDropdown);
      }
    }, 100);
  });
}

function deleteImage(event, sectionID, s_no, imgPath) {
  event.preventDefault();
  event.stopPropagation();

  if (!confirm("Are you sure you want to delete this image?")) return;

  const locoId = document.getElementById("loco-id").value;
  const relativePath = imgPath.replace(/^.*\/uploads\//, 'uploads/');

  fetch('deleteImage.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loco_id: locoId, s_no, imgPath: relativePath })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Image deleted successfully.");

      // Remove the image element from DOM directly
      const imgContainer = event.target.closest('.image-container');
      if (imgContainer) {
        imgContainer.remove();
      }

      // Also update the observation object to remove this image
      const obs = observations.find(o => o.S_no === s_no && o.section_id === sectionID);
      if (obs && obs.images) {
        obs.images = obs.images.filter(path => path !== imgPath);
      }

    } else {
      alert("Failed to delete image: " + data.message);
    }
  })
  .catch(error => console.error('Error deleting image:', error));
}







// Function to update only the description part (if needed)
function updateObservationText(rowId, barcodeValue) {
  // Look for a span with class "description" within the observation cell.
  const descriptionSpan = document.querySelector(`#row-${rowId} td.observation_text .description`);
  if (descriptionSpan) {
    // For example, if you want to update the description to reflect the barcode:
    // (Adjust the logic as needed—you might simply leave the description unchanged.)
    descriptionSpan.textContent = `Updated Barcode: ${barcodeValue}`;
  }
}

// Function to handle barcode scanning
function handleBarcodeScan(rowId, barcodeValue) {
  // Update the input field's value
  const barcodeInput = document.querySelector(`#row-${rowId} input[name="barcode_kavach_main_unit"]`);
  if (barcodeInput) {
    barcodeInput.value = barcodeValue;
    updateEditedBarcode(rowId, barcodeValue);
  }
  // Optionally update the display of the description
  updateObservationText(rowId, barcodeValue);
}


// Enable update button if any changes occur
function enableUpdateButton() {
  document.getElementById("update-button").disabled = false;
}

// Function to track changes in inputs (used for enabling the update button)
function trackChanges(element, isFile = false) {
  let initialValue = element.getAttribute("data-initial");
  let currentValue = isFile ? element.files.length > 0 : element.value;
  
  if (initialValue != currentValue) {
    document.getElementById("update-button").disabled = false;
  }
}

// Function to delete an image





function toggleNotInstalledOption(inputElement) {
  // Find the row containing this input
  const row = inputElement.closest('tr');
  if (!row) return;

  // Grab the dropdown in the same row
  const dropdown = row.querySelector('select');
  if (!dropdown) return;

  // Locate the "Not Installed" <option> in that dropdown
  const notInstalledOption = [...dropdown.options].find(
    option => option.value === 'Not Installed'
  );
  if (!notInstalledOption) return; // fixed typo: using notInstalledOption

  // If there's any text in the barcode input, disable "Not Installed"
  if (inputElement.value.trim() !== '') {
    notInstalledOption.disabled = true;

    // If the dropdown was already set to "Not Installed", reset it
    if (dropdown.value === 'Not Installed') {
      dropdown.value = 'Select';
    }
  } else {
    // If input is empty, re-enable "Not Installed"
    notInstalledOption.disabled = false;
  }
}

// Example dummy function for the select change event
function highlightSelect(selectElement) {
  // Dummy function; add your highlighting code here if needed.
  
}
// Function to format observation description
function formatDescription(observationText) {
  let normalized = observationText.trim();

  // Match trailing numbers
  const trailingMatch = normalized.match(/(\d+\s*)+$/);
  if (!trailingMatch) return normalized; // No trailing numbers found, return the original text

  const trailingNumbers = trailingMatch[0].trim().split(/\s+/); // Split trailing numbers
  const labelsText = normalized.substring(0, trailingMatch.index).trim(); // Get text before the trailing numbers

  // Match labels that end with a colon
  const labels = labelsText.match(/[^:]+:/g);
  if (!labels) return normalized; // No labels found, return the original text

  // Return formatted string combining labels and numbers
  return labels.slice(0, trailingNumbers.length)
    .map((label, i) => label.trim() + trailingNumbers[i]) // Combine each label with its corresponding number
    .join(" , ");
}

// Function to fetch updated details when clicking "Get Details"
function getDetails() {
  let locoID = document.getElementById("loco-id").value.trim();
  let railwayDivision = document.getElementById("railway-division").value.trim();
  let shedName = document.getElementById("shed-name").value.trim();

  if (!locoID || !railwayDivision || !shedName) {
    alert("Please fill in all the fields.");
    return;
  }

  

  $.ajax({
    url: "generateReport.php",
    type: "POST",
    data: {
      "loco-id": locoID,
      "railway-division": railwayDivision,
      "shed-name": shedName,
    },
    dataType: "json",
    success: async function (response) {
      

      if (!response.success) {
        console.warn("⚠️ No details found:", response.message);
        alert(response.message);
        return;
      }

      
      populateLocoDetails(response.locoDetails);

      let sectionWiseSno = {};

      response.observations.forEach((observation) => {
        let sectionID = observation.section_id;
        if (!sectionWiseSno[sectionID]) {
          sectionWiseSno[sectionID] = [];
        }
        sectionWiseSno[sectionID].push(observation.S_no);
      });

      

      Object.keys(sectionWiseSno).forEach((sectionID) => {
        updateSections(response.observations, sectionID, sectionWiseSno[sectionID]);

        let updateBtn = document.getElementById(`update-btn-${sectionID}`);
        if (updateBtn) {
          updateBtn.disabled = false;
        }
      });

      setTimeout(() => {
        response.observations.forEach((observation) => {
          if (observation.images && observation.images.length > 0) {
            
            displayImagesWithDelete(observation.images, observation.rowId);
          }
        });
      }, 500);

      await checkAndHighlightSections(locoID, shedName, railwayDivision);

      // Hide Save button and show Update button when Get Details is clicked
      document.getElementById('save-btn').style.display = 'none';
      document.getElementById('update-btn').style.display = 'inline-block'; // Show Update button
    },
    error: function (xhr, status, error) {
      console.error("❌ Error fetching data from server:", status, error);
      alert("There was an error fetching the data.");
    },
  });
}

// Modified displayImages function to include delete icon
function displayImagesWithDelete(images, rowId) {
  const imageContainer = document.getElementById(`image-container-${rowId}`);
  if (imageContainer) {
    images.forEach((imgPath, idx) => {
      const imgHTML = `
        <div class="image-container">
          <img
            id="captured-image-${rowId}-${idx}"
            src="${imgPath}"
            alt="Uploaded Image"
            width="100"
            style="display:block; margin:5px;"
            onerror="console.error('Error loading image:', this.src)">
          <button type="button" onclick="deleteImage('${rowId}', '${imgPath}')">Delete</button>
        </div>
      `;
      imageContainer.innerHTML += imgHTML;
    });
  }
}


/**
 * Update existing observations for a given section.
 * Uses rowFiles map, deletedImagesMap, uploadImages helper,
 * and preserves multi-file uploads from device and camera captures.
 */
async function updateObservation(section) {
  // 1) Section mapping (optional index)
  const sectionMapping = {
    "1_0": 0,  "2_0": 1,  "3_0": 2,  "4_0": 3,
    "5_0": 4,  "6_0": 5,  "7_0": 6,  "8_0": 7,
    "9_0": 8, "10_0": 9, "11_0":10, "12_0":11,
   "13_0":12, "14_0":13, "15_0":14, "16_0":15
  };

  // 2) Section‐level fields
  const locoId          = document.getElementById("loco-id").value;
  const shedName        = document.getElementById("shed-name").value;
  const railwayDivision = document.getElementById("railway-division").value;

  if (sectionMapping[section] === undefined) {
    alert("Invalid section provided.");
    return;
  }

  // 3) Mandatory‐images check
  if (!validateMandatoryImages(section)) return;

  // 4) Build base FormData
  const formData = new FormData();
  formData.append("loco-id",          locoId);
  formData.append("loco-type",        document.getElementById("loco-type").value);
  formData.append("brake-type",       document.getElementById("brake-type").value);
  formData.append("railway-division", railwayDivision);
  formData.append("shed-name",        shedName);
  formData.append("inspection-date",  document.getElementById("date").value);
  formData.append("section-id",       section);
  formData.append("action",           "update");
  formData.append("section_index",    sectionMapping[section]);

  // 5) Gather per-row observations
  const observations = [];
  let hasChanges = false;
  const rows = document.querySelectorAll(`#observations-section-${section} tbody tr`);

  for (const row of rows) {
    const rowId = row.id.replace("row-", "");
    const S_no  = row.querySelector("td:nth-child(1)")?.innerText.trim() || "";

    // 5a) Text, barcode (for 2_0), remarks, status
    let observationText = row.querySelector(".observation_text")?.textContent.trim() || "";
    let barcodeValue    = "";
    if (section === "2_0") {
      const bcInput = row.querySelector("input[name='barcode_kavach_main_unit']");
      if (bcInput) {
        barcodeValue = bcInput.value.trim().slice(-15);
        if (bcInput.dataset.initialValue !== barcodeValue) hasChanges = true;
      }
    }

    const remarks           = row.querySelector(".remarks textarea")?.value.trim() || "";
    const observationStatus = row.querySelector("select")?.value || "";
    if (observationStatus && observationStatus !== "Select") hasChanges = true;
    if (observationText || remarks || barcodeValue)        hasChanges = true;
    if (!observationStatus && !remarks && !barcodeValue && !observationText) continue;

    // 5b) Gather ALL images currently in the container
    const existingPaths = [];
    const imgContainer  = document.getElementById(`image-container-${rowId}`);
    if (imgContainer) {
      imgContainer.querySelectorAll("img").forEach(img => {
        const rel = img.src.replace(/^.*\/uploads\//, "uploads/");
        existingPaths.push(rel);
      });
    }

    // 5c) Deleted images
    const deletedPaths = Array.from(deletedImagesMap[rowId] || []);

    // 5d) Upload new Files/Blobs from rowFiles map
    let uploadedPaths = [];
    const newFiles = rowFiles.get(rowId) || [];
    if (newFiles.length) {
      try {
        uploadedPaths = await uploadImages(newFiles);
        rowFiles.set(rowId, []); // clear queue
      } catch (err) {
        alert(`❌ Failed to upload images for row ${rowId}: ${err}`);
        return;
      }
    }

    // 5e) Consolidate final image list
    const allImages = [
      ...existingPaths.filter(p => !deletedPaths.includes(p)),
      ...uploadedPaths
    ];

    observations.push({
      S_no,
      observation_text:  observationText,
      barcode:           barcodeValue,
      remarks,
      observation_status: observationStatus,
      image_paths:       allImages,
      deleted_images:    deletedPaths
    });
  }

  // 6) Abort if no modifications
  if (!hasChanges) {
    alert("No changes detected. Modify at least one entry before updating.");
    return;
  }

  // 7) Append JSON payload
  formData.append("observations", JSON.stringify(observations));

  // 8) Submit update
  try {
    const resp = await fetch("updateObservations.php", { method: "POST", body: formData });
    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); }
    catch { throw new Error("Server returned non-JSON response"); }

    if (data.success) {
      alert("✅ Observations updated successfully!");
      unsavedChanges = false;
      getDetails();
    } else {
      alert(`Error from server: ${data.message}`);
    }
  } catch (err) {
    console.error("Error updating observations:", err);
    alert("An error occurred during update: " + err.message);
  }
}
// Function to enable section buttons dynamically
function enableSectionButtons(sectionID) {
  // Extract only the main section number (before underscore, if present)
  const sectionNumber = sectionID.split("_")[0];

  const button = document.getElementById(`button-${sectionNumber}`);
  if (button) {
    button.disabled = false;
  } else {
    console.warn(`Button not found for section: ${sectionID}`);
  }
}

// Build the dropdown options (your function provided earlier)
function getDropdownOptions(sno, observationStatus) {
  let isSelected = !observationStatus || observationStatus.trim() === "" || observationStatus.trim() === "Select";
  let defaultOption = `<option value="Select" ${isSelected ? "selected" : ""}>Select</option>`;
  
  if (!sno || typeof sno !== "string") {
    console.error("Invalid S_no value:", sno);
    return defaultOption;
  }
const specificOptions = {
    "2.1": ["Present", "Not Present"],
"2.38,2.39" : ["Matching", "Not Matching", "Not Installed", "Not Applicable"],    "2.2,2.3,2.4,2.5,2.6,2.7,2.8,2.9,2.10,2.11,2.12,2.13,2.14,2.15,2.16,2.17,2.18,2.19,2.20,2.21,2.22,2.23,2.24,2.25,2.26,2.27,2.28,2.29,2.30,2.31,2.32,2.33,2.34,2.35,2.36,2.37": ["Matching", "Not Matching", "Not Installed"],
    "3.6,14.13": ["Matching", "Not Matching"],
    "3.3,3.4,3.5,3.5.1,3.5.2,3.12,3.13,6.2,6.4,6.7,7.2,8.1,8.2,8.3,8.7.1,8.7.2,8.7.3,8.7.4,9.1-9.6,14.2,14.6,15.2,15.4,15.10,16.2,15.5,15.5.1,3.12,3.13,5.7,6.10,6.11,5.1,8.4,14.8,5.2,5.3,9.7,16.1,16.2,16.3,16.4,5.8,5.7,5.4,15.9": ["Yes", "No"],
    "3.1,3.8,6.8,6.9,8.5,8.6,14.2,14.15.1,14.18,14.18.1,14.19,15.8,14.15,14.17,16.5,5.6,10.4": ["Connected", "Not Connected"],
    "1.1,1.2,3.2,6.1": ["Available", "Not Available"],
    "6.5,8.8": ["Applied", "Not Applied"],
    "4.2,6.6,6.10,7.3,8.7,14.20,16.3,3.9,3.14,5.8,14.14,15.7,6.12,5.9,5.5": ["Routing Done", "Routing Not Done"],
    "4.1,15.6": ["Fixed", "Not Fixed"],
    "6.3,7.1,14.3,14.12,15.3,14.7,3.7,14.15.2": ["Torquing done", "Torquing Not done"],
    "10.1-10.3,14.1,14.11,15.1": ["Installed", "Not Installed"],
    "14.10,14.9": ["Aligned", "Not Aligned"],
    "14.4,14.5": ["Positioning done", "Positioning not done"],
    "14.16": ["Welding done", "Welding Not done"],
    "16.1": ["Earthing done", "Earthing Not done"],
    "15.11,7.4,14.21":["Locked" , "Not Locked"],
    "3.11" :["Cables Connected", "Cables Not Connected"],
    "13.4,13.2,11.4,11.2,11.1,11.1.1,15.2.1" : ["Yes", "No", "Not Applicable"],
    "13.3" :["Fixed", "Not Fixed", "Not Applicable"],
    "13.1,12.2,12.1,11.7,11.10" :["Installed", "Not Installed", "Not Applicable"],
    "12.5,11.6,11.8,11.9,11.11" :["Routing Done", "Routing Not Done", "Not Applicable"], 
    "12.4,11.5" :["Connected", "Not Connected", "Not Applicable"],
    "12.3" :["Matching", "Not Matching", "Not Applicable"],
    "11.3" :["Applied", "Not Applied", "Not Applicable"],
    "3.10" : ["Metal clamps implemented","Metal clamps not implemented"]
    
  };




  for (const [key, values] of Object.entries(specificOptions)) {
    const keys = key.split(",").map(k => k.trim());
    for (const k of keys) {
      if (k.includes("-")) {
        const [start, end] = k.split("-").map(Number);
        const numSno = parseFloat(sno);
        if (numSno >= start && numSno <= end) {
          const matchedOptions = values.map(value =>
            `<option value="${value}" ${observationStatus?.trim() === value ? "selected" : ""}>${value}</option>`
          ).join("\n");
          return defaultOption + "\n" + matchedOptions;
        }
      } else if (sno === k) {
        const matchedOptions = values.map(value =>
          `<option value="${value}" ${observationStatus?.trim() === value ? "selected" : ""}>${value}</option>`
        ).join("\n");
        return defaultOption + "\n" + matchedOptions;
      }
    }
  }

  return defaultOption;
}





function formatDescription(description) {
  let normalized = description.trim();
  const trailingMatch = normalized.match(/(\d+\s*)+$/);
  if (!trailingMatch) return normalized;

  const trailingNumbers = trailingMatch[0].trim().split(/\s+/);
  const labelsText = normalized.substring(0, trailingMatch.index).trim();
  const labels = labelsText.match(/[^:]+:/g);
  if (!labels) return normalized;

  return labels.slice(0, trailingNumbers.length)
    .map((label, i) => label.trim() + trailingNumbers[i])
    .join(" , ");
}



function showModal() {
  const modal = document.getElementById("success-modal");
  modal.style.display = "block"; // Show modal
  setTimeout(() => {
    modal.style.display = "none"; // Hide modal after 3 seconds
  }, 3000);
}

// Helper function to handle input selection (only one checked)
function onlyOneChecked(target, name) {
  const checkboxes = document.getElementsByName(name);
  checkboxes.forEach((checkbox) => {
    if (checkbox !== target) checkbox.checked = false;
  });
}

// Event listener to load default loco info (if any) when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  const locoInfo = JSON.parse(sessionStorage.getItem("locoInfo"));

  if (locoInfo) {
    showSection("0.0"); // Default section to load
  }
});

function showUploadOptions(rowId) {
  const uploadBox = document.getElementById(`upload-options-${rowId}`);
  if (!uploadBox) {
    console.warn(`Upload options not found for rowId: ${rowId}`);
    return;
  }
  uploadBox.style.display = uploadBox.style.display === "none" ? "block" : "none";
}


let currentCamera = "environment"; // Default to back camera
let observations = [];

// ✅ Start Camera
async function startCamera(rowId) {
  const cameraContainer = document.getElementById(`camera-container-${rowId}`);
  const video = document.getElementById(`camera-${rowId}`);

  if (!video || !cameraContainer) {
    console.error(`❌ Missing camera elements for row ${rowId}`);
    return;
  }

  try {
    const constraints = {
      video: { facingMode: currentCamera },
      audio: false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    cameraContainer.style.display = "block";
    
  } catch (error) {
    console.error("🚨 Error starting the camera:", error);
    alert("⚠️ Unable to access the camera. Please check permissions.");
  }
}

// ✅ Stop Camera
function stopCamera(rowId) {
  const video = document.getElementById(`camera-${rowId}`);
  if (!video) return;

  if (video.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  }

  const cameraContainer = document.getElementById(`camera-container-${rowId}`);
  if (cameraContainer) cameraContainer.style.display = "none";

  
}

function enableButtons() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => (button.disabled = false));
}

// ✅ Capture Image
function captureImage(rowId) {
  const canvas = document.getElementById(`canvas-${rowId}`);
  const video = document.getElementById(`camera-${rowId}`);
  const imageContainer = document.getElementById(`image-container-${rowId}`);

  if (!canvas || !video || !imageContainer) {
    console.error(`❌ Missing elements for row ${rowId}`);
    return;
  }

  if (video.videoWidth === 0 || video.videoHeight === 0) {
    alert("⚠️ Camera not active. Please start the camera first.");
    return;
  }

  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  
  
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error("⚠️ Failed to create image blob.");
      return;
    }

    // Log the blob size and type to confirm it was created correctly
    
    
    // Upload the captured image
    uploadCapturedImage(blob, rowId, imageContainer);
  }, "image/png");

  stopCamera(rowId); // Stop the camera only after the image is captured
}

// ✅ Upload Captured Image and Add to rowFiles
function uploadCapturedImage(blob, rowId, imageContainer) {
  const formData = new FormData();
  formData.append("images[]", blob, `capture-${rowId}.png`);

  

  fetch("upload.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      
      
      if (data.success && data.file_paths && data.file_paths.length > 0) {
        const imageUrl = data.file_paths[0];

        // Add the captured image URL to the image container and rowFiles map
        addImageWithDeleteIcon(imageUrl, imageContainer, rowId); // Use reusable function
        updateObservations(rowId, imageUrl);

        // Add captured image URL to rowFiles (if it's not already in there)
        const files = rowFiles.get(rowId) || [];
        files.push(imageUrl);  // Add imageUrl from captured image
        rowFiles.set(rowId, files);

        
      } else {
        alert(`⚠️ Capture upload failed: ${data.message || "Unknown error"}`);
      }
    })
    .catch((error) => {
      console.error("🚨 Error uploading image:", error);
      alert("⚠️ Image upload failed.");
    });
}


async function uploadDeviceImages(rowId) {
  let imagePaths = [];

  const imageContainer = document.getElementById(`image-container-${rowId}`);
  if (imageContainer) {
    const imgs = imageContainer.querySelectorAll("img");
    for (const img of imgs) {
      const src = img.getAttribute("src");
      if (src.startsWith("data:image")) {
        // Optional: convert base64 to blob + upload here if needed
        console.warn("Base64 image detected. Already uploaded via camera.");
      } else {
        const relative = src.replace(/^.*\/uploads\//, "uploads/");
        imagePaths.push(relative);
      }
    }
  }

  // Then upload files from rowFiles map (device uploads)
  const files = rowFiles.get(rowId) || [];
  if (files.length > 0) {
    const fd = new FormData();
    files.forEach(f => fd.append("images[]", f));

    try {
      const response = await fetch("upload.php", {
        method: "POST",
        body: fd
      });
      const data = await response.json();
      if (data.success && data.file_paths) {
        data.file_paths.forEach(path => {
          imagePaths.push(path);
        });
      } else {
        alert("❌ Upload failed.");
        return [];
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      return [];
    }
  }

  return imagePaths;
}

// ✅ Reusable function to add image with delete icon
function addImageWithDeleteIcon(imageUrl, imageContainer, rowId) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "inline-block";
  wrapper.style.position = "relative";
  wrapper.style.margin = "5px";

  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.width = "100px";
  img.style.display = "block";
  img.style.border = "1px solid #ccc";

  // Create delete icon
  const deleteIcon = document.createElement("span");
  deleteIcon.innerHTML = "&times;"; // × symbol
  deleteIcon.style.position = "absolute";
  deleteIcon.style.top = "-8px";
  deleteIcon.style.right = "-8px";
  deleteIcon.style.backgroundColor = "#f44336";
  deleteIcon.style.color = "#fff";
  deleteIcon.style.width = "20px";
  deleteIcon.style.height = "20px";
  deleteIcon.style.borderRadius = "50%";
  deleteIcon.style.cursor = "pointer";
  deleteIcon.style.textAlign = "center";
  deleteIcon.style.lineHeight = "20px";
  deleteIcon.style.fontWeight = "bold";
  deleteIcon.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

  deleteIcon.onclick = () => {
    wrapper.remove();
    
    removeImageFromObservations(rowId, imageUrl); // optional backend logic
  };

  wrapper.appendChild(img);
  wrapper.appendChild(deleteIcon);
  imageContainer.appendChild(wrapper);
}

// Optional: Function to remove image from backend observations (if needed)
function removeImageFromObservations(rowId, imageUrl) {
  // Implement backend deletion logic here
  fetch("deleteImage.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ rowId, imageUrl })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        
      } else {
        console.error("⚠️ Failed to remove image from backend:", data.message);
      }
    })
    .catch(error => {
      console.error("🚨 Error in removing image from backend:", error);
    });
}


// ✅ Update Observations Array
function updateObservations(rowId, imagePath) {
  let observation = observations.find((obs) => obs.S_no === rowId);

  if (observation) {
    observation.image_path = imagePath;
  } else {
    observations.push({
      S_no: rowId,
      observation_text: "",
      remarks: "",
      observation_status: "",
      image_path: imagePath,
    });
  }

  
}

// ✅ Switch Camera (Front/Back)
function switchCamera(rowId) {
  currentCamera = currentCamera === "environment" ? "user" : "environment";
  stopCamera(rowId);
  startCamera(rowId);
}

// Step 1: Function to handle file upload
function handleFileUpload(rowId, imgElementId) {
  const files = rowFiles.get(rowId); // Get the list of files for the specific row
  if (!files || files.length === 0) {
    alert("No files selected for upload.");
    return;
  }

  const formData = new FormData();

  // Step 2: Append each file with a unique name (timestamp to avoid overwriting)
  files.forEach((file) => {
    

    // Append file with a unique identifier
    const timestamp = Date.now();
    formData.append("images[]", file, `${file.name.split('.')[0]}_${timestamp}.${file.name.split('.').pop()}`);
  });

  

  // Step 3: Send the request to upload.php via Fetch API
  fetch("upload.php", { method: "POST", body: formData })
    .then((response) => response.json())
    .then((data) => {
       // Debugging log
      if (data.success) {
        // Step 4: If upload is successful, update the image elements with the uploaded file paths
        const imgElement = document.getElementById(imgElementId);

        // Check if the file paths are returned as expected
        data.file_paths.forEach((filePath) => {
          // Display uploaded image(s)
          const img = document.createElement("img");
          img.src = filePath; // Use the returned file path
          img.style.display = "block";
          imgElement.appendChild(img); // Append to the imgElement
        });
      } else {
        alert("Upload failed: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error uploading file:", error);
      alert("An error occurred during file upload.");
    });
}

// at top of your script:
const rowFiles = new Map();  // rowId → Array<File>
function displayImages(inputElement, rowId) {
  rowId = String(rowId); // ✅ Always treat rowId as a string
  

  const imageContainer = document.getElementById(`image-container-${rowId}`);
  if (!imageContainer) {
    console.error(`❌ Image container not found for rowId: ${rowId}`);
    return;
  }

  const newFiles = Array.from(inputElement.files);
  if (newFiles.length === 0) {
    console.warn("⚠️ No files selected for upload.");
    return;
  }

  const existing = rowFiles.get(rowId) || [];
  existing.push(...newFiles);
  rowFiles.set(rowId, existing);
  

  newFiles.forEach(file => {
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      

      const wrapper = document.createElement("div");
      Object.assign(wrapper.style, {
        display: "inline-block", position: "relative", margin: "5px"
      });

      const img = document.createElement("img");
      img.src = imageUrl;
      Object.assign(img.style, { width: "100px", border: "1px solid #ccc" });

      const del = document.createElement("span");
      del.innerHTML = "&times;";
      Object.assign(del.style, {
        position: "absolute", top: "-8px", right: "-8px",
        backgroundColor: "#f44336", color: "#fff",
        width: "20px", height: "20px", borderRadius: "50%",
        cursor: "pointer", textAlign: "center", lineHeight: "20px",
        fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      });

      del.onclick = () => {
        wrapper.remove();
        const arr = rowFiles.get(rowId).filter(f => f !== file);
        rowFiles.set(rowId, arr);
        
      };

      wrapper.append(img, del);
      imageContainer.append(wrapper);
    };
    reader.readAsDataURL(file);
  });
}
function uploadImages(files) {
  return new Promise((resolve, reject) => {
    if (!files || files.length === 0) {
      return resolve([]); // nothing to do
    }

    const formData = new FormData();
    let appended = 0;

    files.forEach((f, idx) => {
      // only append File or Blob instances
      if (f instanceof File || f instanceof Blob) {
        // preserve original name if available, else give a default
        const filename = f.name || `capture_${idx}.png`;
        
        formData.append('images[]', f, filename);
        appended++;
      } else {
        
      }
    });

    if (appended === 0) {
      
      return resolve([]);
    }

    
    fetch('upload.php', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        
        if (data.success) {
          resolve(data.file_paths);
        } else {
          console.error('❌ Image upload failed:', data.message);
          reject(data.message);
        }
      })
      .catch(err => {
        console.error('🚨 Upload error:', err);
        reject('Upload failed due to a network or server error.');
      });
  });
}
function highlightSelect(selectElement) {
  if (selectElement.value === "Not Available") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Available") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Present") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Not Present") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Yes") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "No") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Applied") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Not Applied") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Routing Done") {
    selectElement.style.backgroundColor = "Green";
  } else if (selectElement.value === "Routing Not Done") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Fixed") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Not Fixed") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Secured") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Not Secured") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Installed") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Not Installed") {
    selectElement.style.backgroundColor = "yellow";
  } else if (selectElement.value === "Connected") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Not Connected") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Aligned") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Not Aligned") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Torquing done") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Torquing Not done") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Positioning done") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Positioning Not done") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Configured") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Not Configured") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "NA") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Welding done") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Welding not done") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Matching") {
    selectElement.style.backgroundColor = "Green";
  } else if (selectElement.value === "Not Matching") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Coating done") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Coating Not done") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Earthing done") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Earthing Not done") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Locked") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Not Locked") {
    selectElement.style.backgroundColor = "red";
  }else if (selectElement.value === "Metal clamps implemented") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Metal clamps not implemented") {
    selectElement.style.backgroundColor = "red";
  }else if (selectElement.value === "Cables Connected") {
    selectElement.style.backgroundColor = "green";
  } else if (selectElement.value === "Cables Not Connected") {
    selectElement.style.backgroundColor = "red";
  } else if (selectElement.value === "Not Applicable") {
    selectElement.style.backgroundColor = "green";
  } else {
    selectElement.style.backgroundColor = "";
  }
}

const deletedImagesMap = {}; // Tracks deleted image URLs for each observationID



/*document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".sidebar .button");

  buttons.forEach(button => {
    button.addEventListener("click", function () {
      // Remove 'active' class from all buttons
      buttons.forEach(btn => btn.classList.remove("active"));

      // Add 'active' class to the clicked button
      this.classList.add("active");
    });
  });
});*/


// 1) define per‑section lists of S_no that require an image
const mandatoryImageRowsBySection = {
  "3_0": ["3.1","3.5","3.7","3.8","3.11"],
  "4_0": ["4.1","4.2"],
  "5_0": ["5.2","5.3","5.4","5.5"],
  "6_0": ["6.2","6.3","6.6","6.8","6.9","6.10"],
  "7_0": ["7.1","7.3"],
  "8_0": ["8.1","8.2","8.5","8.7"],
  "9_0": ["9.2"],
  "10_0": ["10.1","10.2"],
  "14_0": ["14.1","14.16","14.17","14.19","14.21","14.22"],
  "15_0": ["15.1","15.3","15.4","15.9","15.10","15.6"]

};
function validateMandatoryImages(sectionID) {
  const mandatory = mandatoryImageRowsBySection[sectionID] || [];
  const tbody     = document.querySelector(`#observations-tbody-${sectionID}`);
  const missing   = [];

  if (!tbody) return true;

  tbody.querySelectorAll("tr").forEach(tr => {
    const sno = tr.cells[0]?.textContent.trim();
    if (!mandatory.includes(sno)) return;       // not one of the must‑have rows

    const sel = tr.querySelector("select");
    if (!sel || sel.value === "Select") return; // still default → skip

    // **NEW**: look for any <img> in the 5th cell
    const imgCell = tr.cells[4];
    const imgs    = imgCell?.querySelectorAll("img") || [];

    if (imgs.length === 0) {
      missing.push(sno);
    }
  });

  if (missing.length) {
    alert(`🚫 Image required for rows: ${missing.join(", ")}`);
    return false;
  }
  return true;
}




// Function to ensure only one checkbox is selected at a time for a given group
function onlyOneChecked(checkbox, groupClass) {
  // Get all checkboxes in the same group
  const checkboxes = document.querySelectorAll(`.${groupClass}`);

  // Count how many checkboxes in the group are checked
  const checkedCount = Array.from(checkboxes).filter(
    (box) => box.checked
  ).length;

  // If more than one checkbox is checked, uncheck all others
  if (checkedCount > 1) {
    checkboxes.forEach((box) => {
      if (box !== checkbox) {
        box.checked = false; // Uncheck other checkboxes
      }
    });
  }
}





