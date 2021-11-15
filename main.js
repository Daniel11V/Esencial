
class Product {
    constructor(name, price, quantity, imgUrl) {
        this.name = name;
        this.price = parseInt(price);
        this.quantity = parseInt(quantity);
        this.imgUrl = imgUrl;
    }
}

let products = [];
let newProduct = [];

let cart = [];

let inputStep = 0;


const getData = () => {

    // getProducts
    let productsFromStorage = JSON.parse(localStorage.getItem("products"));
    console.log("productsFromStorage: ", productsFromStorage);

    if (!productsFromStorage) {
        productsFromStorage = [
            new Product("Zapatillas", 5500, 5, "https://static0.tiendeo.com.ar/upload_articulos/257825/e3af9bc1-80c2-5be5-8e48-848652227b5f.jpg"),
            new Product("Remeras", 800, 10, "https://essential.vteximg.com.br/arquivos/ids/305737-1000-1000/266-0710_1.jpg?v=637112560190470000")
        ];

        localStorage.setItem("products", JSON.stringify(productsFromStorage));
        console.log("EnJSON: ", JSON.stringify(productsFromStorage));
    }

    products = productsFromStorage;


    // getCart
    let cartFromStorage = JSON.parse(localStorage.getItem("cart"));

    if (!cartFromStorage) {
        cartFromStorage = [];

        localStorage.setItem("cart", JSON.stringify(cartFromStorage));
    }

    cart = cartFromStorage;

}

const loadProducts = () => {

    const productsContainer = document.getElementById("products");

    productsContainer.innerHTML = "";

    for (let i = 0; i < products.length; i++) {

        productsContainer.innerHTML += `
        <div class="col-4 col-12-medium" id="product-${i}">
            <section class="box feature" style="border-radius: 10px;position:relative;">
                <a href="#" class="image featured product-img">
                    <img src="${products[i].imgUrl}" alt="${products[i].name}" />
                </a>
                <div class="inner" style="display:flex;justify-content:space-between;">
                    <header>
                        <h2>${products[i].name}</h2>
                        <p>Stock: ${products[i].quantity}</p>
                    </header>
                    <div style="display: flex;flex-direction: column;align-items:end">
                        <span style="font-size: 1.5em;line-height:1em">$${products[i].price}</span>
                        <a href="javascript:addProductToCart(${i})"
                class="fas fa-cart-plus cart-button"></a>
                    </div>
                </div>
                <a href="javascript:deleteProduct(${i})"
                class="icon fas fa-times-circle delete-button"></a>
            </section>
        </div>`;

    }
}

const nextInput = () => {
    newProduct.push(document.getElementById("inputProduct").value);
    document.getElementById("inputProduct").value = "";

    if (inputStep < 3) {
        inputStep++;
    } else {
        inputStep = 0;
    }

    switch (inputStep) {
        case 0:
            changeInputDescription("Nombre del producto a agregar");
            products.push(new Product(newProduct[0], newProduct[1], newProduct[2], newProduct[3]));
            localStorage.setItem("products", JSON.stringify(products));
            newProduct = [];
            loadProducts();
            break;
        case 1:
            changeInputDescription("Precio del producto a agregar");
            break;
        case 2:
            changeInputDescription("Stock del producto a agregar");
            break;
        case 3:
            changeInputDescription("URL de la imagen del producto (en serio, de Google)");
            break;
        default:
            console.log("Paso Error");
    }
}

const changeInputDescription = (description, step) => {
    document.getElementById("textDescription").innerHTML = description;
    document.getElementById("textStep").innerHTML = `${inputStep + 1}/4`;
}

const deleteProduct = (id) => {
    products.splice(id, 1);
    document.getElementById("product-" + id).remove();
    localStorage.setItem("products", JSON.stringify(products));
}

const addProductToCart = (productId) => {

    let invalid, chosenQuantity;

    do {
        chosenQuantity = parseInt(prompt(`Indique cantidad deseada de ${products[productId].name} (${products[productId].quantity} disponibles):`));
        invalid = (chosenQuantity > products[productId].quantity);
    } while (invalid);

    if (chosenQuantity > 0) {
        if (confirm(`Se añadiran ${chosenQuantity} ${products[productId].name} al carrito.`)) {

            // Añadir al Carrito
            const indextProductInCart = cart.findIndex(product => product.name === products[productId].name);
            if (indextProductInCart === -1) {
                cart.push(new Product(
                    products[productId].name,
                    products[productId].price,
                    chosenQuantity,
                    products[productId].imgUrl
                ));
            } else {
                cart[indextProductInCart].quantity += chosenQuantity;
            }

            // Bajar cantidad disponible
            products[productId].quantity -= chosenQuantity;
            if (!products[productId].quantity) {
                products.splice(productId, 1);
            }

            loadProducts();
            loadCart();
            localStorage.setItem("products", JSON.stringify(products));
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }
}

const deleteProductFromCart = (productId) => {

    let chosenQuantity, invalid;

    do {
        chosenQuantity = parseInt(prompt(`Indique cuantas ${cart[productId].name} quitar (${cart[productId].quantity} en el carrito):`));
        invalid = (chosenQuantity > cart[productId].quantity);
    } while (invalid);

    if (chosenQuantity > 0) {
        if (confirm(`Se quitaran ${chosenQuantity} ${cart[productId].name} del carrito.`)) {

            // Subir cantidad disponible
            const indextProductInProducts = products.findIndex(product => product.name === cart[productId].name);
            console.log(indextProductInProducts);
            if (indextProductInProducts == -1) {
                products.push(new Product(
                    cart[productId].name,
                    cart[productId].price,
                    chosenQuantity,
                    cart[productId].imgUrl
                ));
            } else {
                products[indextProductInProducts].quantity += chosenQuantity;
            }

            // Quitar del Carrito
            cart[productId].quantity -= chosenQuantity;
            if (!cart[productId].quantity) {
                cart.splice(productId, 1);
            }

            loadProducts();
            loadCart();
            localStorage.setItem("products", JSON.stringify(products));
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }
}

const loadCart = () => {

    let totalPrice = 0;

    const cartContainer = document.getElementById("cart");
    cartContainer.innerHTML = "";

    for (let i = 0; i < cart.length; i++) {

        totalPrice += (cart[i].price * cart[i].quantity);

        cartContainer.innerHTML += `
        <div class="col-6" id="product-cart-${i}">
            <a href="javascript:deleteProductFromCart(${i})" class="image fit" style="position:relative;height: 5em;">
                <img src="${cart[i].imgUrl}" alt="${cart[i].name}" />
                <div id="product-cart-text">
                    <p>${cart[i].name}</p>
                    <span>$${cart[i].price}</span>
                    <span>x${cart[i].quantity}</span>
                    <i id="delete-cart-button" class="far fa-minus-square"></i>
                </div>
            </a>
        </div>`;

    }

    document.getElementById("cart-total").innerHTML = "TOTAL: $" + totalPrice;
}

window.onload = () => {
    getData();
    loadProducts();
    loadCart();

    // EventListeners

    document.getElementById("nextInput").addEventListener("click", () => nextInput());
    document.getElementById("inputProduct").addEventListener("keyup", event => {
        if (event.keyCode === 13) {
            nextInput();
        }
    });

    document.getElementById("performPurchase").addEventListener("click", () => {
        cart.splice(0, cart.length);

        alert("Felicidades, a realizado su compra con exito!");

        loadCart();
        localStorage.setItem("cart", JSON.stringify([]));
    });

};