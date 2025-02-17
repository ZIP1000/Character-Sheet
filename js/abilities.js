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

function calculateModifier(score) {
    return Math.floor(score / 2) - 5;
}

function updateModifiers() {
    let level = parseInt(document.getElementById("level").value) || 1;
    document.getElementById("hit-dice").innerText = `${level}d8`;

    let profBonus = parseInt(document.getElementById("prof-bonus").value) || 0;

    abilities.forEach(ability => {
        let id = ability.toLowerCase().substring(0, 3);
        let score = parseInt(document.getElementById(id).value) || 1;
        let modifier = calculateModifier(score);
        document.getElementById(id + "-mod").innerText = modifier >= 0 ? `+${modifier}` : modifier;
    });

    document.querySelectorAll(".saving-throw, .skill").forEach(element => {
        let ability = element.dataset.ability;
        let id = ability.toLowerCase().substring(0, 3);
        let baseMod = calculateModifier(parseInt(document.getElementById(id).value) || 1);
        let isChecked = document.getElementById(element.id + "-chk").checked;
        element.innerText = isChecked ? (baseMod + profBonus >= 0 ? `+${baseMod + profBonus}` : baseMod + profBonus) : (baseMod >= 0 ? `+${baseMod}` : baseMod);
    });

    // 🎯 Spellcasting Calculations
    let wisdomMod = calculateModifier(parseInt(document.getElementById("wis").value) || 1);
    let spellSaveDC = 8 + profBonus + wisdomMod;
    let spellAttackBonus = wisdomMod + profBonus;

    document.getElementById("spell-save-dc").innerText = spellSaveDC;
    document.getElementById("spell-attack-bonus").innerText = `+${spellAttackBonus}`;

    // 🎯 Prepared Spells & Mana System
    let preparedSpellsList = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
    let maxManaList = [200, 300, 1200, 1400, 2000, 2300, 2700, 3100, 4000, 4500, 5100, 5100, 5800, 5800, 6600, 6600, 7500, 7500, 7500, 7500];

    let preparedSpells = preparedSpellsList[level - 1] || 4;
    let maxMana = maxManaList[level - 1] || 200;

    document.getElementById("prepared-spells").innerText = preparedSpells;
    document.getElementById("max-mana").innerText = maxMana;

    // 🎯 Auto-set Current Mana to Max Mana on Level Change
    document.getElementById("current-mana").innerText = maxMana;

    document.getElementById("initiative").innerText = document.getElementById("dex-mod").innerText;
    let perceptionMod = parseInt(document.getElementById("perception").innerText) || 0;
    document.getElementById("passive-perception").innerText = 10 + perceptionMod;
}

export { abilities, skills, calculateModifier, updateModifiers };