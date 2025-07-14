// js/ui.js

// This module is responsible for all direct manipulation of the HTML document (the DOM).
// It handles rendering all game views, updating status displays, and managing user interactions
// on the UI elements. It imports data and state, but does not modify the state itself.

import { ICONS, journeyData, townActions } from './gameData.js';
import { encounters } from './encounters.js';
import { gameState } from './gameState.js';

// This is a placeholder for the functions that will be in other modules.
// We'll import them properly in the main.js file and pass them where needed.
// This avoids circular dependency issues.
let gameLogicDependencies = {};
export function setGameLogicDependencies(deps) {
    gameLogicDependencies = deps;
}

// --- DOM Element References ---
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const mainView = document.getElementById('main-view');
const mainColumn = document.getElementById('main-column');
const partyStatusDisplay = document.getElementById('party-status-display');
const fellowshipDisplay = document.getElementById('fellowship-display');
let animationFrame = 0;


// --- UI HELPER FUNCTIONS ---

/**
 * Gets a descriptive string and color for a character's health value.
 * @param {number} health - The character's health (0-100).
 * @returns {{text: string, colorClass: string}}
 */
function getHealthStatus(health) {
    const h = Math.max(0, health);
    if (h === 0) return { text: 'Dead', colorClass: 'text-red-500' };
    if (h <= 10) return { text: 'Very Poor', colorClass: 'text-red-400' };
    if (h <= 30) return { text: 'Poor', colorClass: 'text-orange-400' };
    if (h <= 50) return { text: 'Average', colorClass: 'text-yellow-400' };
    if (h <= 70) return { text: 'Fair', colorClass: 'text-lime-400' };
    if (h <= 90) return { text: 'Good', colorClass: 'text-green-400' };
    return { text: 'Great', colorClass: 'text-green-300' };
}

/**
 * Gets a descriptive string for the time of day based on the hour.
 * @param {number} hour - The current hour of the day (0-23).
 * @returns {string} The name of the time of day.
 */
function getTimeOfDayString(hour) {
    const h = Math.floor(hour % 24);
    if (h >= 23 || h < 4) return 'Midnight';
    if (h < 6) return 'Before Dawn';
    if (h < 8) return 'Dawn';
    if (h < 12) return 'Morning';
    if (h < 14) return 'Noon';
    if (h < 17) return 'Afternoon';
    if (h < 19) return 'Late Afternoon';
    if (h < 21) return 'Evening';
    return 'Night';
}

/**
 * Triggers a brief screen flash animation for emphasis during encounters.
 * @param {string} color - 'white' or 'red'.
 */
export function triggerEncounterFlash(color = 'white') {
    const className = color === 'red' ? 'flash-red' : 'flash-white';
    mainColumn.classList.add(className);
    setTimeout(() => {
        mainColumn.classList.remove(className);
    }, 400);
}


// --- CORE UI UPDATE FUNCTIONS ---

/**
 * Updates the main status panels with the latest data from the gameState.
 * This function is called frequently to keep the UI in sync with the state.
 */
export function updateUI() {
    if (!gameState || Object.keys(gameState).length === 0) return;
    const day = Math.floor((gameState.totalHours - 11 + 24) / 24);
    
    partyStatusDisplay.innerHTML = `
        <div class="flex items-center">${ICONS.day} Day ${day}</div>
        <div class="flex items-center">${ICONS.location} ${journeyData[gameState.currentLocationKey].name}</div>
        <div class="flex items-center">${ICONS.distance} ${Math.floor(gameState.distanceTraveled)} mi</div>
        <div class="flex items-center">${ICONS.food} Food: ${Math.floor(gameState.food)}</div>
        <div class="flex items-center">${ICONS.supplies} Supplies: ${Math.floor(gameState.supplies)}</div>
        <div class="flex items-center">${ICONS.morale} Morale: ${Math.floor(gameState.morale)}</div>
        <div class="flex items-center">${ICONS.gold} Gold: ${gameState.gold}</div>
        <div class="flex items-center col-span-full sm:col-span-1 lg:col-span-2">${ICONS.day} ${getTimeOfDayString(gameState.totalHours)}</div>
    `;

    fellowshipDisplay.innerHTML = gameState.fellowship.map(m => {
        const healthInfo = getHealthStatus(m.health);
        return `
            <div class="flex justify-between items-center text-sm">
                <span>${m.name} <span class="text-xs text-stone-400">(${m.race})</span></span>
                <span class="font-semibold ${healthInfo.colorClass}">${healthInfo.text}</span>
            </div>`;
    }).join('');
}

