import { backend } from 'declarations/backend';

const availableCategories = document.getElementById('available-categories');
const cartList = document.getElementById('cart-list');
const notification = document.getElementById('notification');
const listViewBtn = document.getElementById('list-view-btn');
const gridViewBtn = document.getElementById('grid-view-btn');

let currentView = 'list';

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
        const itemsContainer = document.createElement(currentView === 'list' ? 'ul' : 'div');
        itemsContainer.className = currentView === 'grid' ? 'grid-view' : '';
        items.forEach(item => {
            const itemElement = createItemElement(item);
            itemsContainer.appendChild(itemElement);
        });
        categoryDiv.appendChild(itemsContainer);
        availableCategories.appendChild(categoryDiv);
    });
}

function renderCartItems(items) {
    cartList.innerHTML = '';
    const itemsContainer = document.createElement(currentView === 'list' ? 'ul' : 'div');
    itemsContainer.className = currentView === 'grid' ? 'grid-view' : '';
    items.forEach(item => {
        const itemElement = createItemElement(item);
        itemsContainer.appendChild(itemElement);
    });
    cartList.appendChild(itemsContainer);
}

function createItemElement(item) {
    if (currentView === 'list') {
        return createListItem(item);
    } else {
        return createGridItem(item);
    }
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

function createGridItem(item) {
    const gridItem = document.createElement('div');
    gridItem.className = `grid-item ${item.completed ? 'completed' : ''}`;
    gridItem.innerHTML = `
        <div class="emoji">${item.emoji}</div>
        <div>${item.description}</div>
    `;

    if (item.inCart) {
        gridItem.innerHTML += `
            <button class="toggle"><i class="fas fa-check"></i></button>
            <button class="delete"><i class="fas fa-trash"></i></button>
        `;
        const toggleButton = gridItem.querySelector('.toggle');
        toggleButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleAction(() => backend.toggleCompleted(item.id), `Marked "${item.description}" as ${item.completed ? 'incomplete' : 'complete'}`);
        });

        const deleteButton = gridItem.querySelector('.delete');
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleAction(() => backend.deleteItem(item.id), `Deleted "${item.description}" from cart`);
        });
    }

    gridItem.addEventListener('click', async () => {
        await handleAction(() => backend.toggleInCart(item.id), `${item.inCart ? 'Removed' : 'Added'} "${item.description}" ${item.inCart ? 'from' : 'to'} cart`);
    });

    return gridItem;
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

function setView(view) {
    currentView = view;
    if (view === 'list') {
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    } else {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    }
    loadItems();
}

listViewBtn.addEventListener('click', () => setView('list'));
gridViewBtn.addEventListener('click', () => setView('grid'));

// Initialize predefined items and load the list
(async () => {
    await backend.initialize();
    await loadItems();
})();