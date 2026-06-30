function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const priorityInput = document.getElementById('todoPriorityInput');
    const descInput = document.getElementById('todoDescInput');

    const title = input.value.trim();
    const priority = priorityInput.value;
    const desc = descInput.value.trim();

    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        input.focus();
        return;
    }
    if (desc.length > 150) {
        alert('Description must be 150 characters or fewer.');
        descInput.focus();
        return;
    }

    state.tasks.push({
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        desc: desc,
        priority: priority,
        createdAt: Date.now()
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
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}
