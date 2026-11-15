
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

function formatPrice(value) {
    if (value === null || value === undefined) return "N/A";

    return "$" + Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 8
    });
}

function formatNumber(value) {
    if (value === null || value === undefined) return "N/A";

    return Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 2
    });
}

function showStatus(message) {
    status.textContent = message;
}

async function getCoins() {
    showStatus("Loading cryptocurrency data...");

    coinContainer.innerHTML = "";

    refreshBtn.disabled = true;
    refreshBtn.textContent = "Loading...";

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Unable to fetch cryptocurrency data");
        }

        allCoins = await response.json();
        filterCoins();

    } catch (error) {
        showStatus("Something went wrong! Please try again.");
        console.log(error);

    } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = "↻ Refresh";
    }
}

function showCoins(coins) {
    coinContainer.innerHTML = "";

    if (coins.length === 0) {
        showStatus(
            currentView === "watchlist"
                ? "Your watchlist is empty!"
                : "No coins found!"
        );

        return;
    }

    showStatus("");

    coins.forEach(function (coin, index) {
        const card = document.createElement("div");

        card.dataset.coinId = coin.id;

        card.className = "group min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#111B2E] to-[#0D1526] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/60 hover:shadow-xl hover:shadow-cyan-500/10 active:scale-[0.98]";

        const top = document.createElement("div");
        top.className = "flex items-center justify-between gap-3";

        const left = document.createElement("div");
        left.className = "flex min-w-0 items-center gap-3";

        const image = document.createElement("img");
        image.src = coin.image;
        image.alt = coin.name;
        image.className = "h-11 w-11 shrink-0 rounded-full";

        const info = document.createElement("div");
        info.className = "min-w-0";

        const name = document.createElement("h3");
        name.className = "truncate text-base font-bold transition group-hover:text-cyan-400";
        name.textContent = coin.name;

        const symbol = document.createElement("p");
        symbol.className = "text-xs uppercase text-slate-500";
        symbol.textContent = coin.symbol;

        info.append(name, symbol);
        left.append(image, info);

        const rank = document.createElement("span");
        rank.className = "shrink-0 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-cyan-300";
        rank.textContent = "#" + (coin.market_cap_rank || index + 1);

        top.append(left, rank);

        const price = document.createElement("h2");
        price.className = "mt-6 break-all text-2xl font-bold text-white sm:text-3xl";
        price.textContent = formatPrice(coin.current_price);

        const changeValue = coin.price_change_percentage_24h;

        const change = document.createElement("p");
        change.className = "mt-2 text-sm font-semibold";

        if (changeValue === null || changeValue === undefined) {
            change.textContent = "24h Change: N/A";
            change.classList.add("text-slate-400");
        } else {
            const sign = changeValue > 0 ? "+" : "";

            change.textContent = sign + changeValue.toFixed(2) + "% (24h)";

            change.classList.add(
                changeValue >= 0 ? "text-green-400" : "text-red-400"
            );
        }

        const divider = document.createElement("div");
        divider.className = "my-5 border-t border-slate-800";

        const marketCap = document.createElement("div");
        marketCap.className = "flex items-center justify-between gap-2 text-sm";

        const marketLabel = document.createElement("span");
        marketLabel.className = "text-slate-500";
        marketLabel.textContent = "Market Cap";

        const marketValue = document.createElement("span");
        marketValue.className = "text-right font-semibold text-slate-300";
        marketValue.textContent = formatPrice(coin.market_cap);

        marketCap.append(marketLabel, marketValue);

        const watchlistButton = document.createElement("button");

        watchlistButton.type = "button";
        watchlistButton.dataset.action = "watchlist";
        watchlistButton.dataset.id = coin.id;

        watchlistButton.textContent = watchlist.includes(coin.id)
            ? "★ Remove from Watchlist"
            : "☆ Add to Watchlist";

        watchlistButton.className = "relative z-10 mt-5 w-full rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400 hover:text-slate-950";

        card.append(
            top,
            price,
            change,
            divider,
            marketCap,
            watchlistButton
        );

        coinContainer.appendChild(card);
    });
}

