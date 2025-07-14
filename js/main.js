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
    triggerEncounterFlash
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
    
    const startingLandmark = journeyData[startKey];
    if (startKey === 'rivendell') {
        handleRivendellArrivalLogic();
    } else if (startingLandmark.type === 'town') {
        showTownView(startKey);
    } else {
        showTravelView();
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
    const { choice, title } = e.detail;
    const result = choice.action({
        gameState,
        advanceTime,
        triggerEncounterFlash,
        updateUI,
        performDeathRolls,
        showEncounterView,
        stopGameLoop,
        showTravelView,
        storyTriggers,
        encounters
    });

    if (result === null || gameState.isGameOver) {
        return;
    }
    showEncounterView(title, result, [{ text: "Continue", action: () => { stopGameLoop(); showTravelView(); return null; } }]);
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
        renderTownActions
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
