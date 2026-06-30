function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const title = input.value.trim();
    if (!title) {
        input.focus();
        return;
    }
    state.tasks.push({
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title,
        createdAt: Date.now()
    });
    saveToStorage();
    input.value = '';
    input.focus();
    render();
}

function deleteTask(taskId) {
    const index = state.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;
    const [removed] = state.tasks.splice(index, 1);
    saveToStorage();
    render();
    showToast(`Deleted "${removed.title}"`, 'info', {
        label: 'Undo',
        onClick: () => undoDelete(removed, index)
    });
}

function undoDelete(task, index) {
    const at = Math.min(index, state.tasks.length);
    state.tasks.splice(at, 0, task);
    saveToStorage();
    render();
    showToast(`Restored "${task.title}"`, 'success');
}
