
class Product {
    constructor(name, price, quantity, imgUrl) {
        this.name = name;
        this.price = parseInt(price);
        this.quantity = parseInt(quantity);
        this.imgUrl = imgUrl;
    }
}

const products = [];
products.push(new Product("Zapatillas", 5500, 5, "https://static0.tiendeo.com.ar/upload_articulos/257825/e3af9bc1-80c2-5be5-8e48-848652227b5f.jpg"));
products.push(new Product("Remeras", 800, 10, "https://essential.vteximg.com.br/arquivos/ids/305737-1000-1000/266-0710_1.jpg?v=637112560190470000"));

const cart = [];

let inputStep = 0;
let newProduct = [];


const loadProducts = () => {
    const productsContainer = document.getElementById("products");

    productsContainer.innerHTML = "";

    for (let i = 0; i < products.length; i++) {

        productsContainer.innerHTML += `
        <div class="col-4 col-12-medium" id="product-${i}">
            <section class="box feature" style="border-radius: 10px;">
                <a href="#" class="image featured" style="border-top-left-radius: 10px;border-top-right-radius: 10px;border: 4px solid #ffffff;border-bottom: 4px solid #afafaf">
                    <img src="${products[i].imgUrl}" alt="${products[i].name}" />
                </a>
                <div class="inner" style="display:flex;justify-content:space-between;">
                    <header>
                        <h2>${products[i].name}</h2>
                        <p>Stock: ${products[i].quantity}</p>
                    </header>
                    <p style="font-size: 1.5em">$${products[i].price}</p>
                </div>
            </section>
        </div>`;

    }
}

const changeInputDescription = (description, step) => {
    document.getElementById("textDescription").innerHTML = description;
    document.getElementById("textStep").innerHTML = `${inputStep + 1}/4`;
}

const nextInput = () => {
    newProduct.push(document.getElementById("inputProduct").value);
    document.getElementById("inputProduct").value = "";

    if (inputStep < 3) {
        inputStep++;
    } else {
        inputStep = 0;
    }

    console.log(newProduct, inputStep);

    switch (inputStep) {
        case 0:
            changeInputDescription("Nombre del producto a agregar");
            products.push(new Product(newProduct[0], newProduct[1], newProduct[2], newProduct[3]));
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