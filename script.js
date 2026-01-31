const apiUrl = 'https://dummyjson.com/products';
const searchApiUrl = 'https://dummyjson.com/products/search?q=';

const container = document.getElementById('product-container');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchBtn');
const suggestionContainer = document.getElementById('suggestions-container');
let products = {};
const SEARCH_HISTORY_KEY = 'searchHistory';

// Pagination state
let currPage = 1;
const itemsPerPage = 12;
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

function fetchProducts(url) {
    return fetch(url)
        .then(res => res.json())
        .catch(err => {
            console.error(err);
            return { products: [] };
        });
}

function displayProducts(products, container) {
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.productId = product.id;
        card.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p class="price">$${product.price}</p>
        `;
        card.addEventListener('click', () => {
            const pid = card.dataset.productId;
            window.location.href = `./product.html?id=${pid}`;
        });
        container.appendChild(card);
    });
}

function renderPage() {
    if (!Array.isArray(products)) products = [];
    const total = products.length;
    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    if (currPage > totalPages) currPage = totalPages;
    const start = (currPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = products.slice(start, end);

    displayProducts(pageItems, container);

    if (pageInfo) pageInfo.innerText = `Page ${currPage} of ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currPage === 1;
    if (nextBtn) nextBtn.disabled = currPage === totalPages;
}
function displaySuggestions(items, container) {
    container.innerHTML = '';

    if (!items.length) {
        container.style.display = 'none';
        return;
    }

    items.forEach(item => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion';
        suggestion.innerHTML = `
            <span class="suggestion-text">${item.title}</span>
        `;
        suggestion.addEventListener('click', () => {
            searchInput.value = item.title;
            container.style.display = 'none';
        });
        container.appendChild(suggestion);
    });

    container.style.display = 'block';
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}  

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// helpers to normalize and manage search history with timestamps
function normalizeHistory(rawHistory) {
    if (!Array.isArray(rawHistory)) return [];
    return rawHistory.map(entry => {
        if (typeof entry === 'string') {
            return {
                query: entry,
                timestamp: new Date().toISOString()
            };
        }
        if (entry && typeof entry.query === 'string') {
            return {
                query: entry.query,
                timestamp: entry.timestamp || new Date().toISOString()
            };
        }
        return null;
    }).filter(Boolean);
}

function addQueryToHistory(query) {
    if (!query) return;
    let history = normalizeHistory(getFromLocalStorage(SEARCH_HISTORY_KEY) || []);

    const lowerQuery = query.toLowerCase();
    const exists = history.some(entry => entry.query.toLowerCase() === lowerQuery);
    if (!exists) {
        history.unshift({
            query,
            timestamp: new Date().toISOString()
        });
        history = history.slice(0, 10); // keep last 10 queries
        saveToLocalStorage(SEARCH_HISTORY_KEY, history);
    }
}

function showHistorySuggestions(prefix = '') {
    let history = normalizeHistory(getFromLocalStorage(SEARCH_HISTORY_KEY) || []);
    if (prefix) {
        const lowerPrefix = prefix.toLowerCase();
        history = history.filter(entry =>
            entry.query.toLowerCase().startsWith(lowerPrefix)
        );
    }
    const items = history.map(entry => ({ title: entry.query }));
    displaySuggestions(items, suggestionContainer);
}

document.addEventListener('DOMContentLoaded', () => {
   
    fetchProducts(apiUrl)
        .then(data => {
            products = data.products || [];
            currPage = 1;
            renderPage();
        })
        .catch(err => {
            console.error(err);
        });

    // show history when user focuses the input
    searchInput.addEventListener('focus', () => {
        if (!searchInput.value) {
            showHistorySuggestions();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();

        if (!query) {
            // empty -> show previous search queries
            showHistorySuggestions();
            return;
        }

        // live product suggestions
        const filteredProducts = products.filter(product =>
            product.title.toLowerCase().includes(query)
        );
        displaySuggestions(filteredProducts, suggestionContainer);
    });

    searchInput.addEventListener('blur', () => {
        // Slight delay so click events on suggestions still register
        setTimeout(() => {
            suggestionContainer.style.display = 'none';
        }, 150);
    });

    searchButton.addEventListener('click', (e) => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;

        // save this query for future suggestions
        addQueryToHistory(query);

        fetchProducts(searchApiUrl + encodeURIComponent(query))
            .then(data => {
                products = data.products || [];
                currPage = 1;
                renderPage();
            })
            .catch(err => {
                console.error(err);
        });
    });

    // Pagination button handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currPage > 1) {
                currPage--;
                renderPage();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.max(1, Math.ceil((Array.isArray(products) ? products.length : 0) / itemsPerPage));
            if (currPage < totalPages) {
                currPage++;
                renderPage();
            }
        });
    }
});
