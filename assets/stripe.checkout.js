import STRIPE_KEYS from "./stripe-keys.js"

const d = document,
$ramen =d.getElementById("ramen"),
$template = d.getElementById("ramen-template").content,
$fragment = d.createDocumentFragment(), 
fetchOptions = {
    headers: {
        Authorization: `Bearer ${STRIPE_KEYS.secret}`
    }
};

let prices, products;

Promise.all([
    fetch("https://api.stripe.com/v1/products", fetchOptions),
    fetch("https://api.stripe.com/v1/prices", fetchOptions)
]).then(responses => Promise.all(responses.map(res => res.json())))
.then(json => {
    console.log(json)
    products = json[0].data;
    prices = json[1].data;
    console.log(products, prices);

    prices.forEach(el => {
        let productData = products.filter(product => product.id === el.product);
        console.log(productData);

        $template.querySelector(".ramen").setAttribute("data-price", el.id);
        $template.querySelector("img").src = productData[0].images[0];
        $template.querySelector("img").alt = productData[0].name;
        $template.querySelector("figcaption").innerHTML = `${productData[0].name} <br> ${el.currency} ${el.unit_amount_decimal} <br>`;

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