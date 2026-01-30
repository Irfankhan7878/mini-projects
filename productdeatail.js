const id = new URLSearchParams(window.location.search).get('id');

fetch(`https://dummyjson.com/products/${id}`) 
    .then(res => res.json())
    .then(product => {
        document.getElementById('product_name').innerText = product.title;  
        document.getElementById('product_image').src = product.thumbnail;
        document.getElementById('product_description').innerText = product.description;
        document.getElementById('product_price').innerText = `$${product.price}`;

        const specslist = document.getElementById('product_specs');
        specslist.innerHTML = '';
        for (const [key, value] of Object.entries(product)) {
            if (['id', 'title', 'description', 'price', 'thumbnail', ].includes(key)) continue;
            const li = document.createElement('li');
            li.innerText = `${key}: ${value}`;
            specslist.appendChild(li);
        }
    })
    .catch(err => {
        console.error('Error fetching product details:', err);
    });
                                        