/**
 * Updates the simple travel animation in the travel view.
 */
function updateTravelAnimation() {
    const animEl = document.getElementById('travel-animation');
    if (!animEl) return;
    const hour = Math.floor(gameState.totalHours % 24);
    const icon = (hour >= 5 && hour < 18) ? '☀️' : '🌙';
    const path = Array(12).fill('⋅');
    if (gameState.mode === 'traveling') {
        animationFrame = (animationFrame + 1) % 12;
        path[animationFrame] = '🚶‍♂️‍➡️';
    } else {
        path[0] = '🏕️';
    }
    animEl.innerHTML = `<div class="text-4xl mb-2">${icon}</div><div>${path.join('')}</div>`;
}


// --- VIEW RENDERING FUNCTIONS ---

/**
 * Renders the main travel view.
 */
export function showTravelView() {
    const currentLoc = journeyData[gameState.currentLocationKey];
    const nextLoc = journeyData[currentLoc.next];
    const progress = nextLoc ? (gameState.distanceTraveled - currentLoc.distance) / (nextLoc.distance - currentLoc.distance) * 100 : 100;

    mainView.innerHTML = `
        <div class="text-center mb-6">
            <h3 class="font-title text-3xl text-sky-300 mb-2">${currentLoc.legName || 'The Journey Continues'}</h3>
            <p class="text-stone-400">From ${currentLoc.name} to ${nextLoc ? nextLoc.name : 'an unknown destination'}</p>
        </div>
        <div class="w-full bg-zinc-700 rounded-full h-2.5 mb-4">
            <div class="bg-emerald-500 h-2.5 rounded-full" style="width: ${progress}%"></div>
        </div>
        <div id="travel-animation" class="text-center my-auto text-2xl font-mono text-emerald-400 tracking-widest"></div>
        <div class="mt-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <button id="travel-button" class="game-button bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform hover:scale-105">Continue Journey</button>
            <button id="camp-button" class="game-button bg-amber-800 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform hover:scale-105">Make Camp</button>
            <button id="map-button" class="game-button bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform hover:scale-105">View Map</button>
        </div>
    `;
    
    document.getElementById('camp-button').addEventListener('click', () => showCampView(false));
    document.getElementById('map-button').addEventListener('click', () => showMapView(showTravelView));
    
    const travelButton = document.getElementById('travel-button');
    if (gameState.mode === 'traveling') {
        travelButton.textContent = "Stop Traveling";
        travelButton.onclick = gameLogicDependencies.stopGameLoop;
    } else {
        travelButton.textContent = "Continue Journey";
        travelButton.onclick = gameLogicDependencies.startGameLoop;
    }
    updateTravelAnimation();
}

/**
 * Renders a generic encounter view with a title, description, and choices.
 * @param {string} title - The encounter title.
 * @param {string} description - The encounter description text.
 * @param {Array} choices - An array of choice objects.
 */
export function showEncounterView(title, description, choices) {
    gameState.mode = 'event';
    mainView.innerHTML = `
        <div class="text-center flex-grow flex flex-col justify-center">
            <h3 class="font-title text-3xl text-amber-300 mb-4">${title}</h3>
            <p class="text-stone-300 max-w-xl mx-auto mb-8 text-lg leading-relaxed">${description}</p>
        </div>
        <div id="choices-area" class="mt-auto grid gap-4 pt-6"></div>
    `;
    const choicesArea = document.getElementById('choices-area');
    choicesArea.className = 'mt-auto grid gap-4 pt-6';
    
    if (choices.length === 1) {
        choices[0].text = "Continue";
        choicesArea.classList.add('grid-cols-1', 'flex', 'justify-center');
    } else {
        choicesArea.classList.add('grid-cols-1', 'sm:grid-cols-2');
    }

    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.className = "game-button bg-sky-800 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform hover:scale-105";
        if (choices.length === 1) button.classList.add('w-full', 'sm:w-1/2');

        button.onclick = () => {
            // Pass all necessary functions and state to the choice's action
            const result = choice.action({ ...gameLogicDependencies, gameState, showEncounterView, showTravelView, encounters, caradhrasFailureMessages });
            if (result === null || gameState.isGameOver) {
                return;
            }
            showEncounterView(title, result, [{ text: "Continue", action: () => { gameLogicDependencies.stopGameLoop(); showTravelView(); return null; } }]);
            updateUI();
        };

        if (choice.condition && !choice.condition(gameState)) {
            button.disabled = true;
        }
        choicesArea.appendChild(button);
    });
}

