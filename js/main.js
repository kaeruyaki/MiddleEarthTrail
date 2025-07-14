// js/main.js

// This is the main entry point for the entire game application.
// Its primary responsibilities are:
// 1. Importing all the necessary modules.
// 2. Wiring up dependencies between modules to avoid circular imports.
// 3. Initializing the game when the page loads.

import { setupNewGame, meetStrider, storyTriggers } from './gameState.js';
import { 
    updateUI, 
    initializeStartScreen, 
    showTravelView, 
    showTownView, 
    handleRivendellArrival,
    setGameLogicDependencies 
} from './ui.js';
import { 
    startGameLoop, 
    stopGameLoop, 
    advanceTime, 
    checkGameOver, 
    campActions,
    performDeathRolls
} from './gameLoop.js';

/**
 * Initializes a new game, sets up the initial state, and displays the first view.
 * This function is called from the start screen.
 * @param {string} profession - The chosen starting profession.
 * @param {string} startKey - The starting location key.
 * @param {object} debugOptions - Flags for debug modes like quick travel.
 */
function initializeGame(profession, startKey, debugOptions) {
    // Hide the start screen and show the main game container
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    // Create the initial game state object
    setupNewGame(profession, startKey, debugOptions);
    
    // Determine the initial view based on the starting location
    const startingLandmark = journeyData[startKey];
    if (startKey === 'rivendell') {
        handleRivendellArrival();
    } else if (startingLandmark.type === 'town') {
        showTownView(startKey);
    } else {
        showTravelView();
    }

    // Perform the first UI update to display the initial state
    updateUI();
}

// --- Dependency Injection ---
// To prevent circular dependencies (e.g., ui.js needing gameLoop.js and vice-versa),
// we create a single object containing all the core logic functions.
// This object is then passed to the ui.js module, giving it access to the functions it needs
// without creating a direct import loop.
const gameLogic = {
    initializeGame,
    startGameLoop,
    stopGameLoop,
    advanceTime,
    checkGameOver,
    campActions,
    meetStrider,
    storyTriggers,
    performDeathRolls
};

// Provide the UI module with the functions it needs to trigger game logic.
setGameLogicDependencies(gameLogic);


// --- Game Start ---
// This is the true entry point of the application. When the window has finished loading,
// it calls the function to set up the interactive start screen.
window.onload = () => {
    initializeStartScreen();
};
