const API_KEY_RAWG = "0f551c1455924f2cbb203cd560dafeab";
let rawgUrl = `https://api.rawg.io/api/games?key=${API_KEY_RAWG}&page_size=8`;

// Affiche la liste des jeux depuis RAWG
async function getGames() {
  try {
    const data = await fetchAPI(rawgUrl);
    rawgUrl = data.next;
    displayGames(data.results);
  } catch (error) {
    console.error(error.message);
  }
}

function displayGames(games) {
  const gamesContainer = document.getElementById("games-container");
  gamesContainer.innerHTML = "";
  games.forEach((game) => {
    const card = document.createElement("div");
    card.classList.add("game-card");
    card.addEventListener("click", () => openModal(game.name)); // on envoie le name, requête avec le name dans shark, ensuite on récupère le game ID et on refait une recherche avec le game ID cette fois-ci, on récupère le prix le moins cher ET récupérer le TOUT PREMIER deal

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const gameImage = document.createElement("img");
    gameImage.src = game.background_image;

    const gameTitle = document.createElement("h2");
    gameTitle.innerText = game.name;

    const genres = game.genres.map((genre) => genre.name);
    const gameGenre = document.createElement("p");
    gameGenre.innerText = genres.join(", ");

    const gameRating = document.createElement("p");
    gameRating.innerText = `${game.rating}/5`;

    cardContent.append(gameTitle, gameGenre, gameRating);
    card.append(gameImage, cardContent);
    gamesContainer.appendChild(card);
  });
}

async function getGamesByTitle(title) {
  try {
    const data = await fetchAPI(
      `https://api.rawg.io/api/games?key=${API_KEY_RAWG}&search=${title}`,
    );
    displayGames(data);
  } catch (error) {
    console.error(error.message);
  }
}

// Ouvre une modale avec les infos du jeu
async function openModal(gameName) {
  let loading = true;
  try {
    // Récupère les infos de RAWG et CheapShark
    const rawgData = await fetchRawgData(gameName);
    const cheapSharkData = await fetchCheapSharkData(gameName);

    const modalHeader = document.createElement("div");
    modalHeader.classList.add("modal-header");

    const gameTitle = document.createElement("h2");
    gameTitle.innerText = rawgData.name;

    const closeButton = document.createElement("span");
    closeButton.innerText = "X";
    closeButton.addEventListener("click", closeModal);

    modalHeader.append(gameTitle, closeButton);

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    if (cheapSharkData) {
      const normalPrice = document.createElement("p");
      normalPrice.innerText = cheapSharkData
        ? `Prix normal: ${cheapSharkData.normalPrice}€`
        : "Prix indisponible";

      const cheapestPrice = document.createElement("p");
      cheapestPrice.innerText = cheapSharkData
        ? `Prix le moins cher: ${cheapSharkData.cheapestPrice}€`
        : "Prix indisponible";

      modalContent.append(normalPrice, cheapestPrice);
    } else {
      const noPromo = document.createElement("p");
      noPromo.innerText = "Pas de promotion trouvée";

      modalContent.appendChild(noPromo);
    }

    const carousel = document.createElement("div");
    carousel.classList.add("carousel");
    rawgData.screenshots.map((screenshot) => {
      const img = document.createElement("img");
      img.src = screenshot;
      carousel.appendChild(img);
    });

    const reviews = document.createElement("div");
    reviews.classList.add("reviews");

    const love = document.createElement("p");
    love.innerText = `😍 ${rawgData.ratings.love}`;

    const good = document.createElement("p");
    good.innerText = `🙂 ${rawgData.ratings.good}`;

    const meh = document.createElement("p");
    meh.innerText = `😐 ${rawgData.ratings.meh}`;

    const bad = document.createElement("p");
    bad.innerText = `😡 ${rawgData.ratings.bad}`;

    reviews.append(love, good, meh, bad);

    modalContent.append(carousel, reviews);

    //  Affiche la modale
    loading = false;
    const modal = document.querySelector(".modal");
    modal.append(modalHeader, modalContent);
    modal.classList.add("open");
  } catch (error) {
    console.error(error.message);
  }
}

