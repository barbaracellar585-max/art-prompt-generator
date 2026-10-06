// Art Prompt Generator
// Lines starting with // are comments. The browser ignores them.

// Step 1: check that JavaScript is connected.
// Open the page, press F12, and click the "Console" tab. You should see this message.
console.log("app.js is loaded!");

// Your code goes below this line.

// A list of things to draw. Add or remove anything you like!
const subjects = [
  "a sleepy fox",
  "an old lighthouse",
  "a cat wearing a hat",
  "a dragon made of flowers",
  "a cozy treehouse",
  "a jellyfish",
  "your favorite snack with a face",
  "a robot gardener",

  // Animals
  "an owl on a branch",
  "a frog holding an umbrella",
  "a sleeping cat curled up",
  "a horse running",
  "a hedgehog",
  "a koi fish",
  "a raccoon digging through trash",
  "a bunny in a flower field",
  "a whale breaching",
  "a hummingbird",
  "a wolf howling",
  "a turtle",

  // People and characters
  "a portrait of an old sailor",
  "a dancer mid-spin",
  "a witch brewing a potion",
  "a knight in armor",
  "a child blowing bubbles",
  "a hand holding a flower",
  "a musician playing guitar",
  "an astronaut floating in space",
  "a person reading in the rain",
  "a mermaid on a rock",

  // Places and scenes
  "a cozy coffee shop",
  "a mountain lake at sunrise",
  "a busy city street at night",
  "a cottage in the woods",
  "a Japanese garden",
  "a desert with cacti",
  "an abandoned train station",
  "a beach with tide pools",
  "a castle on a cliff",
  "a bedroom full of plants",

  // Objects and still life
  "a bowl of fruit",
  "an old pair of boots",
  "a teapot and cups",
  "a stack of books",
  "a vintage camera",
  "a jar of seashells",
  "a lit candle",
  "a bicycle leaning on a wall",
  "a mushroom cluster",
  "a bouquet of sunflowers",

  // Fantasy and fun
  "a tiny house on a turtle's back",
  "a phoenix rising",
  "a ghost having tea",
  "a cloud shaped like an animal",
  "a fairy sleeping in a flower",
  "a floating island",
  "a monster under the bed",
  "a city inside a bottle",
  "a unicorn in the snow",
  "a moth with galaxy wings"
];

// Grab the parts of the page we want to change, using their id from index.html
const promptText = document.getElementById("prompt");
const button = document.getElementById("generate-btn");
const referenceLink = document.getElementById("reference-link");
const reference = document.getElementById("reference");
const referenceImg = document.getElementById("reference-img");
const referenceCredit = document.getElementById("reference-credit");
const statusText = document.getElementById("status");
const saveButton = document.getElementById("save-btn");
const favoritesSection = document.getElementById("favorites");
const favoritesList = document.getElementById("favorites-list");

// The idea currently on screen: { subject: "...", image: {...} or null }
let currentIdea = null;

// Saved favorites, loaded from the browser's storage when the page opens
let favorites = loadFavorites();

