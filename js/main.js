// js/main.js
// FINAL-FIX: Corrected event logic order and restored missing encounters.

import { setupNewGame, meetStrider, storyTriggers, gameState } from './gameState.js';
import { 
    updateUI, 
    initializeStartScreen, 
    showTravelView, 
    showEncounterView,
    showMapView,
    showLandmarkView,
} from './ui.js';
import { journeyData } from './gameData.js';
import { encounters } from './encounters.js';

// --- Game Loop and Logic ---

const CONSTANTS = {
    HOURS_PER_SECOND: 2, 
    HOURLY_FOOD_CONSUMPTION: 0.25,
    HOURLY_DISTANCE_TRAVEL: 5,
    DAILY_HEALTH_LOSS_WHILE_TRAVELING: 5,
    ENCOUNTER_CHANCE_MULTIPLIER: 1.0, 
    FORAGE_YIELD: { min: 8, max: 13 },
    HUNT_YIELD: { min: 20, max: 40 },
    SCAVENGE_YIELD: { min: 5, max: 15 },
    DEATH_CHECKS: { 
        'Hobbit': 0.01, 
        'Man': 0.02, 
        'Dwarf': 0.02, 
        'Elf': 0.005, 
        'Wizard': 0.005 
    }
};

let gameLoopInterval = null;
const canonicalPath = ['shire', 'bree', 'weathertop', 'trollshaws', 'rivendell', 'caradhras_pass', 'moria', 'lothlorien', 'anduin', 'amonhen', 'emynmuil', 'deadmarshes', 'blackgate', 'cirithungol', 'mountdoom'];

function checkGameOver(reason = null) {
    if (gameState.isGameOver) return;

    let finalReason = reason;

    if (!finalReason) {
        const frodo = gameState.fellowship.find(m => m.name === 'Frodo');
        if (frodo && frodo.health <= 0) finalReason = "The Ringbearer has fallen. The quest is over.";
        else if (gameState.fellowship.filter(m => m.health > 0).length === 0) finalReason = `The entire company has been lost. The quest is over.`;
        else if (gameState.food <= 0) finalReason = "The company has perished from starvation. The quest is over.";
        else if (gameState.morale <= 0) finalReason = `The company's morale has broken. The quest is over.`;
    }

    if (finalReason) {
        gameState.isGameOver = true;
        stopGameLoop();
        showEncounterView("The Quest has Failed", finalReason, [{ text: "The Ring has been Lost to Mordor. Game Over", action: () => window.location.reload() }]);
    }
}


function advanceTime(hours) {
    if (gameState.isGameOver) return;
    
    if (gameState.mode !== 'town' && gameState.mode !== 'camp') {
        const livingMembers = gameState.fellowship.filter(m => m.health > 0).length;
        if (livingMembers > 0) {
            gameState.food = Math.max(0, gameState.food - (hours * CONSTANTS.HOURLY_FOOD_CONSUMPTION * livingMembers / 4));
        }
    }

    gameState.totalHours += hours;
    updateUI();
    checkGameOver();
}

function rollForDailyEncounters() {
    const roll = Math.random();
    if (roll < 0.03) gameState.pendingEncounters = 7;
    else if (roll < 0.10) gameState.pendingEncounters = 5;
    else if (roll < 0.25) gameState.pendingEncounters = 3;
    else if (roll < 0.75) gameState.pendingEncounters = 1;
    else gameState.pendingEncounters = 0;
    gameState.flags.dailyRollMade = true;
}

function triggerRandomEncounter() {
    const currentLocData = journeyData[gameState.currentLocationKey];
    const currentZone = currentLocData.zone;
    
    const currentIndex = canonicalPath.indexOf(gameState.currentLocationKey);
    let currentAct = 1;
    if (currentIndex >= canonicalPath.indexOf('rivendell')) currentAct = 2;
    if (currentIndex >= canonicalPath.indexOf('amonhen')) currentAct = 3;

    const validEncounters = Object.values(encounters).filter(e => {
        const isTravelEncounter = e.trigger === 'travel';
        const inZone = e.zones && e.zones.includes(currentZone);
        const inAct = !e.acts || e.acts.includes(currentAct);
        const meetsCondition = !e.condition || e.condition(gameState);
        return isTravelEncounter && inZone && inAct && meetsCondition;
    });

    if (validEncounters.length === 0) return;

    const weightedEncounters = validEncounters.map(e => {
        let finalWeight = e.baseWeight;
        if (currentAct === 1 && e.name === "A Black Rider") finalWeight *= 10;
        if (currentAct === 1 && e.name === "Orc Patrol") finalWeight *= 0.1;
        if (currentAct >= 2 && (e.name === "Orc Patrol" || e.name === "Wargs of the Wild")) finalWeight *= 3;
        if (currentAct === 3 && currentZone === 'Mordor') {
             if (e.name === "Orc Patrol") finalWeight *= 5;
             if (e.name === "Oppressive Despair") finalWeight *= 2;
        }
        return { ...e, finalWeight };
    });

    const totalWeight = weightedEncounters.reduce((sum, e) => sum + e.finalWeight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const event of weightedEncounters) {
        randomWeight -= event.finalWeight;
        if (randomWeight <= 0) {
            stopGameLoop();
            showEvent(event);
            gameState.pendingEncounters = Math.max(0, gameState.pendingEncounters - 1);
            return;
        }
    }
}

