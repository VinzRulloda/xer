let editModeActive = false;

function logout() {
    window.location.href = '../index.html';
}

function addButton() {
    const mainContainer =document.getElementById('mainContainer');

    const newButton =  document.createElement('button');
    newButton.innerText = 'Click me';
    newButton.className = 'draggable';
    newButton.ondblclick = () => showInfoForm(newButton);

    newButton.onmousedown = (e) => {
        if (editModeActive) {
            e.preventDefault();
            const rect = mainContainer.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            const moveAt = (pageX, pageY) => {
                newButton.style.left = `${pageX - offsetX}px`;
                newButton.style.top = `${pageY - offsetY}px`;
            };

            moveAt(e.pageX, e.pageY);

            const onMouseMove = (e) => {
                moveAt(e.pageX, e.pageY);
            };

            document.addEventListener('mousemove', onMouseMove);

            document.onmouseup = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.onmouseup = null;
            };
        }
    };

    mainContainer.appendChild(newButton);
}

function editMode() {
    editModeActive = !editModeActive;
    const buttons = document.querySelectorAll(`.draggable`);
    buttons.forEach(button => button.style.border = editModeActive ? '2px dashed white' : '');
}

function removeButton() {
    const buttons = document.querySelectorAll('.draggable');
    buttons.forEach(button => {
        if (button.style.border === '2px dashed white') {
            button.remove();
        }
    });
}

function save() {

}

function showInfoForm(button) {
    const info = prompt(`Pole Name:\nPole Address:\nPole Type:\nPole Size:\nPole Assembly:\nTransformer Rating:`);
    if (info) {
        alert(`Pole Info:\n${info}`);
    }
}