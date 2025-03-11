let trees = 10;
let maxTrees = 20; 
let treeGrowthRate = 10000;
let inventory = {
    sticks: 0,
    stones: 0,
    berries: 0,
    wood: 0,
    iron: 0,
    cloth: 0
};
let slots = [null, null]; 
let craftUses = 0;

// Crafting Recipes
const recipes = {
    fire: { sticks: 2 },
    stone_axe: { sticks: 1, stones: 2 },
    iron_pickaxe: { sticks: 1, iron: 2 }
};

// Item Drop Rates
const itemDropRates = [
    { name: "sticks", chance: 0.35 },
    { name: "stones", chance: 0.25 },
    { name: "berries", chance: 0.10 },
    { name: "wood", chance: 0.15 },
    { name: "iron", chance: 0.10 },
    { name: "cloth", chance: 0.05 }
];

function updateInventory() {
    let inventoryDiv = document.getElementById("inventory");
    inventoryDiv.innerHTML = "";
    
    Object.keys(inventory).forEach(item => {
        if (inventory[item] > 0) {
            let inventoryItem = document.createElement("div");
            inventoryItem.classList.add("inventory-item");
            inventoryItem.setAttribute("draggable", "true");
            inventoryItem.setAttribute("ondragstart", `dragItem(event, '${item}')`);
            inventoryItem.innerText = `${getIcon(item)} ${inventory[item]}`;
            inventoryDiv.appendChild(inventoryItem);
        }
    });
}

function getIcon(item) {
    let icons = {
        sticks: "🪵",
        stones: "🪨",
        berries: "🍇",
        wood: "🪓",
        iron: "⛏️",
        cloth: "🧵",
        stone_axe: "🪚",
        iron_pickaxe: "🔨",
        fire: "🔥"
    };
    return icons[item] || "❓";
}

function cutTree() {
    if (trees > 1) {
        trees--;
        inventory.wood++; 
        document.getElementById("tree-count").innerText = `🌲 Trees: ${trees}`;
        updateInventory();
    } else {
        alert("❌ You cannot cut down the last tree!");
    }
}

function growTree() {
    if (trees < maxTrees) {
        trees++;
        document.getElementById("tree-count").innerText = `🌲 Trees: ${trees}`;
    }
}

// Trees will grow over time
setInterval(growTree, treeGrowthRate);

function explore() {
    let roll = Math.random();
    let cumulativeChance = 0;

    for (let i = 0; i < itemDropRates.length; i++) {
        cumulativeChance += itemDropRates[i].chance;
        if (roll < cumulativeChance) {
            let foundItem = itemDropRates[i].name;
            inventory[foundItem] += 2;
            document.getElementById("explore-result").innerText = `🔍 You found 2 ${foundItem}!`;
            updateInventory();
            return;
        }
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function dragItem(event, itemType) {
    event.dataTransfer.setData("text", itemType);
}

function dropItem(event, slotIndex) {
    event.preventDefault();
    let itemType = event.dataTransfer.getData("text");

    if (inventory[itemType] > 0 && slots[slotIndex] === null) {
        slots[slotIndex] = itemType;
        inventory[itemType]--;
        event.target.innerText = getIcon(itemType);
        event.target.classList.add("highlight");
        updateInventory();
    }
}

function returnItem(event, slotIndex) {
    let itemType = slots[slotIndex];
    if (itemType) {
        slots[slotIndex] = null;
        inventory[itemType]++;
        event.target.innerText = "";
        event.target.classList.remove("highlight");
        updateInventory();
    }
}

function returnAllItems() {
    slots.forEach((item, index) => {
        if (item) {
            inventory[item]++;
            slots[index] = null;
        }
    });

    document.querySelectorAll(".slot").forEach(slot => {
        slot.innerText = "";
        slot.classList.remove("highlight");
    });

    updateInventory();
}

// 🔧 **FIXED: Crafting Slot Expansion System**
function craftItem() {
    let itemCounts = {};

    // Count items in slots
    slots.forEach(item => {
        if (item) {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        }
    });

    // Check if we can craft anything
    for (let recipe in recipes) {
        let canCraft = true;
        for (let reqItem in recipes[recipe]) {
            if (!itemCounts[reqItem] || itemCounts[reqItem] < recipes[recipe][reqItem]) {
                canCraft = false;
                break;
            }
        }

        if (canCraft) {
            // Clear slots after crafting
            slots.fill(null);
            inventory[recipe] = (inventory[recipe] || 0) + 1;
            updateInventory();
            document.getElementById("craft-result").innerText = `✅ You crafted a ${recipe.replace('_', ' ')}!`;

            // Increase craft count & check if we should add a slot
            craftUses++;
            if (craftUses % 3 === 0) {
                addCraftingSlot();
            }
            return;
        }
    }

    document.getElementById("craft-result").innerText = "❌ Invalid item combination!";
}

// 🆕 **Ensure the Slot Expands Properly**
function addCraftingSlot() {
    let craftingGrid = document.getElementById("crafting-grid");

    // Check if slot already exists (Prevents duplicate slots)
    if (craftingGrid.children.length < slots.length + 1) {
        let newSlot = document.createElement("div");
        newSlot.classList.add("slot");
        newSlot.setAttribute("ondragover", "allowDrop(event)");
        newSlot.setAttribute("ondrop", `dropItem(event, ${slots.length})`);
        newSlot.setAttribute("ondblclick", `returnItem(event, ${slots.length})`);
        craftingGrid.appendChild(newSlot);

        slots.push(null);
    }
}

// Ensure the 1x2 grid is initialized
document.addEventListener("DOMContentLoaded", () => {
    updateInventory();
});