function gameLoop() {
    if (gameState.isGameOver || gameState.mode !== 'traveling') {
        stopGameLoop();
        return;
    };
    
    const timeOfDay = gameState.totalHours % 24;
    if (timeOfDay >= 23) {
        stopGameLoop();
        gameState.flags.dailyRollMade = false;
        document.dispatchEvent(new CustomEvent('showCamp', { detail: { isForcedNight: true } }));
        return;
    }
    
    const travelMultiplier = gameState.flags.isQuickTravel ? 12 : 1;
    gameState.distanceTraveled += CONSTANTS.HOURLY_DISTANCE_TRAVEL * travelMultiplier;
    gameState.fellowship.forEach(m => { if (m.health > 0) m.health -= (CONSTANTS.DAILY_HEALTH_LOSS_WHILE_TRAVELING / 24); });
    
    const currentLocData = journeyData[gameState.currentLocationKey];
    const nextLocKey = currentLocData.next;
    if (nextLocKey && gameState.distanceTraveled >= journeyData[nextLocKey].distance) {
        stopGameLoop();
        gameState.currentLocationKey = nextLocKey;
        gameState.pathTaken.push(nextLocKey);
        gameState.discoveredStops.add(nextLocKey);
        
        const landmarkData = journeyData[nextLocKey];
        const storyEncounterKey = landmarkData.arrivalEncounter || nextLocKey;
        const storyEncounter = encounters[storyEncounterKey];
        
        if (storyEncounter) {
            showEvent(storyEncounter);
        } else {
            showLandmarkView(landmarkData);
        }
        return;
    }
    
    if (!gameState.flags.isStoryOnly && gameState.pendingEncounters > 0) {
        const hoursLeftInDay = Math.max(1, 23 - timeOfDay);
        const hourlyChance = (gameState.pendingEncounters / hoursLeftInDay) * travelMultiplier * CONSTANTS.ENCOUNTER_CHANCE_MULTIPLIER;
        if (Math.random() < hourlyChance) {
            triggerRandomEncounter();
            return; 
        }
    }
    
    advanceTime(1);
}

function startGameLoop() {
    if (gameState.isGameOver || gameState.mode === 'traveling') return;
    
    const timeOfDay = gameState.totalHours % 24;
    if (timeOfDay >= 23 || timeOfDay < 11) {
        const hoursToWait = (24 - timeOfDay + 11) % 24;
        advanceTime(hoursToWait);
        gameState.flags.dailyRollMade = false;
        if(gameState.isGameOver) return;
    }

    if (!gameState.flags.dailyRollMade) {
        const currentZone = journeyData[gameState.currentLocationKey].zone;
        if (currentZone !== 'Rivendell' && currentZone !== 'Lothlorien') {
            rollForDailyEncounters();
        } else {
            gameState.pendingEncounters = 0;
            gameState.flags.dailyRollMade = true;
        }
    }
    
    gameState.mode = 'traveling';
    showTravelView(); 

    clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 1000 / CONSTANTS.HOURS_PER_SECOND);
}

function stopGameLoop(andShowTravelView = false) {
    clearInterval(gameLoopInterval);
    if (gameState.isGameOver) return;
    gameState.mode = 'paused'; 
    if (andShowTravelView) {
        showTravelView();
    }
}

const campActions = {
    forage: () => {
        advanceTime(6);
        const f = Math.floor(Math.random() * (CONSTANTS.FORAGE_YIELD.max - CONSTANTS.FORAGE_YIELD.min + 1)) + CONSTANTS.FORAGE_YIELD.min;
        gameState.food += f;
        return `You spend much of the morning foraging and find ${f} food.`;
    },
    hunt: () => {
        advanceTime(4);
        const roll = Math.random();
        if (roll < 0.25) {
            gameState.fellowship.forEach(m => m.health -= 15);
            return `<p class='text-rose-400'>The hunt goes poorly! The party was injured and found nothing.</p>`;
        } else if (roll < 0.75) {
            return `<p class='text-amber-400'>You hunted for several hours but found nothing.</p>`;
        } else {
            const f = Math.floor(Math.random() * (CONSTANTS.HUNT_YIELD.max - CONSTANTS.HUNT_YIELD.min + 1)) + CONSTANTS.HUNT_YIELD.min;
            gameState.food += f;
            return `<p class='text-emerald-300'>A successful hunt! You brought back ${f} food.</p>`;
        }
    },
    scavenge: () => {
        advanceTime(8);
        const roll = Math.random();
        if (roll < 0.2) {
            stopGameLoop();
            showEvent(encounters['orc-patrol']);
            return null;
        } else if (roll < 0.6) {
            const s = Math.floor(Math.random() * (CONSTANTS.SCAVENGE_YIELD.max - CONSTANTS.SCAVENGE_YIELD.min + 1)) + CONSTANTS.SCAVENGE_YIELD.min;
            gameState.supplies += s;
            return `<p class='text-emerald-300'>You found ${s} useful supplies!</p>`;
        } else {
            return `<p class='text-amber-400'>You scavenged but found nothing of note.</p>`;
        }
    },
    extendedRest: () => {
        advanceTime(24);
        gameState.fellowship.forEach(m => { if (m.health > 0) m.health = Math.min(100, m.health + (CONSTANTS.DAILY_HEALTH_LOSS_WHILE_TRAVELING * 5)); });
        gameState.morale = Math.min(100, gameState.morale + 15);
        return `<p class='text-emerald-300'>You rest for a full day, recovering your strength.</p>`;
    }
};

