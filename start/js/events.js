function setupEventListeners() {
    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    document.getElementById('todoTitleInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    document.getElementById('todoTitleInput').addEventListener('input', (e) => {
        const len = e.target.value.length;
        document.getElementById('titleCounter').textContent = (40 - len) + ' left';
    });

    document.getElementById('todoDescInput').addEventListener('input', (e) => {
        const len = e.target.value.length;
        document.getElementById('descCounter').textContent = (150 - len) + ' left';
    });

    document.getElementById('todoTitleInput').addEventListener('focus', () => {
        document.getElementById('addTodoCard').classList.add('expanded');
    });

    document.addEventListener('click', (e) => {
        const addCard = document.getElementById('addTodoCard');
        if (!addCard.contains(e.target)) {
            const titleVal = document.getElementById('todoTitleInput').value.trim();
            const descVal = document.getElementById('todoDescInput').value.trim();
            if (!titleVal && !descVal) {
                addCard.classList.remove('expanded');
            }
        }
    });

    // Modal events
    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);

    document.getElementById('taskTitleInput').addEventListener('input', (e) => {
        document.getElementById('taskTitleCounter').textContent = (40 - e.target.value.length) + ' left';
    });

    document.getElementById('taskDescInput').addEventListener('input', (e) => {
        document.getElementById('taskDescCounter').textContent = (150 - e.target.value.length) + ' left';
    });

    // Search, filter, sort
    document.getElementById('searchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value.trim(); render(); });
    document.getElementById('priorityFilter').addEventListener('change', (e) => { state.filterPriority = e.target.value; render(); });
    document.getElementById('sortBySelect').addEventListener('change', (e) => { state.sortBy = e.target.value; render(); });

    // Drag-and-drop on columns
    document.querySelectorAll('.board-column').forEach(col => {
        col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over'); });
        col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            moveTask(e.dataTransfer.getData('text/plain'), col.getAttribute('data-column'));
        });
    });

    // Header Actions menu
    const headerActionsBtn = document.getElementById('headerActionsBtn');
    const headerActionsMenu = document.getElementById('headerActionsMenu');
    if (headerActionsBtn) {
        headerActionsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            headerActionsMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!headerActionsBtn.contains(e.target) && !headerActionsMenu.contains(e.target)) {
                headerActionsMenu.classList.add('hidden');
            }
        });

        document.getElementById('actLoadDemo').addEventListener('click', async () => {
            headerActionsMenu.classList.add('hidden');
            const confirmed = await requestConfirmation('Load Sample Data', 'This will replace all current tasks with demo data. Continue?');
            if (!confirmed) return;
            loadDemoData();
            render();
            showToast('Sample data loaded.', 'success');
        });

        document.getElementById('actCleanDone').addEventListener('click', async () => {
            headerActionsMenu.classList.add('hidden');
            const confirmed = await requestConfirmation('Clean Done', 'Remove all completed tasks?');
            if (!confirmed) return;
            state.tasks = state.tasks.filter(t => !t.completed);
            saveToStorage();
            render();
            showToast('Completed tasks cleared.', 'info');
        });

        document.getElementById('actCleanAll').addEventListener('click', async () => {
            headerActionsMenu.classList.add('hidden');
            const confirmed = await requestConfirmation('Clean All', 'This will remove ALL tasks from the board. Continue?');
            if (!confirmed) return;
            state.tasks = [];
            saveToStorage();
            render();
            showToast('All tasks cleared.', 'info');
        });
    }

    // Mobile tabs
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            state.activeTab = tab;

            document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.board-column').forEach(col => col.classList.remove('active-tab'));
            const colMap = { todo: 'columnTodo', progress: 'columnProgress', done: 'columnDone' };
            document.getElementById(colMap[tab]).classList.add('active-tab');
        });
    });

    // Dark mode toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('dtt-theme', isDark ? 'dark' : 'light');
            themeBtn.innerHTML = isDark
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';
            showToast(isDark ? 'Dark mode enabled.' : 'Light mode enabled.', 'info');
        });
    }
}
