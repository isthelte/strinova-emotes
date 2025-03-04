// State tracking with localStorage persistence
let favorites = new Set();
let recent = [];
let copyImageMode = false;
let categorizedView = false;
let chatEmoteOnly = false;
let searchQuery = "";

// DOM elements
const searchInput = document.getElementById("searchInput");
const allContainer = document.getElementById("all-container");
const favoritesContainer = document.getElementById("favorites-container");
const recentContainer = document.getElementById("recent-container");
const fullSizeImg = document.getElementById("fullImg");
const toast = document.getElementById("toast");

// Override Ctrl+F to focus on emote search input
window.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "f") {
    e.preventDefault();

    // If search input is already focused, blur it
    if (document.activeElement === searchInput) {
      searchInput.blur();

      // Add visual feedback when unfocusing
      searchInput.classList.add("input-focus-flash");
      setTimeout(() => searchInput.classList.remove("input-focus-flash"), 400);
    } else {
      // Otherwise focus it with animation
      searchInput.focus();
      searchInput.classList.add("input-focus-flash");
      setTimeout(() => searchInput.classList.remove("input-focus-flash"), 400);
    }
  }

  // Add keyboard shortcut for toggling ChatEmote only mode
  if (e.ctrlKey && e.key === "c" && !searchInput.matches(":focus")) {
    e.preventDefault();
    toggleChatEmoteOnly();
  }
});
// Add keyboard shortcut for toggling ChatEmote only mode
window.addEventListener("keydown", function (e) {});

// Helper function to get all paths (for favorites and recent functionality)
function getAllPaths() {
  const paths = [];

  // Process EmotesWiki and ChatEmote
  ["EmotesWiki", "ChatEmote"].forEach((folder) => {
    if (emoteData[folder]) {
      Object.values(emoteData[folder]).forEach((characterEmotes) => {
        characterEmotes.forEach((emote) => paths.push(emote.path));
      });
    }
  });

  // Process PopTeamEpic
  if (emoteData.PopTeamEpic) {
    emoteData.PopTeamEpic.forEach((emote) => paths.push(emote.path));
  }

  return paths;
}

function saveCategorizedView() {
  localStorage.setItem("categorizedView", JSON.stringify(categorizedView));
}

function loadCategorizedView() {
  const mode = localStorage.getItem("categorizedView");
  if (mode !== null) {
    try {
      categorizedView = JSON.parse(mode);
    } catch (e) {
      console.error("Error loading view mode:", e);
      categorizedView = false;
    }
  }
}

// Load favorites from localStorage
function loadFavorites() {
  const savedFavorites = localStorage.getItem("imageFavorites");
  if (savedFavorites) {
    try {
      favorites = new Set(JSON.parse(savedFavorites));
    } catch (e) {
      console.error("Error loading favorites:", e);
      favorites = new Set();
    }
  }
}

// Save favorites to localStorage
function saveFavorites() {
  localStorage.setItem("imageFavorites", JSON.stringify(Array.from(favorites)));
}

// Load recent from localStorage
function loadRecent() {
  const savedRecent = localStorage.getItem("imageRecent");
  if (savedRecent) {
    try {
      recent = JSON.parse(savedRecent);
    } catch (e) {
      console.error("Error loading recent:", e);
      recent = [];
    }
  }
}

// Save recent to localStorage
function saveRecent() {
  localStorage.setItem("imageRecent", JSON.stringify(recent));
}

// Save mode to localStorage
function saveCopyImageMode() {
  localStorage.setItem("copyImageMode", JSON.stringify(copyImageMode));
}

// Save mode to localStorage
function loadCopyImageMode() {
  const mode = localStorage.getItem("copyImageMode");
  if (mode) {
    try {
      copyImageMode = JSON.parse(mode);
    } catch (e) {
      console.error("Error loading copy image mode:", e);
      recent = [];
    }
  }
}

// Save chatEmoteOnly to localStorage
function saveChatEmoteOnly() {
  localStorage.setItem("chatEmoteOnly", JSON.stringify(chatEmoteOnly));
}

// Load chatEmoteOnly from localStorage
function loadChatEmoteOnly() {
  const mode = localStorage.getItem("chatEmoteOnly");
  if (mode !== null) {
    try {
      chatEmoteOnly = JSON.parse(mode);
    } catch (e) {
      console.error("Error loading ChatEmote only mode:", e);
      chatEmoteOnly = false;
    }
  }
}

