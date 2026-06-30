function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const title = input.value.trim();

    if (!title) {
        input.focus();
        return;
    }

    state.tasks.push({
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        createdAt: new Date().toISOString()
    });

    saveToStorage();
    input.value = '';
    render();
}

function deleteTask(taskId) {
    var taskIndex = state.tasks.findIndex(function (t) { return t.id === taskId; });
    if (taskIndex === -1) return;

    var removed = state.tasks.splice(taskIndex, 1)[0];
    saveToStorage();
    render();

    showToast('Task deleted', {
        label: 'Undo',
        onClick: function () {
            state.tasks.splice(taskIndex, 0, removed);
            saveToStorage();
            render();
        }
    });
}
