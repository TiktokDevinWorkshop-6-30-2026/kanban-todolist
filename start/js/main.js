document.addEventListener('DOMContentLoaded', () => {
    // Restore dark mode before first render to avoid flash
    const savedTheme = localStorage.getItem('dtt-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('themeToggleBtn');
        if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    loadFromStorage();
    setupEventListeners();
    render();
    setInterval(renderTimestampsOnly, 30000);
    refreshDevinConfig();
    startDevinPolling();
    pollDevinSessions();
});
