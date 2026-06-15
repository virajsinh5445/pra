// Main array to store products
let products = [];

// Variables to track editing state and sorting
let editingId = null;
let currentSortOrder = null; 

// DOM Elements - Form
const titleInput = document.querySelector('#title');
const priceInput = document.querySelector('#price');
const imageInput = document.querySelector('#image');
const categoryInput = document.querySelector('#category');
const submitBtn = document.querySelector('#submit-btn');

// DOM Elements - Controls & Display
const searchInput = document.querySelector('#search-input');
const filterCategory = document.querySelector('#filter-category');
const sortAscBtn = document.querySelector('#sort-asc-btn');
const sortDescBtn = document.querySelector('#sort-desc-btn');
const productsContainer = document.querySelector('#products-container');
const productCount = document.querySelector('#product-count');

// Load products when the page opens
window.addEventListener('DOMContentLoaded', loadProducts);

// Setup primary event listeners
submitBtn.addEventListener('click', function() {
    if (editingId === null) {
        addProduct();
    } else {
        updateProduct();
    }
});

searchInput.addEventListener('input', searchProducts);
filterCategory.addEventListener('change', filterProducts);
sortAscBtn.addEventListener('click', () => sortProducts('asc'));
sortDescBtn.addEventListener('click', () => sortProducts('desc'));

// --- CORE FUNCTIONS ---

function generateId() {
    // Generate a simple unique ID
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

function loadProducts() {
    const savedProducts = localStorage.getItem('productsData');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    // Render UI after loading
    displayProducts();
}

function saveProducts() {
    // Save data to local storage
    localStorage.setItem('productsData', JSON.stringify(products));
}

function addProduct() {
    // 1. Validate inputs
    const title = titleInput.value.trim();
    const price = parseFloat(priceInput.value);
    const image = imageInput.value.trim();
    const category = categoryInput.value;

    if (title === "") {
        alert("Please enter a product title.");
        return;
    }
    if (isNaN(price) || price <= 0) {
        alert("Please enter a valid price greater than 0.");
        return;
    }
    if (image === "") {
        alert("Please provide an image URL.");
        return;
    }
    if (category === "") {
        alert("Please select a category.");
        return;
    }

    // 2. Create product object
    const newProduct = {
        id: generateId(),
        title: title,
        price: price,
        image: image,
        category: category
    };

    // 3. Push to array and save
    products.push(newProduct);
    saveProducts();

    // 4. Update UI
    displayProducts();
    clearInputs();
}

function displayProducts() {
    // Before displaying, we apply any active search, filter, and sort
    let filteredProducts = getProcessedProducts();

    // Clear the container
    productsContainer.innerHTML = '';

    // Update count
    productCount.textContent = filteredProducts.length;

    // Check for empty state
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = `<div class="empty-state">No products found. Add some or change your search/filter!</div>`;
        return;
    }

    // Loop through array and build HTML dynamically
    for (let i = 0; i < filteredProducts.length; i++) {
        let product = filteredProducts[i];

        // Create the card div manually
        let card = document.createElement('div');
        card.className = 'product-card';

        // Set fallback image logic using inline onerror
        let fallbackImg = "https://via.placeholder.com/300x200?text=Image+Not+Found";
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.src='${fallbackImg}'">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                
                <div class="card-actions">
                    <button class="edit-btn" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteProduct('${product.id}')">Delete</button>
                </div>
            </div>
        `;

        // Append to container
        productsContainer.append(card);
    }
}

function clearInputs() {
    titleInput.value = '';
    priceInput.value = '';
    imageInput.value = '';
    categoryInput.value = '';
    
    // Reset state just in case
    editingId = null;
    submitBtn.textContent = 'Add Product';
    submitBtn.classList.remove('update-mode');
}

function editProduct(id) {
    // Find product to edit
    let productToEdit = null;
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            productToEdit = products[i];
            break;
        }
    }

    if (productToEdit !== null) {
        // Fill form inputs
        titleInput.value = productToEdit.title;
        priceInput.value = productToEdit.price;
        imageInput.value = productToEdit.image;
        categoryInput.value = productToEdit.category;

        // Change button behavior
        editingId = id;
        submitBtn.textContent = 'Update Product';
        
        // Scroll to top to see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateProduct() {
    // Validate again before updating
    const title = titleInput.value.trim();
    const price = parseFloat(priceInput.value);
    const image = imageInput.value.trim();
    const category = categoryInput.value;

    if (title === "" || isNaN(price) || price <= 0 || image === "" || category === "") {
        alert("Please fill out all fields correctly.");
        return;
    }

    // Find the product and update it
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === editingId) {
            products[i].title = title;
            products[i].price = price;
            products[i].image = image;
            products[i].category = category;
            break;
        }
    }

    // Save, Refresh, and Reset
    saveProducts();
    displayProducts();
    clearInputs();
}

function deleteProduct(id) {
    // Ask for confirmation
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    // Filter out the deleted product
    let updatedProducts = [];
    for (let i = 0; i < products.length; i++) {
        if (products[i].id !== id) {
            updatedProducts.push(products[i]);
        }
    }
    
    products = updatedProducts;
    
    // Save and refresh UI
    saveProducts();
    displayProducts();
}


// --- SEARCH, SORT & FILTER FUNCTIONS ---

// We trigger a display refresh whenever these change
function searchProducts() {
    displayProducts();
}

function filterProducts() {
    displayProducts();
}

function sortProducts(order) {
    currentSortOrder = order;
    displayProducts();
}

// Helper function to make Search + Filter + Sort work together
function getProcessedProducts() {
    let result = products;

    // 1. Filter by category
    const selectedCategory = filterCategory.value;
    if (selectedCategory !== 'All') {
        let categoryFiltered = [];
        for (let i = 0; i < result.length; i++) {
            if (result[i].category === selectedCategory) {
                categoryFiltered.push(result[i]);
            }
        }
        result = categoryFiltered;
    }

    // 2. Search by title (Case insensitive)
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm !== '') {
        let searchFiltered = [];
        for (let i = 0; i < result.length; i++) {
            if (result[i].title.toLowerCase().includes(searchTerm)) {
                searchFiltered.push(result[i]);
            }
        }
        result = searchFiltered;
    }

    // 3. Sort by numeric price
    if (currentSortOrder === 'asc') {
        result.sort(function(a, b) {
            return a.price - b.price;
        });
    } else if (currentSortOrder === 'desc') {
        result.sort(function(a, b) {
            return b.price - a.price;
        });
    }

    return result;
}