// Function to show toast notification
function showToast() {
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

function handleSearch(e) {
  searchQuery = e.target.value.toLowerCase();
  updateAllImagesView();
  updateFavoritesView();
  updateRecentView();
}

// Function to copy to clipboard
async function copyToClipboard(url, el) {
  try {
    // Get base URL of the current page
    const baseUrl =
      window.location.origin +
      window.location.pathname.replace(/\/[^\/]*$/, "/");
    // Construct absolute URL
    const absoluteUrl = new URL(url, baseUrl).href;

    if (copyImageMode) {
      // Copy the image itself
      const img = await fetch(absoluteUrl);
      const blob = await img.blob();
      const data = [new ClipboardItem({ [blob.type]: blob })];
      await navigator.clipboard.write(data);
    } else {
      // Copy the absolute URL
      await navigator.clipboard.writeText(absoluteUrl);
    }

    // Update toast message text
    toast.textContent = copyImageMode
      ? "Image copied to clipboard!"
      : "URL copied to clipboard!";
    showToast();
  } catch (err) {
    console.error("Failed to copy: ", err);
    alert("Failed to copy: " + err.message);
  }
}

// Function to update toggle label
function updateToggleLabel() {
  const label = document.getElementById("copyModeLabel");
  label.textContent = copyImageMode ? "Image" : "URL";
}

// Function to update view toggle label
function updateViewToggleLabel() {
  const label = document.getElementById("viewModeLabel");
  label.textContent = categorizedView ? "Categorized" : "Flat";
}

// Add this to your initialization code
document.addEventListener("DOMContentLoaded", function () {
  initializeGallery();

  updateToggleLabel();
});

function toggleLabel() {
  copyImageMode = !copyImageMode;

  // Add animation
  const label = document.getElementById("copyModeLabel");
  label.classList.add("toggle-btn-active");
  setTimeout(() => label.classList.remove("toggle-btn-active"), 300);

  updateToggleLabel();
  saveCopyImageMode();
}

function toggleView() {
  categorizedView = !categorizedView;

  // Add animation
  const label = document.getElementById("viewModeLabel");
  label.classList.add("toggle-btn-active");
  setTimeout(() => label.classList.remove("toggle-btn-active"), 300);

  updateViewToggleLabel();
  saveCategorizedView();
  updateAllImagesView();
}

function toggleChatEmoteOnly() {
  chatEmoteOnly = !chatEmoteOnly;

  // Add animation
  const label = document.getElementById("chatEmoteOnlyLabel");
  label.classList.add("toggle-btn-active");
  setTimeout(() => label.classList.remove("toggle-btn-active"), 300);

  updateChatEmoteOnlyLabel();
  saveChatEmoteOnly();

  // Update all views to reflect the filter
  updateAllImagesView();
  updateFavoritesView();
  updateRecentView();
}

// Function to add to recent
function addToRecent(url) {
  // Add to beginning of recent list if it doesn't exist yet
  if (!recent.includes(url)) {
    recent.unshift(url);
  }

  // Keep only last 10
  if (recent.length > 10) {
    recent = recent.slice(0, 10);
  }

  // Save to localStorage
  saveRecent();

  // Update the recent view
  updateRecentView();
}

// Function to update the recent view
function updateRecentView() {
  recentContainer.innerHTML = "";

  if (recent.length === 0) {
    recentContainer.innerHTML =
      '<p class="text-gray-500 italic p-2">No recent clicks</p>';
    return;
  }

  let hasVisibleRecent = false;

  recent.forEach((path) => {
    const emote = findEmoteByPath(path);
    if (emoteMatchesSearch(emote)) {
      const container = createImageElement(emote);
      recentContainer.appendChild(container);
      hasVisibleRecent = true;
    }
  });

  if (!hasVisibleRecent && searchQuery) {
    recentContainer.innerHTML =
      '<p class="text-gray-500 italic p-2">No recent emotes matching your search</p>';
  }
}

// Function to toggle favorite status
function toggleFavorite(url, starIcon) {
  if (favorites.has(url)) {
    favorites.delete(url);
    starIcon.innerHTML = "☆";
  } else {
    favorites.add(url);
    starIcon.innerHTML = "★";
  }

  // Save to localStorage
  saveFavorites();

  // Update the favorites view
  updateFavoritesView();

  // Update all images view to reflect star changes
  updateAllImagesView();
}

// Function to update the favorites view
function updateFavoritesView() {
  favoritesContainer.innerHTML = "";

  if (favorites.size === 0) {
    favoritesContainer.innerHTML =
      '<p class="text-gray-500 italic p-2">No favorites yet</p>';
    return;
  }

  let hasVisibleFavorites = false;

  Array.from(favorites).forEach((path) => {
    const emote = findEmoteByPath(path);
    if (emoteMatchesSearch(emote)) {
      const container = createImageElement(emote);
      favoritesContainer.appendChild(container);
      hasVisibleFavorites = true;
    }
  });

  if (!hasVisibleFavorites && searchQuery) {
    favoritesContainer.innerHTML =
      '<p class="text-gray-500 italic p-2">No favorites matching your search</p>';
  }
}

function updateChatEmoteOnlyLabel() {
  const label = document.getElementById("chatEmoteOnlyLabel");
  label.textContent = chatEmoteOnly ? "Chat Emote Only" : "All Emotes";
}

// Function to update all images view
function updateAllImagesView() {
  allContainer.innerHTML = "";

  if (categorizedView) {
    // Categorized view - organized by folder and character
    ["EmotesWiki", "ChatEmote", "PopTeamEpic"].forEach((folder) => {
      if (emoteData[folder]) {
        const folderSection = document.createElement("div");
        folderSection.className = "mb-8";

        const folderHeader = document.createElement("h2");
        folderHeader.className = "text-lg font-medium mb-4";
        folderHeader.textContent = folder;
        folderSection.appendChild(folderHeader);

        let hasVisibleEmotes = false;

        if (folder === "PopTeamEpic") {
          const emoteContainer = document.createElement("div");
          emoteContainer.className = "flex flex-wrap";

          emoteData[folder].forEach((emote) => {
            // Only show if it matches the search
            if (emoteMatchesSearch(emote)) {
              const container = createImageElement(emote);
              emoteContainer.appendChild(container);
              hasVisibleEmotes = true;
            }
          });

          folderSection.appendChild(emoteContainer);
        } else {
          Object.entries(emoteData[folder]).forEach(([character, emotes]) => {
            const characterSection = document.createElement("div");
            characterSection.className = "mb-4";

            const characterHeader = document.createElement("h3");
            characterHeader.className = "text-md font-medium mb-2 ml-4";
            characterHeader.textContent = character;
            characterSection.appendChild(characterHeader);

            const emotesContainer = document.createElement("div");
            emotesContainer.className = "flex flex-wrap ml-8";

            let characterHasVisibleEmotes = false;

            emotes.forEach((emote) => {
              // Only show if it matches the search
              if (emoteMatchesSearch(emote)) {
                const container = createImageElement(emote);
                emotesContainer.appendChild(container);
                characterHasVisibleEmotes = true;
                hasVisibleEmotes = true;
              }
            });

            if (characterHasVisibleEmotes) {
              characterSection.appendChild(emotesContainer);
              folderSection.appendChild(characterSection);
            }
          });
        }

        if (hasVisibleEmotes) {
          allContainer.appendChild(folderSection);
        }
      }
    });
  } else {
    // Flat view - all emotes in a single grid
    const container = document.createElement("div");
    container.className = "flex flex-wrap";

    // Get all emotes in a flat array
    const allEmotes = [];
    ["EmotesWiki", "ChatEmote"].forEach((folder) => {
      if (emoteData[folder]) {
        Object.values(emoteData[folder]).forEach((characterEmotes) => {
          allEmotes.push(...characterEmotes);
        });
      }
    });
    if (emoteData.PopTeamEpic) {
      allEmotes.push(...emoteData.PopTeamEpic);
    }

    let hasVisibleEmotes = false;

    // Create elements for all emotes that match the search
    allEmotes.forEach((emote) => {
      if (emoteMatchesSearch(emote)) {
        const imageContainer = createImageElement(emote);
        container.appendChild(imageContainer);
        hasVisibleEmotes = true;
      }
    });

    if (hasVisibleEmotes) {
      allContainer.appendChild(container);
    } else if (searchQuery) {
      const noResults = document.createElement("p");
      noResults.className = "text-gray-500 italic p-2";
      noResults.textContent = "No emotes found matching your search.";
      allContainer.appendChild(noResults);
    }
  }
}

// Function to check if an emote matches the search query
function emoteMatchesSearch(emote) {
  if (!emote) return false;

  // Check if we're in ChatEmote only mode
  if (chatEmoteOnly && !emote.path.includes("ChatEmote/")) {
    return false;
  }

  if (!searchQuery) return true;

  const path = emote.path.toLowerCase();
  const id = emote.id ? emote.id.toLowerCase() : "";

  return path.includes(searchQuery) || id.includes(searchQuery);
}

// Function to find an emote object by its path
function findEmoteByPath(path) {
  // Check in all folders
  for (const folder of ["EmotesWiki", "ChatEmote"]) {
    if (emoteData[folder]) {
      for (const character in emoteData[folder]) {
        const found = emoteData[folder][character].find(
          (emote) => emote.path === path
        );
        if (found) return found;
      }
    }
  }

  // Check in PopTeamEpic
  if (emoteData.PopTeamEpic) {
    const found = emoteData.PopTeamEpic.find((emote) => emote.path === path);
    if (found) return found;
  }

  // If not found, return an object with just the path
  return { path };
}

// Function to create an image element with its container and star
function createImageElement(emote) {
  // Handle both object and string inputs for backward compatibility
  const url = typeof emote === "object" ? emote.path : emote;
  const emoteId = typeof emote === "object" ? emote.id : null;
  const emoteType =
    typeof emote === "object" && url.includes("ChatEmote/")
      ? "ChatEmote"
      : null;

  const container = document.createElement("div");
  container.className = "image-container";

  const img = document.createElement("img");
  img.src = url;
  img.className = "image";

  // Discord-like click animation
  img.addEventListener("click", function (el) {
    // Add click animation class
    fullSizeImg.classList.add("fullimg-clicked");
    setTimeout(() => fullSizeImg.classList.remove("fullimg-clicked"), 200);

    copyToClipboard(url, el.target);
    addToRecent(url);
  });

  // Add right-click event listener for ChatEmote emotes
  img.addEventListener("contextmenu", function (e) {
    // Check if this is a ChatEmote emote
    if (emoteType === "ChatEmote" && emoteId) {
      e.preventDefault(); // Prevent the default context menu

      // Add right-click animation
      fullSizeImg.classList.add("fullimg-clicked");
      setTimeout(() => fullSizeImg.classList.remove("fullimg-clicked"), 200);

      const styleTxt = `[style="Image" id="${emoteId}"]`;
      navigator.clipboard
        .writeText(styleTxt)
        .then(() => {
          // Update toast message and show with Discord-like styling
          const toast = document.getElementById("toast");
          toast.innerHTML = "<span>🔗 Style code copied to clipboard!</span>";
          showToast();
        })
        .catch((err) => {
          console.error("Failed to copy style code: ", err);
          alert("Failed to copy style code: " + err.message);
        });
    }
  });

  img.addEventListener("mouseenter", function () {
    container.style.opacity = "0";
    fullSizeImg.src = url;

    fullSizeImg.onload = () => {
      // Calculate optimal position for preview
      const rect = img.getBoundingClientRect();
      const originalImgWidth = fullSizeImg.width;
      const originalImgHeight = fullSizeImg.height;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      fullSizeImg.style.top = `${Math.min(
        viewportHeight - originalImgHeight,
        rect.top - originalImgWidth / 2 + img.width / 2
      )}px`;
      fullSizeImg.style.left = `${Math.min(
        viewportWidth - originalImgWidth,
        Math.max(0, rect.left - originalImgHeight / 2 + img.height / 2)
      )}px`;

      fullSizeImg.style.display = "block";
    };

    // Add hover state to container
    container.classList.add("emote-hovered");
  });

  img.addEventListener("mouseleave", function () {
    container.style.opacity = "1";

    fullSizeImg.style.display = "none";
    container.classList.remove("emote-hovered");
  });

  // Discord-style star favorites
  const starIcon = document.createElement("div");
  starIcon.className = "star-icon";

  // Use SVG for better-looking star icon
  const starSVG = favorites.has(url)
    ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="gold"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>'
    : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>';

  starIcon.innerHTML = starSVG;

  starIcon.addEventListener("click", function (e) {
    e.stopPropagation(); // Prevent triggering the image click

    // Add star click animation
    starIcon.classList.add("star-clicked");
    setTimeout(() => starIcon.classList.remove("star-clicked"), 300);

    toggleFavorite(url, starIcon);

    // Update the star icon with SVG
    starIcon.innerHTML = favorites.has(url)
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="gold"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>';
  });

  container.appendChild(img);
  container.appendChild(starIcon);

  return container;
}

// Function to clean up localStorage
function cleanUpLocalStorage() {
  loadFavorites();
  loadRecent();

  const validImages = new Set(getAllPaths());

  favorites = new Set([...favorites].filter((url) => validImages.has(url)));
  saveFavorites();

  recent = recent.filter((url) => validImages.has(url));
  saveRecent();
}

// Initialize the view
function initializeGallery() {
  // Clean up localStorage from old data
  cleanUpLocalStorage();

  // Load saved state
  loadFavorites();
  loadRecent();
  loadCopyImageMode();
  saveCopyImageMode();
  loadCategorizedView();
  loadChatEmoteOnly();

  updateViewToggleLabel();
  updateChatEmoteOnlyLabel();

  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }

  // Initialize views
  updateAllImagesView();
  updateFavoritesView();
  updateRecentView();
}

// Start the app
document.addEventListener("DOMContentLoaded", initializeGallery);
