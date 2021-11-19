
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

let suggestions = [];

let cart = [];

let inputStep = 0;


const getDataFromAPI = () => {
    const APIURL = "https://servicios.neunapp.com/api/tienda/productos/lista/";

    $.get(APIURL, (respuesta, estado) => {
        if (estado === "success") {
            let newSuggestions = respuesta.results;

            for (const product of newSuggestions) {
                suggestions.push(new Product(product.name, product.price.replace('.', ''), product.visits, product.main_image))
            }

            loadProducts(false, suggestions, "suggestions");
        }
    });
}

const getDataFromLocalStorage = () => {

    // getProducts
    let productsFromStorage = JSON.parse(localStorage.getItem("products"));

    if (!productsFromStorage) {
        productsFromStorage = [
            new Product("Zapatillas", 5500, 5, "https://static0.tiendeo.com.ar/upload_articulos/257825/e3af9bc1-80c2-5be5-8e48-848652227b5f.jpg"),
            new Product("Remeras", 800, 10, "https://essential.vteximg.com.br/arquivos/ids/305737-1000-1000/266-0710_1.jpg?v=637112560190470000")
        ];

        localStorage.setItem("products", JSON.stringify(productsFromStorage));
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


const loadProducts = (saveInLocalStorage, prodArray = products, nameArray = "products") => {

    $("#" + nameArray).empty();

    for (let i = 0; i < prodArray.length; i++) {

        $("#" + nameArray).append(`
        <div class="col-4 col-12-medium" id="${(nameArray === "products") ? "product" : "suggestion"}-${i}">
            <section class="box feature" style="border-radius: 10px;position:relative;">
                <a href="javascript:void(0)" class="image featured product-img">
                    <img src="${prodArray[i].imgUrl}" alt="${prodArray[i].name}" />
                </a>
                <div class="inner" style="display:flex;justify-content:space-between;">
                    <header>
                        <span class="product-title">${prodArray[i].name}</span>
                        <p>Stock: ${prodArray[i].quantity}</p>
                    </header>
                    <div style="display: flex;flex-direction: column;align-items:end">
                        <span style="font-size: 1.5em;line-height:1em">$${prodArray[i].price}</span>
                        <a href="javascript:void(0)"
                class="fas fa-${(nameArray === "products") ? "cart-plus cart" : "cloud-download-alt save"}-button action-button"></a>
                    </div>
                </div>
                ${(nameArray === "products") ?
                `<a href="javascript:void(0)"
                class="icon fas fa-times-circle delete-button"></a>`
                : ""}
            </section>
        </div>`);

    }

    if (saveInLocalStorage) {
        localStorage.setItem(nameArray, JSON.stringify(prodArray));
    }

    //// Product Card Listeners
    $(".delete-button").click((e) => {
        const productId = $(e.target).closest(".col-12-medium").attr('id').replace("product-", '');
        deleteProduct(parseInt(productId));
    });

    $(".action-button").click((e) => {
        const productId = $(e.target).closest(".col-12-medium").attr('id');
        if (productId.includes("product")) {
            addProductToCart(parseInt(productId.replace("product-", '')));
        } else {
            addSuggestionToProducts(parseInt(productId.replace("suggestion-", '')));
        }
    });
}


const nextInput = () => {
    newProduct.push($("#inputProduct").val());
    $("#inputProduct").val("");

    if (inputStep < 3) {
        inputStep++;
    } else {
        inputStep = 0;
    }

    switch (inputStep) {
        case 0:
            changeInputDescription("Nombre del producto a agregar");
            products.push(new Product(newProduct[0], newProduct[1], newProduct[2], newProduct[3]));
            newProduct = [];
            loadProducts(true);
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

const changeInputDescription = description => {
    $("#textDescription").text(description);
    $("#textStep").text(`${inputStep + 1}/4`);
}

const deleteProduct = async (id) => {
    if (await askWithModal("confirm", `Eliminar el producto ${products[id].name}?`)) {
        products.splice(id, 1);
        $("#product-" + id).remove();
        localStorage.setItem("products", JSON.stringify(products));
    }
}

const askWithModal = (type, description, notFadeIn, notFadeOut) => {
    $(".modal-window input").val("");
    let toFocus;

    if (type === "input") {
        $(".modal-window input").show();
        $("#modal-btn-cancel").show();
        $("#modal-btn-confirm").text("Confirmar");
        toFocus = ".modal-window input";
    } else if (type === "confirm") {
        $(".modal-window input").hide();
        $("#modal-btn-cancel").show();
        $("#modal-btn-confirm").text("Confirmar");
        toFocus = "#modal-btn-confirm";
    } else if (type === "notification") {
        $(".modal-window input").hide();
        $("#modal-btn-cancel").hide();
        $("#modal-btn-confirm").text("Aceptar");
        toFocus = "#modal-btn-confirm";
    }

    $(".modal-window h1").text(description);
    if (!notFadeIn) $(".modal-window").fadeIn(150);
    $(toFocus).focus();

    return new Promise((res, rej) => {

        // Cancel
        $("#modal-btn-cancel").unbind().click(() => {
            $(".modal-window").fadeOut(200);

            res(0);
        });

        // Confirm
        const confirmFunction = () => {
            if (!notFadeOut) $(".modal-window").fadeOut(200);

            if (type === "input") res(parseInt($("#input-modal").val()));
            if (type === "confirm") { $("#modal-btn-confirm").off("focus"); res(1) };
        }

        $("#modal-btn-confirm").unbind().click((e) => confirmFunction());
        $(".modal-window").unbind().keyup(e => { if (e.key === "Enter") confirmFunction() });

    });

}

const addProductToCart = async (productId) => {

    let invalid, chosenQuantity;

    do {
        chosenQuantity = await askWithModal("input", `Indique cantidad deseada de ${products[productId].name} (${products[productId].quantity} disponibles):`, false, true);
        invalid = (chosenQuantity > products[productId].quantity);
    } while (invalid);

    if (chosenQuantity > 0) {
        if (await askWithModal("confirm", `Se añadiran ${chosenQuantity} ${products[productId].name} al carrito.`, true)) {

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

            loadProducts(true);
            loadCart(true);
        }
    }
}


const addSuggestionToProducts = async (productId) => {
    if (await askWithModal("confirm", `Se añadira ${suggestions[productId].name} a la lista de tus productos.`, false, true)) {

        // Añadir a Productos
        const indextOfSuggestionInProducts = products.findIndex(product => product.name === suggestions[productId].name);
        if (indextOfSuggestionInProducts === -1) {
            products.push(new Product(
                suggestions[productId].name,
                suggestions[productId].price,
                suggestions[productId].quantity,
                suggestions[productId].imgUrl
            ));
            askWithModal("notification", `El producto se añadio a su lista y ya esta disponible para su compra.`, true);
        } else {
            askWithModal("notification", `El producto ya se encontraba en su lista.`, true);
        }

        loadProducts(true);
    }
}

const deleteProductFromCart = async (productId) => {

    let chosenQuantity, invalid;

    do {
        chosenQuantity = await askWithModal("input", `Indique cuantas ${cart[productId].name} quitar (${cart[productId].quantity} en el carrito):`, false, true);
        invalid = (chosenQuantity > cart[productId].quantity);
    } while (invalid);

    if (chosenQuantity > 0) {
        if (await askWithModal("confirm", `Se quitaran ${chosenQuantity} ${cart[productId].name} del carrito.`, true)) {

            // Subir cantidad disponible
            const indextProductInProducts = products.findIndex(product => product.name === cart[productId].name);
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

            loadProducts(true);
            loadCart(true);
        }
    }
}

const loadCart = (saveInLocalStorage) => {

    let totalPrice = 0;

    $("#cart").empty();

    for (let i = 0; i < cart.length; i++) {

        totalPrice += (cart[i].price * cart[i].quantity);

        $("#cart").append(`
        <div class="col-6" id="product-cart-${i}">
            <a href="javascript:void(0)" class="image fit" style="position:relative;height: 5em;">
                <img src="${cart[i].imgUrl}" alt="${cart[i].name}" />
                <div id="product-cart-text">
                    <p>${cart[i].name}</p>
                    <span>$${cart[i].price}</span>
                    <span>x${cart[i].quantity}</span>
                    <i id="delete-cart-button" class="far fa-minus-square"></i>
                </div>
            </a>
        </div>`);

    }

    $("#cart-total").text("TOTAL: $" + totalPrice);

    if (saveInLocalStorage) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    //// Cart Listener
    $("#cart a.image.fit").click((e) => {
        const productId = $(e.target).closest(".col-6").attr('id').replace("product-cart-", '');
        deleteProductFromCart(parseInt(productId));
    });

    $("#performPurchase").click(() => {
        cart.splice(0, cart.length);

        askWithModal("notification", "Felicidades, a realizado su compra con exito!");

        loadCart(true);
    });

}

$(document).ready(() => {
    getDataFromAPI();
    getDataFromLocalStorage();
    loadProducts(false, products, "products");
    loadCart(false);

    //// New Product Listener
    $("#nextInput").click(() => nextInput());

    $("#inputProduct").keyup(event => {
        if (event.key === "Enter") nextInput();
    });

});