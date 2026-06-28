const loadingLines = [
    "Discord was almost called Bonfire before we picked our name. It was meant to be nice and cozy.",
    "Discord was almost called Wyvern before we picked our name. Not too proud of that one.",
    "Our logo's name is Clyde.",
    "There are a bunch of hidden Easter Eggs in the app that happen when you click certain things...",
    "Discord started as a game company making a mobile game called Fates Forever.",
    "Discord's official birthday is May 13, 2015.",
    "We came up with the idea of Discord Nitro over morning breakfast potatoes.",
    "Our mascot, Wumpus, was originally created as a character with no friends :(",
    "In Discord's early days, light theme was the only theme. Dark theme didn't arrive until August 2015.",
    "In the ancient days, Discord started as a browser-only app.",
    "Our HypeSquad program has three houses: Bravery, Balance, and Brilliance.",
    "The character on our 404 page is a robot hamster named Nelly.",
    "You can play our version of Snake on our 404 page.",
    "There's a very small chance you can get a secret ringtone when calling someone.",
    "Our old Partner mascot was an elf named Springle."
];

const loadingText = document.getElementById("loadingText");

let current = Math.floor(Math.random() * loadingLines.length);

function changeLine() {
    loadingText.style.opacity = 0;

    setTimeout(() => {
        loadingText.textContent = loadingLines[current];
        loadingText.style.opacity = 1;

        current = (current + 1) % loadingLines.length;
    }, 250);
}

changeLine();

setInterval(changeLine, 7000);
const helpMenu = document.getElementById("helpMenu");

setTimeout(() => {
    helpMenu.classList.add("show");
}, 10000);