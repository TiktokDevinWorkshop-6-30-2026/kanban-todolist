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
}
