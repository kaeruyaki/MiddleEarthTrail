// js/gameLoop.js

// This module represents the core engine of the game. It handles the main game loop,
// time progression, resource consumption, travel mechanics, and game state checks.

import { gameState } from './gameState.js';
import { journeyData } from './gameData.js';
import { encounters } from './encounters.js';
import { 
    updateUI, 
    showCampView, 
    showTownView, 
    showLandmarkView, 
    displayEvent, 
    showEncounterView, 
    handleRivendellArrival,
    showTravelView
} from './ui.js';

// --- GAME CONSTANTS ---
const HOURS_PER_SECOND = 2; 
const HOURLY_FOOD_CONSUMPTION = 0.25;
const HOURLY_DISTANCE_TRAVEL = 5;
const DAILY_HEALTH_LOSS = 5;

// --- Game Loop State ---
let gameLoopInterval = null;

/**
 * Checks for game-ending conditions like the Ringbearer's death, party wipe,
 * starvation, or broken morale.
 */
export function checkGameOver(reason = null) {
    if (gameState.isGameOver) return;
    
    let endReason = reason;
    let title = "Journey's End";

    if (!endReason) {
        const frodo = gameState.fellowship.find(m => m.name === 'Frodo');
        const livingMembers = gameState.fellowship.filter(m => m.health > 0).length;
        const partyName = gameState.flags.councilOfElrondComplete ? "The Fellowship's" : "Your company's";

        if (frodo && frodo.health <= 0) endReason = "the Ringbearer has fallen.";
        else if (livingMembers === 0) endReason = `the entire ${partyName.toLowerCase()} has been lost.`;
        else if (gameState.food <= 0) endReason = "you have run out of food.";
        else if (gameState.morale <= 0) endReason = `${partyName} morale has broken.`;
    }

    if (endReason) {
        gameState.isGameOver = true;
        stopGameLoop();
        
        let finalDescription;
        if (endReason.includes("shattering crash")) {
            title = "A Shadow in the East";
            finalDescription = `<p>${endReason} The quest has failed. <strong class='text-red-500'>Darkness will fall.</strong></p>`;
        } else {
            const partyName = gameState.flags.councilOfElrondComplete ? "The Fellowship's" : "The quest";
            finalDescription = `<p>${partyName} has failed because ${endReason}. The quest is over. <strong class='text-red-500'>Failure!</strong></p>`;
        }
        
        showEncounterView(title, finalDescription, [{ text: "Start Anew", action: () => { window.location.reload(); return null; } }]);
    } else if (gameState.currentLocationKey === 'mountdoom') {
        gameState.isGameOver = true;
        stopGameLoop();
        showEncounterView("Victory!", `<p>The One Ring has been cast into the fires of Mount Doom! Middle-earth is saved! <strong class='text-green-500'>Victory!</strong></p>`, [{ text: "Start Anew", action: () => { window.location.reload(); return null; } }]);
    }
}

/**
 * Advances game time by a specified number of hours, consuming food and updating UI.
 * @param {number} hours - The number of hours to advance.
 */
export function advanceTime(hours) {
    if (gameState.isGameOver) return;
    const hasSustainingWater = gameState.buffs.sustainingWater > gameState.totalHours;
    const livingMembers = gameState.fellowship.filter(m => m.health > 0).length;
    if (livingMembers > 0 && !hasSustainingWater) {
        gameState.food = Math.max(0, gameState.food - (hours * HOURLY_FOOD_CONSUMPTION * livingMembers / 4));
    }
    gameState.totalHours += hours;
    if (gameState.buffs.sustainingWater && gameState.buffs.sustainingWater <= gameState.totalHours) {
        delete gameState.buffs.sustainingWater;
    }
    updateUI();
    checkGameOver();
}

/**
 * The main game loop function, executed on a set interval.
 * Handles travel, time progression, and event triggering.
 */
