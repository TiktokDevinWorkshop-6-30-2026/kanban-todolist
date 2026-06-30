function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const title = input.value.trim();
    if (!title) return;

    const task = {
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        createdAt: new Date().toISOString(),
        done: false
    };

    state.tasks.push(task);
    saveToStorage();
    input.value = '';
    render();
}

function toggleDone(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.done = !task.done;
        saveToStorage();
        render();
    }
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}