// Récupère les données d'un jeu sur RAWG
async function fetchRawgData(gameName) {
  const url = `https://api.rawg.io/api/games?key=${API_KEY_RAWG}&search=${encodeURIComponent(
    gameName,
  )}`;
  const response = await fetch(url);
  const data = await response.json();

  const game = data.results[0]; // Premier jeu trouvé
  if (!game) throw new Error("Jeu introuvable sur RAWG.");

  return {
    name: game.name,
    screenshots: game.short_screenshots.map((s) => s.image),
    ratings: {
      love: game.ratings.find((r) => r.title === "exceptional")?.count || 0,
      good: game.ratings.find((r) => r.title === "recommended")?.count || 0,
      meh: game.ratings.find((r) => r.title === "meh")?.count || 0,
      bad: game.ratings.find((r) => r.title === "skip")?.count || 0,
    },
  };
}

// Récupère les données d'un jeu sur CheapShark
async function fetchCheapSharkData(gameName) {
  const searchUrl = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(
    gameName,
  )}`;
  const searchResponse = await fetch(searchUrl);
  const searchResults = await searchResponse.json();

  const game = searchResults[0];
  if (!game) return false;

  const detailsUrl = `https://www.cheapshark.com/api/1.0/games?id=${game.gameID}`;
  const detailsResponse = await fetch(detailsUrl);
  const details = await detailsResponse.json();

  if (parseInt(details.deals[0].savings) === 0) {
    return false;
  } else {
    return {
      normalPrice: details.deals[0].retailPrice || "Non disponible",
      cheapestPrice: details.deals[0].price || "Non disponible",
      platform: details.deals[0]?.storeID || "Non disponible",
      savings: details.deals[0].savings,
    };
  }
}

// Ferme la modale
function closeModal() {
  const modal = document.querySelector(".modal");
  modal.classList.remove("open");
  modal.innerHTML = ""; // Nettoie le contenu
}

// Charge les jeux dès le chargement de la page
getGames();

// /**
//  * @summary Récupère la liste des stores de CheapShark
//  * @returns {Promise<Object[]>} - Tableau d'objets représentant les stores
//  * @throws {Error} Si la requête se passe mal
//  */
// async function getStores() {
//   try {
//     const data = await fetchAPI("https://www.cheapshark.com/api/1.0/stores");
//     return data;
//   } catch (error) {
//     console.error(error.message);
//   }
// }

// /**
//  * @summary Cherche un store en fonction de son nom
//  * @param {string} name - Nom du store
//  * @returns {Promise<Object>} - Le store correspondant
//  */
// async function searchStore(name) {
//   const stores = await getStores();
//   return stores.find(
//     (store) => store.storeName === name.charAt(0).toUpperCase() + name.slice(1),
//   );
// }

// /**
//  * @summary Cherche un store en fonction de son storeID
//  * @param {string} id - ID du store
//  * @returns {Promise<Object>} - Le store correspondant
//  */
// async function searchStoreByID(id) {
//   const stores = await getStores();
//   return stores.find((store) => store.storeID === `${id}`);
// }

// /**
//  * @summary Affiche le logo et le nom d'un store
//  * @param {HTMLElement} parent - Élément parent qui contiendra la balise <div> créée
//  */
// async function displayStore(name, parent) {
//   const store = await searchStore(name);
//   if (!store) return console.error("Store non trouvé !");

//   const div = document.createElement("div");
//   div.classList.add("store");

//   const img = document.createElement("img");
//   img.src = `https://www.cheapshark.com/${store.images.logo}`;

//   const h2 = document.createElement("h2");
//   h2.textContent = store.storeName;

//   div.append(h2, img);
//   parent.appendChild(div);
//   console.log(store);
// }

/**
 * @summary Requête une API
 * @param {string} url - URL de l'API
 * @param {Object} [headers={}] - Headers de la requête
 * @returns {Promise<Object>} - Données de l'API
 * @throws {Error} Si la requête se passe mal
 */
async function fetchAPI(url, headers = {}) {
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Erreur lors de la recherche !");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
  }
}

let genres = [];

const fetchGenres = async () => {
  const url = `https://api.rawg.io/api/genres?key=${API_KEY_RAWG}`;
  const response = await fetch(url);
  const data = await response.json();
  genres = data.results;
  displayGenres();
};

fetchGenres();

const displayGenres = () => {
  const genresContainer = document.querySelector(".genres-container");
  genres.forEach((genre) => {
    const genreJeu = document.createElement("a");
    genreJeu.classList.add("links-Grey");
    genreJeu.innerText = genre.name;
    genresContainer.appendChild(genreJeu);
    genreJeu.addEventListener("click", () => fetchGamesFromGenre(genre.id));
  });
};

const fetchGamesFromGenre = async (id) => {
  const url = `https://api.rawg.io/api/games?key=${API_KEY_RAWG}&genres=${id}&page_size=8`;
  const data = await fetchAPI(url);
  displayGames(data.results);
};
