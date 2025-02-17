document.addEventListener("DOMContentLoaded", function () {
    let tabs = document.querySelectorAll(".tab");
    let contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            let target = this.getAttribute("data-target");

            // Hide all tab contents
            contents.forEach(content => content.style.display = "none");

            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove("active"));

            // Show the selected tab and mark it as active
            document.getElementById(target).style.display = "block";
            this.classList.add("active");
        });
    });

    // Show the first tab by default
    if (tabs.length > 0) {
        tabs[0].click();
    }
});

let inventory = [];

function addItem() {
    let name = document.getElementById("item-name").value.trim();
    let quantity = parseInt(document.getElementById("item-quantity").value);
    let description = document.getElementById("item-description").value.trim();

    if (!name || quantity < 1) {
        alert("Enter a valid item name and quantity!");
        return;
    }

    let item = { id: Date.now(), name, quantity, description };
    inventory.push(item);
    updateInventory();
}

function updateInventory() {
    let inventoryList = document.getElementById("inventory-list");
    inventoryList.innerHTML = "";

    inventory.forEach(item => {
        let li = document.createElement("li");
        li.innerHTML = `
            <strong>${item.name}</strong> (x${item.quantity}) - ${item.description} 
            <button onclick="editItem(${item.id})">Edit</button>
            <button onclick="deleteItem(${item.id})">Delete</button>
        `;
        inventoryList.appendChild(li);
    });
}

function editItem(itemId) {
    let item = inventory.find(i => i.id === itemId);
    if (!item) return;

    let newName = prompt("Edit Item Name:", item.name);
    let newQuantity = prompt("Edit Quantity:", item.quantity);
    let newDescription = prompt("Edit Description:", item.description);

    if (newName !== null) item.name = newName.trim();
    if (newQuantity !== null) item.quantity = parseInt(newQuantity) || item.quantity;
    if (newDescription !== null) item.description = newDescription.trim();

    updateInventory();
}

function deleteItem(itemId) {
    inventory = inventory.filter(item => item.id !== itemId);
    updateInventory();
}
