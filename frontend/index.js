import { backend } from 'declarations/backend';

const availableList = document.getElementById('available-list');
const cartList = document.getElementById('cart-list');

async function loadItems() {
    const items = await backend.getItems();
    availableList.innerHTML = '';
    cartList.innerHTML = '';
    items.forEach(item => {
        const li = createListItem(item);
        if (item.inCart) {
            cartList.appendChild(li);
        } else {
            availableList.appendChild(li);
        }
    });
}

function createListItem(item) {
    const li = document.createElement('li');
    li.className = item.completed ? 'completed' : '';
    li.innerHTML = `
        <span><span class="emoji">${item.emoji}</span>${item.description}</span>
    `;

    if (item.inCart) {
        li.innerHTML += `
            <button class="toggle"><i class="fas fa-check"></i></button>
            <button class="delete"><i class="fas fa-trash"></i></button>
        `;
        const toggleButton = li.querySelector('.toggle');
        toggleButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            await backend.toggleCompleted(item.id);
            await loadItems();
        });

        const deleteButton = li.querySelector('.delete');
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            await backend.deleteItem(item.id);
            await loadItems();
        });
    }

    li.addEventListener('click', async () => {
        await backend.toggleInCart(item.id);
        await loadItems();
    });

    return li;
}

// Initialize predefined items and load the list
(async () => {
    await backend.initialize();
    await loadItems();
})();