const apiKeyRAWG = "0e2e4233d5ea4e218b5f6e1ae6acedc3";
let rawgUrl = `https://api.rawg.io/api/games?key=${apiKeyRAWG}&page_size=8`;

async function getGames() {
  try {
    const response = await fetch(rawgUrl);
    if (!response.ok)
      throw new Error("Erreur lors de la récupération des jeux !");
    const data = await response.json();
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
    const gameElement = document.createElement("div");
    gameElement.innerHTML = `
      <img src="${game.background_image}" alt="${game.name}" width="220px"
      height="120" >
      <h3>${game.name}</h3>
      <p>Date de sortie : ${game.released}</p>
    `;
    gameElement.classList.add("div-game");
    gamesContainer.appendChild(gameElement);
  });
}

getGames();

const cheapSharkUrl = `https://www.cheapshark.com/api/1.0/deals?storeID=1&title=`;

async function getGamePrice(gameTitle) {
  try {
    const response = await fetch(`${cheapSharkUrl}${gameTitle}`);
    if (!response.ok)
      throw new Error("Erreur lors de la récupération des prix !");
    const data = await response.json();
    displayPrices(data);
  } catch (error) {
    console.error(error.message);
  }
}

function displayPrices(prices) {
  const priceContainer = document.getElementById("prices-container");
  priceContainer.innerHTML = "";
  prices.forEach((price) => {
    const priceElement = document.createElement("div");
    priceElement.innerHTML = `
      <h4>${price.title}</h4>
      <p>Prix actuel : ${price.salePrice} $</p>
      <p>Prix d'origine : ${price.normalPrice} $</p>
    `;
    priceContainer.appendChild(priceElement);
  });
}

function searchGame() {
  const gameTitle = document.getElementById("search-input").value;
  if (!gameTitle) return alert("Veuillez entrer un titre !");
  getGamesByTitle(gameTitle);
  getGamePrice(gameTitle);
}

async function getGamesByTitle(title) {
  const searchUrl = `https://api.rawg.io/api/games?key=${apiKeyRAWG}&search=${title}`;
  try {
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error("Erreur lors de la recherche !");
    const data = await response.json();
    displayGames(data.results);
  } catch (error) {
    console.error(error.message);
  }
}
