
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

let watchlist = JSON.parse(localStorage.getItem("watchlist"));

if (watchlist === null) {
    watchlist = [];
}

let allCoins = [];
let currentView = "home";

function formatPrice(price) {
    if (price === null || price === undefined) {
        return "N/A";
    }

    return "$" + Number(price).toLocaleString("en-US", {
        maximumFractionDigits: 8
    });
}

function formatNumber(number) {
    if (number === null || number === undefined) {
        return "N/A";
    }

    return Number(number).toLocaleString("en-US", {
        maximumFractionDigits: 2
    });
}

function showStatus(message) {
    status.textContent = message;
}

function updateWatchlistButton(button, coinId) {
    if (watchlist.includes(coinId)) {
        button.innerHTML = '<i class="fa-solid fa-star"></i> Remove from Watchlist';
    } else {
        button.innerHTML = '<i class="fa-regular fa-star"></i> Add to Watchlist';
    }
}

async function getCoins() {
    showStatus("Loading cryptocurrency data...");
    coinContainer.innerHTML = "";
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = "Loading...";

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("API data not available");
        }

        const data = await response.json();
        allCoins = data;
        filterCoins();

    } catch (error) {
        showStatus("Something went wrong! Please try again.");
        console.log(error);
    }

    refreshBtn.disabled = false;
    refreshBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Refresh';
}

function showCoins(coins) {
    coinContainer.innerHTML = "";

    if (coins.length === 0) {
        if (currentView === "watchlist") {
            showStatus("Your watchlist is empty!");
        } else {
            showStatus("No coins found!");
        }

        return;
    }

    showStatus("");

    for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];

        const card = document.createElement("div");

        card.className = "group min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#111B2E] to-[#0D1526] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/60 hover:shadow-xl hover:shadow-cyan-500/10 active:scale-[0.98]";

        let rank = coin.market_cap_rank;

        if (rank === null || rank === undefined) {
            rank = i + 1;
        }

        let changeText = "24h Change: N/A";
        let changeColor = "text-slate-400";

        if (coin.price_change_percentage_24h !== null &&
            coin.price_change_percentage_24h !== undefined) {

            let change = coin.price_change_percentage_24h;
            let sign = "";

            if (change > 0) {
                sign = "+";
            }

            changeText = sign + change.toFixed(2) + "% (24h)";

            if (change >= 0) {
                changeColor = "text-green-400";
            } else {
                changeColor = "text-red-400";
            }
        }

        card.innerHTML = `
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <img
                        src="${coin.image}"
                        alt="${coin.name}"
                        class="h-11 w-11 rounded-full"
                    >

                    <div>
                        <h3 class="text-base font-bold text-white">
                            ${coin.name}
                        </h3>

                        <p class="text-xs uppercase text-slate-500">
                            ${coin.symbol}
                        </p>
                    </div>
                </div>

                <span class="rounded-lg bg-slate-800 px-3 py-1 text-xs text-cyan-300">
                    #${rank}
                </span>
            </div>

            <h2 class="mt-6 break-all text-2xl font-bold text-white">
                ${formatPrice(coin.current_price)}
            </h2>

            <p class="mt-2 text-sm font-semibold ${changeColor}">
                ${changeText}
            </p>

            <div class="my-5 border-t border-slate-800"></div>

            <div class="flex justify-between text-sm">
                <span class="text-slate-500">
                    Market Cap
                </span>

                <span class="font-semibold text-slate-300">
                    ${formatPrice(coin.market_cap)}
                </span>
            </div>

            <button
                class="watchlistButton mt-5 w-full rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400 hover:text-slate-950"
            >
            </button>
        `;

        const button = card.querySelector(".watchlistButton");

        updateWatchlistButton(button, coin.id);

        button.addEventListener("click", function(event) {
            event.stopPropagation();
            toggleWatchlist(coin.id);
        });

        card.addEventListener("click", function() {
            showCoinDetails(coin.id);
        });

        coinContainer.appendChild(card);
    }
}

function toggleWatchlist(coinId) {
    if (watchlist.includes(coinId)) {
        let newWatchlist = [];

        for (let i = 0; i < watchlist.length; i++) {
            if (watchlist[i] !== coinId) {
                newWatchlist.push(watchlist[i]);
            }
        }

        watchlist = newWatchlist;

    } else {
        watchlist.push(coinId);
    }

    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    filterCoins();
}

function filterCoins() {
    let coins = [];

    if (currentView === "watchlist") {
        for (let i = 0; i < allCoins.length; i++) {
            if (watchlist.includes(allCoins[i].id)) {
                coins.push(allCoins[i]);
            }
        }

    } else {
        for (let i = 0; i < allCoins.length; i++) {
            coins.push(allCoins[i]);
        }
    }

    let searchText = searchInput.value.toLowerCase().trim();
    let searchedCoins = [];

    for (let i = 0; i < coins.length; i++) {
        let name = coins[i].name.toLowerCase();
        let symbol = coins[i].symbol.toLowerCase();

        if (name.includes(searchText) || symbol.includes(searchText)) {
            searchedCoins.push(coins[i]);
        }
    }

    coins = searchedCoins;

    let sortValue = sortSelect.value;

    if (sortValue === "price_low") {
        coins.sort(function(a, b) {
            return a.current_price - b.current_price;
        });

    } else if (sortValue === "price_high") {
        coins.sort(function(a, b) {
            return b.current_price - a.current_price;
        });

    } else if (sortValue === "change") {
        coins.sort(function(a, b) {
            let changeA = a.price_change_percentage_24h || 0;
            let changeB = b.price_change_percentage_24h || 0;

            return changeB - changeA;
        });

    } else {
        coins.sort(function(a, b) {
            return b.market_cap - a.market_cap;
        });
    }

    showCoins(coins);
}

