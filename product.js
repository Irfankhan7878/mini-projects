const VIEW_HISTORY_KEY = 'viewHistory';

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function addProductToViewHistory(product) {
    if (!product || !product.id) return;
    let history = getFromLocalStorage(VIEW_HISTORY_KEY) || [];

    // Remove existing entry for this product (to move it to top)
    history = history.filter(entry => entry.id !== product.id);

    history.unshift({
        id: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        timestamp: new Date().toISOString()
    });

    // Keep last 20 viewed products
    history = history.slice(0, 20);
    saveToLocalStorage(VIEW_HISTORY_KEY, history);
}

const id = new URLSearchParams(window.location.search).get('id');
fetch(`https://dummyjson.com/products/${id}`)
    .then(res => res.json())
    .then(product => {
        // Save to view history
        addProductToViewHistory(product);

        document.getElementById('product_name').innerText = product.title;
        document.getElementById('product_image').src = product.thumbnail;
        document.getElementById('product_description').innerText = product.description;
        document.getElementById('product_price').innerText = `$${product.price}`; 

        const specsList = document.getElementById('product_specs');
        specsList.innerHTML = '';
        for (const [key, value] of Object.entries(product)) {
            if (['title', 'thumbnail', 'description', 'price', 'id'].includes(key)) continue;
            const li = document.createElement('li');
            li.innerText = `${key}: ${value}`;
            specsList.appendChild(li);
        }
    })
    .catch(err => {
        console.error(err);
    });