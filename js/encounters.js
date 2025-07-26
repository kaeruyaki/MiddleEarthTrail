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
            { text: "Frodo puts on the Ring", action: ({gameState}) => { gameState.fellowship.find(m => m.name === 'Frodo').health -= 40; gameState.morale -= 40; return `You vanish, entering the wraith-world... He is fading fast! You must race to Rivendell!`; } }
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
        svg: 'Graphics/01_Screen_Bree.svg',
        choices: [
            { 
                id: 'bree_gossip', 
                text: "Listen for Rumors", 
                isPersistent: true, 
                action: ({ advanceTime }) => { 
                    advanceTime(1); 
                    return `You settle into a corner of the common room, listening to the low hum of conversation from the Big Folk and local Hobbits. The talk is of strange folk passing through Bree, and unsettling news from the South. More than one patron speaks in hushed tones of Black Riders seen on the East Road, questioning travelers with a cold dread in their voices. The shadow of the world outside the Shire feels suddenly, terribly close.`; 
                } 
            },
            { 
                id: 'bree_trade', 
                text: "Trade Supplies", 
                isPersistent: true, 
                condition: (gs) => gs.gold >= 15, 
                action: ({ advanceTime, gameState }) => { 
                    advanceTime(1); 
                    gameState.gold -= 15; 
                    gameState.supplies += 25; 
                    return `The trade takes a short while. You get 25 supplies for 15 gold.`; 
                } 
            },
            { 
                id: 'bree_eat_dinner', 
                text: "Eat Dinner", 
                oneTime: true, 
                isPersistent: true, 
                action: ({ advanceTime, gameState, meetStrider }) => { 
                    advanceTime(2); 
                    gameState.flags.ateDinner = true;
                    meetStrider(gameState);
                    return `The warmth of the common room and a pint of ale does much to lift your spirits. Merry and Pippin, feeling bold, begin to regale the locals with tales from the Shire. In a moment of folly, Pippin stands upon a table to sing. The attention this draws is unnerving, and in the commotion, you feel an unseen force press the Ring onto your finger. You vanish. The room erupts in a collective gasp. When you reappear, it is deathly quiet, full of suspicious and fearful eyes. From a dark corner, a lean, weather-beaten man, hooded and smoking a pipe, catches your eye. He motions you over. 'A dangerous trinket to be so careless with' he says in a low voice, his grey eyes glinting in the dim light. 'I am called Strider. I know the enemy that is hunting you, and it is closer than you realize. If you value your life and all that is good, you will come with me.'`;
                } 
            },
            { 
                id: 'bree_follow_strider', 
                text: "Follow Strider", 
                isLeaveAction: true, 
                condition: (gs) => gs.flags.ateDinner,
                action: ({ advanceTime, gameState, showEncounterView, stopGameLoop }) => { 
                    advanceTime(8);
                    gameState.morale -= 10;
                    showEncounterView("A Narrow Escape", "You follow the grim-faced ranger to a small, private parlour. He reveals that the name you travel under, 'Underhill', is known to the Enemy. As the night deepens, a terrifying shriek echoes from the street, followed by the splintering crash of the inn's front door. The Black Riders have found you. Under the cover of darkness, Strider leads you and your companions out a back window and into the wild, his knowledge of the tangled paths your only shield against the hunting Wraiths. He is now one of your company.", [{ text: "Continue", action: () => { stopGameLoop(true); return null; } }]);
                    return null;
                } 
            },
            { 
                id: 'bree_sleep', 
                text: "Turn In for the Night", 
                isLeaveAction: true, 
                action: ({ advanceTime, gameState, meetStrider, showEncounterView, checkGameOver, updateUI, stopGameLoop }) => {
                    advanceTime(8);
                    if (!gameState.flags.ateDinner && Math.random() < 0.5) {
                        // Death Outcome
                        const deathDialogue = "You retire to your rooms, but sleep does not come easily. In the deepest hour of the night, a shattering crash rips you from your slumber. The door to your chamber hangs in splinters. Against the dim light of the hallway stand figures of utter blackness, their presence a wave of ice and terror that steals the breath from your lungs. A high, thin cry of hatred pierces the air, and before any defence can be made, a Morgul-blade glimmers with cold light and finds its mark. The world dissolves into shadow.";
                        showEncounterView("The Ring is Lost", deathDialogue, [{ text: "The Ring has been Lost to Mordor. Game Over", action: () => { window.location.reload(); return null; }}]);
                    } else {
                        // Saved by Strider Outcome
                        const resultText = `You retire to your rooms, but sleep does not come easily. In the deepest hour of the night, the door breaks inward with a crash. Black-robed figures, tall and terrible, fill the doorway. Just as a long, pale blade is raised, a hooded man leaps from the shadows, wielding a sword! 'Out the window!' he commands. You scramble into the night as he holds them back, escaping the attack, but not before the wraith's touch wounds you to the core. Your mysterious rescuer, who calls himself Strider, finds you in the darkness. He is now one of your company.`;
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
