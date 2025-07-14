// js/gameState.js

// This file manages the central state of the game. It initializes the game state,
// holds the state object itself, and contains functions for applying major,
// story-driven changes to the state.

import { professions, journeyData } from './gameData.js';

// The single source of truth for the game's current state.
// It's declared with 'let' so it can be reassigned by setupNewGame.
export let gameState = {};

/**
 * A collection of functions that apply major, irreversible story changes to the game state.
 * These are triggered at specific points in the journey.
 */
export const storyTriggers = {
    'bree': (state) => {
        if (!state.fellowship.some(m => m.name === 'Strider' || m.name === 'Aragorn')) {
            state.fellowship.push({ name: 'Strider', race: 'Man', health: 100 });
            state.flags.metStrider = true;
        }
    },
    'rivendell': (state) => {
        const strider = state.fellowship.find(m => m.name === 'Strider');
        if (strider) strider.name = 'Aragorn';
    },
    'formFellowship': (state) => {
        storyTriggers.rivendell(state); // Ensure Strider is renamed first
        const fellowshipMembers = [
            { name: 'Legolas', race: 'Elf', health: 100 },
            { name: 'Gimli', race: 'Dwarf', health: 100 },
            { name: 'Boromir', race: 'Man', health: 100 },
            { name: 'Gandalf', race: 'Wizard', health: 100 }
        ];

        fellowshipMembers.forEach(member => {
            if (!state.fellowship.some(m => m.name === member.name)) {
                state.fellowship.push(member);
            }
        });
        
        state.flags.councilOfElrondComplete = true;
        // This will be used by the UI module to update the display
        const fellowshipTitleEl = document.getElementById('fellowship-title');
        if(fellowshipTitleEl) fellowshipTitleEl.textContent = "The Fellowship";
    },
    'amonhen': (state) => {
        const boromir = state.fellowship.find(m => m.name === 'Boromir');
        if (boromir) boromir.health = 0;
        state.fellowship = state.fellowship.filter(m => ['Frodo', 'Sam', 'Aragorn', 'Legolas', 'Gimli'].includes(m.name));
    },
    'moria': (state) => {
        const gandalf = state.fellowship.find(m => m.name === 'Gandalf');
        if (gandalf) gandalf.health = 0;
        state.morale -= 40; // Huge morale hit
    },
};

/**
 * A helper object to fast-forward the story state when starting from a debug location.
 */
const storySimulation = {
    'bree': (state) => storyTriggers.bree(state),
    'rivendell': (state) => {
        storyTriggers.rivendell(state);
        storyTriggers.formFellowship(state);
        state.flags.frodoHasStingAndMithril = true;
        state.flags.rivendellPhase = 3;
    },
    'moria': (state) => storyTriggers.moria(state),
    'amonhen': (state) => storyTriggers.amonhen(state),
};

/**
 * A specific state mutation for when the party meets Strider.
 * Ensures he isn't added to the party more than once.
 * @param {object} state - The current game state object.
 */
export function meetStrider(state) {
    if (!state.fellowship.some(m => m.name === 'Strider' || m.name === 'Aragorn')) {
        state.fellowship.push({ name: 'Strider', race: 'Man', health: 100 });
        state.flags.metStrider = true;
    }
}

/**
 * Initializes a new game by creating a fresh gameState object.
 * This is the starting point for any new journey.
 * @param {string} profession - The player's chosen starting profession.
 * @param {string} startKey - The location key to start the journey from (for debugging).
 * @param {object} debugOptions - An object with flags for quick travel, etc.
 */
export function setupNewGame(profession, startKey = 'shire', debugOptions = {}) {
    // 1. Base State Initialization
    const newGameState = {
        totalHours: 11,
        distanceTraveled: 0,
        food: professions[profession].food,
        supplies: professions[profession].supplies,
        gold: professions[profession].gold,
        morale: 100,
        isGameOver: false,
        mode: 'paused', // Modes: 'paused', 'traveling', 'event', 'camp', 'town'
        autocampEnabled: false,
        targetDistance: 1000,
        fellowship: [
            { name: 'Frodo', race: 'Hobbit', health: 100 },
            { name: 'Sam', race: 'Hobbit', health: 100 },
            { name: 'Merry', race: 'Hobbit', health: 100 },
            { name: 'Pippin', race: 'Hobbit', health: 100 },
        ],
        currentLocationKey: 'shire',
        pathTaken: ['shire'],
        discoveredStops: new Set(['shire']),
        completedTownActions: new Set(),
        inventory: { athelas: 0, lembas: 0 },
        buffs: {},
        flags: { 
            gollumFollowing: false, 
            councilOfElrondComplete: false,
            metStrider: false,
            ateDinner: false,
            rivendellPhase: 0,
            frodoHasStingAndMithril: false,
            caradhrasAttempts: 0,
            isQuickTravel: debugOptions.isQuickTravel || false,
            isStoryOnly: debugOptions.isStoryOnly || false,
        },
    };

    // 2. Simulate journey up to the startKey for debugging
    const canonicalPath = ['shire', 'bree', 'weathertop', 'trollshaws', 'rivendell', 'caradhras_pass', 'moria', 'lothlorien', 'anduin', 'amonhen'];
    const startIndex = canonicalPath.indexOf(startKey);

    if (startIndex > 0) {
        const path_to_start = canonicalPath.slice(0, startIndex);
        path_to_start.forEach(locationKey => {
            if (storySimulation[locationKey]) {
                storySimulation[locationKey](newGameState);
            }
             if (!newGameState.pathTaken.includes(locationKey)) {
                newGameState.pathTaken.push(locationKey);
            }
            newGameState.discoveredStops.add(locationKey);
        });
    }
    
    // 3. Set the final location and distance based on the start key
    const startData = journeyData[startKey];
    newGameState.currentLocationKey = startKey;
    newGameState.distanceTraveled = startData.distance;
    
    if (!newGameState.pathTaken.includes(startKey)) {
        newGameState.pathTaken.push(startKey);
    }
    newGameState.discoveredStops.add(startKey);

    // 4. Overwrite the global gameState with the newly created one.
    gameState = newGameState;
}
