// js/gameData.js

// This file contains static data that defines the core elements of the game.
// It includes UI icons, character professions, and the journey map.

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
    'shire': { name: "The Shire", x: 180, y: 350, distance: 0, legName: "The Road to Bree", next: 'bree', locationType: 'wild', zone: 'Shire' },
    'bree': { name: "Bree", arrivalEncounter: 'bree', x: 280, y: 360, distance: 100, legName: "To Weathertop", next: 'weathertop', type: 'town', description: `You pass under the great arch of the town-gate... The Prancing Pony inn spills warm light and noise into the night, a welcome sight for tired travelers, but the faces you see are grim and suspicious.`, locationType: 'town', zone: 'BreeLand' },
    'weathertop': { name: "Weathertop", x: 320, y: 358, distance: 150, legName: "The Road to the Trollshaws", next: 'trollshaws', locationType: 'wild', description: `The wind is sharper here, atop the ancient hill of Weathertop. A great ruin of a watchtower stands on its summit, a broken crown against a grey sky.`, zone: 'WeatherHills' },
    'trollshaws': { name: "Trollshaws", x: 350, y: 355, distance: 175, legName: "The Road to Rivendell", next: 'rivendell', locationType: 'wild', description: `You stumble into a clearing and stop dead. There, hulking and monstrous, are the three Stone-Trolls, forever frozen in their foolish argument by the rising sun decades ago.`, zone: 'WeatherHills' },
    'rivendell': { name: "Rivendell", arrivalEncounter: 'rivendell', x: 400, y: 350, distance: 250, next: 'caradhras_pass', type: 'town', description: `You descend into a hidden valley where the air grows sweet with the scent of pine... This is Imladris, the Last Homely House East of the Sea.`, locationType: 'town', zone: 'Rivendell' },
    'caradhras_pass': { name: "Pass of Caradhras", x: 450, y: 400, distance: 300, legName: "Over the Misty Mountains", next: 'moria', locationType: 'wild', description: `The mountain feels alive, and it hates you. A sudden, unnatural snowstorm descends...`, zone: 'MistyMountains' },
    'moria': { name: "Moria", arrivalEncounter: 'west_gate_of_moria', x: 460, y: 450, distance: 350, legName: "Through Khazad-dûm", next: 'lothlorien', type: 'town', description: `The Doors shut behind you, plunging the world into absolute darkness... This is the great delving of the Dwarves, Khazad-dûm.`, locationType: 'wild', zone: 'Moria' },
    'lothlorien': { name: "Lothlórien", x: 520, y: 480, distance: 550, legName: "The Great River", next: 'anduin', locationType: 'wild', description: `You stumble out of the East-gate of Moria, grief-stricken and leaderless, into a dim wood. The trees here are unlike any you have ever seen... You have come to the Golden Wood of Lothlórien.`, zone: 'Lothlorien' },
    'anduin': { name: "Anduin River", x: 550, y: 550, distance: 650, legName: "The Breaking of the Fellowship", next: 'amonhen', locationType: 'wild', description: `The great river Anduin carries you swiftly south. The banks are empty and wild, but you cannot shake the feeling of being watched.`, zone: 'Anduin' },
    'amonhen': { name: "Amon Hen", x: 560, y: 600, distance: 700, legName: "The Emyn Muil", next: 'emynmuil', locationType: 'wild', description: `You land at the foot of Amon Hen, the Hill of Seeing... The Fellowship is strained, divided by the corrupting whispers of the Ring.`, zone: 'Anduin' },
    'emynmuil': { name: "Emyn Muil", x: 600, y: 620, distance: 750, legName: "The Dead Marshes", next: 'deadmarshes', locationType: 'wild', description: `The Fellowship is broken. Now it is just you and Sam, alone in the treacherous hills of the Emyn Muil.`, zone: 'EmynMuil' },
    'deadmarshes': { name: "Dead Marshes", x: 680, y: 610, distance: 800, legName: "To the Black Gate", next: 'blackgate', locationType: 'wild', description: `The stench of decay hangs heavy over the endless pools and mires of the Dead Marshes... you see them: the pale, dead faces of Elves and Men and Orcs.`, zone: 'DeadMarshes' },
    'blackgate': { name: "The Black Gate", x: 750, y: 600, distance: 900, next: 'cirithungol', locationType: 'wild', description: `You see it. The Black Gate of Mordor. Two vast towers of iron and rock stand like fangs... There is no hope of passing this way.`, zone: 'Mordor' },
    'cirithungol': { name: "Cirith Ungol", x: 780, y: 650, distance: 950, legName: "The Land of Shadow", next: 'mountdoom', locationType: 'wild', description: `Gollum has led you to a secret path... You come to the entrance of a tunnel, a black hole that seems to drink the very light. This is Torech Ungol, the lair of Shelob.`, zone: 'Mordor' },
    'mountdoom': { name: "Mount Doom", x: 850, y: 630, distance: 1000, type: 'end', locationType: 'wild', description: `You are there. At the end of all things... Before you is a dark opening, the Sammath Naur, the Crack of Doom. The end of your quest is at hand.`, zone: 'Mordor' }
};
