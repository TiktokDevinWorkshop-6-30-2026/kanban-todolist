const EMPTY_STATES = {
    todo:     { icon: 'fa-clipboard-list', text: 'No tasks listed here.' },
    progress: { icon: 'fa-spinner',        text: 'Nothing in progress.' },
    done:     { icon: 'fa-check-double',    text: 'No completed tasks yet.' }
};

const MOVE_ARROWS = {
    todo: [
        { target: 'progress', icon: 'fa-arrow-right', title: 'Move to Progress' }
    ],
    progress: [
        { target: 'todo', icon: 'fa-arrow-left', title: 'Move to To Do' },
        { target: 'done', icon: 'fa-arrow-right', title: 'Move to Done' }
    ],
    done: [
        { target: 'progress', icon: 'fa-arrow-left', title: 'Move to In Progress' }
    ]
};

function createTaskCardDOM(task) {
    const card = document.createElement('article');
    card.className = `task-card priority-${task.priority}`;
    card.setAttribute('data-id', task.id);

    const descHtml = task.desc
        ? `<p class="task-desc-excerpt">${task.desc}</p>`
        : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

    const arrows = (MOVE_ARROWS[task.column] || []).map(a =>
        `<button class="btn-arrow" onclick="moveTask('${task.id}', '${a.target}')" title="${a.title}"><i class="fas ${a.icon}"></i></button>`
    ).join('');

    card.innerHTML = `
        <div class="task-card-header">
            <div class="task-card-title-group">
                <span class="badge-priority ${task.priority}">${task.priority}</span>
                <h4 class="task-title">${task.title}</h4>
            </div>
            <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete task">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        ${descHtml}
        <div class="task-footer">
            <div class="card-nav-arrows">${arrows}</div>
        </div>
    `;
    return card;
}

function checkEmptyState(body, column) {
    if (body.children.length > 0) return;
    const { icon, text } = EMPTY_STATES[column];
    const placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    placeholder.innerHTML = `<i class="fas ${icon}"></i><p>${text}</p>`;
    body.appendChild(placeholder);
}

function render() {
    const bodies = {
        todo: document.getElementById('bodyTodo'),
        progress: document.getElementById('bodyProgress'),
        done: document.getElementById('bodyDone')
    };
    const counts = { todo: 0, progress: 0, done: 0 };

    Object.values(bodies).forEach(b => b.innerHTML = '');

    state.tasks.forEach(task => {
        const body = bodies[task.column];
        if (!body) return;
        body.appendChild(createTaskCardDOM(task));
        counts[task.column]++;
    });

    document.getElementById('countTodo').textContent = counts.todo;
    document.getElementById('countProgress').textContent = counts.progress;
    document.getElementById('countDone').textContent = counts.done;

    Object.keys(bodies).forEach(column => checkEmptyState(bodies[column], column));
}
