let editModeActive = false;
let moveModeActive = false;
let deleteModeActive = false;
let currentPole;
let currentImage = null;

window.onload = function() {
    const isLoggedIn = localStorage.getItem('loggedIn'); //etong line nag checheck kung logged-in si user (SECURITY PURPOSES)
    if (!isLoggedIn) {
        alert("You must login first.");
        window.location.href = '../index.html';
        return;
    }

    fetchPolesData();
};

// eto kukuha ng poles data niyo sa poles.txt 
async function fetchPolesData() {
    try {
        const response = await fetch('/getPoles');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const polesData = await response.json();
        console.log('Fetched Pole Data:', polesData); // Log fetched data
        
        polesData.forEach(pole => {
            generatePoleIcon(pole);
        });
    } catch (error) {
        console.error('Error fetching pole data:', error);
    }
}

function logout() {
    //eto mag cleclear ng local storage at session storage para di maka balik sa home pag di nag login
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '../index.html';
}

function addButton() {
    const isLoggedIn = localStorage.getItem('loggedIn'); //etong line nag checheck kung loggedin si user (SECURITY PURPOSES)
    if (!isLoggedIn) {
        alert("You must login first.");
        window.location.href = '../index.html';
    }

    const popup = createPopupForm();
    document.body.appendChild(popup);
}

function createPopupForm(isEdit = false, poleData = {}) {
    const formPopup = document.createElement('div');
    formPopup.id = 'formPopup';

    formPopup.innerHTML = `
        <h3>${isEdit ? 'Edit Pole Information' : 'Add Pole Information'}</h3>
        <label>Pole Name: <input type="text" id="poleName" value="${poleData.name || ''}" required /></label><br>
        <label>Pole Address: <input type="text" id="poleAddress" value="${poleData.address || ''}" required /></label><br>
        <label>Pole Type: <input type="text" id="poleType" value="${poleData.type || ''}" required /></label><br>
        <label>Pole Size: <input type="text" id="poleSize" value="${poleData.size || ''}" required /></label><br>
        <label>Pole Assembly: <input type="text" id="poleAssembly" value="${poleData.assembly || ''}" required /></label><br>
        <label>Transformer Rating: <input type="text" id="transformerRating" value="${poleData.transformerRating || ''}" required /></label><br>
        <button onclick="${isEdit ? 'saveEditedPoleInfo()' : 'savePoleInfo()'}">Save</button>
        <button onclick="closeForm()">Cancel</button>
    `;

    stylePopup(formPopup);
    return formPopup;
}

//style lang  to ng popup pwede niyo palitan
function stylePopup(popup) {
    popup.style.position = 'absolute';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.border = '2px solid black';
    popup.style.zIndex = '1000';
}

// etong code nato mag sasave ng pole info
function savePoleInfo() {
    const poleData = getFormData();
    if (!validateFormData(poleData)) return;

    // eto yung initial position ng pole pwede palitan
    const initialPosition = {
        top: '100px',
        left: '100px'
    };

    poleData.position = initialPosition;

    fetch('/savePole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poleData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Pole saved successfully!');
            poleData.id = data.id;
            generatePoleIcon(poleData);
            closeForm();
        } else {
            alert('Failed to save pole.');
        }
    })
    .catch(error => console.error('Error:', error));
}
// eto mag gegenerate ng pole icon + data
function generatePoleIcon(data) {
    const mainContainer = document.getElementById('mainContainer');
    const poleIcon = document.createElement('img');

    poleIcon.src = '/assets/images/pole.png'; // eto yung path ng icon kung trip niyo palitan
    console.log('Generating pole icon with src:', poleIcon.src);
    poleIcon.className = 'pole-icon draggable';
    poleIcon.style.width = '50px';
    poleIcon.style.height = '50px';
    poleIcon.style.position = 'absolute';
    poleIcon.style.left = data.position.left || '0px';
    poleIcon.style.top = data.position.top || '0px';
    poleIcon.dataset.info = JSON.stringify(data);
    poleIcon.dataset.id = data.id;

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = '#fff';
    tooltip.style.border = '1px solid #ccc';
    tooltip.style.padding = '5px';
    tooltip.style.display = 'none';

    mainContainer.appendChild(poleIcon);
    mainContainer.appendChild(tooltip);
    console.log('Pole icon generated and appended:', poleIcon);

    poleIcon.addEventListener('mouseover', () => {
        const info = JSON.parse(poleIcon.dataset.info);
        tooltip.innerHTML = `
            <strong>Name:</strong> ${info.name}<br>
            <strong>Address:</strong> ${info.address}<br>
            <strong>Type:</strong> ${info.type}<br>
            <strong>Size:</strong> ${info.size}<br>
            <strong>Assembly:</strong> ${info.assembly}<br>
            <strong>Transformer Rating:</strong> ${info.transformerRating}
        `;

        const saveButtonRect = document.getElementById('saveButton').getBoundingClientRect();
        tooltip.style.left = `${saveButtonRect.left}px`;
        tooltip.style.top = `${saveButtonRect.bottom + 20}px`;
        tooltip.style.display = 'block';
    });

    poleIcon.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
    });
}

function editPole(poleIcon) {
    const poleData = JSON.parse(poleIcon.dataset.info);
    currentPole = poleIcon;
    const popup = createPopupForm(true, poleData);
    document.body.appendChild(popup);
}

