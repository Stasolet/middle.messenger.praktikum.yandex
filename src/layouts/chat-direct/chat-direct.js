const attachmentModal = document.getElementById('attachmentModal');
const attachmentBtn = document.getElementById('attachmentBtn');

attachmentBtn.addEventListener('click', () => {
    attachmentModal.showattachmentModal();
});

attachmentModal.addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    if (action) {
    console.log(`Выбрано действие: ${action}`);
    attachmentModal.close();
    }
});

attachmentModal.addEventListener('click', (event) => {
    if (event.target === attachmentModal) {
    attachmentModal.close();
    }
});

const userActionModal = document.getElementById('userActionModal');
const userActionBtn = document.getElementById('userActionBtn');

userActionBtn.addEventListener('click', () => {
    userActionModal.showModal();
});

userActionModal.addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    if (action) {
    console.log(`Выбрано действие: ${action}`);
    userActionModal.close();
    }
});

userActionModal.addEventListener('click', (event) => {
    if (event.target === userActionModal) {
    userActionModal.close();
    }
});
