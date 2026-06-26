var data = {};
var section = "1.0";
const DYNAMIC_TABLE_HEAD = `<h3>Observations</h3>
<table class="observations">
  <thead>
    <tr>
      <th>S_no</th>
      <th>description</th>
      <th>Observation</th>
      <th>Remarks/Comments</th>
      <th>Images</th>
    </tr>
  </thead>`;

const ACTION_BUTTONS = `<div class="action-buttons">
        <button type="button" onclick="saveObservation('${section}')">Save Observation</button>
      </div>`;

const dynamicContent = document.getElementById("dynamic-content");

document.addEventListener("DOMContentLoaded", function () {
  const locoInfo = JSON.parse(sessionStorage.getItem("locoInfo"));

  if (locoInfo) {
    // showSection("0.0"); // Default section to load
  }
});

// Fetch Data

function saveFetchedData(observations) {
  if (!observations) {
    setSection("1.0");
    return;
  }
  observations.forEach((obs) => {
    key = obs.S_no.substring(0, 2) + "0";
    if (!data.hasOwnProperty(key)) {
      data[key] = [];
    }
    data[key].push(obs);
  });
  console.log(data);
  setSection("1.0");
  getTable();
  return;
}

async function getObservations() {
  console.log("Button clicked, fetching observations..."); // <-- Add this line
  const locoID = document.getElementById("loco-id").value;

  if (!locoID) {
    alert("Please enter a Loco ID.");
    return;
  }

  try {
    const response = await fetch("getObservations.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `loco-id=${encodeURIComponent(locoID)}`,
    });

    // Ensure the fetch request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Fetched Data:", result); // <-- Add this line to log the result

    if (result.success) {
      const observations = result.observations;

      saveFetchedData(observations);
      // observations.forEach(obs => {
    } else {
      alert(result.message || "No observations found.");
    }
  } catch (error) {
    console.error("Error fetching observations:", error);
    alert(`An error occurred: ${error.message}`);
  }
}
// Show data

function getTable() {
  dynamicContent.innerHTML = ``;
  if (section === "1.0") {
    sectionOne();
  } else if (section === "2.0") {
    sectionTwo();
  }
  dynamicContent.innerHTML += ACTION_BUTTONS;
}

function sectionOne() {
  // Fetch data for section "1.0" or use an empty array if not available
  const row_data = data["1.0"] ? data["1.0"] : [];
  console.log(row_data);

  // Start building the table with the dynamic head
  let my_table = DYNAMIC_TABLE_HEAD + "<tbody>";

  // Loop through the row_data array to dynamically create table rows
  row_data.forEach((row, index) => {
    my_table += `
      <tr id="row-${index + 1}">
        <td>${row.S_no}</td>
        <td>
          <input 
            type="text" 
            value="${row.observation_text}" 
          />
        </td>
        <td>
          <select onchange="updateData(${index}, 'observation_status', this.value)">
            <option value="Select Ok or Not ok" ${
              !row.observation_status ? "selected" : ""
            }>Please choose an option</option>
            <option value="ok" ${
              row.observation_status === "ok" ? "selected" : ""
            }>Ok</option>
            <option value="not-ok" ${
              row.observation_status === "not-ok" ? "selected" : ""
            }>Not OK</option>
          </select>
        </td>
        <td>
          <textarea 
            rows="2" 
            cols="20" 
            placeholder="Add comments here if Not OK..."
            onchange="updateData(${index}, 'remarks', this.value)"
          >${row.remarks || ""}</textarea>
        </td>
          <td>
            <button class="add-image" onclick="showUploadOptions(${
              index + 1
            })">Add Image</button>
            <div class="upload-options" id="upload-options-${
              index + 1
            }" style="display: none;">
              <button class="add-image" onclick="startCamera(${
                index + 1
              })">Camera</button>
              <input type="file" accept="image/*" onchange="displayImage(this, ${
                index + 1
              })">
            </div>
            <img src="${
              row.image_path || ""
            }" alt="Captured/Uploaded Image" id="captured-image-${
      index + 1
    }" class="captured-image" style="display: ${
      row.image_path ? "block" : "none"
    }; width: 100%; max-width: 100%; margin-top: 10px;">
          </td>
          <div id="camera-container-${index + 1}" style="display: none;">
            <video id="camera-${
              index + 1
            }" width="100%" height="auto" autoplay></video>
            <button class="add-image" onclick="captureImage(${
              index + 1
            })">Capture Image</button>
            <button class="add-image" onclick="stopCamera(${
              index + 1
            })">Stop Camera</button>
            <canvas id="canvas-${
              index + 1
            }" style="display: none;"></canvas> <!-- Canvas to capture the image -->
          </div>
        </tr>
      `;
  });

  // Close the table tag
  my_table += "</tbody></table>";

  // Append the table to the dynamic content container
  dynamicContent.innerHTML += my_table;
  console.log(dynamicContent);
}

function sectionTwo() {
  const row_data = data["2.0"] ? data["2.0"] : [];
  // Similar to section 1, change the table data cells as per your requirement (gpt lo ee code copy paste chesi nek ela kavalo adugu ala motham kalipi ichesthadi)
}

function updateData(index, key, value) {
  if (!data[section] || !data[section][index]) {
    return;
  }
  data[section][index][key] = value;
  console.log("Updated Data:", data);
}

function setSection(sec) {
  section = sec;
  getTable();
  return;
}

