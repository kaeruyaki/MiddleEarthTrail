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
    'caradhras_pass': {
        name: "The Pass of Caradhras",
        description: `As you climb higher, the air grows thin and a cruel wind howls like a hunting wolf. A sudden, unnatural snowstorm descends...`,
        type: 'story',
        trigger: 'landmark_arrival',
        choices: [
            { 
                text: "Attempt to push through the snow", 
                action: (dependencies) => {
                    const { gameState, showEncounterView, stopGameLoop, showTravelView, updateUI, checkGameOver } = dependencies;
                    if (Math.random() < 0.1) {
                        gameState.currentLocationKey = 'lothlorien';
                        gameState.pathTaken.push('lothlorien');
                        const successMessage = `With a final, desperate effort, you break through the storm's heart! You have conquered the pass, but the ordeal has left you battered and weary.`;
                        showEncounterView("The Pass is Broken", successMessage, [{ text: "Continue", action: () => { stopGameLoop(true); return null; } }]);
                        return null;
                    } else {
                        gameState.fellowship.forEach(m => m.health -= 15);
                        gameState.morale -= 10;
                        updateUI();
                        checkGameOver();
                        if(gameState.isGameOver) return null;
                        
                        const failureMessage = caradhrasFailureMessages[Math.floor(Math.random() * caradhrasFailureMessages.length)];
                        const updatedDescription = `<p class='text-orange-400'>${failureMessage}</p><hr class='my-4 border-zinc-600'>${encounters.caradhras_pass.description}`;
                        
                        showEncounterView(encounters.caradhras_pass.name, updatedDescription, encounters.caradhras_pass.choices);
                        return null;
                    }
                }
            },
            { 
                text: "Turn back and take the path through Moria", 
                action: (dependencies) => {
                    const { gameState, showEncounterView, stopGameLoop, showEvent } = dependencies;
                    gameState.currentLocationKey = 'moria';
                    gameState.pathTaken.pop();
                    gameState.pathTaken.push('moria');
                    showEncounterView("The Mountain's Wrath", "The mountain has defeated you. With heavy hearts, you turn back and take the dark and secret way through the Mines of Moria.", [{ text: "Continue", action: () => {
                        stopGameLoop();
                        showEvent(encounters['west_gate_of_moria']);
                        return null;
                    } }]);
                    return null;
                }
            }
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
 'west_gate_of_moria': {
        name: "The West-gate of Moria",
        description: "Before you stands a cliff of grey rock, smooth and sheer. At its base, a dark, still lake gives off a foul stench. Faint lines, like silver threads, are barely visible on the rock face. These are the Doors of Durin, and they are shut.",
        type: 'puzzle',
        trigger: 'landmark_arrival',
        choices: [
            { text: "Push on the doors", isCorrect: false },
            { text: "Search for a keyhole", isCorrect: false },
            { text: "Shout 'Open!' in Dwarvish", isCorrect: false },
            { text: "Speak 'Mellon' (Friend) in Elvish", isCorrect: true },
            { text: "Throw a rock in the lake", isCorrect: false },
            { text: "Wait for someone to come out", isCorrect: false },
        ],
        onFailure: (dependencies) => {
            const { gameState, showEncounterView, checkGameOver } = dependencies;
            const livingMembers = gameState.fellowship.filter(m => m.health > 0);
            if (livingMembers.length <= 1) {
                checkGameOver("The lone survivor is seized by a tentacle and dragged into the murky depths.");
                return null;
            }

            const victim = livingMembers[Math.floor(Math.random() * livingMembers.length)];
            victim.health -= 35; 
            livingMembers.forEach(rescuer => { if (rescuer !== victim) rescuer.health -= 10; });
            
            const failureText = `A ripple disturbs the black water. Suddenly, a score of pale, coiling tentacles erupt from the lake! One whips out and seizes ${victim.name}, dragging them towards the water's edge! The rest of the company rushes forward, hacking at the rubbery limbs to free their companion. In the frantic struggle, they manage to drive the creature back, but not before everyone is battered and shaken.`;
            
            const updatedDescription = `${encounters.west_gate_of_moria.description}<hr class='my-4 border-zinc-600'><p class='text-orange-400'>${failureText}</p>`;
            showEncounterView(encounters.west_gate_of_moria.name, updatedDescription, encounters.west_gate_of_moria.choices, encounters.west_gate_of_moria);
            return null;
        },
        onSuccess: (dependencies) => {
            const { gameState, showEvent } = dependencies;
            const successText = "As Gandalf speaks the word 'Mellon', the silver lines on the door glow brightly, and the great stone slabs swing inward without a sound, revealing a vast darkness. You hurry inside, just as grasping tentacles begin to rise from the lake once more.";
            showEncounterView("The Doors of Durin", successText, [{ text: "Enter the darkness", action: () => {
                gameState.flags.moriaPhase = 1;
                showEvent(encounters['moria_hub']);
                return null;
            }}]);
        }
    },
    'bridge_of_khazad_dum': {
        name: "The Bridge of Khazad-dûm",
        description: "You have fled through the endless dark, but at the Bridge of Khazad-dûm, a new terror emerges. A great shadow, surrounded by flame, rises from the abyss. Its darkness seems to swallow the light. It is a Balrog of Morgoth. Gandalf alone turns to face it on the narrow bridge. 'You cannot pass!' he cries, striking the bridge with his staff.",
        type: 'story',
        choices: [
            { 
                text: "You cannot pass!",
                action: (dependencies) => {
                    const { gameState, storyTriggers } = dependencies;
                    storyTriggers.moria(gameState); // Gandalf falls
                    return "Gandalf and the Balrog fall into the abyss. The Fellowship escapes, but their guide and friend is lost. Grief-stricken, you stumble out of the East-gate and into the dim light of the world.";
                }
            },
            {
                text: "Stand with Gandalf!",
                condition: () => Math.random() < 0.05, // 5% chance for this option to even appear
                action: (dependencies) => {
                    const { gameState, storyTriggers } = dependencies;
                    if (Math.random() < 0.05) { // Miracle outcome: 5% of the 5%
                        const gandalf = gameState.fellowship.find(m => m.name === 'Gandalf');
                        if (gandalf) gandalf.health = 10;
                        gameState.morale = Math.min(100, gameState.morale + 50); // Massive morale boost
                        return "Your valiant stand gives Gandalf the second he needs! As the bridge crumbles and the Balrog plunges into the abyss, Gandalf manages to cling to the broken edge. With a great heave, you pull him to safety, wounded and exhausted, but alive. A miracle has occurred this day.";
                    } else { // Tragic outcome: 95% of the 5%
                        storyTriggers.moria(gameState); // Gandalf falls
                        const living = gameState.fellowship.filter(m => m.health > 0 && m.name !== 'Gandalf');
                        if (living.length > 0) {
                            const victim = living[Math.floor(Math.random() * living.length)];
                            victim.health = 0; // Second member is killed
                            gameState.morale -= 50; // Catastrophic morale hit
                            return `You rush to Gandalf's side, but the Balrog's fiery whip lashes out as it falls, catching ${victim.name} and dragging them into the chasm as well. The loss is devastating.`;
                        }
                        return "You rush to Gandalf's side, but the Balrog's fiery whip lashes out as it falls. The loss is devastating.";
                    }
                }
            }
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
                    return `The warmth of the common room and a pint of ale does much to lift your spirits. Merry and Pippin, feeling bold, begin to regale the locals with tales from the Shire. In a moment of folly, Pippin leaps upon a table to sing a song about a cow jumping over the moon. The attention this draws is unnerving, and in the commotion, you feel an unseen force press the Ring onto your finger. You vanish. The room erupts in a collective gasp. When you reappear, it is deathly quiet, full of suspicious and fearful eyes. From a dark corner, a lean, weather-beaten man, hooded and smoking a pipe, catches your eye. He motions you over. 'That was a perilous slip,' he says in a low voice, his grey eyes glinting in the dim light. 'I am called Strider. If you value your life, and the secret you carry, you will come with me.'`;
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
                        const deathDialogue = "You retire to your rooms, but sleep does not come easily. In the deepest hour of the night, a shattering crash rips you from your slumber. The door to your chamber hangs in splinters. Against the dim light of the hallway stand figures of utter blackness, their presence a wave of ice and terror that steals the breath from your lungs. A high, thin cry of hatred pierces the air, and before any defence can be made, a Morgul-blade glimmers with cold light and finds its mark. The world dissolves into shadow.";
                        checkGameOver(deathDialogue);
                    } else {
                        const resultText = `You retire to your rooms, but sleep does not come easily. In the deepest hour of the night, the door bursts inward with a crash. Black-robed figures, tall and terrible, fill the doorway. Just as a long, pale blade is raised, a hooded man leaps from the shadows, wielding a sword and a flaming brand! 'Out the window!' he commands. You scramble into the night as he holds them back, escaping the attack, but not before the wraith's touch wounds you to the core. Your mysterious rescuer, who calls himself Strider, finds you in the darkness. He is now one of your company.`;
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
        description: journeyData.rivendell.description,
        type: 'town',
        onArrival: (dependencies) => {
            const { gameState, advanceTime } = dependencies;
            const frodo = gameState.fellowship.find(m => m.name === 'Frodo');
            let healingText = "";
            if (frodo && frodo.health < 100) {
                const daysToHeal = Math.ceil((100 - frodo.health) / 10);
                advanceTime(daysToHeal * 24);
                frodo.health = 100;
                gameState.morale = 100;
                healingText = ` For ${daysToHeal} days, you lie in a deep sleep while Elrond's skill battles the shadow of the Morgul-blade. At last, you wake, weak but whole again.`;
            }
            gameState.flags.rivendellPhase = 1;
            return `You are brought before its lord, Elrond. His face is ageless and kind, yet his eyes hold the memory of the world's great sorrows. He looks upon your pale face with concern. "You are fading," Elrond says gravely. "You have been touched by the shadow."${healingText}`;
        },
        choices: (dependencies) => {
            const { gameState, storyTriggers } = dependencies;
            let choices = [];

            if (gameState.flags.rivendellPhase === 1) {
                choices.push(
                    { id: 'riv_walk_gardens', text: "Walk the gardens", oneTime: true, isPersistent: true, action: ({ advanceTime, gameState }) => { advanceTime(4); gameState.morale = Math.min(100, gameState.morale + 10); gameState.flags.rivendellPhase = 2; return `You spend a few hours wandering the peaceful gardens of Imladris. The air is clear and the sound of waterfalls soothes your weary spirit.`; } },
                    { id: 'riv_hall_of_fire', text: "Listen to the songs", oneTime: true, isPersistent: true, action: ({ advanceTime, gameState }) => { advanceTime(4); gameState.morale = Math.min(100, gameState.morale + 15); gameState.flags.rivendellPhase = 2; return `You sit in the Hall of Fire, listening as the Elves sing tales of ancient days. The beauty of the music washes over you, lifting a great weight from your heart.`; } }
                );
            }
            
            if (gameState.flags.rivendellPhase === 2) {
                 choices.push(
                    { id: 'riv_visit_bilbo', text: "Visit Bilbo", oneTime: true, isPersistent: true, action: ({ advanceTime, gameState }) => { advanceTime(1); gameState.flags.frodoHasStingAndMithril = true; return `You find Bilbo in a small room, surrounded by maps and scattered papers. He looks older, but his eyes are as bright as ever. 'The Ring!' he whispers, his gaze fixed on it. After a moment of strange longing passes, he shakes his head. 'No, it's your burden now, my lad. But you'll need this.' He presents you with a small sword in a worn leather scabbard. It is Sting. From a chest, he also pulls a shirt of woven silver rings, light as a feather but hard as dragon-scales. 'My mithril coat. A little secret of mine. Take them. You'll have need of them.'`; } },
                    { id: 'riv_council', text: "Attend the Council", oneTime: true, isPersistent: true, 
                      condition: (gs) => gs.flags.frodoHasStingAndMithril,
                      action: ({ advanceTime, gameState, storyTriggers }) => { 
                          advanceTime(4); 
                          storyTriggers.formFellowship(gameState); 
                          gameState.flags.rivendellPhase = 3; 
                          return `You are summoned to a great council. Elves, Dwarves, and Men are gathered, and the fate of the Ring is debated. Boromir of Gondor tells of his city's long struggle and his desire to use the Ring against the Enemy. But Elrond's counsel prevails. 'The Ring is wholly evil,' he declares. 'It must be unmade in the fires where it was forged.' A heavy silence falls, broken at last by your own voice. 'I will take the Ring,' you say, 'though I do not know the way.' At your words, companions rise to join you. Gandalf, Aragorn, Legolas, Gimli, and Boromir pledge themselves to the quest. The Fellowship of the Ring is formed.`; 
                      } 
                    }
                );
            }

            if (gameState.flags.rivendellPhase === 3) {
                choices.push(
                    { id: 'riv_prepare', text: "Prepare for Departure", oneTime: true, isPersistent: true, action: ({ advanceTime, gameState }) => { advanceTime(8); gameState.food += 50; return `You spend the day gathering provisions. The Elves provide you with Lembas, a special waybread that is both nourishing and light. (+50 Food)`; } },
                    { id: 'riv_leave', text: "Leave Rivendell", isLeaveAction: true, 
                      condition: (gs) => gs.completedTownActions.has('riv_prepare'),
                      action: ({ showTravelView }) => { showTravelView(); return null; } }
                );
            }

            return choices;
        }
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
