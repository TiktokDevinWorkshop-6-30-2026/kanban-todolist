document.addEventListener('DOMContentLoaded', function() {
    // Restore dark mode preference
    if (localStorage.getItem('daily-task-tracker-dark') === 'true') {
        document.body.classList.add('dark-mode');
        var icon = document.querySelector('#darkModeToggle i');
        if (icon) icon.className = 'fas fa-sun';
    }

    loadFromStorage();
    setupEventListeners();
    render();
    setInterval(renderTimestampsOnly, 30000);
});
