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

    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);

    const taskTitleInput = document.getElementById('taskTitleInput');
    const taskDescInput = document.getElementById('taskDescInput');
    taskTitleInput.addEventListener('input', () => {
        document.getElementById('taskTitleCounter').textContent = `${40 - taskTitleInput.value.length} left`;
    });
    taskDescInput.addEventListener('input', () => {
        document.getElementById('taskDescCounter').textContent = `${150 - taskDescInput.value.length} left`;
    });

    document.getElementById('priorityFilter').value = state.filterPriority;
    document.getElementById('sortBySelect').value = state.sortBy;

    document.getElementById('searchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value.trim(); render(); });
    document.getElementById('priorityFilter').addEventListener('change', (e) => { state.filterPriority = e.target.value; saveToStorage(); render(); });
    document.getElementById('sortBySelect').addEventListener('change', (e) => { state.sortBy = e.target.value; saveToStorage(); render(); });

    setupHeaderActions();
    setupMobileTabs();
    setupGlobalMenuDismissal();
    setupDragAndDrop();
}

function setupHeaderActions() {
    const btn = document.getElementById('headerActionsBtn');
    const menu = document.getElementById('headerActionsMenu');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });

    document.getElementById('actLoadDemo').addEventListener('click', async () => {
        menu.classList.add('hidden');
        if (await requestConfirmation('Load Sample Data', 'Replace the current board with the sample tasks?')) {
            loadDemoData();
            render();
            showToast('Sample data loaded.', 'success');
        }
    });
    document.getElementById('actCleanDone').addEventListener('click', async () => {
        menu.classList.add('hidden');
        if (await requestConfirmation('Clean Done', 'Permanently delete all completed tasks?')) {
            state.tasks = state.tasks.filter(t => !t.completed);
            saveToStorage();
            render();
            showToast('Cleared completed tasks.', 'success');
        }
    });
    document.getElementById('actCleanAll').addEventListener('click', async () => {
        menu.classList.add('hidden');
        if (await requestConfirmation('Clean All', 'Permanently delete every task on the board?')) {
            state.tasks = [];
            saveToStorage();
            render();
            showToast('Board cleared.', 'success');
        }
    });
}

function setupMobileTabs() {
    const buttons = document.querySelectorAll('.mobile-tab-btn');
    applyActiveTab(state.activeTab);
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            state.activeTab = btn.dataset.tab;
            saveToStorage();
            applyActiveTab(state.activeTab);
        });
    });
}

function applyActiveTab(tab) {
    document.querySelectorAll('.mobile-tab-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.querySelectorAll('.board-column').forEach((col) => {
        col.classList.toggle('active-tab', col.getAttribute('data-column') === tab);
    });
}

function setupGlobalMenuDismissal() {
    document.addEventListener('click', (e) => {
        hideContextMenu();
        if (!e.target.closest('.badge-priority')) hideBadgePriorityMenu();
        const actionsDropdown = e.target.closest('.header-actions-dropdown');
        if (!actionsDropdown) document.getElementById('headerActionsMenu').classList.add('hidden');
    });
    document.addEventListener('scroll', hideContextMenu, true);
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
