function setupEventListeners() {
    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    document.getElementById('todoTitleInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addNewTodo();
    });

    var titleInput = document.getElementById('todoTitleInput');
    var titleCounter = document.getElementById('titleCounter');
    titleInput.addEventListener('input', function() {
        titleCounter.textContent = (40 - titleInput.value.length) + ' left';
    });

    var descInput = document.getElementById('todoDescInput');
    var descCounter = document.getElementById('descCounter');
    descInput.addEventListener('input', function() {
        descCounter.textContent = (150 - descInput.value.length) + ' left';
    });

    var addTodoCard = document.getElementById('addTodoCard');
    titleInput.addEventListener('focus', function() {
        addTodoCard.classList.add('expanded');
    });

    document.addEventListener('click', function(e) {
        if (!addTodoCard.contains(e.target)) {
            if (!titleInput.value.trim() && !descInput.value.trim()) {
                addTodoCard.classList.remove('expanded');
            }
        }
        hideContextMenu();
        hideBadgePriorityMenu();
    });

    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);

    var taskTitleInput = document.getElementById('taskTitleInput');
    var taskTitleCounter = document.getElementById('taskTitleCounter');
    taskTitleInput.addEventListener('input', function() {
        taskTitleCounter.textContent = (40 - taskTitleInput.value.length) + ' left';
    });

    var taskDescInput = document.getElementById('taskDescInput');
    var taskDescCounter = document.getElementById('taskDescCounter');
    taskDescInput.addEventListener('input', function() {
        taskDescCounter.textContent = (150 - taskDescInput.value.length) + ' left';
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

    // Header Actions dropdown
    var headerActionsBtn = document.getElementById('headerActionsBtn');
    var headerActionsMenu = document.getElementById('headerActionsMenu');
    headerActionsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        headerActionsMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', function(e) {
        if (!headerActionsMenu.contains(e.target) && e.target !== headerActionsBtn) {
            headerActionsMenu.classList.add('hidden');
        }
    });

    document.getElementById('actLoadDemo').addEventListener('click', async function() {
        headerActionsMenu.classList.add('hidden');
        var confirmed = await requestConfirmation(
            'Load Sample Data',
            'This will delete all existing tasks and replace them with sample data. Continue?'
        );
        if (confirmed) {
            loadDemoData();
            render();
            showToast('Board repopulated with sample data.', 'success');
        }
    });

    document.getElementById('actCleanDone').addEventListener('click', async function() {
        headerActionsMenu.classList.add('hidden');
        var completedCount = state.tasks.filter(function(t) { return t.completed; }).length;
        if (completedCount === 0) {
            showToast('There are no completed tasks to clear.', 'warning');
            return;
        }
        var confirmed = await requestConfirmation(
            'Clean Done Tasks',
            'Are you sure you want to permanently delete all ' + completedCount + ' completed tasks?'
        );
        if (confirmed) {
            state.tasks = state.tasks.filter(function(t) { return !t.completed; });
            saveToStorage();
            render();
            showToast('Completed tasks cleared successfully.', 'success');
        }
    });

    document.getElementById('actCleanAll').addEventListener('click', async function() {
        headerActionsMenu.classList.add('hidden');
        if (state.tasks.length === 0) {
            showToast('There are no tasks to clear.', 'warning');
            return;
        }
        var confirmed = await requestConfirmation(
            'Clean All Tasks',
            'Are you sure you want to completely erase all tasks from all lists?'
        );
        if (confirmed) {
            state.tasks = [];
            saveToStorage();
            render();
            showToast('All tasks cleared successfully.', 'success');
        }
    });

    // Mobile tabs
    var mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
    mobileTabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            mobileTabBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');

            var tabName = btn.getAttribute('data-tab');
            state.activeTab = tabName;

            document.querySelectorAll('.board-column').forEach(function(col) {
                col.classList.remove('active-tab');
            });

            if (tabName === 'todo') {
                document.getElementById('columnTodo').classList.add('active-tab');
            } else if (tabName === 'progress') {
                document.getElementById('columnProgress').classList.add('active-tab');
            } else if (tabName === 'done') {
                document.getElementById('columnDone').classList.add('active-tab');
            }
        });
    });

    // Drag and drop on columns
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
            var taskId = e.dataTransfer.getData('text/plain');
            var targetColumn = col.getAttribute('data-column');
            moveTask(taskId, targetColumn);
        });
    });
}
