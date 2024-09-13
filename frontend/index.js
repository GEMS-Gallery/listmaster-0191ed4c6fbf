import { backend } from 'declarations/backend';

const itemInput = document.getElementById('item-input');
const addItemButton = document.getElementById('add-item');
const shoppingList = document.getElementById('shopping-list');

async function loadItems() {
    const items = await backend.getItems();
    shoppingList.innerHTML = '';
    items.forEach(item => {
        const li = createListItem(item);
        shoppingList.appendChild(li);
    });
}

function createListItem(item) {
    const li = document.createElement('li');
    li.className = item.completed ? 'completed' : '';
    li.innerHTML = `
        <span>${item.description}</span>
        <button class="toggle"><i class="fas fa-check"></i></button>
        <button class="delete"><i class="fas fa-trash"></i></button>
    `;

    const toggleButton = li.querySelector('.toggle');
    toggleButton.addEventListener('click', async () => {
        await backend.toggleItem(item.id);
        await loadItems();
    });

    const deleteButton = li.querySelector('.delete');
    deleteButton.addEventListener('click', async () => {
        await backend.deleteItem(item.id);
        await loadItems();
    });

    return li;
}

addItemButton.addEventListener('click', async () => {
    const description = itemInput.value.trim();
    if (description) {
        await backend.addItem(description);
        itemInput.value = '';
        await loadItems();
    }
});

itemInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const description = itemInput.value.trim();
        if (description) {
            await backend.addItem(description);
            itemInput.value = '';
            await loadItems();
        }
    }
});

// Initialize predefined items and load the list
(async () => {
    await backend.initialize();
    await loadItems();
})();