/**
 * Renders the camp view with options for resting, foraging, etc.
 * @param {boolean} isForcedNight - True if camping is forced by nightfall.
 */
export function showCampView(isForcedNight) {
    gameLogicDependencies.stopGameLoop();
    gameState.mode = 'camp';
    let title = isForcedNight ? "The Day's Journey is Over" : "You Make Camp";
    let description = isForcedNight ? "Darkness has fallen. You make camp and rest." : "You decide to pause your journey and set up camp to rest and recover.";
    
    mainView.innerHTML = `
        <div class="text-center mb-6">
            <div class="text-7xl mb-4">🏕️</div>
            <h3 class="font-title text-3xl text-amber-300 mb-2">${title}</h3>
            <p class="text-stone-400">${description}</p>
        </div>
        <div id="camp-results" class="text-center my-4 text-lg text-emerald-300 min-h-[2rem]"></div>
        <div class="mt-auto grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
            <button id="break-camp-btn" class="game-button bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg">Continue</button>
            <button id="map-btn" class="game-button bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg">View Map</button>
            <button id="extended-rest-btn" class="game-button bg-amber-800 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg">Extended Rest</button>
            <button id="forage-btn" class="game-button bg-amber-800 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg">Forage</button>
            <button id="hunt-btn" class="game-button bg-amber-800 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg">Hunt</button>
            <button id="scavenge-btn" class="game-button bg-amber-800 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg">Scavenge</button>
        </div>
    `;

    document.getElementById('break-camp-btn').addEventListener('click', gameLogicDependencies.startGameLoop);
    document.getElementById('map-btn').addEventListener('click', () => showMapView(() => showCampView(false)));
    document.getElementById('extended-rest-btn').addEventListener('click', gameLogicDependencies.campActions.extendedRest);
    document.getElementById('forage-btn').addEventListener('click', gameLogicDependencies.campActions.forage);
    document.getElementById('hunt-btn').addEventListener('click', gameLogicDependencies.campActions.hunt);
    document.getElementById('scavenge-btn').addEventListener('click', gameLogicDependencies.campActions.scavenge);
}

/**
 * Renders the view for a town, including its specific actions.
 * @param {string} locationKey - The key for the town in journeyData.
 */
export function showTownView(locationKey) {
    gameLogicDependencies.stopGameLoop();
    gameState.mode = 'town';
    const townData = journeyData[locationKey];
    
    mainView.innerHTML = `
        <div class="text-center mb-6">
            <h3 class="font-title text-4xl text-amber-300 mb-2">Welcome to ${townData.name}</h3>
            ${ locationKey !== 'rivendell' ? `<p class="text-stone-400 max-w-2xl mx-auto">${townData.description}</p>` : '' }
        </div>
        <div id="town-dialogue" class="text-center my-4 text-lg text-emerald-300 min-h-[2rem]"></div>
        <div id="town-actions-container" class="mt-auto grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6"></div>
    `;
    renderTownActions(locationKey);
}

/**
 * Renders the action buttons for the current town view.
 * @param {string} locationKey - The key for the town.
 */
