document.addEventListener('DOMContentLoaded', (event) => {
    fetch('/getProductServlet')
    .then(response => {
        if (!response.ok) { 
            throw new Error(response.statusText);
        }
        return response.json();
    })
    .then(products => {
        for (let product of products) {
            let cardHtml = createProductCard(product);
            document.querySelector('.cards').insertAdjacentHTML('beforeend', cardHtml);
        }

        // Set up event delegation for '.add-to-cart-btn' clicks
        document.querySelector('.cards').addEventListener('click', (event) => {
            if (event.target.matches('.add-to-cart-btn')) {
                // The '.add-to-cart-btn' was clicked
                let productID = Number(event.target.dataset.id); // Convert dataset.id to number
                let product = products.find(product => Number(product.ID) === productID); // Convert product.ID to number
                addToCart(product);
                event.target.disabled = true; // Disable the button
            }
        });
    })
    .catch(err => console.error(err));
});

function createProductCard(product) {
    return `
        <div class="product-card">
            <img src="/getImageServlet?ID=${product.ID}">
            <h3>${product.ID}</h3>
            <h3>${product.product_name}</h3>
            <p>${product.product_description}</p>
            <p>${product.product_price}</p>
            <select id="quantity${product.ID}" name="quantity">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
            </select>
            <button class="add-to-cart-btn" data-id="${product.ID}">Add to Cart</button>
        </div>
    `;
}

let cart = [];

function addToCart(product) {
    let quantityInput = document.querySelector(`#quantity${product.ID}`);
    product.quantity = quantityInput ? Number(quantityInput.value) : 1;
    product.original_price = product.product_price; // store the original price

    let existingProduct = cart.find(item => item.ID === product.ID);
    if (existingProduct) {
        existingProduct.quantity += product.quantity;
    } else {
        cart.push(product);
    }

    updateCartUI();
}

function updateCartUI() {
    let cartDiv = document.querySelector('.cart-items');
    let totalPrice = 0;
    cartDiv.innerHTML = '';

    cart.forEach((product, index) => {
        let totalProductPrice = product.original_price * product.quantity;
        totalPrice += totalProductPrice;

        let productHtml = `
            <div class="cart-item">
                <span class="product-name">${product.product_name}</span>
                <span class="product-quantity">
                    Quantity:
                    <button onclick="decreaseQuantity(${index})">-</button>
                    <span>${product.quantity}</span>
                    <button onclick="increaseQuantity(${index})">+</button>
                </span>
                <span>
                <button class="delete-btn" onclick="deleteFromCart(${index})">Delete</button>
                </span>
                <span class="product-price">${totalProductPrice.toFixed(2)}</span>
            </div>
        `;
        cartDiv.insertAdjacentHTML('beforeend', productHtml);
    });

    let totalPriceDisplay = document.querySelector('.total-price');
    totalPriceDisplay.textContent = `Total: $${totalPrice.toFixed(2)}`;
}

function increaseQuantity(index) {
    cart[index].quantity++;
    updateCartUI();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }
    updateCartUI();
}


function deleteFromCart(index) {
    let product = cart[index];

    // Find the 'add-to-cart-btn' for this product and re-enable it
    let addToCartBtn = document.querySelector(`.add-to-cart-btn[data-id="${product.ID}"]`);
    if (addToCartBtn) {
        addToCartBtn.disabled = false;
    }

    // Remove the product from the cart
    cart.splice(index, 1);
    updateCartUI();
}




function checkout() {
    let cartMap = {};
    for (let product of cart) {
        cartMap[product.ID] = product.quantity;
    }

    fetch('/orderServlet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartMap),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.text();
    })
    .then(result => {
        console.log(result);
        cart = []; // Clear the cart
        updateCartUI();
        window.location.href = "/dashboard"; // Redirect to dashboard page
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
