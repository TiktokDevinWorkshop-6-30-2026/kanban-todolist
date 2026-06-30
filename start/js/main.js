document.addEventListener('DOMContentLoaded', function() {
    // Restore theme preference
    var savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        var icon = document.getElementById('themeToggle').querySelector('i');
        icon.className = 'fas fa-sun';
        document.getElementById('themeToggle').title = 'Toggle light mode';
    }

    loadFromStorage();
    setupEventListeners();
    render();
    setInterval(renderTimestampsOnly, 30000);

    // Devin integration (no-op when opened via file://)
    refreshDevinConfig();
    startDevinPolling();
    pollDevinSessions();
});
