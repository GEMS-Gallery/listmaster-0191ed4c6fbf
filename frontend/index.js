import { backend } from 'declarations/backend';

const availableCategories = document.getElementById('available-categories');
const cartList = document.getElementById('cart-list');
const notification = document.getElementById('notification');

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
            await handleAction(() => backend.toggleCompleted(item.id), `Marked "${item.description}" as ${item.completed ? 'incomplete' : 'complete'}`);
        });

        const deleteButton = li.querySelector('.delete');
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleAction(() => backend.deleteItem(item.id), `Deleted "${item.description}" from cart`);
        });
    }

    li.addEventListener('click', async () => {
        await handleAction(() => backend.toggleInCart(item.id), `${item.inCart ? 'Removed' : 'Added'} "${item.description}" ${item.inCart ? 'from' : 'to'} cart`);
    });

    return li;
}

async function handleAction(action, message) {
    try {
        const element = event.currentTarget;
        element.style.pointerEvents = 'none';
        await action();
        showNotification(message);
        await loadItems();
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred. Please try again.');
    } finally {
        setTimeout(() => {
            if (element) element.style.pointerEvents = 'auto';
        }, 1000);
    }
}

function showNotification(message) {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Initialize predefined items and load the list
(async () => {
    await backend.initialize();
    await loadItems();
})();