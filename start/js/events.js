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
}
