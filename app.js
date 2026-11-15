
const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

const coinContainer = document.getElementById("coinContainer");
const status = document.getElementById("status");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const homeBtn = document.getElementById("homeBtn");
const watchlistBtn = document.getElementById("watchlistBtn");
const sectionTitle = document.getElementById("sectionTitle");
const coinDetails = document.getElementById("coinDetails");
const detailContent = document.getElementById("detailContent");
const backBtn = document.getElementById("backBtn");

let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
let currentView = "home";
let allCoins = [];

async function getCoins() {
    status.textContent = "Loading cryptocurrency data...";
    coinContainer.innerHTML = "";

    refreshBtn.disabled = true;
    refreshBtn.textContent = "Loading...";

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Unable to fetch cryptocurrency data");
        }

        const data = await response.json();

        allCoins = data;

        filterCoins();

        status.textContent = "";

    } catch (error) {
        status.textContent = "Something went wrong! Please try again.";
        console.log(error);

    } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = "↻ Refresh";
    }
}

function showCoins(coins) {
    coinContainer.innerHTML = "";

    if (coins.length === 0) {
        status.textContent = currentView === "watchlist"
            ? "Your watchlist is empty!"
            : "No coins found!";

        return;
    }

    status.textContent = "";

    coins.forEach(function (coin) {
        const card = document.createElement("div");

        card.className = "rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-orange-400";

        const image = document.createElement("img");
        image.src = coin.image;
        image.alt = coin.name;
        image.className = "mb-4 h-12 w-12";

        const name = document.createElement("h3");
        name.className = "text-lg font-bold cursor-pointer hover:text-orange-400";
        name.textContent = coin.name + " (" + coin.symbol.toUpperCase() + ")";

        name.addEventListener("click", function () {
            showCoinDetails(coin.id);
        });

        const price = document.createElement("p");
        price.className = "mt-3 text-xl font-semibold text-white";
        price.textContent = "$" + coin.current_price.toLocaleString("en-US");

        const change = document.createElement("p");
        const changeValue = coin.price_change_percentage_24h;

        change.className = "mt-2 text-sm font-semibold";

        if (changeValue === null || changeValue === undefined) {
            change.textContent = "24h Change: N/A";
            change.classList.add("text-slate-400");
        } else {
            const sign = changeValue > 0 ? "+" : "";

            change.textContent = "24h Change: " + sign + changeValue.toFixed(2) + "%";

            change.classList.add(
                changeValue >= 0 ? "text-green-400" : "text-red-400"
            );
        }

        const marketCap = document.createElement("p");
        marketCap.className = "mt-3 text-sm text-slate-400";
        marketCap.textContent = "Market Cap: $" + coin.market_cap.toLocaleString("en-US");

        const watchlistButton = document.createElement("button");
        const isSaved = watchlist.includes(coin.id);

        watchlistButton.textContent = isSaved
            ? "★ Remove from Watchlist"
            : "☆ Add to Watchlist";

        watchlistButton.dataset.action = "watchlist";
        watchlistButton.dataset.id = coin.id;

        watchlistButton.className = "mt-4 w-full rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600";

        card.append(image, name, price, change, marketCap, watchlistButton);

        coinContainer.appendChild(card);
    });
}

function toggleWatchlist(coinId) {
    if (watchlist.includes(coinId)) {
        watchlist = watchlist.filter(function (id) {
            return id !== coinId;
        });
    } else {
        watchlist.push(coinId);
    }

    localStorage.setItem("watchlist", JSON.stringify(watchlist));

    filterCoins();
}

function filterCoins() {
    const searchText = searchInput.value.trim().toLowerCase();

    let coins = currentView === "watchlist"
        ? allCoins.filter(coin => watchlist.includes(coin.id))
        : [...allCoins];

    coins = coins.filter(function (coin) {
        return (
            coin.name.toLowerCase().includes(searchText) ||
            coin.symbol.toLowerCase().includes(searchText)
        );
    });

    const sortValue = sortSelect.value;

    if (sortValue === "price_low") {
        coins.sort((a, b) => a.current_price - b.current_price);
    } else if (sortValue === "price_high") {
        coins.sort((a, b) => b.current_price - a.current_price);
    } else if (sortValue === "change") {
        coins.sort(
            (a, b) =>
                (b.price_change_percentage_24h || 0) -
                (a.price_change_percentage_24h || 0)
        );
    } else {
        coins.sort((a, b) => b.market_cap - a.market_cap);
    }

    showCoins(coins);
}

function formatPrice(value) {
    if (value === null || value === undefined) {
        return "N/A";
    }

    return "$" + value.toLocaleString("en-US");
}

