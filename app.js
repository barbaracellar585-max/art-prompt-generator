// Art Prompt Generator
// Lines starting with // are comments. The browser ignores them.

// Step 1: check that JavaScript is connected.
// Open the page, press F12, and click the "Console" tab. You should see this message.
console.log("app.js is loaded!");

// Your code goes below this line.

// A list of things to draw. Add or remove anything you like!
// Each idea is an object with two parts:
//   idea:   what you see on the screen
//   search: 1-2 short words used to find a reference drawing (keep it simple!)
const subjects = [
  { idea: "a sleepy fox", search: "fox" },
  { idea: "an old lighthouse", search: "lighthouse" },
  { idea: "a cat wearing a hat", search: "cat hat" },
  { idea: "a dragon made of flowers", search: "dragon" },
  { idea: "a cozy treehouse", search: "tree house" },
  { idea: "a jellyfish", search: "jellyfish" },
  { idea: "your favorite snack with a face", search: "cartoon food" },
  { idea: "a robot gardener", search: "robot" },

  // Animals
  { idea: "an owl on a branch", search: "owl" },
  { idea: "a frog holding an umbrella", search: "frog" },
  { idea: "a sleeping cat curled up", search: "sleeping cat" },
  { idea: "a horse running", search: "horse" },
  { idea: "a hedgehog", search: "hedgehog" },
  { idea: "a koi fish", search: "koi" },
  { idea: "a raccoon digging through trash", search: "raccoon" },
  { idea: "a bunny in a flower field", search: "rabbit" },
  { idea: "a whale breaching", search: "whale" },
  { idea: "a hummingbird", search: "hummingbird" },
  { idea: "a wolf howling", search: "wolf" },
  { idea: "a turtle", search: "turtle" },

  // People and characters
  { idea: "a portrait of an old sailor", search: "sailor" },
  { idea: "a dancer mid-spin", search: "dancer" },
  { idea: "a witch brewing a potion", search: "witch" },
  { idea: "a knight in armor", search: "knight" },
  { idea: "a child blowing bubbles", search: "bubble" },
  { idea: "a hand holding a flower", search: "hand flower" },
  { idea: "a musician playing guitar", search: "guitar" },
  { idea: "an astronaut floating in space", search: "astronaut" },
  { idea: "a person reading in the rain", search: "umbrella" },
  { idea: "a mermaid on a rock", search: "mermaid" },

  // Places and scenes
  { idea: "a cozy coffee shop", search: "cafe" },
  { idea: "a mountain lake at sunrise", search: "mountain lake" },
  { idea: "a busy city street at night", search: "city street" },
  { idea: "a cottage in the woods", search: "cottage" },
  { idea: "a Japanese garden", search: "japanese garden" },
  { idea: "a desert with cacti", search: "cactus" },
  { idea: "an abandoned train station", search: "train station" },
  { idea: "a beach with tide pools", search: "beach" },
  { idea: "a castle on a cliff", search: "castle" },
  { idea: "a bedroom full of plants", search: "potted plant" },

  // Objects and still life
  { idea: "a bowl of fruit", search: "fruit bowl" },
  { idea: "an old pair of boots", search: "boot" },
  { idea: "a teapot and cups", search: "teapot" },
  { idea: "a stack of books", search: "book" },
  { idea: "a vintage camera", search: "camera" },
  { idea: "a jar of seashells", search: "shell" },
  { idea: "a lit candle", search: "candle" },
  { idea: "a bicycle leaning on a wall", search: "bicycle" },
  { idea: "a mushroom cluster", search: "mushroom" },
  { idea: "a bouquet of sunflowers", search: "sunflower" },

  // Fantasy and fun
  { idea: "a tiny house on a turtle's back", search: "turtle" },
  { idea: "a phoenix rising", search: "phoenix" },
  { idea: "a ghost having tea", search: "ghost" },
  { idea: "a cloud shaped like an animal", search: "cloud" },
  { idea: "a fairy sleeping in a flower", search: "fairy" },
  { idea: "a floating island", search: "floating island" },
  { idea: "a monster under the bed", search: "monster" },
  { idea: "a city inside a bottle", search: "bottle" },
  { idea: "a unicorn in the snow", search: "unicorn" },
  { idea: "a moth with galaxy wings", search: "moth" }
];

// Words that tell us a picture is artwork, not a photo.
// A title word only has to START with one of these, so "illustrat" matches
// "illustration" and "illustrated", and "sketch" matches "sketches".
const artWords = [
  "drawing", "drawn", "illustrat", "sketch", "painting", "cartoon", "watercolo",
  "pencil", "etching", "engraving", "lithograph", "woodcut", "doodle", "clipart",
  "artwork", "comic", "ink"
];

// Art supplies to draw the idea with
const mediums = [
  "pencil",
  "colored pencils",
  "watercolors",
  "acrylic colors",
  "alcohol markers",
  "acrylic markers",
  "pen",
  "ink",
  "oil pastels"
];

