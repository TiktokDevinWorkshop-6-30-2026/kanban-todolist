function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const title = input.value.trim();
    if (!title) {
        input.focus();
        return;
    }

    const task = {
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        createdAt: new Date().toISOString()
    };

    state.tasks.push(task);
    saveToStorage();
    input.value = '';
    input.focus();
    render();
}

function deleteTask(taskId) {
    const index = state.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    const removed = state.tasks[index];
    state.tasks.splice(index, 1);
    saveToStorage();
    render();

    showToast('Task deleted.', 'info', {
        actionLabel: 'Undo',
        onAction: () => restoreTask(removed, index)
    });
}

function restoreTask(task, index) {
    const at = Math.min(Math.max(index, 0), state.tasks.length);
    state.tasks.splice(at, 0, task);
    saveToStorage();
    render();
    showToast('Task restored.', 'success');
}
