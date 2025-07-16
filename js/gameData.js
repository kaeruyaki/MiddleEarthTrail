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
    'bree': { name: "Bree", x: 280, y: 360, distance: 100, legName: "To Weathertop", next: 'weathertop', type: 'town', description: `After many weary miles, the dark shape of the Bree-hill rises before you, a lonely landmark in the empty lands. Nestled at its foot is the ancient village of Bree, a strange and bustling place of Big Folk and Hobbits alike. You pass under the great arch of the town-gate, pulling your cloak a little tighter. The Prancing Pony inn spills warm light and noise into the night, a welcome sight for tired travelers, but the faces you see are grim and suspicious. This is the first great test of your quest: to find a wizard in a town full of strangers, with the Enemy's servants already hunting for you.`, locationType: 'town' },
    'weathertop': { name: "Weathertop", x: 320, y: 358, distance: 150, legName: "The Road to the Trollshaws", next: 'trollshaws', locationType: 'wild', description: `The wind is sharper here, atop the ancient hill of Weathertop. A great ruin of a watchtower stands on its summit, a broken crown against a grey sky. From this vantage, you can see the road you have traveled stretching back for miles, a thin ribbon in the wilderness. There is a commanding view of the lands all about, but the feeling is not one of safety. It is one of exposure. This high place feels watched, and as dusk begins to fall, you sense that you are not alone.` },
    'trollshaws': { name: "Trollshaws", x: 350, y: 355, distance: 175, legName: "The Road to Rivendell", next: 'rivendell', locationType: 'wild', description: `You stumble into a clearing and stop dead. There, hulking and monstrous, are the three Stone-Trolls, forever frozen in their foolish argument by the rising sun decades ago. Moss grows on their stony limbs and a bird has made a nest in one's ear. It is a scene straight out of Bilbo's wildest tales, a stark and chilling reminder that the world outside the Shire has always been filled with creatures of nightmare. Seeing them, solid and real, makes the threat of your own journey feel all the more present.` },
    'rivendell': { name: "Rivendell", x: 400, y: 350, distance: 250, next: 'caradhras_pass', type: 'town', description: `The road has been hard, and the wound in your shoulder burns with a cold fire. Just as you feel your strength failing, you descend into a hidden valley where the air grows sweet with the scent of pine. The sound of waterfalls echoes from the steep, wooded slopes, and you see the lights of a house deep in the valley's fold. This is Imladris, the Last Homely House East of the Sea. You are brought before its lord, Elrond, master of lore and a bastion against the shadow for ages uncounted. His face is ageless and kind, yet his eyes hold the memory of the world's great sorrows. He looks upon your pale face with concern. "You are fading," Elrond says gravely. "You have been touched by the shadow. You must be tended to at once."`, locationType: 'town' },
    'caradhras_pass': { name: "Pass of Caradhras", x: 450, y: 400, distance: 300, legName: "Over the Misty Mountains", next: 'moria', locationType: 'wild', description: `The mountain feels alive, and it hates you. As you climb higher, the air grows thin and a cruel wind howls like a hunting wolf. A sudden, unnatural snowstorm descends, a blinding, swirling wall of white that stings your face and freezes the breath in your lungs. It is more than mere weather; you can feel a malevolent will behind the storm, a fell voice on the wind, seeking to crush you and your quest before it can even cross the Misty Mountains.` },
    'moria': { name: "Moria", arrivalEncounter: 'west_gate_of_moria', x: 460, y: 450, distance: 350, legName: "Through Khazad-dûm", next: 'lothlorien', type: 'town', description: `The Doors shut behind you, plunging the world into absolute darkness and a silence so profound it rings in your ears. The only sound is the ragged panting of your companions. Gandalf's staff illuminates a vast, empty hall, the first of many. The air is cold and dead, heavy with the dust of ages and a deep, abiding sorrow. This is the great delving of the Dwarves, Khazad-dûm, and you are trespassers in a city of ghosts. The journey ahead lies not under the sky, but in the black heart of the earth.`, locationType: 'wild' },
    'lothlorien': { name: "Lothlórien", x: 520, y: 480, distance: 550, legName: "The Great River", next: 'anduin', locationType: 'wild', description: `You stumble out of the East-gate of Moria, grief-stricken and leaderless, into a dim wood. The trees here are unlike any you have ever seen, with silver bark and leaves of gold that never seem to fall. The air is clear and light, and a strange peace begins to settle over your weary heart, washing away the filth and terror of the deep places. You have come to the Golden Wood of Lothlórien, the hidden heart of Elvendom on earth, and for a time, you are safe.` },
    'anduin': { name: "Anduin River", x: 550, y: 550, distance: 650, legName: "The Breaking of the Fellowship", next: 'amonhen', locationType: 'wild', description: `The great river Anduin carries you swiftly south. The banks are empty and wild, but you cannot shake the feeling of being watched. At night, you see a log floating in your wake, always keeping pace, and sometimes you glimpse two pale, luminous eyes in the dark. It is Gollum, drawn by the Ring. His presence is a constant, unsettling reminder of what the Ring can do, of the wretched end that awaits those who carry it for too long. The burden on your own neck feels heavier each day.` },
    'amonhen': { name: "Amon Hen", x: 560, y: 600, distance: 700, legName: "The Emyn Muil", next: 'emynmuil', locationType: 'wild', description: `You land at the foot of Amon Hen, the Hill of Seeing. A path leads up its wooded slope to the summit, where the ancient kings of Gondor would gaze out upon their realm. But there is no sense of majesty here now, only one of impending doom. The Fellowship is strained, divided by the corrupting whispers of the Ring. Boromir's eyes linger on you, filled with a strange fire. You know in your heart that a decision must be made. The path of the Fellowship may end here.` },
    'emynmuil': { name: "Emyn Muil", x: 600, y: 620, distance: 750, legName: "The Dead Marshes", next: 'deadmarshes', locationType: 'wild', description: `The Fellowship is broken. Now it is just you and Sam, alone in the treacherous hills of the Emyn Muil. It is a maze of razor-sharp rocks and deep chasms, a desolate landscape that mirrors the despair in your heart. Every step is a struggle, and the weight of your task is matched only by the physical weight of the Ring, which seems to grow heavier with every mile you travel deeper into the shadow of Mordor.` },
    'deadmarshes': { name: "Dead Marshes", x: 680, y: 610, distance: 800, legName: "To the Black Gate", next: 'blackgate', locationType: 'wild', description: `The stench of decay hangs heavy over the endless pools and mires of the Dead Marshes. A faint, ghostly light flickers beneath the surface of the stagnant water, and as you look closer, you see them: the pale, dead faces of Elves and Men and Orcs, forever trapped in their watery graves from a battle fought an age ago. Their eyes seem to follow you as you pick your way along the treacherous path, a chilling vision of the fate that awaits all who fight and fall in this blighted land.` },
    'blackgate': { name: "The Black Gate", x: 750, y: 600, distance: 900, next: null, locationType: 'wild', description: `After a long and weary journey through the slag-hills and choking dust of the Desolation of the Morannon, you see it. The Black Gate of Mordor. Two vast towers of iron and rock stand like fangs, between which a great wall of iron bars hangs, impassable and grim. The air crackles with watchfulness, and the ground trembles with the unseen industry of the Dark Lord. There is no hope of passing this way. Your quest seems doomed to fail at the very threshold of the enemy's land.` },
    'cirithungol': { name: "Cirith Ungol", x: 780, y: 650, distance: 950, legName: "The Land of Shadow", next: 'mountdoom', locationType: 'wild', description: `Gollum has led you to a secret path, a steep and winding stair carved into the black rock of the mountains. But as you climb, the air grows thick and foul with a stench of ancient malice. You come to the entrance of a tunnel, a black hole that seems to drink the very light. An unspeakable dread emanates from it, a sense of patient, hungry evil that has nested here for ages. This is Torech Ungol, the lair of Shelob.` },
    'mountdoom': { name: "Mount Doom", x: 850, y: 630, distance: 1000, type: 'end', locationType: 'wild', description: `You are there. At the end of all things. The sky above is a roiling storm of black and red, lit by the angry glow of Orodruin. The very air is a choking ash that burns your lungs, and the ground beneath your feet is hot and cracked. The Ring on its chain is a searing weight, a torment of fire against your chest, screaming for you to claim it, to turn back from the precipice. Before you is a dark opening, the Sammath Naur, the Crack of Doom. The end of your quest is at hand.` }
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
