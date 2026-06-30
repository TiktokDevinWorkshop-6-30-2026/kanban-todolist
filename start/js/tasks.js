function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const title = input.value.trim();
    const priorityInput = document.getElementById('todoPriorityInput');
    const descInput = document.getElementById('todoDescInput');
    const desc = descInput ? descInput.value.trim() : '';
    const priority = priorityInput ? priorityInput.value : 'low';

    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        input.focus();
        return;
    }

    if (desc.length > 150) {
        alert('Description must be 150 characters or less.');
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
    if (descInput) descInput.value = '';
    if (priorityInput) priorityInput.value = 'low';

    const titleCounter = document.getElementById('titleCounter');
    if (titleCounter) titleCounter.textContent = '40 left';
    const descCounter = document.getElementById('descCounter');
    if (descCounter) descCounter.textContent = '150 left';

    const addCard = document.getElementById('addTodoCard');
    if (addCard) addCard.classList.remove('expanded');

    render();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}