function performDeathRolls(encounterName = "battle") {
    let casualties = '';
    gameState.fellowship.forEach(member => {
        if (member.health > 0 && Math.random() < CONSTANTS.DEATH_CHECKS[member.race]) {
            member.health = 0;
            casualties += `<br><strong class="text-red-500">${member.name} has fallen in ${encounterName}!</strong>`;
        }
    });
    if (casualties) {
        gameState.morale = Math.max(0, gameState.morale - 25);
    }
    return casualties;
}

// --- Main Application Logic ---

let animationIntervalId = null;

function showEvent(encounter) {
    const dependencies = {
        gameState, advanceTime, updateUI, performDeathRolls, showEncounterView,
        stopGameLoop, showTravelView, storyTriggers, encounters,
        meetStrider, checkGameOver, startGameLoop
    };

    // CORRECTED: Run onArrival logic BEFORE resolving choices.
    if (encounter.onArrival) {
        encounter.dialogue = encounter.onArrival(dependencies);
    }

    let resolvedChoices = encounter.choices;
    if (typeof encounter.choices === 'function') {
        resolvedChoices = encounter.choices(dependencies);
    }
    
    showEncounterView(encounter.name, encounter.description, resolvedChoices, encounter);
}

function initializeGame(profession, startKey, debugOptions) {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'grid';
    
    setupNewGame(profession, startKey, debugOptions);
    
    const startingEncounterKey = journeyData[startKey].arrivalEncounter || startKey;
    const startingEncounter = encounters[startingEncounterKey] || encounters['the_journey_begins'];
    showEvent(startingEncounter);

    updateUI();

    if (!animationIntervalId) {
        animationIntervalId = setInterval(updateUI, 500);
    }
}

// --- EVENT LISTENERS TO CONNECT UI AND LOGIC ---

document.addEventListener('initializeGame', (e) => {
    const { profession, startKey, debugOptions } = e.detail;
    initializeGame(profession, startKey, debugOptions);
});

document.addEventListener('startGameLoop', startGameLoop);
document.addEventListener('stopGameLoop', () => stopGameLoop(true));

document.addEventListener('showCamp', (e) => {
    stopGameLoop();
    const isForcedNight = e.detail?.isForcedNight;
    const campEncounter = {
        name: isForcedNight ? "The Day's Journey is Over" : "You Make Camp",
        description: isForcedNight ? "Darkness has fallen. You make camp and rest." : "You decide to pause your journey and set up camp to rest and recover.",
        choices: [
            { text: "Forage", isPersistent: true, action: campActions.forage },
            { text: "Hunt", isPersistent: true, action: campActions.hunt },
            { text: "Scavenge", isPersistent: true, action: campActions.scavenge },
            { text: "Extended Rest", isPersistent: true, action: campActions.extendedRest },
            { text: "View Map", isPersistent: true, action: () => { showMapView(); return null; } },
            { text: "Continue Journey", isLeaveAction: true, action: () => { startGameLoop(); return null; } },
        ]
    };
    showEvent(campEncounter);
});

document.addEventListener('resolveEncounterChoice', (e) => {
    const { choice, encounter } = e.detail;

    if (!encounter) {
        if (choice.action) choice.action();
        return;
    }

    const dependencies = {
        gameState, advanceTime, updateUI, performDeathRolls, showEncounterView,
        stopGameLoop, showTravelView, storyTriggers, encounters,
        meetStrider, checkGameOver, startGameLoop, showEvent
    };
    
    const action = choice.action;
    if (!action) {
        console.error("Choice has no action:", choice);
        return;
    }

    if (choice.oneTime) {
        gameState.completedTownActions.add(choice.id);
    }

    const result = action(dependencies);

    if (choice.isLeaveAction || result === null) {
        return;
    } else if (choice.isPersistent) {
        encounter.dialogue = result;
        showEvent(encounter);
        updateUI();
    } else {
        showEncounterView(encounter.name, result, [{ text: "Continue", action: startGameLoop }]);
        updateUI();
    }
});

// --- Game Start ---
window.onload = () => {
    initializeStartScreen();
};
