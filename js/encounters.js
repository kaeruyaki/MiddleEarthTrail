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
        choices: [
            { id: 'bree_gossip', text: "Listen for Rumors", isPersistent: true, action: ({ advanceTime }) => { advanceTime(1); return `You spend some time listening to chatter and hear tales of black riders on the road and troubles from the south.`; } },
            { id: 'bree_trade', text: "Trade Supplies", isPersistent: true, condition: (gs) => gs.gold >= 15, action: ({ advanceTime, gameState }) => { advanceTime(1); gameState.gold -= 15; gameState.supplies += 25; return `The trade takes a short while. You get 25 supplies for 15 gold.`; } },
            { 
                id: 'bree_eat_dinner', text: "Eat Dinner", oneTime: true, isPersistent: true, 
                action: ({ advanceTime, gameState, meetStrider }) => { 
                    advanceTime(2); 
                    gameState.flags.ateDinner = true;
                    meetStrider(gameState);
                    return `You find a table in a corner of the crowded common room. As the evening wears on and the ale flows, the hobbits' spirits rise. Pippin, emboldened, leaps onto a table to sing a song. In the midst of the commotion, you feel the Ring slip onto your finger, and the world vanishes in a gasp from the crowd. When you reappear, the room is quiet and full of suspicious eyes. From a dark corner, a lean, hooded man motions you over. 'A dangerous trinket to be playing with,' he says in a low voice, his grey eyes glinting. 'I am called Strider. If you value your life, you will listen to me. The Enemy is closer than you think.'`;
                } 
            },
            { 
                id: 'bree_follow_strider', text: "Follow Strider", isLeaveAction: true, 
                condition: (gs) => gs.flags.ateDinner,
                action: ({ advanceTime, gameState, showEncounterView, stopGameLoop }) => { 
                    advanceTime(8);
                    gameState.morale -= 10;
                    showEncounterView("A Narrow Escape", "You follow the grim-faced ranger out of the common room and into a private parlor. Hours later, a terrifying shriek echoes from outside, followed by the crash of a door being splintered. The Black Riders have found the inn, but they have found your beds empty. Under the cover of darkness, Strider leads you out of Bree and into the wild, his knowledge of the land your only shield. He is now one of your company.", [{ text: "Continue", action: () => { stopGameLoop(true); return null; } }]);
                    return null;
                } 
            },
            { 
                id: 'bree_sleep', text: "Turn In for the Night", isLeaveAction: true, 
                action: ({ advanceTime, gameState, meetStrider, showEncounterView, checkGameOver, updateUI, stopGameLoop }) => {
                    advanceTime(8);
                    if (!gameState.flags.ateDinner && Math.random() < 0.5) {
                        checkGameOver("A shattering crash rips you from sleep. The door to your room hangs in splinters. Against the dim light of the hallway stand figures of utter blackness, their presence a wave of ice and terror that steals the breath from your lungs. A high, thin cry of hatred pierces the air, and before any defence can be made, a Morgul-blade glimmers with cold light and finds its mark. The world dissolves into shadow. The Ring has been taken.");
                    } else {
                        const resultText = `In the deepest hour of the night, the door bursts inward with a crash. Black-robed figures, tall and terrible, fill the doorway. Just as a long, pale blade is raised, a hooded man leaps from the shadows, wielding a sword and a flaming brand! 'Out the window!' he commands. You scramble into the night, escaping the attack, but not before Frodo is wounded by the wraith's touch. Your nerves are shattered. Your mysterious rescuer introduces himself as Strider. He is now one of your company.`;
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
    'rivendell': {
        name: "Welcome to Rivendell",
        description: `The road has been hard, and the wound in your shoulder burns with a cold fire... This is Imladris, the Last Homely House East of the Sea.`,
        type: 'town',
        onArrival: (dependencies) => {
            const { gameState, advanceTime } = dependencies;
            const frodo = gameState.fellowship.find(m => m.name === 'Frodo');
            if (frodo && frodo.health < 100) {
                const daysToHeal = Math.ceil((100 - frodo.health) / 10);
                advanceTime(daysToHeal * 24);
                frodo.health = 100;
                gameState.morale = 100;
                return `You are brought before its lord, Elrond... For ${daysToHeal} days, Frodo lies in a deep sleep... At last, he wakes, weak but whole again.`;
            }
            return "You have come to Imladris, the Last Homely House. Here you may rest and heal.";
        },
        choices: [
            { id: 'riv_walk_gardens', text: "Walk the gardens", oneTime: true, isPersistent: true, action: ({ advanceTime, gameState }) => { advanceTime(4); gameState.morale = Math.min(100, gameState.morale + 10); return `You spend a few hours wandering the peaceful gardens. The sound of waterfalls soothes your weary spirit.`; } },
            { id: 'riv_visit_bilbo', text: "Visit Bilbo", oneTime: true, isPersistent: true, action: ({ advanceTime, gameState }) => { advanceTime(1); gameState.flags.frodoHasStingAndMithril = true; return `You find Bilbo in a small room... He presents you with Sting and his mithril coat. 'Take them. You'll have need of them.'`; } },
            { id: 'riv_council', text: "Attend the Council", oneTime: true, isPersistent: true, 
              condition: (gs) => gs.completedTownActions.has('riv_visit_bilbo'),
              action: ({ advanceTime, gameState, storyTriggers }) => { advanceTime(4); storyTriggers.formFellowship(gameState); return `You are summoned to a great council... The Fellowship of the Ring is formed.`; } },
            { id: 'riv_prepare', text: "Prepare for Departure", oneTime: true, isPersistent: true, 
              condition: (gs) => gs.flags.councilOfElrondComplete,
              action: ({ advanceTime, gameState }) => { advanceTime(8); gameState.food += 50; return `You spend the day gathering provisions. The Elves provide you with Lembas. (+50 Food)`; } },
            { id: 'riv_leave', text: "Leave Rivendell", isLeaveAction: true, 
              condition: (gs) => gs.completedTownActions.has('riv_prepare'),
              action: ({ showTravelView }) => { showTravelView(); return null; } }
        ]
    },
    'moria_hub': {
        name: "The Heart of the Mountain",
        description: "You are deep within the earth. The air is cold and dead, heavy with the dust of ages and a deep, abiding sorrow.",
        type: 'town',
        choices: [
            { id: 'moria_press_on', text: "Press on", isPersistent: true, action: ({ advanceTime }) => { advanceTime(4); return `You travel for hours through the oppressive, silent dark.`; } },
            { id: 'moria_search_tomb', text: "Search for Balin's Tomb", oneTime: true, isLeaveAction: true,
              action: ({ advanceTime, showEncounterView, showEvent }) => { 
                  advanceTime(2);
                  const eventText = "You find a side-chamber... 'HERE LIES BALIN, SON OF FUNDIN, LORD OF MORIA.' ... As Gandalf closes the book, a sound begins. Doom, doom, doom. The drums are getting closer.";
                  showEncounterView("Balin's Tomb", eventText, [{ text: "We cannot get out...", action: () => {
                      showEvent(encounters['bridge_of_khazad_dum']);
                      return null;
                  }}]);
                  return null;
              } 
            }
        ]
    },

    // --- RANDOM ENCOUNTERS ---
    'mysterious_stranger': {
        name: "A Mysterious Stranger",
        description: "As you rest, a cloaked stranger approaches your campfire. His face is hidden in shadow. 'You travel a dangerous road,' he says in a low voice.",
        type: 'neutral',
        trigger: 'travel',
        baseWeight: 5,
        zones: ['BreeLand', 'WeatherHills', 'Anduin'],
        choices: (dependencies) => {
            const { gameState } = dependencies;
            let choices = [];

            if (!gameState.flags.strangerEncounterState) {
                choices.push(
                    { text: "Ask who he is.", isPersistent: true, action: () => { gameState.flags.strangerEncounterState = 'asked_identity'; return "'Who I am is not important. What matters is what you carry.' His gaze seems to pierce through you."; }},
                    { text: "Offer him some food.", isPersistent: true, condition: () => gameState.food >= 5, action: () => { gameState.food -= 5; gameState.flags.strangerEncounterState = 'offered_food'; return "He accepts the food with a nod. 'A kind gesture. Kindness is rare on this path.'"; }},
                    { text: "Tell him to leave.", isLeaveAction: true, action: () => { gameState.morale -= 5; delete gameState.flags.strangerEncounterState; return "The stranger melts back into the shadows without another word. The encounter leaves you feeling uneasy."; }}
                );
            }

            if (gameState.flags.strangerEncounterState === 'asked_identity') {
                choices.push({ text: "[Lie] Say you are simple travelers.", isLeaveAction: true, action: () => { delete gameState.flags.strangerEncounterState; return "He chuckles, a dry, humorless sound. 'Simple travelers do not bear such a burden. Be careful.' He vanishes."; }});
            }
            
            if (gameState.flags.strangerEncounterState === 'offered_food') {
                 choices.push({ text: "Ask for his counsel.", isLeaveAction: true, action: () => { gameState.morale += 10; delete gameState.flags.strangerEncounterState; return "'Trust the grey pilgrim, but do not trust the white,' he says, before disappearing into the night. His words give you hope."; }});
            }

            return choices;
        }
    },
    'fruit-trees': {
        name: "Fruit Trees", description: "You come upon a small, sun-dappled orchard of wild apple trees, their branches heavy with ripe fruit.", type: 'friendly', trigger: 'travel',
        baseWeight: 8,
        zones: ['Shire', 'BreeLand', 'Ithilien'],
        choices: [
            { text: "Eat your fill", action: ({gameState, advanceTime}) => { advanceTime(1); gameState.fellowship.forEach(m => m.health = Math.min(100, m.health + 5)); gameState.morale = Math.min(100, gameState.morale + 5); return `You stop for a while to eat. The fresh fruit is delicious and revitalizing.`; } },
            { text: "Gather for the road", action: ({gameState, advanceTime}) => { advanceTime(2); const foodFound = Math.floor(Math.random() * 15) + 10; gameState.food += foodFound; return `It takes some time, but you gather the best fruit, adding <span class="text-positive">${foodFound} food</span> to your stores.`; } },
            { text: "Do nothing", action: () => `You press on, leaving the bounty behind.` }
        ]
    },
    'orc-patrol': {
        name: "Orc Patrol", description: "A harsh guttural speech echoes from ahead. A patrol of Orcs, their scimitars cruelly sharp, march down the path. They have not yet seen you.", type: 'hostile', trigger: 'travel',
        baseWeight: 7,
        zones: ['WeatherHills', 'MistyMountains', 'Anduin', 'EmynMuil', 'Ithilien', 'Mordor'],
        acts: [2, 3],
        choices: [
            { text: "Set an ambush", action: (deps) => { 
                const { gameState, advanceTime, performDeathRolls } = deps;
                advanceTime(1);
                let successChance = 0.75;
                if (gameState.flags.frodoHasStingAndMithril) { successChance = 0.9; }
                if (Math.random() < successChance) { 
                    const s = Math.floor(Math.random() * 10); 
                    gameState.supplies += s; 
                    gameState.morale += 5; 
                    return `<span class="text-positive">The ambush is perfect!</span> You dispatch the Orcs swiftly, finding ${s} supplies.`; 
                } else { 
                    gameState.fellowship.forEach(m => { if(m.health > 0) m.health -= (m.name === 'Frodo' && gameState.flags.frodoHasStingAndMithril) ? 7 : 15; }); 
                    gameState.morale -= 10; 
                    return `<span class="text-negative">They spot you too soon!</span> A fierce skirmish ensues.`; 
                } 
            } },
            { text: "Attempt to sneak past", action: ({gameState, advanceTime}) => { advanceTime(2); if (Math.random() < 0.5) { return `<span class="text-positive">It takes a couple of tense hours, but you slip by unnoticed.</span>`; } else { const s = Math.floor(Math.random() * 10) + 5; gameState.supplies = Math.max(0, gameState.supplies - s); gameState.morale -= 10; return `<span class="text-negative">Spotted!</span> You drop ${s} supplies to create a diversion and escape.`; } } },
            { text: "Confront them head-on", action: (deps) => { 
                const { gameState, advanceTime, performDeathRolls } = deps;
                advanceTime(1); 
                let txt = ""; 
                gameState.fellowship.forEach(m => { if(m.health > 0) m.health -= (m.name === 'Frodo' && gameState.flags.frodoHasStingAndMithril) ? 12 : 25; }); 
                gameState.morale -= 15; 
                const c = performDeathRolls("battle"); 
                if(c) { txt = `<span class="text-catastrophic">The battle is brutal.</span> ${c}`; } else { txt = `<span class="text-negative">The battle is brutal, leaving everyone wounded.</span>`; } 
                return txt; 
            } }
        ]
    },
    'lost-in-wild': {
        name: "Lost in the Wild", description: "The landscape has become a monotonous, rolling terrain. The path is gone. You are lost.", type: "neutral", trigger: "travel",
        baseWeight: 10,
        zones: ['BreeLand', 'WeatherHills', 'Anduin', 'EmynMuil'],
        choices: [
            { text: "Trust the Ranger", condition: (gameState) => gameState.fellowship.some(m => (m.name === 'Aragorn' || m.name === 'Strider') && m.health > 0), action: ({advanceTime}) => { advanceTime(3); return `<span class="text-positive">Aragorn's skill guides you true after a few hours of searching.</span> You find the main path again.`; } },
            { text: "Climb for a view", action: ({advanceTime, gameState, updateUI}) => { advanceTime(2); if (Math.random() < 0.6) { return `<span class="text-positive">After a short climb, you spot the correct path from a high vantage.</span>`; } else { const m = gameState.fellowship.find(m => m.health > 0); m.health -= 10; updateUI(); return `<span class="text-negative">${m.name} slips and falls while climbing.</span> The path remains hidden.`; } } },
            { text: "Press on blindly", action: ({advanceTime, gameState}) => { advanceTime(4); gameState.morale -= 10; return `<span class="text-neutral">You wander for hours, your spirits sinking, before finally stumbling back onto the path.</span>`; } }
        ]
    },
    'mountain-spring': {
        name: "Mountain Spring", description: "Tucked into a mossy rock face, you find a spring of crystal-clear water bubbling forth.", type: 'friendly', trigger: 'travel',
        baseWeight: 8,
        zones: ['WeatherHills', 'MistyMountains', 'EmynMuil', 'Ithilien'],
        choices: [
            { text: "Drink deeply", action: ({advanceTime, gameState}) => { advanceTime(1); gameState.fellowship.forEach(m => m.health = Math.min(100, m.health + 10)); gameState.morale += 10; return `You rest for a while. The pure, cold water is incredibly refreshing.`; } },
            { text: "Refill waterskins", action: ({advanceTime, gameState}) => { advanceTime(0.5); gameState.buffs.sustainingWater = (gameState.buffs.sustainingWater || gameState.totalHours) + 24; return `You quickly fill your waterskins. The water will sustain you for the next day.`; } },
            { text: "Do nothing", action: () => `You ignore the spring.` }
        ]
    },
    'sudden-downpour': {
        name: "Sudden Downpour", description: "The sky opens up without warning, and a cold, driving rain begins to fall.", type: 'neutral', trigger: 'travel',
        baseWeight: 10,
        zones: ['Shire', 'BreeLand', 'WeatherHills', 'Anduin', 'Ithilien'],
        choices: [
            { text: "Push on", action: ({advanceTime, gameState}) => { advanceTime(1); gameState.fellowship.forEach(m => { if(m.health > 0) m.health -= 5 }); gameState.morale -= 5; return `You trudge on through the miserable rain, losing some health and morale.`; } },
            { text: "Find shelter", action: ({advanceTime}) => { advanceTime(2); return `You find a small overhang and wait for the worst of the storm to pass. It takes a couple of hours.`; } },
            { text: "Use supplies to make shelter", condition: (gameState) => gameState.supplies >= 5, action: ({advanceTime, gameState}) => { advanceTime(0.5); gameState.supplies -= 5; return `You quickly use 5 supplies to create a makeshift shelter.`; } }
        ]
    },
    'wargs-wild': {
        name: "Wargs of the Wild", description: "A howl echoes through the hills. A pack of Wargs, monstrous wolves with a malevolent gleam in their eyes, has caught your scent.", type: 'hostile', trigger: 'travel',
        baseWeight: 6,
        zones: ['WeatherHills', 'MistyMountains', 'Anduin'],
        acts: [2, 3],
        choices: [
            { text: "Light fires to keep them at bay", condition: (gameState) => gameState.supplies >= 10, action: ({advanceTime, gameState}) => { advanceTime(1); gameState.supplies -= 10; gameState.morale -= 5; return `You quickly use 10 supplies to build protective fires. The Wargs snarl from the darkness for an hour but dare not approach.`; } },
            { text: "Stand and fight", action: (deps) => { 
                const { gameState, advanceTime, performDeathRolls } = deps;
                advanceTime(1); 
                let txt = ""; 
                gameState.fellowship.forEach(m => { if(m.health > 0) m.health -= (m.name === 'Frodo' && gameState.flags.frodoHasStingAndMithril) ? 15 : 30; }); 
                gameState.morale -= 20; 
                const c = performDeathRolls("the Warg attack"); 
                if(c) { txt = `<span class="text-catastrophic">The Wargs are terrifyingly fast and strong!</span> ${c}`; } else { txt = `<span class="text-negative">You fight off the beasts, but not without suffering grievous wounds.</span>`; } 
                return txt; 
            } },
            { text: "Climb trees or rocks", action: ({advanceTime, gameState}) => { advanceTime(3); gameState.morale -= 10; return `You scramble up high ground, out of reach. You are trapped for hours until the pack moves on.`; } }
        ]
    },
    'athelas': {
        name: "Athelas (Kingsfoil)", description: "Aragorn kneels, his keen eyes spotting a patch of a seemingly plain weed. 'This is Athelas,' he murmurs. 'Kingsfoil.'", type: 'friendly', trigger: 'travel',
        baseWeight: 3,
        zones: ['BreeLand', 'WeatherHills', 'Anduin', 'Ithilien'],
        condition: (gameState) => gameState.fellowship.some(m => (m.name === 'Aragorn' || m.name === 'Strider') && m.health > 0),
        choices: [
            { text: "Gather it", action: ({advanceTime, gameState}) => { advanceTime(1); gameState.inventory.athelas = (gameState.inventory.athelas || 0) + 1; return `You spend some time carefully gathering the precious herb, adding one use of Athelas to your inventory.`; } },
            { text: "Move on", action: () => `You leave the precious herb behind.` }
        ]
    },
    'abandoned-camp': {
        name: "An Abandoned Camp", description: "Through the trees, you see the faint grey smoke of a dying campfire. You approach cautiously to find a recently abandoned camp.", type: 'neutral', trigger: 'travel',
        baseWeight: 7,
        zones: ['BreeLand', 'WeatherHills', 'Anduin', 'Ithilien'],
        choices: [
            { text: "Search it", action: ({advanceTime, gameState}) => { advanceTime(1); const r = Math.random(); if (r < 0.6) { const f = Math.floor(Math.random() * 10) + 5; gameState.food += f; return `Your search turns up ${f} leftover food rations. A lucky find!`; } else if (r < 0.8) { return `The camp is empty.`; } else { gameState.morale -= 10; return `It's a trap! A small band of goblins leap out. You fight them off but the encounter leaves you shaken.`; } } },
            { text: "Ignore it", action: () => `It's too risky. You leave the camp untouched and move on.` }
        ]
    },
    'eagles-gaze': {
        name: "The Eagles' Gaze", description: "High above, you spot the unmistakable silhouette of a Great Eagle. It circles once, a silent, powerful guardian, then soars away towards the east.", type: 'friendly', trigger: 'travel',
        baseWeight: 2,
        zones: ['MistyMountains', 'Anduin'],
        choices: [
            { text: "Take heart", action: ({gameState}) => { gameState.morale = Math.min(100, gameState.morale + 15); return `The sight is a blessing. Morale is significantly boosted.`; } },
            { text: "Worry it is a spy", action: ({gameState}) => { gameState.morale -= 5; return `Could it be a spy for Saruman? The thought is unsettling.`; } }
        ]
    },
    'gollum-pursuit': {
        name: "Gollum's Pursuit", description: "In the quiet of the night, Sam hears it—a faint, wet, slapping sound from the rocks behind you, and a low, miserable whining. 'My preciousss...' Gollum is following you.", type: 'neutral', trigger: 'travel',
        baseWeight: 10,
        zones: ['Anduin', 'EmynMuil', 'DeadMarshes'],
        acts: [3],
        condition: (gameState) => !gameState.flags.gollumFollowing,
        choices: [
            { text: "Try to lose him", action: ({advanceTime, gameState}) => { advanceTime(4); gameState.morale -= 5; return `You take a difficult, treacherous path for several hours to shake the creature.`; } },
            { text: "Confront him", action: ({advanceTime, gameState}) => { advanceTime(0.5); gameState.flags.gollumFollowing = true; return `You try to capture the creature, but he is too quick. You know he is still out there.`; } },
            { text: "Ignore him", action: ({gameState}) => { gameState.flags.gollumFollowing = true; return `You do nothing. The unsettling presence continues to follow you.`; } }
        ]
    },
    'nazgul-sighting': {
        name: "A Black Rider", description: "A chilling shriek pierces the air. A Black Rider is near!", type: 'hostile', trigger: 'travel',
        baseWeight: 5,
        zones: ['Shire', 'BreeLand', 'WeatherHills'],
        acts: [1],
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
                    { text: "Ward with fire", condition: (gameState) => gameState.fellowship.some(m => (m.name === 'Aragorn' || m.name === 'Strider') && m.health > 0), action: () => { advanceTime(1); gameState.morale -= 5; return `Aragorn brandishes a torch, and the Rider recoils from the flame, giving you time to escape.`; } }
                ];
            }
        }
    },
    'moria-chasm': {
        name: "The Great Chasm", description: "The path ends abruptly before a black chasm of unknown depth. A perilously narrow stone arch, without rail or parapet, is the only way across.", type: 'hostile', trigger: 'travel',
        baseWeight: 10,
        zones: ['Moria'],
        choices: [ /* ... */ ]
    },
    'mordor-despair': {
        name: "Oppressive Despair", description: "The air of Mordor is a poison. A deep despair settles on the party, a palpable weight of hopelessness that saps your will to continue.", type: 'hostile', trigger: 'travel',
        baseWeight: 20,
        zones: ['Mordor'],
        acts: [3],
        choices: [
            { text: "Endure it", action: ({gameState}) => { gameState.morale -= 15; return `You press on, but the shadow weighs heavily on your hearts.`; } }
        ]
    }
};
