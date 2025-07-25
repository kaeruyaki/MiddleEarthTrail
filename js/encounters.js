// js/encounters.js

// This file contains all the story and random encounter data for the game.

import { journeyData } from './gameData.js';

/**
 * A list of flavorful failure messages for the Caradhras Pass encounter.
 */
export const caradhrasFailureMessages = [
    "Beaten back by the blizzard, you find a small alcove to catch your breath. The wind's howl sounds like a mocking laugh, and the cold saps your strength.",
    "The snow is a blinding, swirling wall. For every step forward, you are driven two steps back. You must retreat to your meager shelter.",
    "A great drift of snow, larger than a house, blocks the path completely. It is impassable. You are forced to turn back, shivering.",
    "The air grows so cold that your breath freezes in front of your face. The malice of the mountain is a palpable force, pushing you away."
];

/**
 * The main encounter database.
 */
export const encounters = {
    // --- STORY & LANDMARK ENCOUNTERS ---
    'the_journey_begins': {
        name: "The Shadow of the Past",
        description: `The door of Bag End closes behind you for what feels like the last time... You take a deep breath of the sweet Shire-air and turn your face to the East, towards the growing shadow.`,
        type: 'story',
        choices: [ { text: "Step onto the Road", action: ({ showTravelView }) => { showTravelView(); return null; } } ]
    },
    'weathertop': {
        name: "The Witch-king at Weathertop",
        description: "At the summit of the ancient watchtower, you see them—five black figures against the skyline. The Nazgûl...",
        type: 'story',
        trigger: 'landmark_arrival',
        choices: [
            { text: "Frodo resists the urge", action: ({gameState}) => { const healthLost = Math.floor(Math.random() * 20) + 15; gameState.fellowship.find(m => m.name === 'Frodo').health -= healthLost; gameState.morale -= 30; return `Aragorn leaps to defend the hobbits... Frodo is gravely wounded by a Morgul-blade!`; } },
            { text: "Frodo puts on the Ring", action: ({gameState}) => { gameState.fellowship.find(m => m.name === 'Frodo').health -= 40; gameState.morale -= 40; return `Frodo vanishes, entering the wraith-world... He is fading fast! You must race to Rivendell!`; } }
        ]
    },
    'caradhras_pass': { /* ... existing encounter ... */ },
    'west_gate_of_moria': { /* ... existing encounter ... */ },
    'bridge_of_khazad_dum': { /* ... existing encounter ... */ },
    'amonhen': {
        name: "The Breaking of the Fellowship",
        description: "At Amon Hen, Boromir tries to take the Ring. In the chaos, he is slain by Uruk-hai. Frodo, realizing the Ring's corrupting influence, decides he must go on alone... but Samwise refuses to leave his side. The Fellowship is broken.",
        type: 'story',
        trigger: 'landmark_arrival',
        choices: [
            { text: "Face the inevitable", action: (dependencies) => { 
                const { gameState, storyTriggers } = dependencies;
                storyTriggers.amonhen(gameState);
                gameState.currentLocationKey = 'emynmuil';
                gameState.pathTaken.push('emynmuil');
                return "The Fellowship is broken. Only Frodo and Sam remain to continue the quest into the lands of Mordor.";
            }}
        ]
    },

    // --- TOWN ENCOUNTERS ---
    'bree': {
        name: "Bree",
        description: journeyData.bree.description,
        type: 'town',
        svg: 'Graphics/01_Screen_Bree.svg', // <-- ADDED THIS LINE
        choices: [
            { id: 'bree_gossip', text: "Listen for Rumors", isPersistent: true, action: ({ advanceTime }) => { advanceTime(1); return `You spend some time listening to chatter and hear tales of black riders on the road and troubles from the south.`; } },
            { id: 'bree_trade', text: "Trade Supplies", isPersistent: true, condition: (gs) => gs.gold >= 15, action: ({ advanceTime, gameState }) => { advanceTime(1); gameState.gold -= 15; gameState.supplies += 25; return `The trade takes a short while. You get 25 supplies for 15 gold.`; } },
            { 
                id: 'bree_eat_dinner', text: "Eat Dinner", oneTime: true, isPersistent: true, 
                action: ({ advanceTime, gameState, meetStrider }) => { 
                    advanceTime(2); 
                    gameState.flags.ateDinner = true;
                    meetStrider(gameState);
                    return `You find a table in a corner... a lean, hooded man motions you over. 'I am called Strider. If you value your life, you will listen to me.'`;
                } 
            },
            { 
                id: 'bree_follow_strider', text: "Follow Strider", isLeaveAction: true, 
                condition: (gs) => gs.flags.ateDinner,
                action: ({ advanceTime, gameState, showEncounterView, stopGameLoop }) => { 
                    advanceTime(8);
                    gameState.morale -= 10;
                    showEncounterView("A Narrow Escape", "You follow the grim-faced ranger... Under the cover of darkness, Strider leads you out of Bree and into the wild.", [{ text: "Continue", action: () => { stopGameLoop(true); return null; } }]);
                    return null;
                } 
            },
            { 
                id: 'bree_sleep', text: "Turn In for the Night", isLeaveAction: true, 
                action: ({ advanceTime, gameState, meetStrider, showEncounterView, checkGameOver, updateUI, stopGameLoop }) => {
                    advanceTime(8);
                    if (!gameState.flags.ateDinner && Math.random() < 0.5) {
                        checkGameOver("A shattering crash rips you from sleep... The Ring has been taken.");
                    } else {
                        const resultText = `In the deepest hour of the night, the door bursts inward... Your mysterious rescuer introduces himself as Strider. He is now one of your company.`;
                        gameState.fellowship.find(m => m.name === 'Frodo').health -= 30;
                        gameState.morale -= 25;
                        updateUI();
                        meetStrider(gameState);
                        showEncounterView("Night Terrors", resultText, [{ text: "Continue", action: () => { stopGameLoop(true); return null; } }]);
                    }
                    return null;
                } 
            }
        ]
    },
    'rivendell': { /* ... existing encounter ... */ },
    'moria_hub': { /* ... existing encounter ... */ },

    // --- RANDOM ENCOUNTERS ---
    'mysterious_stranger': { /* ... existing encounter ... */ },
    'fruit-trees': { /* ... existing encounter ... */ },
    'orc-patrol': { /* ... existing encounter ... */ },
    // ... etc.
};
