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
    var task = state.tasks.find(function (t) { return t.id === taskId; });
    if (!task) return;

    var snapshot = JSON.parse(JSON.stringify(task));
    var index = state.tasks.indexOf(task);

    state.tasks.splice(index, 1);
    saveToStorage();
    render();

    showToast('Task deleted', 'success', function () {
        state.tasks.splice(index, 0, snapshot);
        saveToStorage();
        render();
        showToast('Task restored', 'info');
    });
}
