function addNewTodo() {
    var input = document.getElementById('todoTitleInput');
    var title = input.value.trim();
    if (!title) return;
    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        return;
    }

    var descInput = document.getElementById('todoDescInput');
    var desc = descInput.value.trim();
    if (desc.length > 150) {
        alert('Description must be 150 characters or fewer.');
        return;
    }

    var priorityInput = document.getElementById('todoPriorityInput');
    var priority = priorityInput.value;

    state.tasks.push({
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        desc: desc,
        priority: priority,
        createdAt: new Date().toISOString()
    });

    saveToStorage();
    input.value = '';
    descInput.value = '';
    priorityInput.value = 'low';
    document.getElementById('titleCounter').textContent = '40 left';
    document.getElementById('descCounter').textContent = '150 left';
    document.getElementById('addTodoCard').classList.remove('expanded');
    render();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(function(t) { return t.id !== taskId; });
    saveToStorage();
    render();
}
