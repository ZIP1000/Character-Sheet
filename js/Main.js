// Import statements
import { addItem, removeItem, updateInventoryUI } from "./inventory.js";

// Global Constants
const abilities = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
const skills = {
    "Perception": "Wisdom",
    "Acrobatics": "Dexterity",
    "Athletics": "Strength",
    "Deception": "Charisma",
    "Insight": "Wisdom",
    "Investigation": "Intelligence",
    "Persuasion": "Charisma",
    "Stealth": "Dexterity",
    "Survival": "Wisdom"
};

// Global State
let currency = { cp: 0, sp: 0, ep: 0, gp: 0 };
export let player = {
    level: 1,
    inventory: [],
    spells: [],
    spellBook: []
};
// let player = {
//     level: 1,
//     inventory: [],
//     spells: [],
//     spellBook: []
// };

// ====================================
// Core Game Mechanics
// ====================================

function calculateModifier(score) {
    return Math.floor(score / 2) - 5;
}

function validateHP() {
    let maxHP = parseInt(document.getElementById("max-hp").value);
    let tempHP = parseInt(document.getElementById("temp-hp").value);
    let currentHP = parseInt(document.getElementById("current-hp").value);

    if (currentHP > maxHP + tempHP) {
        document.getElementById("current-hp").value = maxHP + tempHP;
    }
}

function takeDamage() {
    let damage = parseInt(document.getElementById("damage-input").value) || 0;
    let tempHP = parseInt(document.getElementById("temp-hp").value);
    let currentHP = parseInt(document.getElementById("current-hp").value);

    if (tempHP >= damage) {
        document.getElementById("temp-hp").value = tempHP - damage;
    } else {
        let leftoverDamage = damage - tempHP;
        document.getElementById("temp-hp").value = 0;
        document.getElementById("current-hp").value = Math.max(0, currentHP - leftoverDamage);
    }
}

// ====================================
// UI Management
// ====================================

function openTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.style.display = "none");
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById(tabName).style.display = "block";
    let clickedTab = document.querySelector(`.tab[data-target="${tabName}"]`);
    if (clickedTab) clickedTab.classList.add("active");
}

function updateModifiers() {
    let level = parseInt(document.getElementById("level").value) || 1;
    let profBonus = parseInt(document.getElementById("prof-bonus").value) || 0;

    // Update hit dice
    document.getElementById("hit-dice").innerText = `${level}d8`;
    document.getElementById("available-hit-dice").innerText = level;

    // Update ability modifiers
    abilities.forEach(ability => {
        let id = ability.toLowerCase().substring(0, 3);
        let score = parseInt(document.getElementById(id).value) || 1;
        let modifier = calculateModifier(score);
        document.getElementById(id + "-mod").innerText = modifier >= 0 ? `+${modifier}` : modifier;
    });

    // Update saves and skills
    document.querySelectorAll(".saving-throw, .skill").forEach(element => {
        let ability = element.dataset.ability;
        let id = ability.toLowerCase().substring(0, 3);
        let baseMod = calculateModifier(parseInt(document.getElementById(id).value) || 1);
        let isChecked = document.getElementById(element.id + "-chk").checked;
        element.innerText = isChecked ?
            (baseMod + profBonus >= 0 ? `+${baseMod + profBonus}` : baseMod + profBonus) :
            (baseMod >= 0 ? `+${baseMod}` : baseMod);
    });

    // Update spell and mana calculations
    updateSpellStats();
    updateManaSystem(level);

    // Update derived stats
    document.getElementById("initiative").innerText = document.getElementById("dex-mod").innerText;
    let perceptionMod = parseInt(document.getElementById("perception").innerText) || 0;
    document.getElementById("passive-perception").innerText = 10 + perceptionMod;
}

// ====================================
// Save/Load System
// ====================================