// Grab the parts of the page we want to change, using their id from index.html
const promptText = document.getElementById("prompt");
const mediumText = document.getElementById("medium");
const button = document.getElementById("generate-btn");
const referenceLink = document.getElementById("reference-link");
const reference = document.getElementById("reference");
const referenceImg = document.getElementById("reference-img");
const referenceCredit = document.getElementById("reference-credit");
const statusText = document.getElementById("status");
const saveButton = document.getElementById("save-btn");
const favoritesSection = document.getElementById("favorites");
const favoritesList = document.getElementById("favorites-list");

// The idea currently on screen: { subject: "...", medium: "...", image: {...} or null }
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
  const medium = pickRandom(mediums);
  currentIdea = { subject: subject.idea, medium: medium, image: null };

  // Reset the save button for the new idea
  saveButton.hidden = false;
  saveButton.disabled = false;
  saveButton.textContent = "♡ Save to favorites";

  // Show the idea on the page
  promptText.textContent = subject.idea;
  mediumText.textContent = "Draw it with: " + medium;
  mediumText.hidden = false;

  // Build a Pinterest search link for simple drawings of that idea and show it
  referenceLink.href = "https://www.pinterest.com/search/pins/?q=" + encodeURIComponent(subject.search + " simple drawing");
  referenceLink.hidden = false;

  // Fetch a reference drawing using the short search words
  showReferenceImage(subject.search);
}

// Search the Openverse image library and return the list of results.
// "async" lets us use "await", which pauses until the internet answers.
// If simpleOnly is true, only search rawpixel, a collection of clean vintage drawings.
async function searchImages(searchText, simpleOnly) {
  let url = "https://api.openverse.org/v1/images/?page_size=20&q=" + encodeURIComponent(searchText);
  if (simpleOnly) {
    url = url + "&source=rawpixel";
  }
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}

// Keep only simple drawings that really show the subject.
// filter() makes a new list with just the items where the function returns true.
function findSimpleDrawings(results, searchWords) {
  return results.filter(function (image) {
    const title = (image.title || "").toLowerCase();
    const tags = (image.tags || []).map(function (tag) { return tag.name; }).join(" ").toLowerCase();

    // Every search word must appear in the title or tags ("boot" → no more jeans!)
    const showsSubject = searchWords.every(function (word) {
      return (title + " " + tags).includes(word);
    });

    // The title itself must say it's artwork. Pictures titled like
    // "Boots drawing, vintage illustration" are usually just the one subject, nice and simple.
    // We compare whole words, so "pink" doesn't count as "ink".
    // split(/[^a-z]+/) cuts the title into words at anything that isn't a letter.
    const titleWords = title.split(/[^a-z]+/);
    const isDrawing = titleWords.some(function (titleWord) {
      return artWords.some(function (artWord) {
        return titleWord.startsWith(artWord);
      });
    });

    return showsSubject && isDrawing;
  });
}

// Find a simple drawing of the subject and show it
async function showReferenceImage(search) {
  // Remember which idea this picture is for
  const idea = currentIdea;
  reference.hidden = true;
  statusText.textContent = "Finding a reference drawing...";

  try {
    // "cat hat" → ["cat", "hat"]
    const searchWords = search.toLowerCase().split(" ");

    // Try the cleanest source first, then wider searches, keeping only the good results:
    //   1. "[subject] drawing" in rawpixel's simple vintage drawings
    //   2. "[subject] drawing" anywhere
    //   3. "[subject] illustration" anywhere
    let drawings = findSimpleDrawings(await searchImages(search + " drawing", true), searchWords);
    if (drawings.length === 0) {
      drawings = findSimpleDrawings(await searchImages(search + " drawing", false), searchWords);
    }
    if (drawings.length === 0) {
      drawings = findSimpleDrawings(await searchImages(search + " illustration", false), searchWords);
    }

    // If the button was clicked again while we waited, this answer is out of date
    if (idea !== currentIdea) {
      return;
    }

    // Better to show nothing than the wrong picture
    if (drawings.length === 0) {
      statusText.textContent = "No simple drawing found for this one. Try the Pinterest link!";
      return;
    }

    // The simplest drawings usually name the subject right in the title,
    // like "Boots drawing, vintage footwear illustration". Use those if there are any.
    const titledDrawings = drawings.filter(function (image) {
      const title = image.title.toLowerCase();
      return searchWords.every(function (word) {
        return title.includes(word + " ") || title.includes(word + "s ") || title.endsWith(word) || title.endsWith(word + "s");
      });
    });
    if (titledDrawings.length > 0) {
      drawings = titledDrawings;
    }

    // Pick a random drawing from the good ones, so the same idea can show different drawings
    const image = pickRandom(drawings);

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
    // Some pictures have no artist name (null), so only add "by ..." when there is one
    let credit = '"' + image.title + '"';
    if (image.creator) {
      credit = credit + " by " + image.creator;
    }
    referenceCredit.textContent = credit + " · ";
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
    statusText.textContent = "Couldn't load a drawing right now. Try the Pinterest link!";
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
  const favorite = {
    subject: currentIdea.subject,
    medium: currentIdea.medium,
    image: currentIdea.image
  };
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

    // Favorites saved before mediums existed don't have one, so check first
    if (favorite.medium) {
      const mediumTag = document.createElement("span");
      mediumTag.className = "medium-tag";
      mediumTag.textContent = favorite.medium;
      item.appendChild(mediumTag);
    }

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
