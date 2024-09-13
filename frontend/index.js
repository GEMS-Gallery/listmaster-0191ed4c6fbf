import { backend } from 'declarations/backend';

const availableCategories = document.getElementById('available-categories');
const cartCategories = document.getElementById('cart-categories');

async function loadItems() {
    const items = await backend.getItems();
    const groupedItems = groupItemsByCategory(items);
    
    renderItems(groupedItems, availableCategories, false);
    renderItems(groupedItems, cartCategories, true);
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

function renderItems(groupedItems, container, inCart) {
    container.innerHTML = '';
    Object.entries(groupedItems).forEach(([category, items]) => {
        const categoryItems = items.filter(item => item.inCart === inCart);
        if (categoryItems.length > 0) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `<div class="category-title">${category}</div>`;
            const ul = document.createElement('ul');
            categoryItems.forEach(item => {
                const li = createListItem(item);
                ul.appendChild(li);
            });
            categoryDiv.appendChild(ul);
            container.appendChild(categoryDiv);
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