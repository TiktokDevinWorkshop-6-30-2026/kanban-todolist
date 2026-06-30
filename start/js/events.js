function setupEventListeners() {
    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    document.getElementById('todoTitleInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addNewTodo();
    });

    document.getElementById('todoTitleInput').addEventListener('input', function(e) {
        var len = e.target.value.length;
        document.getElementById('titleCounter').textContent = (40 - len) + ' left';
    });

    document.getElementById('todoDescInput').addEventListener('input', function(e) {
        var len = e.target.value.length;
        document.getElementById('descCounter').textContent = (150 - len) + ' left';
    });

    document.getElementById('todoTitleInput').addEventListener('focus', function() {
        document.getElementById('addTodoCard').classList.add('expanded');
    });

    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);

    document.getElementById('taskTitleInput').addEventListener('input', function(e) {
        var len = e.target.value.length;
        document.getElementById('taskTitleCounter').textContent = (40 - len) + ' left';
    });

    document.getElementById('taskDescInput').addEventListener('input', function(e) {
        var len = e.target.value.length;
        document.getElementById('taskDescCounter').textContent = (150 - len) + ' left';
    });

    document.getElementById('searchInput').addEventListener('input', function(e) {
        state.searchQuery = e.target.value.trim();
        render();
    });

    document.getElementById('priorityFilter').addEventListener('change', function(e) {
        state.filterPriority = e.target.value;
        render();
    });

    document.getElementById('sortBySelect').addEventListener('change', function(e) {
        state.sortBy = e.target.value;
        render();
    });

    // Drag-and-drop on columns
    var columns = document.querySelectorAll('.board-column');
    columns.forEach(function(col) {
        col.addEventListener('dragover', function(e) {
            e.preventDefault();
            col.classList.add('drag-over');
        });
        col.addEventListener('dragleave', function() {
            col.classList.remove('drag-over');
        });
        col.addEventListener('drop', function(e) {
            e.preventDefault();
            col.classList.remove('drag-over');
            moveTask(e.dataTransfer.getData('text/plain'), col.getAttribute('data-column'));
        });
    });

    // Header Actions menu toggle
    document.getElementById('headerActionsBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        var menu = document.getElementById('headerActionsMenu');
        menu.classList.toggle('hidden');
    });

    // Actions menu items
    document.getElementById('actLoadDemo').addEventListener('click', async function() {
        document.getElementById('headerActionsMenu').classList.add('hidden');
        var confirmed = await requestConfirmation('Load Sample Data', 'This will replace all tasks with sample data. Continue?');
        if (!confirmed) return;
        loadDemoData();
        render();
        showToast('Sample data loaded.', 'success');
    });

    document.getElementById('actCleanDone').addEventListener('click', async function() {
        document.getElementById('headerActionsMenu').classList.add('hidden');
        var confirmed = await requestConfirmation('Clean Done', 'Remove all completed tasks?');
        if (!confirmed) return;
        state.tasks = state.tasks.filter(function(t) { return !t.completed; });
        saveToStorage();
        render();
        showToast('Done tasks cleared.', 'success');
    });

    document.getElementById('actCleanAll').addEventListener('click', async function() {
        document.getElementById('headerActionsMenu').classList.add('hidden');
        var confirmed = await requestConfirmation('Clean All', 'Remove ALL tasks from the board? This cannot be undone.');
        if (!confirmed) return;
        state.tasks = [];
        saveToStorage();
        render();
        showToast('All tasks cleared.', 'success');
    });

    // Mobile tabs
    var tabBtns = document.querySelectorAll('.mobile-tab-btn');
    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var tab = btn.getAttribute('data-tab');
            state.activeTab = tab;

            tabBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');

            document.querySelectorAll('.board-column').forEach(function(col) {
                col.classList.remove('active-tab');
            });

            var colMap = { todo: 'columnTodo', progress: 'columnProgress', done: 'columnDone' };
            document.getElementById(colMap[tab]).classList.add('active-tab');
        });
    });

    // Dark mode toggle
    var darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            var isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('daily-task-tracker-dark', isDark ? 'true' : 'false');
            var icon = darkToggle.querySelector('i');
            if (icon) {
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }

    // Outside click: close add card, context menu, badge menu, actions menu
    document.addEventListener('click', function(e) {
        var addCard = document.getElementById('addTodoCard');
        if (!addCard.contains(e.target)) {
            var titleVal = document.getElementById('todoTitleInput').value.trim();
            var descVal = document.getElementById('todoDescInput').value.trim();
            if (!titleVal && !descVal) {
                addCard.classList.remove('expanded');
            }
        }

        // Close context menu
        var ctxMenu = document.getElementById('contextMenu');
        if (!ctxMenu.contains(e.target)) {
            hideContextMenu();
        }

        // Close badge priority menu
        var badgeMenu = document.getElementById('badgePriorityMenu');
        if (!badgeMenu.contains(e.target) && !e.target.classList.contains('badge-priority')) {
            hideBadgePriorityMenu();
        }

        // Close actions menu
        var actionsMenu = document.getElementById('headerActionsMenu');
        var actionsBtn = document.getElementById('headerActionsBtn');
        if (!actionsMenu.contains(e.target) && !actionsBtn.contains(e.target)) {
            actionsMenu.classList.add('hidden');
        }
    });
}