export function saveGame() {
    let hitDiceValue = document.getElementById("available-hit-dice")?.value;
    let gameData = {
        level: document.getElementById("level").value,
        inventory: player.inventory,
        spells: player.spells,
        spellBook: player.spellBook,
        availableHitDice: hitDiceValue ? Number(hitDiceValue) : 0,
        abilities: {},
        checkboxes: {},
        profBonus: document.getElementById("prof-bonus").value,
        currency: { ...currency },
        health: {
            maxHP: document.getElementById("max-hp").value,
            currentHP: document.getElementById("current-hp").value,
            tempHP: document.getElementById("temp-hp").value
        },
        currentMana: document.getElementById("current-mana").innerText
    };

    // Save ability scores and checkboxes
    abilities.forEach(ability => {
        let id = ability.toLowerCase().substring(0, 3);
        gameData.abilities[id] = document.getElementById(id).value;
    });

    document.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
        gameData.checkboxes[checkbox.id] = checkbox.checked;
    });

    localStorage.setItem("playerData", JSON.stringify(gameData));
}

function loadGame() {
    let savedData = localStorage.getItem("playerData");
    if (!savedData) return;

    let gameData = JSON.parse(savedData);

    // Load basic data
    document.getElementById("level").value = gameData.level;
    player = {
        level: gameData.level,
        inventory: Array.isArray(gameData.inventory) ? gameData.inventory.map(item => ({
            name: item.name || "Unknown",
            quantity: item.quantity || 1,
            description: item.description || ""
        })) : [],
        spells: Array.isArray(gameData.spells) ? gameData.spells : [],
        spellBook: Array.isArray(gameData.spellBook) ? gameData.spellBook : []
    };

    // Load ability scores and checkboxes
    abilities.forEach(ability => {
        let id = ability.toLowerCase().substring(0, 3);
        document.getElementById(id).value = gameData.abilities[id] || 10;
    });

    document.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
        checkbox.checked = gameData.checkboxes[checkbox.id] || false;
    });

    // Load other game state
    document.getElementById("prof-bonus").value = gameData.profBonus || 2;
    Object.assign(currency, gameData.currency);

    // Load health and mana
    loadHealthAndMana(gameData);

    // Update all UI elements
    updateUI();
    updateInventoryUI();
    updateSpellsUI();
    updateModifiers();
}

// ====================================
// Initialization
// ====================================

function initializeUI() {
    // Generate Ability Score Section
    document.getElementById("abilities").innerHTML = abilities.map(ability => {
        let id = ability.toLowerCase().substring(0, 3);
        return `<div class="stat-block">${ability}<br>
            <input type="number" id="${id}" value="10" min="1" oninput="updateModifiers()">
            <br>Mod: <span class="mod" id="${id}-mod">+0</span></div>`;
    }).join("");

    // Generate Saving Throws & Skills
    document.getElementById("saving-throws").innerHTML = abilities.map(ability => {
        let id = ability.toLowerCase().substring(0, 3);
        return `<div class="checkbox-label">
            <input type="checkbox" id="${id}-save-chk" onchange="updateModifiers()">
            ${ability} <span class="mod saving-throw" id="${id}-save" data-ability="${ability}">+0</span>
            </div>`;
    }).join("");

    document.getElementById("skills").innerHTML = Object.entries(skills).map(([skill, ability]) => {
        let id = skill.replace(" ", "-").toLowerCase();
        return `<div class="checkbox-label">
            <input type="checkbox" id="${id}-chk" onchange="updateModifiers()">
            ${skill} <span class="mod skill" id="${id}" data-ability="${ability}">+0</span>
            </div>`;
    }).join("");
}

// ====================================
// Event Listeners
// ====================================

document.addEventListener("DOMContentLoaded", () => {
    initializeUI();
    updateSpellStats();
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});

window.onload = () => {
    loadGame();
    updateUI();
};

// Auto-save every 5 minutes
setInterval(() => {
    saveGame();
    console.log(`Game auto-saved at ${new Date().toLocaleTimeString()}`);
}, 300000);

// ====================================
// Expose functions to window
// ====================================

function setupWindowBindings() {
    window.addItem = addItem;
    window.removeItem = removeItem;
    window.updateInventoryUI = updateInventoryUI;
    window.openTab = openTab;
    window.updateModifiers = updateModifiers;
    window.validateHP = validateHP;
    window.resetHealth = resetHealth;
    window.takeDamage = takeDamage;
    window.toggleDarkMode = toggleDarkMode;
    window.useHitDie = useHitDie;
    window.resetHitDice = resetHitDice;
}

function main() {
    document.addEventListener("DOMContentLoaded", () => {
        setupWindowBindings();
        initializeUI();
        updateSpellStats();
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    });
}

main();