function toggleWatchlist(coinId) {
    if (watchlist.includes(coinId)) {
        watchlist = watchlist.filter(id => id !== coinId);
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

    coins = coins.filter(coin => {
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

async function showCoinDetails(coinId) {
    coinContainer.classList.add("hidden");
    coinDetails.classList.remove("hidden");

    detailContent.innerHTML = `
        <div class="flex min-h-64 flex-col items-center justify-center gap-4">
            <div class="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
            <p class="text-sm text-slate-400">Loading coin details...</p>
        </div>
    `;

    coinDetails.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch coin details");
        }

        const coin = await response.json();
        const market = coin.market_data;

        const change = market.price_change_percentage_24h;

        const changeColor = change === null
            ? "text-slate-400"
            : change >= 0
                ? "text-green-400"
                : "text-red-400";

        const changeSign = change > 0 ? "+" : "";

        const description = coin.description.en
            ? coin.description.en.replace(/<[^>]*>/g, " ").trim()
            : "Description not available.";

        const stats = [
            {
                label: "Market Cap",
                value: formatPrice(market.market_cap?.usd),
                color: "text-white"
            },
            {
                label: "24h High",
                value: formatPrice(market.high_24h?.usd),
                color: "text-green-400"
            },
            {
                label: "24h Low",
                value: formatPrice(market.low_24h?.usd),
                color: "text-red-400"
            },
            {
                label: "All Time High",
                value: formatPrice(market.ath?.usd),
                color: "text-white"
            },
            {
                label: "All Time Low",
                value: formatPrice(market.atl?.usd),
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
                value: formatPrice(market.total_volume?.usd),
                color: "text-white"
            }
        ];

        detailContent.innerHTML = `
            <div class="space-y-6 sm:space-y-8">

                <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div class="flex min-w-0 items-center gap-4">

                        <img
                            src="${coin.image.large}"
                            alt="${coin.name}"
                            class="h-14 w-14 shrink-0 rounded-full sm:h-20 sm:w-20"
                        >

                        <div class="min-w-0">
                            <h2 class="break-words text-2xl font-bold text-white sm:text-3xl">
                                ${coin.name}
                            </h2>

                            <p class="mt-1 text-sm uppercase text-cyan-400">
                                ${coin.symbol}
                            </p>

                            <p class="mt-1 text-xs text-slate-500">
                                Rank #${coin.market_cap_rank || "N/A"}
                            </p>
                        </div>

                    </div>

                    <button
                        id="detailWatchlistBtn"
                        class="w-full shrink-0 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400 hover:text-slate-950 sm:w-auto"
                    >
                        ${watchlist.includes(coin.id)
                            ? "★ Remove from Watchlist"
                            : "☆ Add to Watchlist"}
                    </button>

                </div>

                <div class="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#172A42] to-[#111B2E] p-5 shadow-lg shadow-cyan-500/5 sm:p-8">

                    <p class="text-sm text-slate-400">
                        Current Price
                    </p>

                    <h2 class="mt-3 break-all text-3xl font-bold text-white sm:text-5xl">
                        ${formatPrice(market.current_price?.usd)}
                    </h2>

                    <div class="mt-4 flex flex-wrap items-center gap-3">

                        <span class="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold ${changeColor}">
                            ${change === null
                                ? "N/A"
                                : changeSign + change.toFixed(2) + "%"}
                        </span>

                        <span class="text-xs text-slate-400">
                            Price change in the last 24 hours
                        </span>

                    </div>

                </div>

                <div>

                    <h3 class="mb-4 text-lg font-bold text-white sm:text-xl">
                        Market Statistics
                    </h3>

                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                        ${stats.map(item => `
                            <div class="min-w-0 rounded-xl border border-slate-700 bg-[#0D1526] p-4 transition hover:border-cyan-400/40 sm:p-5">

                                <p class="text-xs text-slate-400 sm:text-sm">
                                    ${item.label}
                                </p>

                                <h3 class="mt-3 break-all text-lg font-bold ${item.color} sm:text-xl">
                                    ${item.value}
                                </h3>

                            </div>
                        `).join("")}

                    </div>

                </div>

                <div class="rounded-2xl border border-slate-700 bg-[#0D1526] p-5 sm:p-7">

                    <h3 class="mb-4 text-lg font-bold text-white sm:text-xl">
                        About ${coin.name}
                    </h3>

                    <p class="text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                        ${description}
                    </p>

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

                localStorage.setItem(
                    "watchlist",
                    JSON.stringify(watchlist)
                );

                this.textContent = watchlist.includes(coin.id)
                    ? "★ Remove from Watchlist"
                    : "☆ Add to Watchlist";
            });

    } catch (error) {
        detailContent.innerHTML = `
            <div class="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">

                <p class="font-semibold text-red-400">
                    Unable to load coin details.
                </p>

                <button
                    id="retryDetailsBtn"
                    class="mt-4 rounded-lg bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                    Try Again
                </button>

            </div>
        `;

        document.getElementById("retryDetailsBtn")
            .addEventListener("click", function () {
                showCoinDetails(coinId);
            });

        console.log(error);
    }
}

coinContainer.addEventListener("click", function (event) {
    const watchlistButton = event.target.closest('[data-action="watchlist"]');

    if (watchlistButton) {
        event.stopPropagation();
        toggleWatchlist(watchlistButton.dataset.id);
        return;
    }

    const card = event.target.closest("[data-coin-id]");

    if (card) {
        showCoinDetails(card.dataset.coinId);
    }
});

refreshBtn.addEventListener("click", getCoins);

searchInput.addEventListener("input", filterCoins);

sortSelect.addEventListener("change", filterCoins);

homeBtn.addEventListener("click", function () {
    currentView = "home";

    sectionTitle.textContent = "Top Cryptocurrencies";

    coinDetails.classList.add("hidden");
    coinContainer.classList.remove("hidden");

    filterCoins();
});

watchlistBtn.addEventListener("click", function () {
    currentView = "watchlist";

    sectionTitle.textContent = "My Watchlist";

    coinDetails.classList.add("hidden");
    coinContainer.classList.remove("hidden");

    filterCoins();
});

backBtn.addEventListener("click", function () {
    coinDetails.classList.add("hidden");
    coinContainer.classList.remove("hidden");

    filterCoins();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

getCoins();