function gameLoop() {
    if (gameState.isGameOver || gameState.mode !== 'traveling') {
        stopGameLoop();
        return;
    };
    
    const timeOfDay = gameState.totalHours % 24;
    if (timeOfDay >= 23) {
        stopGameLoop();
        showCampView(true);
        if (gameState.autocampEnabled) {
            setTimeout(startGameLoop, 1500);
        }
        return;
    }
    
    const travelMultiplier = gameState.flags.isQuickTravel ? 12 : 1;
    gameState.distanceTraveled += HOURLY_DISTANCE_TRAVEL * travelMultiplier;
    gameState.fellowship.forEach(m => { if (m.health > 0) m.health -= (DAILY_HEALTH_LOSS / 12); });
    
    const currentLocData = journeyData[gameState.currentLocationKey];
    const nextLocKey = currentLocData.next;
    if (nextLocKey && gameState.distanceTraveled >= journeyData[nextLocKey].distance) {
        stopGameLoop();
        gameState.currentLocationKey = nextLocKey;
        gameState.pathTaken.push(nextLocKey);
        gameState.discoveredStops.add(nextLocKey);
        
        const landmarkData = journeyData[nextLocKey];
        // FIX: Use arrivalEncounter key to find the correct story event
        const storyEncounterKey = landmarkData.arrivalEncounter || nextLocKey;
        const storyEncounter = encounters[storyEncounterKey];

        if (storyEncounter && storyEncounter.trigger === 'landmark_arrival') {
            displayEvent(storyEncounter);
        } else if (nextLocKey === 'rivendell') {
            handleRivendellArrival();
        } else if (landmarkData.type === 'town') {
            showTownView(nextLocKey);
        } else {
            showLandmarkView(landmarkData);
        }
        return;
    }
    
    const progress = gameState.distanceTraveled / gameState.targetDistance;
    let encountersPerDay;
    if (progress < 0.5) {
        encountersPerDay = 1 + (progress / 0.5) * 2;
    } else {
        encountersPerDay = 3 - ((progress - 0.5) / 0.5);
    }
    const hourlyEncounterChance = encountersPerDay / 12;
    
    if (!gameState.flags.isStoryOnly && Math.random() < hourlyEncounterChance) {
        const validEncounters = Object.values(encounters).filter(e => e.trigger === 'travel' && e.weight > 0 && (!e.condition || e.condition(gameState)));
        if (validEncounters.length > 0) {
            const totalWeight = validEncounters.reduce((sum, e) => sum + e.weight, 0);
            let randomWeight = Math.random() * totalWeight;
            for (const event of validEncounters) {
                randomWeight -= event.weight;
                if (randomWeight <= 0) {
                    stopGameLoop();
                    displayEvent(event);
                    return;
                }
            }
        }
    }
    
    advanceTime(1);
}


// --- GAME LOOP CONTROLLERS ---

export function startGameLoop() {
    if (gameState.isGameOver || gameState.mode === 'traveling') return;
    
    const timeOfDay = gameState.totalHours % 24;
    if (timeOfDay >= 23 || timeOfDay < 11) {
        const hoursToWait = (24 - timeOfDay + 11) % 24;
        advanceTime(hoursToWait);
        if(gameState.isGameOver) return;
    }
    
    gameState.mode = 'traveling';
    showTravelView(); 

    clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 1000 / HOURS_PER_SECOND);
}

export function stopGameLoop() {
    clearInterval(gameLoopInterval);
    if(gameState.mode === 'traveling') {
        gameState.mode = 'paused';
        showTravelView();
    }
}


// --- CAMP ACTIONS ---

export const campActions = {
    forage: () => {
        advanceTime(6);
        const f = Math.floor(Math.random() * 5) + 8;
        gameState.food += f;
        document.getElementById('camp-results').innerHTML = `<p class='text-emerald-300'>You spend much of the morning foraging and find ${f} food.</p>`;
        updateUI();
    },
    hunt: () => {
        advanceTime(4);
        const roll = Math.random();
        let resultText = '';
        if (roll < 0.25) {
            gameState.fellowship.forEach(m => m.health -= 15);
            resultText = `<p class='text-rose-400'>The hunt goes poorly! The party was injured and found nothing after a few hours.</p>`;
        } else if (roll < 0.75) {
            resultText = `<p class='text-amber-400'>You hunted for several hours but found nothing.</p>`;
        } else {
            const f = Math.floor(Math.random() * 20) + 20;
            gameState.food += f;
            resultText = `<p class='text-emerald-300'>A successful hunt! You brought back ${f} food after a few hours.</p>`;
        }
        document.getElementById('camp-results').innerHTML = resultText;
        updateUI();
    },
    scavenge: () => {
        advanceTime(8);
        const roll = Math.random();
        let resultText = '';
        if (roll < 0.2) {
            stopGameLoop();
            displayEvent(encounters['orc-patrol']);
            return;
        } else if (roll < 0.6) {
            const s = Math.floor(Math.random() * 10) + 5;
            gameState.supplies += s;
            resultText = `<p class='text-emerald-300'>After a long day of scavenging, you found ${s} useful supplies!</p>`;
        } else {
            resultText = `<p class='text-amber-400'>You scavenged for most of the day but found nothing of note.</p>`;
        }
        const campResultsEl = document.getElementById('camp-results');
        if (campResultsEl) {
            campResultsEl.innerHTML = resultText;
        }
        updateUI();
    },
    extendedRest: () => {
        advanceTime(24);
        gameState.fellowship.forEach(m => { if (m.health > 0) m.health = Math.min(100, m.health + (DAILY_HEALTH_LOSS * 5)); });
        gameState.morale = Math.min(100, gameState.morale + 15);
        document.getElementById('camp-results').innerHTML = `<p class='text-emerald-300'>You rest for a full day, recovering your strength.</p>`;
        updateUI();
    }
};

// --- DEATH & COMBAT HELPERS ---

const deathChecks = { 'Hobbit': 0.01, 'Man': 0.02, 'Dwarf': 0.02, 'Elf': 0.005, 'Wizard': 0.005 };

export function performDeathRolls(encounterName = "battle") {
    let casualties = '';
    gameState.fellowship.forEach(member => {
        if (member.health > 0 && Math.random() < deathChecks[member.race]) {
            member.health = 0;
            casualties += `<br><strong class="text-red-500">${member.name} has fallen in ${encounterName}!</strong>`;
        }
    });
    if (casualties) {
        gameState.morale = Math.max(0, gameState.morale - 25);
    }
    return casualties;
}