export function renderTownActions(locationKey) {
    const actions = townActions[locationKey];
    const dialogueEl = document.getElementById('town-dialogue');
    const actionsContainer = document.getElementById('town-actions-container');
    actionsContainer.innerHTML = ''; 

    actions.forEach(action => {
        const isCompleted = action.oneTime && gameState.completedTownActions.has(action.id);
        const meetsCondition = !action.condition || action.condition(gameState);
        const isDisabledByLogic = action.disabled === true;

        if (meetsCondition) {
            const button = document.createElement('button');
            button.textContent = action.text;
            button.className = action.isLeaveAction 
                ? "game-button bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg"
                : "game-button bg-sky-800 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg";
            
            if (isCompleted || isDisabledByLogic) {
                button.disabled = true;
            } else {
                button.onclick = () => {
                    if (action.oneTime) {
                        gameState.completedTownActions.add(action.id);
                    }
                    // This is complex: the action function from gameData needs access to many other functions.
                    // We pass them all in a single dependency object.
                    action.action(dialogueEl, gameLogicDependencies.advanceTime, gameState, gameLogicDependencies.meetStrider, showEncounterView, gameLogicDependencies.stopGameLoop, showTravelView, gameLogicDependencies.checkGameOver, updateUI, gameLogicDependencies.storyTriggers, renderTownActions);
                    if (!action.isLeaveAction) {
                        renderTownActions(locationKey);
                    }
                    updateUI();
                };
            }
            actionsContainer.appendChild(button);
        }
    });
}

/**
 * Renders a simple view for arriving at a non-event landmark.
 * @param {object} landmark - The landmark data object from journeyData.
 */
export function showLandmarkView(landmark) {
    gameLogicDependencies.stopGameLoop();
    mainView.innerHTML = `
        <div class="text-center my-auto">
             <h3 class="font-title text-4xl text-amber-300 mb-2">Arrived: ${landmark.name}</h3>
             <p class="text-stone-400 text-lg">You have reached a milestone on your journey. You pause for a moment before pressing on.</p>
        </div>
        <div class="mt-auto pt-6">
            <button id="continue-journey-btn" class="w-full game-button bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg">Continue the Journey</button>
        </div>
    `;
    document.getElementById('continue-journey-btn').addEventListener('click', gameLogicDependencies.startGameLoop);
}

/**
 * Renders the full-screen map view.
 * @param {function} returnAction - The function to call when the return button is clicked.
 */
export function showMapView(returnAction) {
    gameLogicDependencies.stopGameLoop();
    mainView.innerHTML = `
        <h3 class="font-title text-3xl text-sky-300 mb-4 text-center">Map of Middle-earth</h3>
        <div class="flex-grow bg-zinc-900/50 rounded-lg border border-zinc-700 p-2">
            <svg id="large-map-svg" viewBox="0 0 1000 800"></svg>
        </div>
        <div class="mt-auto pt-6">
            <button id="return-journey-btn" class="w-full game-button bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg">Return</button>
        </div>
    `;
    document.getElementById('return-journey-btn').addEventListener('click', returnAction || showTravelView);
    drawMap(document.getElementById('large-map-svg'));
}

/**
 * A wrapper to display a specific encounter by its key.
 * @param {object} event - The encounter object from the encounters data.
 */
export function displayEvent(event) {
    let choices = event.choices;
    if (typeof choices === 'function') {
        // If choices is a function, call it with dependencies to get the dynamic choices
        choices = choices({gameState, journeyData, ...gameLogicDependencies});
    }
    showEncounterView(event.name, event.description, choices);
}


// --- MAP DRAWING ---

/**
 * Draws the SVG map based on the current gameState.
 * @param {SVGElement} svgElement - The <svg> element to draw into.
 */
