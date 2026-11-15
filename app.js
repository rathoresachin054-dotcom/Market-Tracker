
const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

const coinContainer = document.getElementById("coinContainer");
const status = document.getElementById("status");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

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
        status.textContent = "No coins found!";
        return;
    }

    status.textContent = "";

    coins.forEach(function (coin) {
        const card = document.createElement("div");

        card.className =
            "rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-orange-400";

        const image = document.createElement("img");
        image.src = coin.image;
        image.alt = coin.name;
        image.className = "mb-4 h-12 w-12";

        const name = document.createElement("h3");
        name.className = "text-lg font-bold";
        name.textContent = coin.name + " (" + coin.symbol.toUpperCase() + ")";

        const price = document.createElement("p");
        price.className = "mt-3 text-xl font-semibold text-white";
        price.textContent =
            "$" + coin.current_price.toLocaleString("en-US");

        const change = document.createElement("p");
        const changeValue = coin.price_change_percentage_24h;

        change.className = "mt-2 text-sm font-semibold";

        if (changeValue === null || changeValue === undefined) {
            change.textContent = "24h Change: N/A";
            change.classList.add("text-slate-400");
        } else {
            const sign = changeValue > 0 ? "+" : "";

            change.textContent =
                "24h Change: " + sign + changeValue.toFixed(2) + "%";

            change.classList.add(
                changeValue >= 0 ? "text-green-400" : "text-red-400"
            );
        }

        const marketCap = document.createElement("p");
        marketCap.className = "mt-3 text-sm text-slate-400";
        marketCap.textContent =
            "Market Cap: $" + coin.market_cap.toLocaleString("en-US");

        card.append(
            image,
            name,
            price,
            change,
            marketCap
        );

        coinContainer.appendChild(card);
    });
}

function filterCoins() {
    const searchText = searchInput.value.trim().toLowerCase();

    let filteredCoins = allCoins.filter(function (coin) {
        return (
            coin.name.toLowerCase().includes(searchText) ||
            coin.symbol.toLowerCase().includes(searchText)
        );
    });

    const sortValue = sortSelect.value;

    if (sortValue === "price_low") {
        filteredCoins.sort((a, b) => a.current_price - b.current_price);
    }
    else if (sortValue === "price_high") {
        filteredCoins.sort((a, b) => b.current_price - a.current_price);
    }
    else if (sortValue === "change") {
        filteredCoins.sort(
            (a, b) =>
                (b.price_change_percentage_24h || 0) -
                (a.price_change_percentage_24h || 0)
        );
    }
    else {
        filteredCoins.sort((a, b) => b.market_cap - a.market_cap);
    }

    showCoins(filteredCoins);
}

refreshBtn.addEventListener("click", getCoins);

searchInput.addEventListener("input", filterCoins);

sortSelect.addEventListener("change", filterCoins);

getCoins()