// Pick one random item from any list
function pickRandom(list) {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

// Runs every time the button is clicked
function generateIdea() {
  const subject = pickRandom(subjects);
  currentIdea = { subject: subject, image: null };

  // Reset the save button for the new idea
  saveButton.hidden = false;
  saveButton.disabled = false;
  saveButton.textContent = "♡ Save to favorites";

  // Show the idea on the page
  promptText.textContent = subject;

  // Build a Pinterest search link for that idea and show it
  referenceLink.href = "https://www.pinterest.com/search/pins/?q=" + encodeURIComponent(subject);
  referenceLink.hidden = false;

  // Fetch a reference picture for that idea
  showReferenceImage(subject);
}

// Ask the Openverse image library for pictures of the subject, then show one.
// "async" lets us use "await", which pauses until the internet answers.
async function showReferenceImage(subject) {
  // Remember which idea this picture is for
  const idea = currentIdea;
  reference.hidden = true;
  statusText.textContent = "Finding a reference picture...";

  try {
    const url = "https://api.openverse.org/v1/images/?page_size=20&q=" + encodeURIComponent(subject);
    const response = await fetch(url);
    const data = await response.json();

    // If the button was clicked again while we waited, this answer is out of date
    if (idea !== currentIdea) {
      return;
    }

    // The library didn't find anything for this idea
    if (data.results.length === 0) {
      statusText.textContent = "No picture found for this one. Try the Pinterest link!";
      return;
    }

    // Pick a random picture from the results, so the same idea can show different pictures
    const image = pickRandom(data.results);

    // Keep the picture details so they can be saved as a favorite
    idea.image = {
      url: image.url,
      thumbnail: image.thumbnail,
      title: image.title,
      creator: image.creator,
      source: image.foreign_landing_url
    };

    referenceImg.src = image.url;
    referenceImg.alt = image.title;
    // If the full-size picture fails to load, fall back to the small version
    referenceImg.onerror = function () {
      referenceImg.src = image.thumbnail;
    };

    // Credit the photographer (their license asks us to)
    // We use textContent (not innerHTML) because the text comes from the internet,
    // and textContent can never be treated as code
    referenceCredit.textContent = '"' + image.title + '" by ' + image.creator + " · ";
    const sourceLink = document.createElement("a");
    sourceLink.href = image.foreign_landing_url;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener";
    sourceLink.textContent = "source";
    referenceCredit.appendChild(sourceLink);

    reference.hidden = false;
    statusText.textContent = "";
  } catch (error) {
    // Runs if something went wrong, like no internet connection
    statusText.textContent = "Couldn't load a picture right now. Try the Pinterest link!";
    console.error(error);
  }
}

// ---------- Favorites ----------

// localStorage only stores text, so we turn the favorites array into text (JSON) and back.
// try/catch because some browsers block storage (e.g. private mode).
function loadFavorites() {
  try {
    const saved = localStorage.getItem("favorites");
    if (saved === null) {
      return [];
    }
    return JSON.parse(saved);
  } catch (error) {
    return [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  } catch (error) {
    console.error(error);
  }
}

function addFavorite() {
  // Save a copy of the current idea, and put the newest favorite at the top of the list
  const favorite = { subject: currentIdea.subject, image: currentIdea.image };
  favorites.unshift(favorite);
  saveFavorites();
  showFavorites();

  // Prevent saving the same idea twice
  saveButton.disabled = true;
  saveButton.textContent = "♥ Saved!";
}

function removeFavorite(index) {
  // splice removes 1 item at the given position
  favorites.splice(index, 1);
  saveFavorites();
  showFavorites();
}

// Rebuild the favorites list on the page from the favorites array
function showFavorites() {
  favoritesList.replaceChildren(); // clear the old list
  favoritesSection.hidden = favorites.length === 0;

  favorites.forEach(function (favorite, index) {
    const item = document.createElement("li");

    // Thumbnail that opens the full picture in a new tab
    if (favorite.image !== null) {
      const imageLink = document.createElement("a");
      imageLink.href = favorite.image.url;
      imageLink.target = "_blank";
      imageLink.rel = "noopener";

      const thumbnail = document.createElement("img");
      thumbnail.src = favorite.image.thumbnail;
      thumbnail.alt = favorite.image.title;

      imageLink.appendChild(thumbnail);
      item.appendChild(imageLink);
    }

    const text = document.createElement("span");
    text.textContent = favorite.subject;
    item.appendChild(text);

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.className = "remove-btn";
    removeButton.addEventListener("click", function () {
      removeFavorite(index);
    });
    item.appendChild(removeButton);

    favoritesList.appendChild(item);
  });
}

// When the buttons are clicked, run the matching function
button.addEventListener("click", generateIdea);
saveButton.addEventListener("click", addFavorite);

// Show any favorites saved from last time
showFavorites();
