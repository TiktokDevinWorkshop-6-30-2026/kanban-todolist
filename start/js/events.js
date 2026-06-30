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
