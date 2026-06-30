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
}