async function showCoinDetails(coinId) {
    coinContainer.classList.add("hidden");
    coinDetails.classList.remove("hidden");

    detailContent.innerHTML = `
        <div class="text-center py-10">
            <div class="animate-spin mx-auto h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p class="mt-4 text-slate-400">Loading coin details...</p>
        </div>
    `;

    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch coin details");
        }

        const coin = await response.json();

        const market = coin.market_data;
        const price = market.current_price.usd;
        const change = market.price_change_percentage_24h;

        const changeColor = change === null
            ? "text-slate-400"
            : change >= 0
                ? "text-green-400"
                : "text-red-400";

        const changeSign = change > 0 ? "+" : "";

        const description = coin.description.en
            ? coin.description.en.replace(/<[^>]*>/g, " ")
            : "Description not available.";

        detailContent.innerHTML = `
            <div class="space-y-8">

                <div class="flex flex-wrap items-center justify-between gap-5">
                    <div class="flex items-center gap-4">
                        <img
                            src="${coin.image.large}"
                            alt="${coin.name}"
                            class="h-16 w-16 rounded-full"
                        >

                        <div>
                            <h2 class="text-3xl font-bold text-white">
                                ${coin.name}
                            </h2>

                            <p class="text-slate-400 uppercase">
                                ${coin.symbol}
                            </p>
                        </div>
                    </div>

                    <button
                        id="detailWatchlistBtn"
                        class="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                    >
                        ${watchlist.includes(coin.id)
                            ? "★ Remove from Watchlist"
                            : "☆ Add to Watchlist"}
                    </button>
                </div>

                <div class="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <p class="text-slate-400">Current Price</p>

                    <h3 class="mt-2 text-4xl font-bold text-white">
                        ${formatPrice(price)}
                    </h3>

                    <p class="mt-3 font-semibold ${changeColor}">
                        ${change === null
                            ? "24h Change: N/A"
                            : changeSign + change.toFixed(2) + "% (24h)"}
                    </p>
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
                        <p class="text-slate-400">Market Cap</p>
                        <h3 class="mt-2 text-xl font-bold">
                            ${formatPrice(market.market_cap.usd)}
                        </h3>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
                        <p class="text-slate-400">24h High</p>
                        <h3 class="mt-2 text-xl font-bold text-green-400">
                            ${formatPrice(market.high_24h.usd)}
                        </h3>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
                        <p class="text-slate-400">24h Low</p>
                        <h3 class="mt-2 text-xl font-bold text-red-400">
                            ${formatPrice(market.low_24h.usd)}
                        </h3>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
                        <p class="text-slate-400">All Time High</p>
                        <h3 class="mt-2 text-xl font-bold">
                            ${formatPrice(market.ath.usd)}
                        </h3>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
                        <p class="text-slate-400">All Time Low</p>
                        <h3 class="mt-2 text-xl font-bold">
                            ${formatPrice(market.atl.usd)}
                        </h3>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
                        <p class="text-slate-400">Total Supply</p>
                        <h3 class="mt-2 text-xl font-bold">
                            ${market.total_supply === null
                                ? "N/A"
                                : market.total_supply.toLocaleString("en-US")}
                        </h3>
                    </div>

                </div>

                <div class="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <h3 class="mb-4 text-2xl font-bold">
                        About ${coin.name}
                    </h3>

                    <div class="leading-8 text-slate-300">
                        ${description}
                    </div>
                </div>

            </div>
        `;

        document.getElementById("detailWatchlistBtn")
            .addEventListener("click", function () {
                if (watchlist.includes(coin.id)) {
                    watchlist = watchlist.filter(id => id !== coin.id);
                } else {
                    watchlist.push(coin.id);
                }

                localStorage.setItem("watchlist", JSON.stringify(watchlist));

                this.textContent = watchlist.includes(coin.id)
                    ? "★ Remove from Watchlist"
                    : "☆ Add to Watchlist";
            });

    } catch (error) {
        detailContent.textContent =
            "Unable to load coin details. Please try again.";

        console.log(error);
    }
}

refreshBtn.addEventListener("click", getCoins);

searchInput.addEventListener("input", filterCoins);

sortSelect.addEventListener("change", filterCoins);

coinContainer.addEventListener("click", function (event) {
    const button = event.target.closest('[data-action="watchlist"]');

    if (button) {
        toggleWatchlist(button.dataset.id);
    }
});

homeBtn.addEventListener("click", function () {
    currentView = "home";
    sectionTitle.textContent = "Top Cryptocurrencies";
    filterCoins();
});

watchlistBtn.addEventListener("click", function () {
    currentView = "watchlist";
    sectionTitle.textContent = "My Watchlist";
    filterCoins();
});

backBtn.addEventListener("click", function () {
    coinDetails.classList.add("hidden");
    coinContainer.classList.remove("hidden");
    filterCoins();
});

getCoins();
