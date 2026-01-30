let currPage = 1;
let itemsPerPage = 12;
let allProducts = [];

let container = document.getElementById("container");
let prevBtn = document.getElementById("prevBtn");
let nextBtn = document.getElementById("nextBtn");
let pageInfo = document.getElementById("pageInfo");

function renderProducts() {
    container.innerHTML = "";
    let start = (currPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let productsToShow = allProducts.slice(start, end);

    productsToShow.forEach(product => {
    let div = document.createElement("div");
    div.className = "product-card"; // Apply the CSS class

    let img = document.createElement("img");
    img.src = product.images[0];
    img.alt = product.title;
    img.style.width = "100%";
    img.style.height = "150px";
    img.style.objectFit = "contain"; // "contain" looks better for varying image sizes
    img.style.marginBottom = "10px";

    let title = document.createElement("h3");
    title.style.fontSize = "1.1rem";
    title.style.margin = "10px 0";
    title.innerText = product.title;

    let desc = document.createElement("p");
    desc.style.fontSize = "0.9rem";
    desc.style.color = "#666";
    desc.style.flexGrow = "1"; // Pushes price to the bottom
    desc.innerText = product.description.substring(0, 60) + "...";

    let price = document.createElement("p");
    price.innerText = `Price: $${product.price}`;
    price.style.color = "#dc2626";
    price.style.fontWeight = "bold";
    price.style.marginTop = "10px";

    div.appendChild(img);
    div.appendChild(title);
    div.appendChild(desc);
    div.appendChild(price);

    container.appendChild(div);
});

    pageInfo.innerText = `Page ${currPage} of ${Math.ceil(allProducts.length / itemsPerPage)}`;

    prevBtn.disabled = currPage === 1;
    nextBtn.disabled = currPage === Math.ceil(allProducts.length / itemsPerPage);
}


fetch("https://dummyjson.com/products")
    .then(res => res.json())
    .then(data => {
        allProducts = data.products;
        console.log(allProducts);
        if (allProducts.length == 0) {
            container.innerHTML = "<p>No products available.</p>";
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            pageInfo.innerText = "";
        } else {
            renderProducts();
        }
    });

prevBtn.addEventListener("click", () => {
    if (currPage > 1) {
        currPage--;
        renderProducts();
    }
});

nextBtn.addEventListener("click", () => {
    if (currPage < Math.ceil(allProducts.length / itemsPerPage)) {
        currPage++;
        renderProducts();
    }
});