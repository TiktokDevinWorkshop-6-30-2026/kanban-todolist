function setupEventListeners() {
    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    document.getElementById('todoTitleInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    const titleInput = document.getElementById('todoTitleInput');
    const titleCounter = document.getElementById('titleCounter');
    if (titleInput && titleCounter) {
        titleInput.addEventListener('input', () => {
            titleCounter.textContent = (40 - titleInput.value.length) + ' left';
        });
    }

    const descInput = document.getElementById('todoDescInput');
    const descCounter = document.getElementById('descCounter');
    if (descInput && descCounter) {
        descInput.addEventListener('input', () => {
            descCounter.textContent = (150 - descInput.value.length) + ' left';
        });
    }

    const addCard = document.getElementById('addTodoCard');
    if (titleInput && addCard) {
        titleInput.addEventListener('focus', () => {
            addCard.classList.add('expanded');
        });

        document.addEventListener('click', (e) => {
            if (!addCard.contains(e.target)) {
                const descVal = descInput ? descInput.value.trim() : '';
                const titleVal = titleInput.value.trim();
                if (!titleVal && !descVal) {
                    addCard.classList.remove('expanded');
                }
            }
        });
    }
}
