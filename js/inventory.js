import { gameState, saveGame } from './gameState.js';

export function addItem() {
    let name = document.getElementById("item-name").value.trim();
    let quantity = parseInt(document.getElementById("item-quantity").value);
    let description = document.getElementById("item-description").value.trim();

    if (!name || isNaN(quantity) || quantity <= 0) {
        return;
    }

    let existingItem = gameState.player.inventory.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        gameState.player.inventory.push({ name, quantity, description });
    }

    saveGame();
    updateInventoryUI();

    // Clear input fields
    document.getElementById("item-name").value = "";
    document.getElementById("item-quantity").value = "1";
    document.getElementById("item-description").value = "";
}

export function removeItem(name) {
    let itemIndex = gameState.player.inventory.findIndex(item => item.name === name);
    if (itemIndex !== -1) {
        if (gameState.player.inventory[itemIndex].quantity > 1) {
            gameState.player.inventory[itemIndex].quantity -= 1;
        } else {
            gameState.player.inventory.splice(itemIndex, 1);
        }
        saveGame();
        updateInventoryUI();
    }
}

export function updateInventoryUI() {
    let inventoryList = document.getElementById("inventory-list");
    if (!inventoryList) return;

    inventoryList.innerHTML = "";

    gameState.player.inventory.forEach(item => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `<b>${item.quantity}x</b> ${item.name} - ${item.description}`;

        let removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove 1";
        removeBtn.style.marginLeft = "10px";
        removeBtn.onclick = () => removeItem(item.name);

        listItem.appendChild(removeBtn);
        inventoryList.appendChild(listItem);
    });
}