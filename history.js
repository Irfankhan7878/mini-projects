const SEARCH_HISTORY_KEY = 'searchHistory';
const VIEW_HISTORY_KEY = 'viewHistory';

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function normalizeSearchHistory(rawHistory) {
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

function formatTimestamp(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
}

function renderSearchHistory() {
    const listElement = document.getElementById('searchHistoryList');
    const emptyMessage = document.getElementById('searchHistoryEmptyMessage');

    let history = normalizeSearchHistory(getFromLocalStorage(SEARCH_HISTORY_KEY) || []);

    listElement.innerHTML = '';

    if (!history.length) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    history.forEach(entry => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <span class="history-query">${entry.query}</span>
            <span class="history-timestamp">${formatTimestamp(entry.timestamp)}</span>
        `;
        listElement.appendChild(li);
    });
}

function renderViewHistory() {
    const gridElement = document.getElementById('viewHistoryGrid');
    const emptyMessage = document.getElementById('viewHistoryEmptyMessage');

    let history = getFromLocalStorage(VIEW_HISTORY_KEY) || [];

    gridElement.innerHTML = '';

    if (!history.length) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    history.forEach(product => {
        const card = document.createElement('a');
        card.href = `product.html?id=${product.id}`;
        card.className = 'view-history-card';
        card.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}">
            <div class="view-history-info">
                <h4>${product.title}</h4>
                <span class="view-history-price">$${product.price}</span>
                <span class="view-history-time">${formatTimestamp(product.timestamp)}</span>
            </div>
        `;
        gridElement.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const clearSearchBtn = document.getElementById('clearSearchHistoryBtn');
    const clearViewBtn = document.getElementById('clearViewHistoryBtn');

    renderSearchHistory();
    renderViewHistory();

    clearSearchBtn.addEventListener('click', () => {
        localStorage.removeItem(SEARCH_HISTORY_KEY);
        renderSearchHistory();
    });

    clearViewBtn.addEventListener('click', () => {
        localStorage.removeItem(VIEW_HISTORY_KEY);
        renderViewHistory();
    });
});
