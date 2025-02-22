import { initializeTabs } from './tabs.js';
import { gameState, saveGame, loadGame, resetHealth, takeDamage,
         useHitDie, resetHitDice, toggleDarkMode, modifyCurrency,
         convertCurrency, useMana, resetMana } from './gameState.js';
import { abilities, skills, updateModifiers } from './abilities.js';
import { addItem, removeItem, updateInventoryUI } from './inventory.js';

// Initialize abilities section
function initializeAbilities() {
    // Generate Ability Score Section
    document.getElementById("abilities").innerHTML = abilities.map(ability => {
        let id = ability.toLowerCase().substring(0, 3);
        return `<div class="stat-block">${ability}<br>
            <input type="number" id="${id}" value="10" min="1" oninput="updateModifiers()">
            <br>Mod: <span class="mod" id="${id}-mod">+0</span></div>`;
    }).join("");

    // Generate Saving Throws
    document.getElementById("saving-throws").innerHTML = abilities.map(ability => {
        let id = ability.toLowerCase().substring(0, 3);
        return `<div class="checkbox-label">
            <input type="checkbox" id="${id}-save-chk" onchange="updateModifiers()">
            ${ability} <span class="mod saving-throw" id="${id}-save" data-ability="${ability}">+0</span>
            </div>`;
    }).join("");

    // Generate Skills
    document.getElementById("skills").innerHTML = Object.entries(skills).map(([skill, ability]) => {
        let id = skill.replace(" ", "-").toLowerCase();
        return `<div class="checkbox-label">
            <input type="checkbox" id="${id}-chk" onchange="updateModifiers()">
            ${skill} <span class="mod skill" id="${id}" data-ability="${ability}">+0</span>
            </div>`;
    }).join("");
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    initializeTabs();
    initializeAbilities();

    // Bind functions to window for HTML access
    Object.assign(window, {
        saveGame,
        loadGame,
        resetHealth,
        takeDamage,
        useHitDie,
        resetHitDice,
        toggleDarkMode,
        addItem,
        removeItem,
        updateModifiers,
        updateInventoryUI,
        modifyCurrency,
        convertCurrency,
        useMana,
        resetMana
    });

    // Load saved game state
    loadGame();

    // Set up autosave
    setInterval(saveGame, 300000); // Every 5 minutes

    // Initialize dark mode if previously set
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});

// Export gameState for other modules
export { gameState };