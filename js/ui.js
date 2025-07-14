// js/ui.js

// This module is responsible for all direct manipulation of the HTML document (the DOM).
// It now uses custom events to communicate with the main game logic,
// which prevents circular dependency errors.

import { ICONS, journeyData, townActions } from './gameData.js';
import { encounters } from './encounters.js';
import { gameState } from './gameState.js';

// --- DOM Element References ---
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const mainView = document.getElementById('main-view');
const mainColumn = document.getElementById('main-column');
const partyStatusDisplay = document.getElementById('party-status-display');
const fellowshipDisplay = document.getElementById('fellowship-display');
let animationFrame = 0;


// --- UI HELPER FUNCTIONS ---

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

export function triggerEncounterFlash(color = 'white') {
    const className = color === 'red' ? 'flash-red' : 'flash-white';
    mainColumn.classList.add(className);
    setTimeout(() => {
        mainColumn.classList.remove(className);
    }, 400);
}


// --- CORE UI UPDATE FUNCTIONS ---

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

export function updateTravelAnimation() {
    const animEl = document.getElementById('travel-animation');
    if (!animEl || !gameState || typeof gameState.totalHours === 'undefined') return;

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
    
    document.getElementById('camp-button').addEventListener('click', () => document.dispatchEvent(new Event('showCamp')));
    document.getElementById('map-button').addEventListener('click', () => document.dispatchEvent(new CustomEvent('showMap', { detail: { returnAction: showTravelView } })));
    
    const travelButton = document.getElementById('travel-button');
    if (gameState.mode === 'traveling') {
        travelButton.textContent = "Stop Traveling";
        travelButton.onclick = () => document.dispatchEvent(new Event('stopGameLoop'));
    } else {
        travelButton.textContent = "Continue Journey";
        travelButton.onclick = () => document.dispatchEvent(new Event('startGameLoop'));
    }

    updateTravelAnimation();
}

export function showEncounterView(title, description, choices, encounter = null) {
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
            document.dispatchEvent(new CustomEvent('resolveEncounterChoice', { detail: { choice, title, encounter } }));
        };

        if (choice.condition && !choice.condition(gameState)) {
            button.disabled = true;
        }
        choicesArea.appendChild(button);
    });
}

export function showCampView(isForcedNight = false) {
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

    document.getElementById('break-camp-btn').addEventListener('click', () => document.dispatchEvent(new Event('startGameLoop')));
    document.getElementById('map-btn').addEventListener('click', () => document.dispatchEvent(new CustomEvent('showMap', { detail: { returnAction: showCampView } })));
    document.getElementById('extended-rest-btn').addEventListener('click', () => document.dispatchEvent(new Event('campActionExtendedRest')));
    document.getElementById('forage-btn').addEventListener('click', () => document.dispatchEvent(new Event('campActionForage')));
    document.getElementById('hunt-btn').addEventListener('click', () => document.dispatchEvent(new Event('campActionHunt')));
    document.getElementById('scavenge-btn').addEventListener('click', () => document.dispatchEvent(new Event('campActionScavenge')));
}

export function showTownView(locationKey) {
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

export function renderTownActions(locationKey) {
    const actions = townActions[locationKey];
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
                    document.dispatchEvent(new CustomEvent('resolveTownAction', { detail: { action, locationKey } }));
                };
            }
            actionsContainer.appendChild(button);
        }
    });
}

export function showLandmarkView(landmark) {
    mainView.innerHTML = `
        <div class="text-center my-auto">
             <h3 class="font-title text-4xl text-amber-300 mb-2">Arrived: ${landmark.name}</h3>
             <p class="text-stone-400 text-lg">You have reached a milestone on your journey. You pause for a moment before pressing on.</p>
        </div>
        <div class="mt-auto pt-6">
            <button id="continue-journey-btn" class="w-full game-button bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg">Continue the Journey</button>
        </div>
    `;
    document.getElementById('continue-journey-btn').addEventListener('click', () => document.dispatchEvent(new Event('startGameLoop')));
}

export function showMapView(returnAction) {
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
        choices = choices(gameState);
    }
    // BUG FIX: Pass the entire event object as the 4th argument so the puzzle logic can be triggered.
    showEncounterView(event.name, event.description, choices, event);
}

function drawMap(svgElement) {
    svgElement.innerHTML = ''; 
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
        if (key === 'coast') path.classList.add('fill-stone-800/50');
        svgElement.appendChild(path);
    }
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

export function initializeStartScreen() {
    try {
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
                const event = new CustomEvent('initializeGame', {
                    detail: {
                        profession: selectedProfession,
                        startKey: debugSelect.value,
                        debugOptions: {
                            isQuickTravel: document.getElementById('debug-quick-travel').checked,
                            isStoryOnly: document.getElementById('debug-story-only').checked,
                        }
                    }
                });
                document.dispatchEvent(event);
            }
        };
    } catch (error) {
        console.error("Error during initializeStartScreen:", error);
    }
}

export function handleRivendellArrival() {
    document.dispatchEvent(new Event('handleRivendellArrival'));
}
