function render() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (state.tasks.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'No tasks yet — add your first one above!';
        list.appendChild(empty);
        return;
    }

    state.tasks.forEach((task) => {
        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority}`;

        const descMarkup = task.desc
            ? `<p class="task-desc-excerpt">${task.desc}</p>`
            : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

        card.innerHTML = `
            <div class="task-header">
                <span class="badge-priority ${task.priority}">${task.priority}</span>
                <button class="btn-card-action" title="Delete" onclick="deleteTask('${task.id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="task-title">${task.title}</div>
            ${descMarkup}
        `;

        list.appendChild(card);
    });
}
