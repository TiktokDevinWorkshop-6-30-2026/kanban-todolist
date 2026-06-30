function setupEventListeners() {
    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    document.getElementById('todoTitleInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    document.getElementById('todoTitleInput').addEventListener('input', (e) => {
        const len = e.target.value.length;
        document.getElementById('titleCounter').textContent = (40 - len) + ' left';
    });

    document.getElementById('todoDescInput').addEventListener('input', (e) => {
        const len = e.target.value.length;
        document.getElementById('descCounter').textContent = (150 - len) + ' left';
    });

    document.getElementById('todoTitleInput').addEventListener('focus', () => {
        document.getElementById('addTodoCard').classList.add('expanded');
    });

    document.addEventListener('click', (e) => {
        const addCard = document.getElementById('addTodoCard');
        if (!addCard.contains(e.target)) {
            const titleVal = document.getElementById('todoTitleInput').value.trim();
            const descVal = document.getElementById('todoDescInput').value.trim();
            if (!titleVal && !descVal) {
                addCard.classList.remove('expanded');
            }
        }
    });
}