function showModal() {
  const modal = document.getElementById("success-modal");
  modal.style.display = "block"; // Show modal
  setTimeout(() => {
    modal.style.display = "none"; // Hide modal after 3 seconds
  }, 3000);
}

function showUploadOptions(rowId) {
  const uploadOptions = document.getElementById(`upload-options-${rowId}`);
  uploadOptions.style.display =
    uploadOptions.style.display === "none" ? "block" : "none";
}

function startCamera(rowId) {
  const cameraContainer = document.getElementById(`camera-container-${rowId}`);
  cameraContainer.style.display = "block";

  const video = document.getElementById(`camera-${rowId}`);
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error("Error starting the camera:", error);
    });
}

function stopCamera(rowId) {
  const video = document.getElementById(`camera-${rowId}`);
  const stream = video.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
  }
  video.srcObject = null;

  const cameraContainer = document.getElementById(`camera-container-${rowId}`);
  cameraContainer.style.display = "none";
}

function captureImage(rowId) {
  const canvas = document.getElementById(`canvas-${rowId}`);
  const video = document.getElementById(`camera-${rowId}`);
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageUrl = canvas.toDataURL("image/png");
  const img = document.getElementById(`captured-image-${rowId}`);
  img.src = imageUrl;
  img.style.display = "block";

  stopCamera(rowId);
}

function displayImage(input, rowId) {
  const reader = new FileReader();
  reader.onload = function () {
    const img = document.getElementById(`captured-image-${rowId}`);
    img.src = reader.result;
    img.style.display = "block";

    const index = rowId - 1;
    console.log(section, index);
    if (data[section] && data[section][index]) {
      data[section][index].image_path = reader.result;
    }
  };
  reader.readAsDataURL(input.files[0]);
}

// Function to ensure only one checkbox is selected at a time for a given group
function onlyOneChecked(checkbox, groupClass) {
  // Get all checkboxes in the same group
  const checkboxes = document.querySelectorAll(`.${groupClass}`);
  console.log(checkbox.value);

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

// Function to save Loco Info
async function saveLocoInfo() {
  const locoID = document.getElementById("loco-id").value;
  const railwayDivision = document.getElementById("railway-division").value;
  const shedName = document.getElementById("shed-name").value;
  const inspectionDate = document.getElementById("date").value;

  const locoType = document.querySelector('input[name="loco-type"]:checked');
  const brakeType = document.querySelector('input[name="brake-type"]:checked');

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

  const selectedLocoType = locoType.value;
  const selectedBrakeType = brakeType.value;

  const locoData = {
    locoID: locoID,
    locoType: selectedLocoType,
    brakeType: selectedBrakeType,
    railwayDivision: railwayDivision,
    shedName: shedName,
    inspectionDate: inspectionDate,
  };

  // Save data in session storage
  sessionStorage.setItem("locoInfo", JSON.stringify(locoData));

  try {
    const response = await fetch("connect.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "loco-id": locoID,
        "loco-type": selectedLocoType,
        "brake-type": selectedBrakeType,
        "railway-division": railwayDivision,
        "shed-name": shedName,
        "inspection-date": inspectionDate,
      }),
    });

    const data = await response.json();
    console.log(data);

    if (data.success) {
      showModal("Loco info saved successfully!");
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while saving the data.");
  }

  alert("Data saved");
}

function completeData() {
  // Clear sessionStorage for both loco and observations
  sessionStorage.removeItem("locoInfo");
  sessionStorage.removeItem("observations");

  alert(
    "Data has been saved and cleared. You can now enter information for a new loco."
  );

  // Optionally, reset form fields or navigate away from the page
  document.getElementById("dynamic-content").innerHTML = "";
}

async function saveObservation(section) {
  const locoID = document.getElementById("loco-id").value;
  const railwayDivision = document.getElementById("railway-division").value;
  const locoType = document.querySelector('input[name="loco-type"]:checked');
  const brakeType = document.querySelector('input[name="brake-type"]:checked');
  const shedName = document.getElementById("shed-name").value;
  console.log(locoType);

  // Validate if necessary fields are filled out
  if (!locoID || !railwayDivision || !locoType || !brakeType) {
    alert("Please fill out all fields before saving.");
    return;
  }

  const observations = data;

  if (!observations || observations.length === 0) {
    alert("No observations found.");
    return;
  }

  try {
    const response = await fetch("store_observation.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "loco-id": locoID,
        "section-id": section, // Include section ID in the request
        observations: JSON.stringify(observations),
        "loco-type": locoType.value, // Send loco type value
        "brake-type": brakeType.value, // Send brake type value
        "railway-division": railwayDivision, // Send railway division
        "shed-name": shedName,
      }),
    });

    const data = await response.json(); // Parse the response as JSON
    if (data.success) {
      showModal("Observations saved successfully!");
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while saving the observations.");
  }

  alert("Data Saved, go to next section");
  next();
}

function next() {
  // Get the current section number (e.g., "1.0" -> 1)
  const currentSection = parseInt(section.split(".")[0]);

  // Increment the section number
  const nextSection = `${currentSection + 1}.0`;

  // Check if the next section exists in the data
  if (data[nextSection]) {
    setSection(nextSection);
    getTable(); // Render the table for the new section
    console.log(`Section changed to: ${nextSection}`);
  } else {
    alert("No more sections available.");
  }
}