function saveEditedPoleInfo() {
    const poleData = JSON.parse(currentPole.dataset.info); //kukuha ng existing pole data

    // ifoforce yung code na eto lang kukunin para ma update hindi na yung ID at position
    poleData.name = document.getElementById('poleName').value;
    poleData.address = document.getElementById('poleAddress').value;
    poleData.type = document.getElementById('poleType').value;
    poleData.size = document.getElementById('poleSize').value;
    poleData.assembly = document.getElementById('poleAssembly').value;
    poleData.transformerRating = document.getElementById('transformerRating').value;

    console.log("Updated Data Before Sending:", poleData); // pang debug lang to sa console

    fetch('http://localhost:3000/updatePole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poleData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Pole updated successfully') {
            currentPole.dataset.info = JSON.stringify(poleData); // eto mag uupdate ng dataset niyo poles.txt
            closeForm();
            alert('Pole updated successfully!');
            editModeActive = false; 
        } else {
            alert('Failed to update pole.');
        }
    })
    .catch(error => console.error('Error:', error));
}

function movePole(poleIcon, e) {
    const offsetX = e.clientX - poleIcon.getBoundingClientRect().left;
    const offsetY = e.clientY - poleIcon.getBoundingClientRect().top;

    const onMouseMove = (mouseMoveEvent) => {
        poleIcon.style.left = `${mouseMoveEvent.clientX - offsetX}px`;
        poleIcon.style.top = `${mouseMoveEvent.clientY - offsetY}px`;
    };

    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;

        // eto mag uupdate ng pole position
        const newPosition = {
            top: poleIcon.style.top,
            left: poleIcon.style.left
        };

        const poleData = JSON.parse(poleIcon.dataset.info);
        poleData.position = newPosition;

        // eto mag sesend ng update sa server
        fetch('/updatePole', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(poleData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Pole position updated successfully');
            }
        })
        .catch(error => console.error('Error:', error));
    };

    e.preventDefault();
}

function moveMode() {
    const isLoggedIn = localStorage.getItem('loggedIn');
    if (!isLoggedIn) {
        alert("You must login first.");
        window.location.href = '../index.html';
    }

    moveModeActive = !moveModeActive;
    const moveButton = document.querySelector('button[onclick="moveMode()"]');
    moveButton.style.backgroundColor = moveModeActive ? 'green' : '';
    
    alert(moveModeActive ? 'Select a pole to move.' : 'Move mode disabled.');
}

document.getElementById('mainContainer').addEventListener('click', (e) => {
    if (moveModeActive && e.target.classList.contains('draggable')) {
        const poleIcon = e.target;
        movePole(poleIcon, e);
    }
});

function editMode() {
    const isLoggedIn = localStorage.getItem('loggedIn'); //etong line nag checheck kung loggedin si user (SECURITY PURPOSES)
    if (!isLoggedIn) {
        alert("You must login first.");
        window.location.href = '../index.html';
    }

    editModeActive = !editModeActive;
    alert(editModeActive ? 'Select a pole to edit.' : 'Edit mode disabled.');
    console.log("Edit Mode Active:", editModeActive);
}

document.getElementById('mainContainer').addEventListener('click', (e) => {
    if (editModeActive && e.target.classList.contains('draggable')) {
        const poleIcon = e.target;
        editPole(poleIcon); 
    }
});

function getFormData() {
    return {
        name: document.getElementById('poleName').value,
        address: document.getElementById('poleAddress').value,
        type: document.getElementById('poleType').value,
        size: document.getElementById('poleSize').value,
        assembly: document.getElementById('poleAssembly').value,
        transformerRating: document.getElementById('transformerRating').value,
    };
}

//eto mag vavalidate ng form data
function validateFormData(data) {
    if (Object.values(data).some(value => !value)) {
        alert('Please fill in all fields.');
        return false;
    }
    return true;
}

function closeForm() {
    const formPopup = document.getElementById('formPopup');
    if (formPopup) formPopup.remove();
}

function removeButton() {
    const isLoggedIn = localStorage.getItem('loggedIn'); //etong line nag checheck kung loggedin si user (SECURITY PURPOSES)
    if (!isLoggedIn) {
        alert("You must login first.");
        window.location.href = '../index.html';
        return;
    }

    deleteModeActive = true; // Activate delete mode
    alert('Select a pole to delete.'); 
}

// Eto yung mag reremove ng poles
function removePole(poleIcon) {
    const poleId = poleIcon.dataset.id; //kukunin niya yung pole ID machecheck niyo sa poles.txt

    //Confirmation ng delete
    if (!confirm(`Are you sure you want to delete the pole with ID: ${poleId}?`)) {
        return; // kung cancel pinindot balewala yung function
    }

    fetch('http://localhost:3000/deletePole', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: Number(poleId) }), // eto nag mamakesure na number yung ID
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        // eto mag aalis nung pole sa screen niyo
        poleIcon.remove();

        deleteModeActive = false; 
        alert('Pole deleted successfully.'); 
    })
    .catch((error) => {
        console.error('Error deleting pole:', error);
        alert('Failed to remove pole: ' + error.message);
    });
}

document.getElementById('mainContainer').addEventListener('click', (e) => {
    if (deleteModeActive && e.target.classList.contains('draggable')) {
        const poleIcon = e.target;
        removePole(poleIcon); 
    }
});

function save() {
    const isLoggedIn = localStorage.getItem('loggedIn'); //etong line nag checheck kung loggedin si user (SECURITY PURPOSES)
    if (!isLoggedIn) {
        alert("You must login first.");
        window.location.href = '../index.html';
    }

    const images = document.querySelectorAll('.draggable');
    const dataToSave = Array.from(images).map(image => {
        const poleData = JSON.parse(image.dataset.info);
        poleData.position = { top: image.style.top, left: image.style.left };
        return poleData;
    });

    fetch('/saveAllPolesData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
    })
        .then(response => response.json())
        .then(data => alert('All pole information saved successfully!'))
        .catch(error => console.error('Error:', error));
}
