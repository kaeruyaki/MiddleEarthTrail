// js/ui.js
// FINAL-FIX: Implemented responsive button layouts and dynamic SVG loading.

import { journeyData } from './gameData.js';
import { gameState } from './gameState.js';

// --- DOM Element References ---
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const mainView = document.getElementById('main-view');
const partyStatusDisplay = document.getElementById('party-status-display');
const fellowshipDisplay = document.getElementById('fellowship-display');
let animationFrame = 0;

// --- SVG Loader ---
async function loadAndDisplaySVG(url, targetElementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const svgText = await response.text();
        const target = document.getElementById(targetElementId);
        if (target) {
            target.innerHTML = svgText;
            const svgElement = target.querySelector('svg');
            if (svgElement) svgElement.classList.add('encounter-svg');
        }
    } catch (error) {
        console.error('Failed to load SVG:', error);
        const target = document.getElementById(targetElementId);
        if (target) target.innerHTML = `<p class="error-text">Error: Could not load graphic.</p>`;
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

// --- CORE UI UPDATE FUNCTIONS ---
export function updateUI() {
    if (!gameState || Object.keys(gameState).length === 0) return;
    const day = Math.floor((gameState.totalHours - 11 + 24) / 24);
    
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
        <!-- This now uses a responsive flex layout for buttons -->
        <div class="mt-auto flex flex-col sm:flex-row gap-4 pt-6">
            <button id="travel-button" class="game-button flex-1">Continue Journey</button>
            <button id="camp-button" class="game-button flex-1">Make Camp</button>
            <button id="map-button" class="game-button flex-1">View Map</button>
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

    const svgContainerHtml = encounter && encounter.svg
        ? `<div id="encounter-svg-container" class="my-4 w-full max-w-lg mx-auto"></div>`
        : '';

    mainView.innerHTML = `
        <div class="text-center mb-6 flex-shrink-0">
            <h3 class="font-title text-3xl mb-2">${title}</h3>
            ${svgContainerHtml}
            <p class="max-w-2xl mx-auto">${description}</p>
        </div>
        <div id="dialogue-area" class="text-center my-4 text-lg min-h-[2rem] flex-shrink-0">
            ${encounter && encounter.dialogue ? encounter.dialogue : ''}
        </div>
        <div id="choices-area" class="mt-auto pt-6 flex-grow flex flex-col justify-end"></div>
    `;

    if (encounter && encounter.svg) {
        loadAndDisplaySVG(encounter.svg, 'encounter-svg-container');
    }

    const choicesArea = document.getElementById('choices-area');
    const buttonContainer = document.createElement('div');
    choicesArea.appendChild(buttonContainer);

    if (!choices) choices = [];

    // Simplified to a responsive flex layout for all button counts.
    buttonContainer.className = 'flex flex-wrap justify-center gap-4';

    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.className = 'game-button flex-grow'; // Buttons will grow to fill space
        
        if (choices.length === 1) {
            button.classList.add('sm:flex-grow-0', 'sm:min-w-[250px]'); // Don't grow on larger screens if only one button
            choice.text = "Continue";
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
    // ... (rest of the function is unchanged)
}

export function initializeStartScreen() {
    gameContainer.style.display = 'none';
    startScreen.style.display = 'flex';
    
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
