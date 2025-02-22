export const gameState = {
    player: {
        level: 1,
        inventory: [],
        spells: [],
        spellBook: []
    },
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    darkMode: false
};

// Currency management
export function modifyCurrency() {
    const type = document.getElementById("currency-type").value;
    const amount = parseInt(document.getElementById("currency-amount").value) || 0;
    const operation = document.getElementById("add-subtract").value;

    if (operation === "add") {
        gameState.currency[type] += amount;
    } else {
        gameState.currency[type] = Math.max(0, gameState.currency[type] - amount);
    }

    updateCurrencyDisplay();
    saveGame();
}

export function convertCurrency() {
    // Convert up to the next denomination
    if (gameState.currency.cp >= 100) {
        gameState.currency.gp += Math.floor(gameState.currency.cp / 100);
        gameState.currency.cp %= 100;
    }
    if (gameState.currency.sp >= 10) {
        gameState.currency.gp += Math.floor(gameState.currency.sp / 10);
        gameState.currency.sp %= 10;
    }
    if (gameState.currency.ep >= 2) {
        gameState.currency.gp += Math.floor(gameState.currency.ep / 2);
        gameState.currency.ep %= 2;
    }

    updateCurrencyDisplay();
    saveGame();
}

function updateCurrencyDisplay() {
    document.getElementById("cp-display").textContent = gameState.currency.cp;
    document.getElementById("sp-display").textContent = gameState.currency.sp;
    document.getElementById("ep-display").textContent = gameState.currency.ep;
    document.getElementById("gp-display").textContent = gameState.currency.gp;

    // Calculate total GP value
    const totalGP = gameState.currency.gp +
        Math.floor(gameState.currency.cp / 100) +
        Math.floor(gameState.currency.sp / 10) +
        Math.floor(gameState.currency.ep / 2);

    document.getElementById("total-gp").textContent = totalGP;
}

// Mana system
export function useMana(cost) {
    const currentMana = parseInt(document.getElementById("current-mana").innerText);
    if (currentMana >= cost) {
        document.getElementById("current-mana").innerText = currentMana - cost;
        saveGame();
    }
}

export function resetMana() {
    document.getElementById("current-mana").innerText =
        document.getElementById("max-mana").innerText;
    saveGame();
}
// Health management
export function resetHealth() {
    const maxHP = parseInt(document.getElementById("max-hp").value) || 100;
    document.getElementById("current-hp").value = maxHP;
    document.getElementById("temp-hp").value = 0;
}

export function takeDamage() {
    const damage = parseInt(document.getElementById("damage-input").value) || 0;
    let tempHP = parseInt(document.getElementById("temp-hp").value) || 0;
    let currentHP = parseInt(document.getElementById("current-hp").value) || 0;

    if (tempHP >= damage) {
        document.getElementById("temp-hp").value = tempHP - damage;
    } else {
        const remainingDamage = damage - tempHP;
        document.getElementById("temp-hp").value = 0;
        document.getElementById("current-hp").value = Math.max(0, currentHP - remainingDamage);
    }
}

// Hit Dice management
export function useHitDie() {
    const availableHitDice = parseInt(document.getElementById("available-hit-dice").value) || 0;
    if (availableHitDice > 0) {
        const conMod = parseInt(document.getElementById("con-mod").innerText) || 0;
        const healAmount = Math.max(1, Math.floor(Math.random() * 8) + 1 + conMod);
        const currentHP = parseInt(document.getElementById("current-hp").value) || 0;
        const maxHP = parseInt(document.getElementById("max-hp").value) || 0;

        document.getElementById("current-hp").value = Math.min(maxHP, currentHP + healAmount);
        document.getElementById("available-hit-dice").value = availableHitDice - 1;
    }
}

export function resetHitDice() {
    const level = parseInt(document.getElementById("level").value) || 1;
    document.getElementById("available-hit-dice").value = level;
}

// Dark mode toggle
export function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    gameState.darkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', gameState.darkMode);
}

// Save/Load functions
export function saveGame() {
    // Capture all current state
    const savedState = {
        ...gameState,
        level: document.getElementById("level").value,
        profBonus: document.getElementById("prof-bonus").value,
        health: {
            maxHP: document.getElementById("max-hp").value,
            currentHP: document.getElementById("current-hp").value,
            tempHP: document.getElementById("temp-hp").value
        },
        hitDice: document.getElementById("available-hit-dice").value,
        abilities: {},
        checkboxes: {}
    };

    // Save ability scores
    const abilities = ["str", "dex", "con", "int", "wis", "cha"];
    abilities.forEach(ability => {
        savedState.abilities[ability] = document.getElementById(ability).value;
    });

    // Save checkbox states
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        savedState.checkboxes[checkbox.id] = checkbox.checked;
    });

    localStorage.setItem("dndCharacterSheet", JSON.stringify(savedState));
}

export function loadGame() {
    const savedState = localStorage.getItem("dndCharacterSheet");
    if (!savedState) return;

    const loadedState = JSON.parse(savedState);

    // Restore game state
    Object.assign(gameState, loadedState);

    // Restore basic values
    document.getElementById("level").value = loadedState.level;
    document.getElementById("prof-bonus").value = loadedState.profBonus;

    // Restore health
    document.getElementById("max-hp").value = loadedState.health.maxHP;
    document.getElementById("current-hp").value = loadedState.health.currentHP;
    document.getElementById("temp-hp").value = loadedState.health.tempHP;

    // Restore hit dice
    document.getElementById("available-hit-dice").value = loadedState.hitDice;

    // Restore abilities
    Object.entries(loadedState.abilities).forEach(([ability, value]) => {
        document.getElementById(ability).value = value;
    });

    // Restore checkboxes
    Object.entries(loadedState.checkboxes).forEach(([id, checked]) => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = checked;
    });

    // Restore dark mode
    if (loadedState.darkMode) {
        document.body.classList.add('dark-mode');
    }

    // Update all displays
    updateModifiers();
    updateInventoryUI();
}