import STRIPE_KEYS from "./stripe-keys.js"

const d = document,
$ramen = d.getElementById("ramen-section"),
$template = d.getElementById("ramen-template").content,
$fragment = d.createDocumentFragment(), 
fetchOptions = {
    headers: {
        Authorization: `Bearer ${STRIPE_KEYS.secret}`
    }
};

let prices, products;

const moneyFormat = (num) => {
    return `$${num.slice(0, -2) || 0}.${num.slice(-2)}`;
}

Promise.all([
    fetch("https://api.stripe.com/v1/products", fetchOptions),
    fetch("https://api.stripe.com/v1/prices", fetchOptions)
])

.then(responses => Promise.all(responses.map(res => res.json())))

.then(jsonsArray => {
    console.log(jsonsArray) //first console log
    products = jsonsArray[0].data;
    prices = jsonsArray[1].data;
    console.log(products, prices); //second console log

    prices.forEach(el => {
        let productData = products.filter(product => product.id === el.product);
        console.log(productData); //third console log

        $template.querySelector(".ramen-figure").setAttribute("data-price", el.id);
        $template.querySelector("img").src = productData[0].images[0];
        $template.querySelector("img").alt = productData[0].name;
        $template.querySelector("figcaption").innerHTML = `${productData[0].name} <br> ${el.currency} ${moneyFormat(el.unit_amount_decimal)} <br>`;

        let $clone = d.importNode($template, true);
        $fragment.appendChild($clone);
    });

    $ramen.appendChild($fragment);

})
.catch(err => {
    console.log(err);
    let message = err.statusText || "Ocurrió un error al conectarse con la API de Stripe";
    $ramen.innerHTML = `<p>Error ${err.status}: ${message}</p>`;
})


d.addEventListener("click", e => {
    if(e.target.matches(".ramen-figure *")) {
        let priceId = e.target.parentElement.getAttribute("data-price");
        Stripe(STRIPE_KEYS.public)
        .redirectToCheckout({
            lineItems: [{ price: priceId, quantity: 1 }],
        })
        .then(res => {
            if(res.error) {
                $ramen.insertAdjacentHTML("afterend", res.error.message);
            }   
        }) 
    }})