function drawMap(svgElement) {
    svgElement.innerHTML = ''; 
    
    // Landmass & Features
    const features = {
        coast: 'M130,340 C100,450 150,550 280,600 L350,700 L500,750 L650,720 L750,680 L800,600 L850,500 L820,400 C800,300 700,250 600,250 C500,250 400,200 300,180 C200,150 150,250 130,340 Z',
        misty_mountains: 'M400,100 C420,200 440,300 450,400 C460,500 480,600 500,700',
        mordor_mountains_n: 'M680,580 L750,580 L820,590',
        mordor_mountains_w: 'M680,580 L670,650 L680,720',
        mirkwood: 'M500,200 C520,250 530,350 500,450',
        fangorn: 'M550,580 C530,620 550,660 580,680'
    };
    
    for (const key in features) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', features[key]);
        path.setAttribute('class', 'map-feature');
        if (key === 'coast') {
            path.classList.add('fill-stone-800/50');
        }
        svgElement.appendChild(path);
    }

    // Draw the path taken by the player
    const takenRouteGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (let i = 0; i < gameState.pathTaken.length - 1; i++) {
        const startPoint = journeyData[gameState.pathTaken[i]];
        const endPoint = journeyData[gameState.pathTaken[i+1]];
        if (!startPoint || !endPoint) continue;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startPoint.x); line.setAttribute('y1', startPoint.y);
        line.setAttribute('x2', endPoint.x); line.setAttribute('y2', endPoint.y);
        line.setAttribute('class', 'stroke-emerald-400/50');
        line.setAttribute('stroke-width', '3');
        takenRouteGroup.appendChild(line);
    }
    svgElement.appendChild(takenRouteGroup);

    // Draw all landmarks
    const landmarksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (const key in journeyData) {
        const landmark = journeyData[key];
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', landmark.x); circle.setAttribute('cy', landmark.y);
        
        if (gameState.discoveredStops.has(key)) {
            circle.setAttribute('r', '8');
            circle.setAttribute('class', 'fill-amber-500 stroke-zinc-900 stroke-2');
            landmarksGroup.appendChild(circle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', landmark.x); text.setAttribute('y', landmark.y - 15);
            text.textContent = landmark.name;
            text.setAttribute('class', 'map-landmark-label');
            landmarksGroup.appendChild(text);
        } else {
            circle.setAttribute('r', '3');
            circle.setAttribute('class', 'fill-stone-500');
            landmarksGroup.appendChild(circle);
        }
    }
    svgElement.appendChild(landmarksGroup);

    // Draw the current player position
    const currentLoc = journeyData[gameState.currentLocationKey];
    const nextLocKey = currentLoc.next;
    let playerX = currentLoc.x;
    let playerY = currentLoc.y;
    
    if (nextLocKey && journeyData[nextLocKey]) {
        const nextLoc = journeyData[nextLocKey];
        const segmentDist = nextLoc.distance - currentLoc.distance;
        if (segmentDist > 0) {
            const progressOnSegment = (gameState.distanceTraveled - currentLoc.distance) / segmentDist;
            if (progressOnSegment > 0 && progressOnSegment < 1) {
                playerX = currentLoc.x + (nextLoc.x - currentLoc.x) * progressOnSegment;
                playerY = currentLoc.y + (nextLoc.y - currentLoc.y) * progressOnSegment;
            } else if (progressOnSegment >= 1) {
                playerX = nextLoc.x;
                playerY = nextLoc.y;
            }
        }
    }

    const playerMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    playerMarker.setAttribute('cx', playerX);
    playerMarker.setAttribute('cy', playerY);
    playerMarker.setAttribute('r', '6');
    playerMarker.setAttribute('class', 'fill-rose-600 stroke-white');
    svgElement.appendChild(playerMarker);
}

// --- INITIALIZATION ---

/**
 * Sets up the initial start screen, attaching event listeners.
 */
export function initializeStartScreen() {
    gameContainer.style.display = 'none';
    startScreen.style.display = 'flex';
    const beginButton = document.getElementById('begin-journey-button');
    const professionCards = document.querySelectorAll('.profession-card');
    let selectedProfession = null;
    
    const debugSelect = document.getElementById('debug-start-select');
    debugSelect.innerHTML = ''; 
    for (const key in journeyData) {
        if (Object.prototype.hasOwnProperty.call(journeyData, key)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = journeyData[key].name;
            debugSelect.appendChild(option);
        }
    }

    professionCards.forEach(card => {
        card.addEventListener('click', () => {
            professionCards.forEach(c => c.classList.remove('border-amber-400/50'));
            card.classList.add('border-amber-400/50');
            selectedProfession = card.dataset.profession;
            beginButton.disabled = false;
        });
    });

    beginButton.onclick = () => {
        if(selectedProfession) {
            const debugOptions = {
                isQuickTravel: document.getElementById('debug-quick-travel').checked,
                isStoryOnly: document.getElementById('debug-story-only').checked,
            };
            gameLogicDependencies.initializeGame(selectedProfession, debugSelect.value, debugOptions);
        }
    };
}

/**
 * Handles the special arrival logic for Rivendell.
 */
export function handleRivendellArrival() {
    const { storyTriggers, advanceTime } = gameLogicDependencies;
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

// Set up a recurring timer for the travel animation
setInterval(updateTravelAnimation, 500);
