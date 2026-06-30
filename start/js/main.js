document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    document.getElementById('priorityFilter').value = state.filterPriority || 'all';
    document.getElementById('sortBySelect').value = state.sortBy || 'date-desc';
    setupEventListeners();
    render();
    setInterval(renderTimestampsOnly, 30000);
});
