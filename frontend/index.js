import { backend } from 'declarations/backend';

const availableCategories = document.getElementById('available-categories');
const cartList = document.getElementById('cart-list');

async function loadItems() {
    const items = await backend.getItems();
    const availableItems = items.filter(item => !item.inCart);
    const cartItems = items.filter(item => item.inCart);
    
    renderAvailableItems(groupItemsByCategory(availableItems));
    renderCartItems(cartItems);
}

function groupItemsByCategory(items) {
    const grouped = {};
    items.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }
        grouped[item.category].push(item);
    });
    return grouped;
}

function renderAvailableItems(groupedItems) {
    availableCategories.innerHTML = '';
    Object.entries(groupedItems).forEach(([category, items]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.innerHTML = `<div class="category-title">${category}</div>`;
        const ul = document.createElement('ul');
        items.forEach(item => {
            const li = createListItem(item);
            ul.appendChild(li);
        });
        categoryDiv.appendChild(ul);
        availableCategories.appendChild(categoryDiv);
    });
}

function renderCartItems(items) {
    cartList.innerHTML = '';
    items.forEach(item => {
        const li = createListItem(item);
        cartList.appendChild(li);
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