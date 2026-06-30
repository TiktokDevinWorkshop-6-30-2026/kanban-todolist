function setupEventListeners() {
    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const titleCounter = document.getElementById('titleCounter');
    const descCounter = document.getElementById('descCounter');
    const addCard = document.getElementById('addTodoCard');

    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    titleInput.addEventListener('input', () => {
        titleCounter.textContent = `${40 - titleInput.value.length} left`;
    });
    descInput.addEventListener('input', () => {
        descCounter.textContent = `${150 - descInput.value.length} left`;
    });

    titleInput.addEventListener('focus', () => {
        addCard.classList.add('expanded');
    });

    document.addEventListener('click', (e) => {
        if (!addCard.contains(e.target) && !titleInput.value.trim() && !descInput.value.trim()) {
            addCard.classList.remove('expanded');
        }
    });
}
