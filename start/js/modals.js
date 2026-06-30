function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (modalId === 'taskModal') editingTaskId = null;
}

function requestConfirmation(title, message) {
    return new Promise(function(resolve) {
        var modal = document.getElementById('confirmModal');
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        modal.classList.add('active');
        var yes = document.getElementById('confirmYesBtn');
        var cancel = document.getElementById('confirmCancelBtn');
        var close = document.getElementById('confirmCloseBtn');
        function done(val) { modal.classList.remove('active'); cleanup(); resolve(val); }
        function onYes() { done(true); }
        function onNo() { done(false); }
        function cleanup() { yes.removeEventListener('click', onYes); cancel.removeEventListener('click', onNo); close.removeEventListener('click', onNo); }
        yes.addEventListener('click', onYes);
        cancel.addEventListener('click', onNo);
        close.addEventListener('click', onNo);
    });
}
