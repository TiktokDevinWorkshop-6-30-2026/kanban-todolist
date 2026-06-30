document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    setupEventListeners();
    setup3DInteraction();
    render();

    setInterval(() => {
        renderTimestampsOnly();
    }, 30000);
});
