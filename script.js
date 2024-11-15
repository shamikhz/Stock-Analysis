const Stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL', 'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'];

const stockList = document.getElementById('stock-list');
const changeDiv = document.getElementById('change');
const infoDiv = document.getElementById('info');
const stockCanvas = document.getElementById('stockCanvas');

document.addEventListener("DOMContentLoaded", () => {
    fetch('https://stocks3.onrender.com/api/stocks/getstockstatsdata')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const stocksStatsData = data.stocksStatsData[0];
            const filteredStockArray = Stocks.map(symbol => ({
                symbol,
                ...stocksStatsData[symbol]
            }));
            populateStockList(filteredStockArray);
        })
        .catch(error => console.error('Error fetching stock stats data:', error));
});

function populateStockList(stocks) {
    stocks.forEach(stock => {
        const li = document.createElement('li');

        const button = document.createElement('button');
        button.textContent = stock.symbol;
        button.classList.add('button-style');
        button.addEventListener('click', () => {
            console.log(`Button clicked for stock: ${stock.symbol}`);
            updateChangeDiv(stock);
            fetchStockSummary(stock.symbol);
            fetchStockData(stock.symbol); 
        });
        li.appendChild(button);

        const detailsDiv = document.createElement('div');
        detailsDiv.textContent = `${stock.bookValue}`;
        detailsDiv.style.marginLeft = '25px';
        li.appendChild(detailsDiv);

        const profitDiv = document.createElement('div');
        profitDiv.textContent = `${stock.profit}%`;
        profitDiv.style.marginLeft = '25px';
        profitDiv.style.color = stock.profit <= 0 ? 'red' : 'green';
        li.appendChild(profitDiv);

        stockList.appendChild(li);
    });
}

function updateChangeDiv(stock) {
    changeDiv.innerHTML = '';

    const symbolDiv = document.createElement('div');
    symbolDiv.textContent = `${stock.symbol}`;
    symbolDiv.style.marginLeft = '25px';
    symbolDiv.style.marginRight = '25px';
    changeDiv.appendChild(symbolDiv);

    const bookValueDiv = document.createElement('div');
    bookValueDiv.textContent = `${stock.bookValue}`;
    bookValueDiv.style.marginRight = '25px';
    changeDiv.appendChild(bookValueDiv);

    const profitDiv = document.createElement('div');
    profitDiv.textContent = `${stock.profit}%`;
    profitDiv.style.color = stock.profit <= 0 ? 'red' : 'green';
    changeDiv.appendChild(profitDiv);

    changeDiv.style.display = 'flex';
    changeDiv.style.fontSize = '24px';
    changeDiv.style.textAlign = 'center';
}

function fetchStockSummary(symbol) {
    fetch('https://stocks3.onrender.com/api/stocks/getstocksprofiledata')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const stockProfileData = data.stocksProfileData[0];
            const stockSummary = stockProfileData[symbol]?.summary || 'Summary not available';
            updateInfoDiv(stockSummary);
        })
        .catch(error => console.error('Error fetching stock summary:', error));
}

function updateInfoDiv(summary) {
    infoDiv.innerHTML = '';
    const summaryDiv = document.createElement('div');
    summaryDiv.textContent = summary;
    infoDiv.appendChild(summaryDiv);
}
let stockChart;

async function fetchStockData(symbol) {
    try {
        const response = await fetch(`https://stocks3.onrender.com/api/stocks/getstocksdata`);
        const data = await response.json();
        console.log(data);
        const stockData = data.stocksData.find(stock => stock[symbol]);
        if (stockData && stockData[symbol]) {
            updateChart(stockData[symbol]['1mo']); // Default to '1mo' initially
        } else {
            console.error(`No data found for symbol: ${symbol}`);
        }
    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}

function updateChart(stock) {
    const labels = stock.timeStamp.map(ts => new Date(ts * 1000).toLocaleDateString());
    const data = stock.value;

    if (stockChart) {
        stockChart.destroy();
    }

    stockChart = new Chart(stockCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '', 
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    display: false, 
                },
                y: {
                    display: false,
                }
            },
            plugins: {
                legend: {
                    display: false 
                },
                tooltip: {
                    enabled: false 
                }
            }
        }
    });
}

function changeTimeRange(timeFrame) {
    fetchStockData(symbol);
    switch (timeFrame) {
        case '1mo':
            stockChart.data.datasets[0].data = [fetchStockData()];
            break;
        case '3mo':
            stockChart.data.datasets[0].data = [fetchStockData()];
            break;
        case '1yr':
            stockChart.data.datasets[0].data = [fetchStockData()];
            break;
        case '5yr':
            stockChart.data.datasets[0].data = [fetchStockData()];
            break;
        default:
            console.error(`Invalid time frame: ${timeFrame}`);
    }
    stockChart.update();
}