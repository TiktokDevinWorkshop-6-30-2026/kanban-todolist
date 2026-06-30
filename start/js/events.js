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
}
