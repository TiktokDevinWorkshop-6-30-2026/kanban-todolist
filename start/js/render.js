function render() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (state.tasks.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-message';
        empty.textContent = 'No tasks yet — add your first one above!';
        list.appendChild(empty);
        return;
    }

    state.tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority}`;

        const descHtml = task.desc
            ? `<p class="task-desc-excerpt">${task.desc}</p>`
            : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

        card.innerHTML = `
            <div class="task-card-header">
                <div class="task-card-title-group">
                    <span class="badge-priority ${task.priority}">${task.priority}</span>
                    <span class="task-title">${task.title}</span>
                </div>
                <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            ${descHtml}
        `;

        list.appendChild(card);
    });
}
