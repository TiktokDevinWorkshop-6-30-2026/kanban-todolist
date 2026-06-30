function setupEventListeners() {
    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    document.getElementById('todoTitleInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addNewTodo();
    });

    // Title character counter
    document.getElementById('todoTitleInput').addEventListener('input', function() {
        var len = this.value.length;
        document.getElementById('titleCounter').textContent = (40 - len) + ' left';
    });

    // Description character counter
    document.getElementById('todoDescInput').addEventListener('input', function() {
        var len = this.value.length;
        document.getElementById('descCounter').textContent = (150 - len) + ' left';
    });

    // Expand description row on title focus
    document.getElementById('todoTitleInput').addEventListener('focus', function() {
        document.getElementById('addTodoCard').classList.add('expanded');
    });

    // Collapse when clicking outside if both fields are empty
    document.addEventListener('click', function(e) {
        var addCard = document.getElementById('addTodoCard');
        if (!addCard.contains(e.target)) {
            var titleVal = document.getElementById('todoTitleInput').value.trim();
            var descVal = document.getElementById('todoDescInput').value.trim();
            if (!titleVal && !descVal) {
                addCard.classList.remove('expanded');
            }
        }
    });

    // Modal counters
    document.getElementById('taskTitleInput').addEventListener('input', function() {
        document.getElementById('taskTitleCounter').textContent = (40 - this.value.length) + ' left';
    });
    document.getElementById('taskDescInput').addEventListener('input', function() {
        document.getElementById('taskDescCounter').textContent = (150 - this.value.length) + ' left';
    });

    // Save edit button
    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', function() {
        var html = document.documentElement;
        var isDark = html.getAttribute('data-theme') === 'dark';
        var newTheme = isDark ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme-preference', newTheme);
        var icon = this.querySelector('i');
        icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
        this.title = isDark ? 'Toggle dark mode' : 'Toggle light mode';
    });

    // Search, filter, sort
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

    // Drag & drop on board columns
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

    // Header Actions menu
    var headerActionsBtn = document.getElementById('headerActionsBtn');
    var headerActionsMenu = document.getElementById('headerActionsMenu');
    if (headerActionsBtn && headerActionsMenu) {
        headerActionsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            headerActionsMenu.classList.toggle('hidden');
        });

        document.getElementById('actLoadDemo').addEventListener('click', function() {
            headerActionsMenu.classList.add('hidden');
            requestConfirmation('Load Sample Data', 'This will replace all current tasks with demo data. Continue?').then(function(confirmed) {
                if (!confirmed) return;
                loadDemoData();
                render();
                showToast('Sample data loaded.', 'success');
            });
        });

        document.getElementById('actCleanDone').addEventListener('click', function() {
            headerActionsMenu.classList.add('hidden');
            requestConfirmation('Clean Done', 'Remove all completed tasks?').then(function(confirmed) {
                if (!confirmed) return;
                state.tasks = state.tasks.filter(function(t) { return !t.completed; });
                saveToStorage();
                render();
                showToast('Completed tasks cleared.', 'success');
            });
        });

        document.getElementById('actAbout').addEventListener('click', function() {
            headerActionsMenu.classList.add('hidden');
            openModal('aboutModal');
        });

        document.getElementById('actCleanAll').addEventListener('click', function() {
            headerActionsMenu.classList.add('hidden');
            requestConfirmation('Clean All Tasks', 'This will permanently delete ALL tasks. Are you sure?').then(function(confirmed) {
                if (!confirmed) return;
                state.tasks = [];
                saveToStorage();
                render();
                showToast('All tasks cleared.', 'success');
            });
        });
    }

    // Mobile tabs
    var mobileTabs = document.querySelectorAll('.mobile-tab-btn');
    mobileTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            var targetTab = tab.getAttribute('data-tab');
            state.activeTab = targetTab;

            mobileTabs.forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');

            var allCols = document.querySelectorAll('.board-column');
            allCols.forEach(function(col) { col.classList.remove('active-tab'); });

            var colMap = { todo: 'col-todo', progress: 'col-progress', done: 'col-done' };
            var targetCol = document.querySelector('.board-column.' + colMap[targetTab]);
            if (targetCol) targetCol.classList.add('active-tab');
        });
    });
}
