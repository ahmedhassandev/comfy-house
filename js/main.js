// start of variables
const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartDom = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDom = document.querySelector('.products-center')
let cart = [] // main cart
let buttons = [];
// end of variables

class Products { //getting the products 
    async getProducts() {
        try {
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(function(item) {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image };
            })
            return products;
        } catch (error) {
            console.log(error);

        }
    }
}

class UI { //display the products 
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src=${product.image} alt="product" class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                    add to bag
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
        </article>
            `;
        });
        productsDom.innerHTML = result;
    }
    getBagBtns() {
        var that = this;
        const btns = [...document.querySelectorAll('.bag-btn')];
        buttons = btns;
        btns.forEach(function(btn) {
            let id = btn.dataset.id;
            let inCart = cart.find(function(item) { item.id === id });
            if (inCart) {
                btn.innerText = 'In Cart';
                btn.disabled = true;
            }
            btn.addEventListener('click', (event) => {
                event.target.innerText = 'In Cart';
                event.target.disabled = true;
                // get products from products from local storage
                let cartItem = {...Storage.getProduct(id), amount: 1 };
                // add products to the cart 
                cart = [...cart, cartItem]

                // save products to the local storage 
                Storage.saveCart(cart);
                // set cart values to the cart icon
                that.setCartValues(cart);
                // display cart item 
                that.addCartItems(cartItem);
                // show cart items 
                that.showCart();

            })

        })
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map((item) => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        console.log(cartTotal, cartItems);
    }
    addCartItems(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
        `;
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('showCart');
    }
    setupApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', function() {
            cartOverlay.classList.remove('transparentBcg');
            cartDom.classList.remove('showCart');
        })
    }
    populateCart(cart) {
        cart.forEach((item) => {
            this.addCartItems(item)
        })
    }
    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
    }
    clearCart() {
        let cartItem = cart.map((item) => {
            item.id
        });
        cartItem.forEach(id => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }

    }
    removeItem(id) {
        cart = cart.filter(item => {
            item.id !== id;
        })
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
        add to bag`;
    }
    getSingleButton(id) {
        return buttons.find(button => button.dataset.id === id)
    }
}

class Storage { // local storage 
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));


        return products.find(products => products.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const ui = new UI(); // the instance from the UI class 
    const products = new Products(); // the instance from the Products class
    // setup App
    ui.setupApp();
    // get all products 
    products.getProducts().then(function(products) {
        ui.displayProducts(products)
        Storage.saveProducts(products);


    }).then(function() {
        ui.getBagBtns();
        ui.cartLogic();
    });

})