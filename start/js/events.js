function setupEventListeners() {
    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);

    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const addCard = document.getElementById('addTodoCard');

    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    titleInput.addEventListener('input', () => {
        document.getElementById('titleCounter').textContent = `${40 - titleInput.value.length} left`;
    });
    descInput.addEventListener('input', () => {
        document.getElementById('descCounter').textContent = `${150 - descInput.value.length} left`;
    });

    titleInput.addEventListener('focus', () => addCard.classList.add('expanded'));

    document.addEventListener('click', (e) => {
        if (!addCard.contains(e.target) && !titleInput.value.trim() && !descInput.value.trim()) {
            addCard.classList.remove('expanded');
        }
    });

    // Edit modal: save + counters
    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);
    const modalTitle = document.getElementById('taskTitleInput');
    const modalDesc = document.getElementById('taskDescInput');
    modalTitle.addEventListener('input', () => {
        document.getElementById('taskTitleCounter').textContent = `${40 - modalTitle.value.length} left`;
    });
    modalDesc.addEventListener('input', () => {
        document.getElementById('taskDescCounter').textContent = `${150 - modalDesc.value.length} left`;
    });

    // Search / filter / sort
    document.getElementById('searchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value.trim(); render(); });
    document.getElementById('priorityFilter').addEventListener('change', (e) => { state.filterPriority = e.target.value; saveToStorage(); render(); });
    document.getElementById('sortBySelect').addEventListener('change', (e) => { state.sortBy = e.target.value; saveToStorage(); render(); });
}
