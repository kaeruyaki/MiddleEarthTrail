// js/main.js

// This is the main entry point for the entire game application.
// It sets up event listeners to connect the UI to the game logic,
// preventing circular dependencies and ensuring stable execution.

import { setupNewGame, meetStrider, storyTriggers, gameState } from './gameState.js';
import { 
    updateUI, 
    initializeStartScreen, 
    showTravelView, 
    showTownView, 
    showEncounterView,
    showCampView,
    showMapView,
    renderTownActions,
    updateTravelAnimation,
    triggerEncounterFlash,
    displayEvent
} from './ui.js';
import { 
    startGameLoop, 
    stopGameLoop, 
    advanceTime, 
    checkGameOver, 
    campActions,
    performDeathRolls
} from './gameLoop.js';
import { townActions, journeyData } from './gameData.js';
import { encounters } from './encounters.js';

let animationIntervalId = null;

/**
 * Initializes a new game, sets up the initial state, and displays the first view.
 */
function initializeGame(profession, startKey, debugOptions) {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    setupNewGame(profession, startKey, debugOptions);
    
    // CORRECTED: Added special handling for the very first start of the game.
    if (startKey === 'shire') {
        displayEvent(encounters['the_journey_begins']);
    } 
    // Logic for debug starts at other locations
    else {
        const landmarkData = journeyData[startKey];
        const storyEncounterKey = landmarkData.arrivalEncounter || startKey;
        const storyEncounter = encounters[storyEncounterKey];

        if (storyEncounter && storyEncounter.trigger === 'landmark_arrival') {
            displayEvent(storyEncounter);
        } 
        else if (startKey === 'moria') {
            gameState.flags.moriaPhase = 1;
            showTownView('moria');
        }
        else if (startKey === 'rivendell') {
            handleRivendellArrivalLogic();
        } 
        else if (landmarkData.type === 'town' || journeyData[startKey].zone === 'Lothlorien') {
            showTownView(startKey);
        } 
        else {
            showTravelView();
        }
    }

    updateUI();

    if (!animationIntervalId) {
        animationIntervalId = setInterval(updateTravelAnimation, 500);
    }
}

function handleRivendellArrivalLogic() {
    storyTriggers.rivendell(gameState);

    const frodo = gameState.fellowship.find(m => m.name === 'Frodo');
    let healingText = "";
    if (frodo.health < 100) {
        const daysToHeal = Math.ceil((100 - frodo.health) / 10);
        advanceTime(daysToHeal * 24);
        frodo.health = 100;
        gameState.morale = 100;
        healingText = ` For ${daysToHeal} days, Frodo lies in a deep sleep while Elrond's skill battles the shadow of the Morgul-blade. At last, he wakes, weak but whole again. The company's morale is fully restored in this safe haven.`;
    }
    gameState.flags.rivendellPhase = 1;
    showEncounterView("Welcome to Rivendell", journeyData.rivendell.description + healingText, [{ text: "Continue", action: () => { showTownView('rivendell'); return null; } }]);
}


// --- EVENT LISTENERS TO CONNECT UI AND LOGIC ---

document.addEventListener('initializeGame', (e) => {
    const { profession, startKey, debugOptions } = e.detail;
    initializeGame(profession, startKey, debugOptions);
});

document.addEventListener('startGameLoop', startGameLoop);
document.addEventListener('stopGameLoop', stopGameLoop);

document.addEventListener('showCamp', () => {
    stopGameLoop();
    showCampView();
});

document.addEventListener('showTown', (e) => {
    stopGameLoop();
    showTownView(e.detail.locationKey);
});


document.addEventListener('showMap', (e) => {
    stopGameLoop();
    showMapView(e.detail.returnAction);
});

document.addEventListener('campActionExtendedRest', campActions.extendedRest);
document.addEventListener('campActionForage', campActions.forage);
document.addEventListener('campActionHunt', campActions.hunt);
document.addEventListener('campActionScavenge', campActions.scavenge);

document.addEventListener('handleRivendellArrival', handleRivendellArrivalLogic);

document.addEventListener('resolveEncounterChoice', (e) => {
    const { choice, title, encounter } = e.detail;

    // BUG FIX: If there's no encounter object, it's a simple "Continue" screen.
    // The action is already defined in the choice object, so we just execute it.
    if (!encounter) {
        if (choice.action) {
            choice.action();
        }
        return; // Exit early to prevent crash.
    }

    // Handle special puzzle encounters like the West Gate of Moria
    if (encounter.onSuccess || encounter.onFailure) {
        if (choice.isCorrect) {
            encounter.onSuccess({ gameState, showEncounterView, displayEvent, encounters });
        } else {
            encounter.onFailure({ gameState, triggerEncounterFlash, updateUI, showEncounterView, checkGameOver });
        }
        return; 
    }

    // Create a dependencies object to pass to action functions
    const dependencies = {
        gameState,
        advanceTime,
        triggerEncounterFlash,
        updateUI,
        performDeathRolls,
        showEncounterView,
        stopGameLoop,
        showTravelView,
        storyTriggers,
        encounters,
        displayEvent
    };

    let choicesToUse = encounter.choices;
    // If choices are a function, resolve them to get the array of choices
    if (typeof choicesToUse === 'function') {
        choicesToUse = choicesToUse(dependencies);
    }
    
    // Find the actual choice object from the potentially dynamically generated list
    const actualChoice = choicesToUse.find(c => c.text === choice.text);
    if (!actualChoice) {
        console.error("Could not find matching choice.", choice, choicesToUse);
        return;
    }

    // Execute the action and get the result text
    const result = actualChoice.action(dependencies);

    // If the action returns null, it handles its own UI transition (e.g., game over, puzzles)
    if (result === null || gameState.isGameOver) {
        return;
    }

    // Display the result of the choice.
    // CORRECTED: This action now uses the canonical stopGameLoop function.
    // This ensures the game state is correctly set to 'paused' and ready for the
    // user to resume travel, which will correctly trigger the next day's encounter roll.
    const continueAction = () => {
        stopGameLoop();
        showTravelView();
        return null;
    };
    showEncounterView(title, result, [{ text: "Continue", action: continueAction }]);
    updateUI();
});

document.addEventListener('resolveTownAction', (e) => {
    const { action, locationKey } = e.detail;
    const dialogueEl = document.getElementById('town-dialogue');
    
    if (action.oneTime) {
        gameState.completedTownActions.add(action.id);
    }
    
    action.action({
        dialogueEl,
        advanceTime,
        gameState,
        meetStrider,
        showEncounterView,
        checkGameOver,
        updateUI,
        stopGameLoop,
        showTravelView,
        storyTriggers,
        renderTownActions,
        displayEvent,
        encounters
    });

    if (!action.isLeaveAction) {
        renderTownActions(locationKey);
    }
    updateUI();
});


// --- Game Start ---
window.onload = () => {
    initializeStartScreen();
};