async function showCoinDetails(coinId) {
    coinContainer.classList.add("hidden");
    coinDetails.classList.remove("hidden");

    detailContent.innerHTML = `
        <p class="py-10 text-center text-slate-400">
            Loading coin details...
        </p>
    `;

    coinDetails.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/coins/" + coinId
        );

        if (!response.ok) {
            throw new Error("Unable to load coin details");
        }

        const coin = await response.json();
        const market = coin.market_data;

        let change = market.price_change_percentage_24h;
        let changeColor = "text-slate-400";
        let changeText = "N/A";

        if (change !== null && change !== undefined) {
            if (change >= 0) {
                changeColor = "text-green-400";
            } else {
                changeColor = "text-red-400";
            }

            let sign = "";

            if (change > 0) {
                sign = "+";
            }

            changeText = sign + change.toFixed(2) + "%";
        }

        let description = coin.description.en;

        if (description) {
            description = description.replace(/<[^>]*>/g, " ");
        } else {
            description = "Description not available.";
        }

        const stats = [
            {
                label: "Market Cap",
                value: formatPrice(market.market_cap.usd),
                color: "text-white"
            },
            {
                label: "24h High",
                value: formatPrice(market.high_24h.usd),
                color: "text-green-400"
            },
            {
                label: "24h Low",
                value: formatPrice(market.low_24h.usd),
                color: "text-red-400"
            },
            {
                label: "All Time High",
                value: formatPrice(market.ath.usd),
                color: "text-white"
            },
            {
                label: "All Time Low",
                value: formatPrice(market.atl.usd),
                color: "text-white"
            },
            {
                label: "Total Supply",
                value: formatNumber(market.total_supply),
                color: "text-white"
            },
            {
                label: "Circulating Supply",
                value: formatNumber(market.circulating_supply),
                color: "text-white"
            },
            {
                label: "Max Supply",
                value: formatNumber(market.max_supply),
                color: "text-white"
            },
            {
                label: "24h Volume",
                value: formatPrice(market.total_volume.usd),
                color: "text-white"
            }
        ];

        let statsHTML = "";

        for (let i = 0; i < stats.length; i++) {
            statsHTML = statsHTML + `
                <div class="rounded-xl border border-slate-700 bg-[#0D1526] p-5">
                    <p class="text-sm text-slate-400">
                        ${stats[i].label}
                    </p>

                    <h3 class="mt-3 break-all text-xl font-bold ${stats[i].color}">
                        ${stats[i].value}
                    </h3>
                </div>
            `;
        }

        detailContent.innerHTML = `
            <div class="space-y-6">
                <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
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

                            <p class="mt-1 uppercase text-cyan-400">
                                ${coin.symbol}
                            </p>

                            <p class="mt-1 text-xs text-slate-500">
                                Rank #${coin.market_cap_rank || "N/A"}
                            </p>
                        </div>
                    </div>

                    <button
                        id="detailWatchlistBtn"
                        class="rounded-xl bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300"
                    >
                    </button>
                </div>

                <div class="rounded-2xl border border-cyan-400/20 bg-[#172A42] p-6">
                    <p class="text-sm text-slate-400">
                        Current Price
                    </p>

                    <h2 class="mt-3 break-all text-4xl font-bold text-white">
                        ${formatPrice(market.current_price.usd)}
                    </h2>

                    <p class="mt-4 text-lg font-semibold ${changeColor}">
                        ${changeText} (24h)
                    </p>
                </div>

                <div>
                    <h3 class="mb-4 text-xl font-bold text-white">
                        Market Statistics
                    </h3>

                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        ${statsHTML}
                    </div>
                </div>

                <div class="rounded-2xl border border-slate-700 bg-[#0D1526] p-6">
                    <h3 class="mb-4 text-xl font-bold text-white">
                        About ${coin.name}
                    </h3>

                    <p class="text-sm leading-7 text-slate-300">
                        ${description}
                    </p>
                </div>
            </div>
        `;

        const detailWatchlistBtn = document.getElementById("detailWatchlistBtn");

        updateWatchlistButton(detailWatchlistBtn, coin.id);

        detailWatchlistBtn.addEventListener("click", function() {
            toggleWatchlist(coin.id);
            updateWatchlistButton(detailWatchlistBtn, coin.id);
        });

    } catch (error) {
        detailContent.innerHTML = `
            <div class="rounded-xl bg-red-500/10 p-6 text-center">
                <p class="font-semibold text-red-400">
                    Unable to load coin details.
                </p>

                <button
                    id="retryDetailsBtn"
                    class="mt-4 rounded-lg bg-cyan-400 px-5 py-2 text-slate-950"
                >
                    Try Again
                </button>
            </div>
        `;

        document.getElementById("retryDetailsBtn").addEventListener("click", function() {
            showCoinDetails(coinId);
        });

        console.log(error);
    }
}

refreshBtn.addEventListener("click", function() {
    getCoins();
});

searchInput.addEventListener("input", function() {
    filterCoins();
});

sortSelect.addEventListener("change", function() {
    filterCoins();
});

homeBtn.addEventListener("click", function() {
    currentView = "home";
    sectionTitle.textContent = "Top Cryptocurrencies";
    coinDetails.classList.add("hidden");
    coinContainer.classList.remove("hidden");
    filterCoins();
});

watchlistBtn.addEventListener("click", function() {
    currentView = "watchlist";
    sectionTitle.textContent = "My Watchlist";
    coinDetails.classList.add("hidden");
    coinContainer.classList.remove("hidden");
    filterCoins();
});

backBtn.addEventListener("click", function() {
    coinDetails.classList.add("hidden");
    coinContainer.classList.remove("hidden");
    filterCoins();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

getCoins();
