const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

async function getCoins() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log(data);
    } catch (error) {
        console.log("Error:", error);
    }
}

getCoins();