// js/gameData.js

// This file contains static data that defines the core elements of the game.
// It includes UI icons, character professions, the journey map, and actions available in towns.

/**
 * A collection of SVG strings for UI icons.
 */
export const ICONS = {
    day: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline-block text-amber-300" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 7.072l.707-.707a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clip-rule="evenodd" /></svg>`,
    location: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline-block text-sky-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>`,
    distance: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline-block text-stone-400" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path fill-rule="evenodd" d="M12 1.5a.5.5 0 01.5.5v4.813l1.32-1.32a.5.5 0 11.708.708l-2.061 2.06a.5.5 0 01-.707 0L9.46 6.2a.5.5 0 11.707-.708l1.332 1.332V2a.5.5 0 01.5-.5zm-4-1a.5.5 0 01.5.5v5.06l1.32-1.32a.5.5 0 11.708.708l-2.061 2.06a.5.5 0 01-.707 0L5.46 5.7a.5.5 0 11.707-.708L7.5 6.26V1a.5.5 0 01.5-.5z" clip-rule="evenodd" /></svg>`,
    food: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline-block text-lime-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 000 1.84L9 9.61v5.08a1 1 0 00.528.885l3.5 2a1 1 0 001.472-.885v-5.08l6.606-3.302a1 1 0 000-1.84l-7-3.5z" /></svg>`,
    supplies: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline-block text-orange-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 3a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 0a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zm-4 8a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm2 0a1 1 0 011-1h1a1 1 0 110 2H9a1 1 0 01-1-1zm4-4a1 1 0 100-2h-1a1 1 0 100 2h1zM5 7a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1zm2 0a1 1 0 011-1h1a1 1 0 110 2H9a1 1 0 01-1-1zm4-1a1 1 0 10-2 0v1a1 1 0 102 0V6zM5 15a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1zm2 0a1 1 0 011-1h1a1 1 0 110 2H9a1 1 0 01-1-1zm4 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>`,
    morale: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline-block text-rose-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>`,
    gold: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline-block text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`
};

/**
 * Defines the starting resources for each character background/profession.
 */
export const professions = {
    Baggins:   { food: 100, supplies: 50, gold: 100 },
    Took:      { food: 50, supplies: 150, gold: 50 },
    Brandybuck:{ food: 85, supplies: 85, gold: 80 }
};

/**
 * The main data structure for the game map. Each key is a location.
 */
export const journeyData = {
    'shire': { name: "The Shire", x: 180, y: 350, distance: 0, legName: "The Road to Bree", next: 'bree', locationType: 'wild' },
    'bree': { name: "Bree", x: 280, y: 360, distance: 100, legName: "To Weathertop", next: 'weathertop', type: 'town', description: "After many weary miles, the dark shape of the Bree-hill rises before you, and nestled at its foot is the ancient village of Bree. You pass under the great arch of the town-gate and make your way through the winding, cobbled streets to the Prancing Pony, a large inn famed for its hospitality. The warm light and noise of the common room spill out into the night, a welcome sight for tired travelers. It seems a fine place to seek a meal and a bed.", locationType: 'town' },
    'weathertop': { name: "Weathertop", x: 320, y: 358, distance: 150, legName: "The Road to the Trollshaws", next: 'trollshaws', locationType: 'wild' },
    'trollshaws': { name: "Trollshaws", x: 350, y: 355, distance: 175, legName: "The Road to Rivendell", next: 'rivendell', locationType: 'wild' },
    'rivendell': { name: "Rivendell", x: 400, y: 350, distance: 250, next: 'caradhras_pass', type: 'town', description: "The road has been hard, but at last you descend into a hidden valley where the air is sweet with the scent of pine. The sound of waterfalls echoes from the steep, wooded slopes, and you see the lights of a house deep in the valley's fold. This is Imladris; the Last Homely House East of the Sea. You are brought before Elrond Half-elven, whose face is ageless and kind, yet his eyes hold the memory of ages. He looks upon Frodo's pale face with concern. 'He is fading,' Elrond says gravely. 'He must be tended to at once.'", locationType: 'town' },
    'caradhras_pass': { name: "Pass of Caradhras", x: 450, y: 400, distance: 300, legName: "Over the Misty Mountains", next: 'moria', locationType: 'wild' },
    // FIX: Changed name for clarity in debug menu, and added arrivalEncounter key
    'moria': { name: "Moria", arrivalEncounter: 'west_gate_of_moria', x: 460, y: 450, distance: 350, legName: "Through Khazad-dûm", next: 'lothlorien', type: 'town', description: "The Doors shut behind you, plunging the world into absolute darkness and silence, save for the sound of your own breathing. Gandalf's staff illuminates a vast, empty hall, the first of many. The air is cold and dead. This is the great delving of the Dwarves, and you are trespassers in a city of ghosts.", locationType: 'wild' },
    'lothlorien': { name: "Lothlórien", x: 520, y: 480, distance: 550, legName: "The Great River", next: 'anduin', locationType: 'wild' },
    'anduin': { name: "Anduin River", x: 550, y: 550, distance: 650, legName: "The Breaking of the Fellowship", next: 'amonhen', locationType: 'wild' },
    'amonhen': { name: "Amon Hen", x: 560, y: 600, distance: 700, legName: "The Emyn Muil", next: 'emynmuil', locationType: 'wild' },
    'emynmuil': { name: "Emyn Muil", x: 600, y: 620, distance: 750, legName: "The Dead Marshes", next: 'deadmarshes', locationType: 'wild' },
    'deadmarshes': { name: "Dead Marshes", x: 680, y: 610, distance: 800, legName: "To the Black Gate", next: 'blackgate', locationType: 'wild' },
    'blackgate': { name: "The Black Gate", x: 750, y: 600, distance: 900, next: null, locationType: 'wild' },
    'cirithungol': { name: "Cirith Ungol", x: 780, y: 650, distance: 950, legName: "The Land of Shadow", next: 'mountdoom', locationType: 'wild' },
    'mountdoom': { name: "Mount Doom", x: 850, y: 630, distance: 1000, type: 'end', locationType: 'wild' }
};

/**
 * Defines the specific actions available to the player in each town.
 */
export const townActions = {
    'bree': [
        { id: 'bree_gossip', text: "Listen for Rumors", action: ({ dialogueEl, advanceTime }) => { advanceTime(1); dialogueEl.innerHTML = `You spend some time listening to chatter and hear tales of black riders on the road and troubles from the south.`; } },
        { id: 'bree_trade', text: "Trade Supplies", condition: (gameState) => gameState.gold >= 15, action: ({ dialogueEl, advanceTime, gameState }) => { advanceTime(1); gameState.gold -= 15; gameState.supplies += 25; dialogueEl.innerHTML = `The trade takes a short while. You get 25 supplies for 15 gold.`; } },
        { 
            id: 'bree_eat_dinner', 
            text: "Eat Dinner", 
            oneTime: true, 
            action: ({ dialogueEl, advanceTime, gameState, meetStrider, renderTownActions }) => { 
                advanceTime(2); 
                gameState.flags.ateDinner = true;
                dialogueEl.innerHTML = `You find a table in a corner of the crowded common room. As the evening wears on and the ale flows, the hobbits' spirits rise. Pippin, emboldened, leaps onto a table to sing a song. In the midst of the commotion, you feel the Ring slip onto your finger, and the world vanishes in a gasp from the crowd. When you reappear, the room is quiet and full of suspicious eyes. From a dark corner, a lean, hooded man motions you over. 'A dangerous trinket to be playing with,' he says in a low voice, his grey eyes glinting. 'I am called Strider. If you value your life, you will listen to me. The Enemy is closer than you think.'`;
                meetStrider(gameState);
                renderTownActions('bree');
            } 
        },
        { 
            id: 'bree_follow_strider', 
            text: "Follow Strider", 
            isLeaveAction: true, 
            condition: (gameState) => gameState.flags.ateDinner,
            action: ({ advanceTime, gameState, meetStrider, showEncounterView, stopGameLoop, showTravelView }) => { 
                advanceTime(8);
                gameState.morale -= 10;
                meetStrider(gameState);
                showEncounterView("A Narrow Escape", "You follow the grim-faced ranger out of the common room and into a private parlor. Hours later, a terrifying shriek echoes from outside, followed by the crash of a door being splintered. The Black Riders have found the inn, but they have found your beds empty. Under the cover of darkness, Strider leads you out of Bree and into the wild, his knowledge of the land your only shield. He is now one of your company.", [{ text: "Continue", action: () => { stopGameLoop(); showTravelView(); return null; } }]);
            } 
        },
        { 
            id: 'bree_sleep', 
            text: "Turn In for the Night", 
            isLeaveAction: true, 
            action: ({ advanceTime, gameState, meetStrider, showEncounterView, checkGameOver, updateUI, stopGameLoop, showTravelView }) => {
                advanceTime(8);
                if (!gameState.flags.ateDinner && Math.random() < 0.5) {
                    checkGameOver("A shattering crash rips you from sleep. The door to your room hangs in splinters. Against the dim light of the hallway stand figures of utter blackness, their presence a wave of ice and terror that steals the breath from your lungs. A high, thin cry of hatred pierces the air, and before any defence can be made, a Morgul-blade glimmers with cold light and finds its mark. The world dissolves into shadow. The Ring has been taken.");
                } else {
                    const resultText = `In the deepest hour of the night, the door bursts inward with a crash. Black-robed figures, tall and terrible, fill the doorway. Just as a long, pale blade is raised, a hooded man leaps from the shadows, wielding a sword and a flaming brand! 'Out the window!' he commands. You scramble into the night, escaping the attack, but not before Frodo is wounded by the wraith's touch. Your nerves are shattered. Your mysterious rescuer introduces himself as Strider. He is now one of your company.`;
                    
                    gameState.fellowship.find(m => m.name === 'Frodo').health -= 30;
                    gameState.morale -= 25;
                    updateUI();
                    meetStrider(gameState);
                    showEncounterView("Night Terrors", resultText, [{ text: "Continue", action: () => { stopGameLoop(); showTravelView(); return null; } }]);
                }
            } 
        }
    ],
    'rivendell': [
        { id: 'riv_walk_gardens', text: "Walk the gardens", oneTime: true, condition: (gameState) => gameState.flags.rivendellPhase === 1, action: ({ dialogueEl, advanceTime, gameState, renderTownActions }) => { advanceTime(4); gameState.morale = Math.min(100, gameState.morale + 10); dialogueEl.innerHTML = `You spend a few hours wandering the peaceful gardens of Imladris. The air is clear and the sound of waterfalls soothes your weary spirit.`; gameState.flags.rivendellPhase = 2; renderTownActions('rivendell'); } },
        { id: 'riv_hall_of_fire', text: "Listen to the songs", oneTime: true, condition: (gameState) => gameState.flags.rivendellPhase === 1, action: ({ dialogueEl, advanceTime, gameState, renderTownActions }) => { advanceTime(4); gameState.morale = Math.min(100, gameState.morale + 15); dialogueEl.innerHTML = `You sit in the Hall of Fire, listening as the Elves sing tales of ancient days. The beauty of the music washes over you, lifting a great weight from your heart.`; gameState.flags.rivendellPhase = 2; renderTownActions('rivendell'); } },
        { id: 'riv_visit_bilbo', text: "Visit Bilbo", oneTime: true, condition: (gameState) => gameState.flags.rivendellPhase === 2, action: ({ dialogueEl, advanceTime, gameState, renderTownActions }) => { advanceTime(1); gameState.flags.frodoHasStingAndMithril = true; dialogueEl.innerHTML = `You find Bilbo in a small room, surrounded by maps and scattered papers. He looks older, but his eyes are as bright as ever. 'The Ring!' he whispers, his gaze fixed on it. After a moment of strange longing passes, he shakes his head. 'No, it's your burden now, my lad. But you'll need this.' He presents you with a small sword in a worn leather scabbard. It is Sting. From a chest, he also pulls a shirt of woven silver rings, light as a feather but hard as dragon-scales. 'My mithril coat. A little secret of mine. Take them. You'll have need of them.'<br><br><span class='text-emerald-300'>Armed with an Elven blade and a coat of mithril, Frodo feels his resolve harden against the encroaching darkness.</span>`; renderTownActions('rivendell'); } },
        { id: 'riv_council_disabled', text: "Attend the Council", condition: (gameState) => gameState.flags.rivendellPhase === 1, disabled: true, action: () => {} },
        { id: 'riv_council', text: "Attend the Council of Elrond", oneTime: true, condition: (gameState) => gameState.flags.rivendellPhase === 2, action: ({ dialogueEl, advanceTime, gameState, storyTriggers, renderTownActions }) => { advanceTime(4); storyTriggers.formFellowship(gameState); dialogueEl.innerHTML = `You are summoned to a great council. Elves, Dwarves, and Men are gathered, and the fate of the Ring is debated. Boromir of Gondor tells of his city's long struggle and his desire to use the Ring against the Enemy. But Elrond's counsel prevails. 'The Ring is wholly evil,' he declares. 'It must be unmade in the fires where it was forged.' A heavy silence falls, broken at last by Frodo. 'I will take the Ring,' he says, 'though I do not know the way.' At his words, companions rise to join him. Gandalf, Aragorn, Legolas, Gimli, and Boromir pledge themselves to the quest. The Fellowship of the Ring is formed.`; gameState.flags.rivendellPhase = 3; renderTownActions('rivendell'); } },
        { id: 'riv_prepare', text: "Prepare for Departure", oneTime: true, condition: (gameState) => gameState.flags.rivendellPhase === 3, action: ({ dialogueEl, advanceTime, gameState, renderTownActions }) => { advanceTime(8); gameState.food += 50; dialogueEl.innerHTML = `You spend the day gathering provisions. The Elves provide you with Lembas, a special waybread that is both nourishing and light. (+50 Food)`; renderTownActions('rivendell'); } },
        { id: 'riv_leave', text: "Leave Rivendell", isLeaveAction: true, condition: (gameState) => gameState.flags.rivendellPhase === 3, action: ({ showTravelView }) => { 
            showTravelView(); 
        } }
    ],
    'moria': [
        { 
            id: 'moria_press_on', 
            text: "Press on through the darkness", 
            condition: (gameState) => gameState.flags.moriaPhase === 1,
            action: ({ dialogueEl, advanceTime }) => { 
                advanceTime(4); 
                dialogueEl.innerHTML = `You travel for hours through the oppressive, silent dark. The path is mercifully straight, but the feeling of being deep within the earth weighs heavily on your spirits.`; 
            } 
        },
        { 
            id: 'moria_search_tomb', 
            text: "Search for Balin's Tomb", 
            oneTime: true,
            condition: (gameState) => gameState.flags.moriaPhase === 1,
            action: ({ advanceTime, gameState, showEncounterView }) => { 
                advanceTime(2);
                const eventText = "Guided by Gandalf, you find a side-chamber. A ray of light from a high shaft pierces the gloom, illuminating a single, oblong tomb. The stone is cloven, and upon it are carved runes: 'HERE LIES BALIN, SON OF FUNDIN, LORD OF MORIA.' As Gimli weeps, Gandalf picks up a tattered book. Its last pages tell a grim tale of Orcs, a strange presence in the deep water, and a final, desperate stand... As he closes the book, a sound begins, echoing from the depths of the mine. A slow, rhythmic beating. Doom, doom, doom. It is the sound of great drums, and they are getting closer.";
                showEncounterView("Balin's Tomb", eventText, [{ text: "The drums are getting closer...", action: () => {
                    gameState.flags.moriaPhase = 3;
                    document.dispatchEvent(new CustomEvent('showTown', { detail: { locationKey: 'moria' } }));
                    return null;
                }}]);
            } 
        },
        {
            id: 'moria_flee',
            text: "Flee to the Bridge!",
            isLeaveAction: true,
            condition: (gameState) => gameState.flags.moriaPhase === 3,
            action: ({ displayEvent, encounters }) => {
                displayEvent(encounters['bridge_of_khazad_dum']);
            }
        }
    ]
};
