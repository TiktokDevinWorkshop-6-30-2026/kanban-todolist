function setupEventListeners() {
    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const titleCounter = document.getElementById('titleCounter');
    const descCounter = document.getElementById('descCounter');
    const addCard = document.getElementById('addTodoCard');

    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    titleInput.addEventListener('input', () => {
        titleCounter.textContent = `${40 - titleInput.value.length} left`;
    });
    descInput.addEventListener('input', () => {
        descCounter.textContent = `${150 - descInput.value.length} left`;
    });

    titleInput.addEventListener('focus', () => {
        addCard.classList.add('expanded');
    });

    document.addEventListener('click', (e) => {
        if (!addCard.contains(e.target) &&
            titleInput.value.trim() === '' &&
            descInput.value.trim() === '') {
            addCard.classList.remove('expanded');
        }
    });

    setupDragAndDrop();
}

// Find the card the dragged element should be inserted before, based on cursor Y.
function getDragAfterElement(container, y) {
    const cards = [...container.querySelectorAll('.task-card:not(.dragging)')];
    let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
    cards.forEach((card) => {
        const box = card.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            closest = { offset, element: card };
        }
    });
    return closest.element;
}

function setupDragAndDrop() {
    document.querySelectorAll('.board-column').forEach((col) => {
        const body = col.querySelector('.column-body');
        const column = col.getAttribute('data-column');

        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            col.classList.add('drag-over');
        });
        col.addEventListener('dragleave', (e) => {
            if (!col.contains(e.relatedTarget)) col.classList.remove('drag-over');
        });
        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            const taskId = e.dataTransfer.getData('text/plain');
            const afterElement = getDragAfterElement(body, e.clientY);
            const beforeId = afterElement ? afterElement.dataset.id : null;
            handleTaskDrop(taskId, column, beforeId);
        });
    });
}
