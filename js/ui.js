// js/ui.js
// FINAL-FIX: Implemented dynamic SVG loading for a sustainable workflow.

import { ICONS, journeyData } from './gameData.js';
import { gameState } from './gameState.js';

// --- DOM Element References ---
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const mainView = document.getElementById('main-view');
const partyStatusDisplay = document.getElementById('party-status-display');
const fellowshipDisplay = document.getElementById('fellowship-display');
let animationFrame = 0;

// --- NEW: SVG Loader ---
/**
 * Fetches an SVG file and injects it into a target container.
 * @param {string} url - The relative path to the SVG file.
 * @param {string} targetElementId - The ID of the div to place the SVG in.
 */
async function loadAndDisplaySVG(url, targetElementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const svgText = await response.text();
        const target = document.getElementById(targetElementId);
        if (target) {
            target.innerHTML = svgText;
            // Add the necessary class to the loaded SVG for styling
            const svgElement = target.querySelector('svg');
            if (svgElement) {
                svgElement.classList.add('shire-svg');
            }
        }
    } catch (error) {
        console.error('Failed to load SVG:', error);
        const target = document.getElementById(targetElementId);
        if (target) {
            target.innerHTML = `<p class="error-text">Error: Could not load graphic.</p>`;
        }
    }
}


// --- UI HELPER FUNCTIONS ---
function getHealthStatus(health) {
    const h = Math.max(0, health);
    if (h === 0) return { text: 'Dead' };
    if (h <= 30) return { text: 'Poor' };
    if (h <= 70) return { text: 'Fair' };
    return { text: 'Great' };
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

// --- CORE UI UPDATE FUNCTIONS ---

export function updateUI() {
    if (!gameState || Object.keys(gameState).length === 0) return;
    const day = Math.floor((gameState.totalHours - 11 + 24) / 24);
    
    // CORRECTED: Removed icons to maintain pure vector style
    partyStatusDisplay.innerHTML = `
        <div>Day ${day}</div>
        <div>${journeyData[gameState.currentLocationKey].name}</div>
        <div>${Math.floor(gameState.distanceTraveled)} mi</div>
        <div>Food: ${Math.floor(gameState.food)}</div>
        <div>Supplies: ${Math.floor(gameState.supplies)}</div>
        <div>Morale: ${Math.floor(gameState.morale)}</div>
    `;

    fellowshipDisplay.innerHTML = gameState.fellowship.map(m => {
        const healthInfo = getHealthStatus(m.health);
        // CORRECTED: Removed color classes
        return `<div class="flex justify-between items-center text-sm">
                    <span>${m.name} (${m.race})</span>
                    <span class="font-semibold">${healthInfo.text}</span>
                </div>`;
    }).join('');

    const animEl = document.getElementById('travel-animation');
    if (animEl) {
        const hour = Math.floor(gameState.totalHours % 24);
        const icon = (hour >= 5 && hour < 18) ? '☀️' : '🌙';
        const path = Array(12).fill('─');
        if (gameState.mode === 'traveling') {
            animationFrame = (animationFrame + 1) % 12;
            path[animationFrame] = 'O';
        } else {
            path[0] = '■';
        }
        animEl.innerHTML = `<div class="text-4xl mb-2 font-title">${icon}</div><div class="font-mono tracking-widest">${path.join('')}</div>`;
    }
}

// --- VIEW RENDERING FUNCTIONS ---

export function showTravelView() {
    const currentLoc = journeyData[gameState.currentLocationKey];
    const nextLoc = journeyData[currentLoc.next];
    const progress = nextLoc ? (gameState.distanceTraveled - currentLoc.distance) / (nextLoc.distance - currentLoc.distance) * 100 : 100;

    mainView.innerHTML = `
        <div class="text-center mb-6">
            <h3 class="font-title text-3xl mb-2">${currentLoc.legName || 'The Journey Continues'}</h3>
            <p>From ${currentLoc.name} to ${nextLoc ? nextLoc.name : 'an unknown destination'}</p>
        </div>
        <div class="w-full bg-transparent border border-[var(--line-color)] h-2.5 my-4">
            <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
        <div id="travel-animation" class="text-center my-auto"></div>
        <div class="mt-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <button id="travel-button" class="game-button">Continue Journey</button>
            <button id="camp-button" class="game-button">Make Camp</button>
            <button id="map-button" class="game-button">View Map</button>
        </div>
    `;
    
    document.getElementById('camp-button').addEventListener('click', () => document.dispatchEvent(new Event('showCamp')));
    document.getElementById('map-button').addEventListener('click', () => showMapView());
    
    const travelButton = document.getElementById('travel-button');
    travelButton.textContent = gameState.mode === 'traveling' ? "Stop Traveling" : "Continue Journey";
    travelButton.onclick = () => document.dispatchEvent(new Event(gameState.mode === 'traveling' ? 'stopGameLoop' : 'startGameLoop'));

    updateUI();
}

export function showEncounterView(title, description, choices, encounter = null) {
    gameState.mode = 'event';

    mainView.innerHTML = `
        <div class="text-center mb-6 flex-shrink-0">
            <h3 class="font-title text-3xl mb-2">${title}</h3>
            <p class="max-w-2xl mx-auto">${description}</p>
        </div>
        <div id="dialogue-area" class="text-center my-4 text-lg min-h-[2rem] flex-shrink-0">
            ${encounter && encounter.dialogue ? encounter.dialogue : ''}
        </div>
        <div id="choices-area" class="mt-auto pt-6 flex-grow flex flex-col justify-end"></div>
    `;

    const choicesArea = document.getElementById('choices-area');
    const buttonContainer = document.createElement('div');
    choicesArea.appendChild(buttonContainer);

    if (!choices) choices = [];

    if (choices.length === 1 && choices[0] && !choices[0].isPersistent) {
        buttonContainer.className = 'flex justify-center';
        choices[0].text = "Continue";
    } else {
        buttonContainer.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    }

    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        // CORRECTED: Removed all Tailwind classes to rely solely on the stylesheet.
        button.className = 'game-button';
        
        if (choices.length === 1 && choices[0] && !choices[0].isPersistent) {
            button.classList.add('w-full', 'sm:w-auto', 'sm:min-w-[200px]');
        }

        const isCompleted = choice.oneTime && gameState.completedTownActions.has(choice.id);
        const meetsCondition = !choice.condition || choice.condition(gameState);
        button.disabled = isCompleted || !meetsCondition;

        button.onclick = () => {
            document.dispatchEvent(new CustomEvent('resolveEncounterChoice', { detail: { choice, encounter } }));
        };
        buttonContainer.appendChild(button);
    });
}

