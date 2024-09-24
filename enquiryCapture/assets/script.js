// Sheet URL ( Publish "Confrigation" Sheet As CSV File And use the CSV Link Here )
const sourceUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQdXUdGL6DN4CwP3mMVmUQv6M9ZCOshTjxIYKGynpPhnzTi8ZoV8_YEu-vEI72nS9Yf6ZnyaYOi48V8/pub?gid=326358480&single=true&output=csv';

// Store CSV data globally
let csvData = null;

// Fetch and store CSV data once
async function fetchCsvData() {
    if (!csvData) {
        try {
            const response = await fetch(sourceUrl);
            const data = await response.text();
            csvData = data.split('\n').map(row => row.split(','));
        } catch (error) {
            console.error('Error fetching CSV:', error);
        }
    }
}

// Fetch District From Zip Code
document.getElementById('zip').addEventListener('input', fetchDistrict);
async function fetchDistrict() {
    const pinCode = document.getElementById('zip').value;
    const districtSelect = document.getElementById('district');
    if (pinCode.length === 6 && /^\d{6}$/.test(pinCode)) {
        const url = `https://api.postalpincode.in/pincode/${pinCode}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data[0].Status === 'Success') {
                const districts = data[0].PostOffice.map(postOffice => postOffice.District);
                const uniqueDistricts = [...new Set(districts)];
                districtSelect.innerHTML = '';
                uniqueDistricts.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district;
                    option.textContent = district;
                    districtSelect.appendChild(option);
                });
            } else {
                districtSelect.innerHTML = '<option value="">Invalid zip code</option>';
            }
        } catch (error) {
            districtSelect.innerHTML = '<option value="">Error fetching data</option>';
            console.error('Error:', error);
        }
    } else {
        districtSelect.innerHTML = '<option value="">Invalid zip code</option>';
    }
}

// Enquiry Source Event Handling
const showroomDropdown = document.getElementById('showroomDropdown');
const fieldDropdown = document.getElementById('fieldDropdown');
const fieldLocation = document.getElementById('fieldLocation');
const digitalPromotionDropdown = document.getElementById('digitalPromotionDropdown');

document.querySelectorAll('input[name="Enquiry Source"]').forEach((radio) => {
    radio.addEventListener('change', async (event) => {
        await fetchCsvData(); // Ensure CSV data is available
        switch (event.target.id) {
            case 'Showroom':
                handleEnquirySource(3, showroomDropdown, 'Showroom Enquiry Type');
                // Hide Other Option
                fieldDropdown.style.display = "none";
                fieldLocation.style.display = "none";
                digitalPromotionDropdown.style.display = "none";
                break;
            case 'Field':
                handleEnquirySource(4, fieldDropdown, 'Field Promotion Activity Type');
                fieldLocation.style.display = "block";
                // Hide Other Option
                showroomDropdown.style.display = "none";
                digitalPromotionDropdown.style.display = "none";
                break;
            case 'DigitalPromotion':
                handleEnquirySource(5, digitalPromotionDropdown, 'Digital Promotion Enquiry Source');
                // Hide Other Option
                showroomDropdown.style.display = "none";
                fieldLocation.style.display = "none";
                fieldDropdown.style.display = "none";
                break;
        }
    });
});

function handleEnquirySource(columnIndex, dropdownElement, nameAttribute) {
    document.querySelectorAll('.dropdown').forEach(dropdown => dropdown.style.display = 'none');
    dropdownElement.innerHTML = '<option value="">Select Source</option>';
    const options = [...new Set(csvData.slice(1).map(row => row[columnIndex].trim()).filter(Boolean))];
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        dropdownElement.appendChild(optionElement);
    });
    dropdownElement.style.display = 'block';
    dropdownElement.setAttribute('name', nameAttribute);
}

// Fetch options for Enquiry Capture By
async function fetchCaptureByOptions() {
    await fetchCsvData();
    const captureByOptions = [...new Set(csvData.slice(1).map(row => row[6].trim()).filter(Boolean))];
    populateDropdown('captureByDropDown', captureByOptions);
}
fetchCaptureByOptions();

// Fetch options for Enquiry Allocated To
async function fetchAllocatedOptions() {
    await fetchCsvData();
    const allocatedToOptions = [...new Set(csvData.slice(1).map(row => row[6].trim()).filter(Boolean))];
    populateDropdown('allocatedToDropDown', allocatedToOptions);
}
fetchAllocatedOptions();

// Fetch Option For Enquiry Model
async function fetchModelOptions() {
    await fetchCsvData();
    const modelOptions = [...new Set(csvData.slice(1).map(row => row[1].trim()).filter(Boolean))];
    populateDropdown('modelName', modelOptions);
}
fetchModelOptions();

// Fetch Option For Occupation
async function fetchOccupationOptions() {
    await fetchCsvData();
    const occupationOptions = [...new Set(csvData.slice(1).map(row => row[7].trim()).filter(Boolean))];
    populateDropdown('Occupation', occupationOptions);
}
fetchOccupationOptions();

// Populate Dropdown Helper Function
function populateDropdown(dropdownId, options) {
    const selectElement = document.getElementById(dropdownId);
    selectElement.innerHTML = '<option value="">Select Option</option>';
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

// Timestamp and Enquiry ID
function updateTimestamp() {
    const now = new Date();
    const timestamp = ("0" + now.getDate()).slice(-2) + "/" + ("0" + (now.getMonth() + 1)).slice(-2) + "/" + now.getFullYear() + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2);
    document.getElementById("timestamp").value = timestamp;
}
setInterval(updateTimestamp, 1000);

document.getElementById("enquiryForm").addEventListener("submit", function (e) {
    e.preventDefault();
    updateTimestamp();
});

function generateUniqueId() {
    const now = new Date();
    const datePart = now.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, "");
    const timePart = ("0" + now.getHours()).slice(-2) + ("0" + now.getMinutes()).slice(-2) + ("0" + now.getSeconds()).slice(-2);
    document.getElementById("enquiryId").value = "EQ" + datePart + "-" + timePart;
}
generateUniqueId();

// Reset Form
document.querySelector("#reset").addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(dropdown => dropdown.style.display = 'none');
});

// Reset Form
document.querySelector("#reset").addEventListener('click', ()=>{
    showroomDropdown.style.display = 'none';
    fieldDropdown.style.display = 'none';
    fieldLocation.style.display = 'none';
    digitalPromotionDropdown.style.display = 'none';
})