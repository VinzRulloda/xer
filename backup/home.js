let editModeActive = false;
let moveModeActive = false;
let deleteModeActive = false;
let currentImage = null;

window.onload = function() {
    const isLoggedIn = localStorage.getItem('loggedIn'); //etong line nag checheck kung logged-in si user (SECURITY PURPOSES)
    if (!isLoggedIn) {
        alert("You must login first.");
        window.location.href = '../index.html';
    }
    
};
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

// Apply styles to the popup
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

// Save pole info and generate a new icon
function savePoleInfo() {
    const poleData = getFormData();
    if (!validateFormData(poleData)) return;

    fetch('/savePole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poleData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Pole saved successfully!');
            generatePoleIcon(poleData);
            closeForm();
        } else {
            alert('Failed to save pole.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Generate a new icon button for the saved pole
function generatePoleIcon(data) {
    const mainContainer = document.getElementById('mainContainer');
    const poleIcon = document.createElement('img');

    poleIcon.src = '../assets/images/pole.png';
    poleIcon.className = 'pole-icon draggable';
    poleIcon.style.width = '50px';
    poleIcon.style.height = '50px';
    poleIcon.style.position = 'absolute';
    poleIcon.style.left = '100px';
    poleIcon.style.top = '100px';
    poleIcon.dataset.info = JSON.stringify(data);

    poleIcon.onclick = () => {
        if (editModeActive) {
            editPole(poleIcon);
        } else if (moveModeActive) {
            movePole(poleIcon);
        } else {
            displayPoleInfo(poleIcon);
        }
    };

    mainContainer.appendChild(poleIcon);
}

function displayPoleInfo(poleIcon) {
    const info = JSON.parse(poleIcon.dataset.info);
    alert(`Pole Information:
Name: ${info.name}
Address: ${info.address}
Type: ${info.type}
Size: ${info.size}
Assembly: ${info.assembly}
Transformer Rating: ${info.transformerRating}`);
}

function editPole(poleIcon) {
    const poleData = JSON.parse(poleIcon.dataset.info);
    currentPole = poleIcon;
    const popup = createPopupForm(true, poleData);
    document.body.appendChild(popup);
}

function saveEditedPoleInfo() {
    const updatedData = getFormData();
    if (!validateFormData(updatedData)) return;

    currentPole.dataset.info = JSON.stringify(updatedData);

    // Update the data in the backend
    fetch('/updatePole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Pole updated successfully!');
            closeForm();
        } else {
            alert('Failed to update pole.');
        }
    })
    .catch(error => console.error('Error:', error));
}

function movePole(poleIcon) {
    poleIcon.onmousedown = (e) => {
        const rect = poleIcon.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const moveAt = (pageX, pageY) => {
            poleIcon.style.left = `${pageX - offsetX}px`;
            poleIcon.style.top = `${pageY - offsetY}px`;
        };

        moveAt(e.pageX, e.pageY);

        const onMouseMove = (e) => moveAt(e.pageX, e.pageY);
        document.addEventListener('mousemove', onMouseMove);

        document.onmouseup = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.onmouseup = null;
        };
    };
}

function moveMode() {
    const isLoggedIn = localStorage.getItem('loggedIn');
    if (!isLoggedIn) {
        alert("You must login first.");
        window.location.href = '../index.html';
    }

    moveModeActive = !moveModeActive;
    alert(moveModeActive ? 'Select a pole to move.' : 'Move mode disabled.');
}

function editMode() {
    const isLoggedIn = localStorage.getItem('loggedIn'); //etong line nag checheck kung loggedin si user (SECURITY PURPOSES)
    if (!isLoggedIn) {
        alert("You must login first.");
        window.location.href = '../index.html';
    }

    editModeActive = !editModeActive;
    alert(editModeActive ? 'Select a pole to edit.' : 'Edit mode disabled.');
}

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
// Validate form data
function validateFormData(data) {
    if (Object.values(data).some(value => !value)) {
        alert('Please fill in all fields.');
        return false;
    }
    return true;
}

// Close the popup form
function closeForm() {
    const formPopup = document.getElementById('formPopup');
    if (formPopup) formPopup.remove();
}

// Remove the selected pole
function removePole(poleIcon) {
    const info = JSON.parse(poleIcon.dataset.info);

    if (confirm(`Are you sure you want to delete this pole: ${info.name}?`)) {
        // Remove pole from the view
        poleIcon.remove();

        // Remove pole from the database
        fetch('/deletePole', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: info.name }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Pole removed successfully!');
            } else {
                alert('Failed to remove pole.');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    deleteModeActive = false;
}

function removeButton() {
    const isLoggedIn = localStorage.getItem('loggedIn'); //etong line nag checheck kung loggedin si user (SECURITY PURPOSES)
    if (!isLoggedIn) {
        alert("You must login first.");
        window.location.href = '../index.html';
    }

    deleteModeActive = true;
    alert(deleteModeActive ? 'Select a pole to delete.' : 'Delete mode disabled.'); 
}

document.getElementById('mainContainer').addEventListener('click', (e) => {
    if (deleteModeActive && e.target.classList.contains('draggable')) {
        const button = e.target;
        if (confirm('Are you sure you want to delete this button?')) {
            button.remove();
            alert('Button deleted');
        }
        deleteModeActive = false;
    }
});

function save() {
    const isLoggedIn = localStorage.getItem('loggedIn'); //etong line nag checheck kung loggedin si user (SECURITY PURPOSES)
    if (!isLoggedIn) {
        alert("You must login first.");
        window.location.href = '../index.html';
    }

    const images = document.querySelectorAll('.draggable');
    const dataToSave = Array.from(images).map(image => ({
        src: image.src,
        poleInfo: image.dataset.info,
        position: { top: image.style.top, left: image.style.left }
    }));

    fetch('/saveAllPolesData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
    })
        .then(response => response.json())
        .then(data => alert('All pole information saved successfully!'))
        .catch(error => console.error('Error:', error));
}