export function showLandmarkView(landmark) {
    showEncounterView(
        `Arrived: ${landmark.name}`,
        landmark.description || "You have reached a milestone on your journey.",
        [{ text: "Continue the Journey", action: () => document.dispatchEvent(new Event('startGameLoop')) }]
    );
}

export function showMapView() {
    mainView.innerHTML = `
        <h3 class="font-title text-3xl mb-4 text-center">Map of Middle-earth</h3>
        <div class="flex-grow p-2">
            <svg id="large-map-svg" viewBox="0 0 1000 800" class="w-full h-full"></svg>
        </div>
        <div class="mt-auto pt-6">
            <button id="return-journey-btn" class="game-button w-full">Return</button>
        </div>
    `;
    document.getElementById('return-journey-btn').addEventListener('click', showTravelView);
    drawMap(document.getElementById('large-map-svg'));
}

function drawMap(svgElement) {
    svgElement.innerHTML = ''; 
    const features = {
        coast: 'M130,340 C100,450 150,550 280,600 L350,700 L500,750 L650,720 L750,680 L800,600 L850,500 L820,400 C800,300 700,250 600,250 C500,250 400,200 300,180 C200,150 150,250 130,340 Z',
        misty_mountains: 'M400,100 C420,200 440,300 450,400 C460,500 480,600 500,700',
        mordor_mountains_n: 'M680,580 L750,580 L820,590',
        mordor_mountains_w: 'M680,580 L670,650 L680,720',
    };
    for (const key in features) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', features[key]);
        path.setAttribute('class', 'map-feature');
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
        line.setAttribute('class', 'map-path');
        takenRouteGroup.appendChild(line);
    }
    svgElement.appendChild(takenRouteGroup);
    const landmarksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (const key in journeyData) {
        const landmark = journeyData[key];
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', landmark.x); circle.setAttribute('cy', landmark.y);
        circle.setAttribute('r', '8');
        circle.setAttribute('class', 'map-landmark');
        
        if (gameState.discoveredStops.has(key)) {
            landmarksGroup.appendChild(circle);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', landmark.x); text.setAttribute('y', landmark.y - 15);
            text.textContent = landmark.name;
            text.setAttribute('class', 'map-landmark-label');
            landmarksGroup.appendChild(text);
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
    playerMarker.setAttribute('class', 'map-player');
    svgElement.appendChild(playerMarker);
}

export function initializeStartScreen() {
    gameContainer.style.display = 'none';
    startScreen.style.display = 'flex';
    
    // Load the SVG for the start screen
    loadAndDisplaySVG('Graphics/00_Screen_TheShire.svg', 'start-screen-svg-container');

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
            document.querySelectorAll('.profession-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
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
}
