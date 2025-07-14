// js/encounters.js

// This file contains all the story and random encounter data for the game.
// Separating this makes it easier to add new encounters or balance existing ones
// without touching the core game logic.

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
 * Each key is a unique encounter ID.
 */
export const encounters = {
    // --- STORY ENCOUNTERS ---
    'weathertop': {
        name: "The Witch-king at Weathertop",
        description: "At the summit of the ancient watchtower, you see them—five black figures against the skyline. The Nazgûl. Their leader draws a long sword that glitters with a cold, pale light. A cry of pure terror and hatred splits the air as they advance, and Frodo feels an overwhelming urge to put on the Ring.",
        type: 'story',
        trigger: 'landmark_arrival',
        choices: [
            { text: "Frodo resists the urge", action: ({gameState}) => { const healthLost = Math.floor(Math.random() * 20) + 15; gameState.fellowship.find(m => m.name === 'Frodo').health -= healthLost; gameState.morale -= 30; return `Aragorn leaps to defend the hobbits, brandishing fire against the Wraiths. They are driven back, but not before Frodo is gravely wounded by a Morgul-blade! You must get him to Rivendell!`; } },
            { text: "Frodo puts on the Ring", action: ({gameState}) => { gameState.fellowship.find(m => m.name === 'Frodo').health -= 40; gameState.morale -= 40; return `Frodo vanishes, entering the wraith-world. The Witch-king strikes with a Morgul-blade, and a shard of ice enters Frodo's shoulder. He is fading fast! You must race to Rivendell!`; } }
        ]
    },
    'caradhras_pass': {
        name: "The Pass of Caradhras",
        description: "As you climb higher into the mountains, the air grows thin and a cruel wind howls. A sudden, unnatural snowstorm descends, blinding you with swirling white. The voice of Saruman echoes in the storm, a fell magic seeking to crush you.",
        type: 'story',
        trigger: 'landmark_arrival',
        choices: [
            { 
                text: "Attempt to push through the snow", 
                action: (dependencies) => {
                    const { gameState, triggerEncounterFlash, showEncounterView, stopGameLoop, showTravelView, updateUI, checkGameOver } = dependencies;
                    triggerEncounterFlash('white');
                    if (Math.random() < 0.1) { // 10% chance of success
                        gameState.currentLocationKey = 'lothlorien';
                        gameState.pathTaken.push('lothlorien');
                        const successMessage = `With a final, desperate effort, you break through the storm's heart! The wind lessens, the snow thins, and ahead you see the slopes descending into a golden-hued valley. You have conquered the pass, but the ordeal has left you battered and weary.`;
                        showEncounterView("The Pass is Broken", successMessage, [{ text: "Continue", action: () => { stopGameLoop(); showTravelView(); return null; } }]);
                        return null;
                    } else {
                        // Failure
                        gameState.fellowship.forEach(m => m.health -= 15);
                        gameState.morale -= 10;
                        updateUI();
                        gameState.flags.caradhrasAttempts = (gameState.flags.caradhrasAttempts || 0) + 1;
                        checkGameOver();
                        if(gameState.isGameOver) return null;
                        
                        const failureMessage = caradhrasFailureMessages[gameState.flags.caradhrasAttempts % caradhrasFailureMessages.length];
                        const updatedDescription = `<p class='text-orange-400'>${failureMessage}</p><hr class='my-4 border-zinc-600'>${encounters.caradhras_pass.description}`;
                        
                        showEncounterView(encounters.caradhras_pass.name, updatedDescription, encounters.caradhras_pass.choices);
                        return null;
                    }
                }
            },
            { 
                text: "Turn back and take the path through Moria", 
                action: (dependencies) => {
                    const { gameState, showEncounterView, stopGameLoop, showTravelView } = dependencies;
                    gameState.currentLocationKey = 'moria';
                    gameState.pathTaken.pop();
                    gameState.pathTaken.push('moria');
                    showEncounterView("The Mountain's Wrath", "The mountain has defeated you. With heavy hearts, you turn back and take the dark and secret way through the Mines of Moria.", [{ text: "Continue", action: () => { stopGameLoop(); showTravelView(); return null; } }]);
                    return null;
                }
            }
        ]
    },
    'moria': {
        name: "The Bridge of Khazad-dûm",
        description: "You have fled through the endless dark of Moria, but at the bridge, a shadow rises from the depths. A Balrog of Morgoth, a demon of the ancient world, blocks your path. Gandalf alone turns to face it on the narrow bridge. 'You cannot pass!' he cries, striking the bridge with his staff.",
        type: 'story',
        trigger: 'landmark_arrival',
        choices: [
            { text: "Fly, you fools!", action: (dependencies) => { 
                const { gameState, storyTriggers } = dependencies;
                storyTriggers.moria(gameState);
                gameState.currentLocationKey = 'lothlorien';
                gameState.pathTaken.push('lothlorien');
                return `Gandalf confronts the Balrog, and both fall into the abyss. The Fellowship escapes, but their guide and friend is lost. Grief-stricken, you make your way to the woods of Lothlórien.`;
            }}
        ]
    },
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
    // --- RANDOM ENCOUNTERS ---
    'fruit-trees': {
        name: "Fruit Trees", description: "You come upon a small, sun-dappled orchard of wild apple trees, their branches heavy with ripe fruit.", type: 'friendly', trigger: 'travel', weight: 8,
        choices: [
            { text: "Eat your fill", action: ({gameState, advanceTime}) => { advanceTime(1); gameState.fellowship.forEach(m => m.health = Math.min(100, m.health + 5)); gameState.morale = Math.min(100, gameState.morale + 5); return `You stop for a while to eat. The fresh fruit is delicious and revitalizing.`; } },
            { text: "Gather for the road", action: ({gameState, advanceTime}) => { advanceTime(2); const foodFound = Math.floor(Math.random() * 15) + 10; gameState.food += foodFound; return `It takes some time, but you gather the best fruit, adding <span class="text-positive">${foodFound} food</span> to your stores.`; } },
            { text: "Do nothing", action: () => `You press on, leaving the bounty behind.` }
        ]
    },
    'orc-patrol': {
        name: "Orc Patrol", description: "A harsh guttural speech echoes from ahead. A patrol of Orcs, their scimitars cruelly sharp, march down the path. They have not yet seen you.", type: 'hostile', trigger: 'travel', weight: 7,
        choices: [
            { text: "Set an ambush", action: (deps) => { 
                const { gameState, advanceTime, triggerEncounterFlash, updateUI, performDeathRolls } = deps;
                advanceTime(1);
                let successChance = 0.75;
                if (gameState.flags.frodoHasStingAndMithril) { successChance = 0.9; }
                if (Math.random() < successChance) { 
                    const s = Math.floor(Math.random() * 10); 
                    gameState.supplies += s; 
                    gameState.morale += 5; 
                    return `<span class="text-positive">The ambush is perfect!</span> You dispatch the Orcs swiftly, finding ${s} supplies.`; 
                } else { 
                    triggerEncounterFlash('red');
                    gameState.fellowship.forEach(m => { 
                        if(m.health > 0) {
                            let damage = Math.random() * 15;
                            if (m.name === 'Frodo' && gameState.flags.frodoHasStingAndMithril) { damage *= 0.5; }
                            m.health -= damage;
                        }
                    }); 
                    gameState.morale -= 10; 
                    updateUI();
                    return `<span class="text-negative">They spot you too soon!</span> A fierce skirmish ensues.`; 
                } 
            } },
            { text: "Attempt to sneak past", action: ({gameState, advanceTime}) => { advanceTime(2); if (Math.random() < 0.5) { return `<span class="text-positive">It takes a couple of tense hours, but you slip by unnoticed.</span>`; } else { const s = Math.floor(Math.random() * 10) + 5; gameState.supplies = Math.max(0, gameState.supplies - s); gameState.morale -= 10; return `<span class="text-negative">Spotted!</span> You drop ${s} supplies to create a diversion and escape.`; } } },
            { text: "Confront them head-on", action: (deps) => { 
                const { gameState, advanceTime, triggerEncounterFlash, updateUI, performDeathRolls } = deps;
                advanceTime(1); 
                triggerEncounterFlash('red');
                let txt = ""; 
                gameState.fellowship.forEach(m => { 
                    if(m.health > 0) {
                        let damage = Math.random() * 25;
                        if (m.name === 'Frodo' && gameState.flags.frodoHasStingAndMithril) { damage *= 0.5; }
                        m.health -= damage;
                    }
                }); 
                gameState.morale -= 15; 
                updateUI();
                const c = performDeathRolls("battle"); 
                if(c) { 
                    txt = `<span class="text-catastrophic">The battle is brutal.</span> ${c}`; 
                } else { 
                    txt = `<span class="text-negative">The battle is brutal, leaving everyone wounded.</span>`; 
                } 
                return txt; 
            } }
        ]
    },
    'lost-in-wild': {
        name: "Lost in the Wild", description: "The landscape has become a monotonous, rolling terrain. The path is gone. You are lost.", type: "neutral", trigger: "travel", weight: 10,
        choices: [
            // BUG FIX: Condition now checks for "Strider" OR "Aragorn"
            { text: "Trust the Ranger", condition: (gameState) => gameState.fellowship.some(m => (m.name === 'Aragorn' || m.name === 'Strider') && m.health > 0), action: ({advanceTime}) => { advanceTime(3); return `<span class="text-positive">Aragorn's skill guides you true after a few hours of searching.</span> You find the main path again.`; } },
            { text: "Climb for a view", action: ({advanceTime, gameState, updateUI}) => { advanceTime(2); if (Math.random() < 0.6) { return `<span class="text-positive">After a short climb, you spot the correct path from a high vantage.</span>`; } else { const m = gameState.fellowship.find(m => m.health > 0); m.health -= 10; updateUI(); return `<span class="text-negative">${m.name} slips and falls while climbing.</span> The path remains hidden.`; } } },
            { text: "Press on blindly", action: ({advanceTime, gameState}) => { advanceTime(4); gameState.morale -= 10; return `<span class="text-neutral">You wander for hours, your spirits sinking, before finally stumbling back onto the path.</span>`; } }
        ]
    },
    'mountain-spring': {
        name: "Mountain Spring", description: "Tucked into a mossy rock face, you find a spring of crystal-clear water bubbling forth.", type: 'friendly', trigger: 'travel', weight: 8,
        choices: [
            { text: "Drink deeply", action: ({advanceTime, gameState}) => { advanceTime(1); gameState.fellowship.forEach(m => m.health = Math.min(100, m.health + 10)); gameState.morale += 10; return `You rest for a while. The pure, cold water is incredibly refreshing.`; } },
            { text: "Refill waterskins", action: ({advanceTime, gameState}) => { advanceTime(0.5); gameState.buffs.sustainingWater = (gameState.buffs.sustainingWater || gameState.totalHours) + 24; return `You quickly fill your waterskins. The water will sustain you for the next day.`; } },
            { text: "Do nothing", action: () => `You ignore the spring.` }
        ]
    },
    'sudden-downpour': {
        name: "Sudden Downpour", description: "The sky opens up without warning, and a cold, driving rain begins to fall.", type: 'neutral', trigger: 'travel', weight: 10,
        choices: [
            { text: "Push on", action: ({advanceTime, gameState}) => { advanceTime(1); gameState.fellowship.forEach(m => { if(m.health > 0) m.health -= 5 }); gameState.morale -= 5; return `You trudge on through the miserable rain, losing some health and morale.`; } },
            { text: "Find shelter", action: ({advanceTime}) => { advanceTime(2); return `You find a small overhang and wait for the worst of the storm to pass. It takes a couple of hours.`; } },
            { text: "Use supplies to make shelter", condition: (gameState) => gameState.supplies >= 5, action: ({advanceTime, gameState}) => { advanceTime(0.5); gameState.supplies -= 5; return `You quickly use 5 supplies to create a makeshift shelter.`; } }
        ]
    },
    'wargs-wild': {
        name: "Wargs of the Wild", description: "A howl echoes through the hills. A pack of Wargs, monstrous wolves with a malevolent gleam in their eyes, has caught your scent.", type: 'hostile', trigger: 'travel', weight: 4,
        choices: [
            { text: "Light fires to keep them at bay", condition: (gameState) => gameState.supplies >= 10, action: ({advanceTime, gameState}) => { advanceTime(1); gameState.supplies -= 10; gameState.morale -= 5; return `You quickly use 10 supplies to build protective fires. The Wargs snarl from the darkness for an hour but dare not approach.`; } },
            { text: "Stand and fight", action: (deps) => { 
                const { gameState, advanceTime, triggerEncounterFlash, updateUI, performDeathRolls } = deps;
                advanceTime(1); 
                triggerEncounterFlash('red');
                let txt = ""; 
                gameState.fellowship.forEach(m => { 
                    if(m.health > 0) {
                        let damage = Math.random() * 20 + 10;
                        if (m.name === 'Frodo' && gameState.flags.frodoHasStingAndMithril) { damage *= 0.5; }
                        m.health -= damage;
                    }
                }); 
                gameState.morale -= 20; 
                updateUI();
                const c = performDeathRolls("the Warg attack"); 
                if(c) { 
                    txt = `<span class="text-catastrophic">The Wargs are terrifyingly fast and strong!</span> ${c}`; 
                } else { 
                    txt = `<span class="text-negative">You fight off the beasts, but not without suffering grievous wounds.</span>`; 
                } 
                return txt; 
            } },
            { text: "Climb trees or rocks", action: ({advanceTime, gameState}) => { advanceTime(3); gameState.morale -= 10; return `You scramble up high ground, out of reach. You are trapped for hours until the pack moves on.`; } }
        ]
    },
    'athelas': {
        name: "Athelas (Kingsfoil)", description: "Aragorn kneels, his keen eyes spotting a patch of a seemingly plain weed. 'This is Athelas,' he murmurs. 'Kingsfoil.'", type: 'friendly', trigger: 'travel', weight: 2,
        // BUG FIX: Condition now checks for "Strider" OR "Aragorn"
        condition: (gameState) => gameState.fellowship.some(m => (m.name === 'Aragorn' || m.name === 'Strider') && m.health > 0),
        choices: [
            { text: "Gather it", action: ({advanceTime, gameState}) => { advanceTime(1); gameState.inventory.athelas = (gameState.inventory.athelas || 0) + 1; return `You spend some time carefully gathering the precious herb, adding one use of Athelas to your inventory.`; } },
            { text: "Move on", action: () => `You leave the precious herb behind.` }
        ]
    },
    'abandoned-camp': {
        name: "An Abandoned Camp", description: "Through the trees, you see the faint grey smoke of a dying campfire. You approach cautiously to find a recently abandoned camp.", type: 'neutral', trigger: 'travel', weight: 7,
        choices: [
            { text: "Search it", action: ({advanceTime, gameState}) => { advanceTime(1); const r = Math.random(); if (r < 0.6) { const f = Math.floor(Math.random() * 10) + 5; gameState.food += f; return `Your search turns up ${f} leftover food rations. A lucky find!`; } else if (r < 0.8) { return `The camp is empty.`; } else { gameState.morale -= 10; return `It's a trap! A small band of goblins leap out. You fight them off but the encounter leaves you shaken.`; } } },
            { text: "Ignore it", action: () => `It's too risky. You leave the camp untouched and move on.` }
        ]
    },
    'eagles-gaze': {
        name: "The Eagles' Gaze", description: "High above, you spot the unmistakable silhouette of a Great Eagle. It circles once, a silent, powerful guardian, then soars away towards the east.", type: 'friendly', trigger: 'travel', weight: 2,
        choices: [
            { text: "Take heart", action: ({gameState}) => { gameState.morale = Math.min(100, gameState.morale + 15); return `The sight is a blessing. Morale is significantly boosted.`; } },
            { text: "Worry it is a spy", action: ({gameState}) => { gameState.morale -= 5; return `Could it be a spy for Saruman? The thought is unsettling.`; } }
        ]
    },
    'gollum-pursuit': {
        name: "Gollum's Pursuit", description: "In the quiet of the night, Sam hears it—a faint, wet, slapping sound from the rocks behind you, and a low, miserable whining. 'My preciousss...' Gollum is following you.", type: 'neutral', trigger: 'travel', weight: 1,
        condition: (gameState) => gameState.distanceTraveled > 400 && !gameState.flags.gollumFollowing,
        choices: [
            { text: "Try to lose him", action: ({advanceTime, gameState}) => { advanceTime(4); gameState.morale -= 5; return `You take a difficult, treacherous path for several hours to shake the creature.`; } },
            { text: "Confront him", action: ({advanceTime, gameState}) => { advanceTime(0.5); gameState.flags.gollumFollowing = true; return `You try to capture the creature, but he is too quick. You know he is still out there.`; } },
            { text: "Ignore him", action: ({gameState}) => { gameState.flags.gollumFollowing = true; return `You do nothing. The unsettling presence continues to follow you.`; } }
        ]
    },
    'nazgul-sighting': {
        name: "A Black Rider",
        description: "A chilling shriek pierces the air. A Black Rider is near!",
        type: 'hostile',
        trigger: 'travel',
        weight: 3,
        condition: (gameState) => gameState.distanceTraveled < journeyData.rivendell.distance,
        choices: function(dependencies) {
            const { gameState, advanceTime } = dependencies;
            const locationType = journeyData[gameState.currentLocationKey].locationType;
            if (locationType === 'town') {
                return [
                    { text: "Barricade yourselves in the Inn", action: () => { advanceTime(3); gameState.morale -= 15; return `You spend a terrifying few hours barricaded inside as the Nazgûl searches the town. Eventually, it moves on.`; } },
                    { text: "Flee the town immediately", action: () => { advanceTime(1); gameState.morale -= 10; return `You gather your things in a panic and flee into the wilderness, not stopping until the sun rises.`; } },
                    { text: "Hide in the stables", action: () => { advanceTime(2); if (Math.random() < 0.3) { gameState.supplies = Math.max(0, gameState.supplies - 20); return `The Rider finds you! You create a diversion by releasing the horses and lose some supplies in the chaos.`; } else { return `You hide amongst the hay and animals. The Rider passes by, its presence chilling you to the bone.`; } } }
                ];
            } else { // wild
                return [
                    { text: "Run for a river crossing", action: () => { advanceTime(2); gameState.distanceTraveled += 5; return `You race for a nearby river, hoping the water will deter the wraith. The desperate flight takes its toll.`; } },
                    { text: "Hide in the grass", action: () => { advanceTime(3); if (Math.random() < 0.5) { gameState.morale -= 20; return `The Rider passes so close you can hear its fell whispers. The terror is immense, but you remain unseen.`; } else { return `You lie still for what feels like an eternity. The Rider eventually moves on.`; } } },
                    // BUG FIX: Condition now checks for "Strider" OR "Aragorn"
                    { text: "Ward with fire", condition: (gameState) => gameState.fellowship.some(m => (m.name === 'Aragorn' || m.name === 'Strider') && m.health > 0), action: () => { advanceTime(1); gameState.morale -= 5; return `Aragorn brandishes a torch, and the Rider recoils from the flame, giving you time to escape.`; } }
                ];
            }
        }
    }
};
