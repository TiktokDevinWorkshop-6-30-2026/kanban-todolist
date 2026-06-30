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
        if (!addCard.contains(e.target) && !titleInput.value.trim() && !descInput.value.trim()) {
            addCard.classList.remove('expanded');
        }
    });

    // Edit modal
    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);
    const modalTitleInput = document.getElementById('taskTitleInput');
    const modalDescInput = document.getElementById('taskDescInput');
    modalTitleInput.addEventListener('input', () => {
        document.getElementById('taskTitleCounter').textContent = `${40 - modalTitleInput.value.length} left`;
    });
    modalDescInput.addEventListener('input', () => {
        document.getElementById('taskDescCounter').textContent = `${150 - modalDescInput.value.length} left`;
    });

    // Search / filter / sort
    document.getElementById('searchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value.trim(); render(); });
    document.getElementById('priorityFilter').addEventListener('change', (e) => { state.filterPriority = e.target.value; saveToStorage(); render(); });
    document.getElementById('sortBySelect').addEventListener('change', (e) => { state.sortBy = e.target.value; saveToStorage(); render(); });

    // Drag & drop between columns
    document.querySelectorAll('.board-column').forEach(col => {
        col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over'); });
        col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            moveTask(e.dataTransfer.getData('text/plain'), col.getAttribute('data-column'));
        });
    });

    // Header Actions menu (bulk operations)
    const actionsBtn = document.getElementById('headerActionsBtn');
    const actionsMenu = document.getElementById('headerActionsMenu');
    actionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        actionsMenu.classList.toggle('hidden');
    });

    document.getElementById('actLoadDemo').addEventListener('click', async () => {
        actionsMenu.classList.add('hidden');
        if (await requestConfirmation('Load Sample Data', 'This replaces all current tasks with the demo set. Continue?')) {
            loadDemoData();
            render();
            showToast('Sample data loaded.', 'success');
        }
    });
    document.getElementById('actCleanDone').addEventListener('click', async () => {
        actionsMenu.classList.add('hidden');
        if (await requestConfirmation('Clean Done', 'Permanently delete all completed tasks?')) {
            state.tasks = state.tasks.filter(t => !t.completed);
            saveToStorage();
            render();
            showToast('Completed tasks cleared.', 'success');
        }
    });
    document.getElementById('actCleanAll').addEventListener('click', async () => {
        actionsMenu.classList.add('hidden');
        if (await requestConfirmation('Clean All', 'Permanently delete ALL tasks? This cannot be undone.')) {
            state.tasks = [];
            saveToStorage();
            render();
            showToast('All tasks deleted.', 'success');
        }
    });

    // Mobile column tabs
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            state.activeTab = tab;
            document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
            document.querySelectorAll('.board-column').forEach(col => {
                col.classList.toggle('active-tab', col.getAttribute('data-column') === tab);
            });
        });
    });

    // Close menus on outside click
    document.addEventListener('click', () => {
        hideContextMenu();
        hideBadgePriorityMenu();
        actionsMenu.classList.add('hidden');
    });
}
