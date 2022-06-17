chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { data } = message;
    const domParser = new DOMParser;
    const html = domParser.parseFromString(data, 'text/html');

    const products = html.getElementsByClassName('product-tile');

    const response = {
        numProductsFound: products.length
    }

    sendResponse(response);

    for (const product of products) {
        const productCompany = product.getElementsByClassName('product-company')[0];
        const productName = product.getElementsByClassName('product-name')[0];
        console.log(productCompany.innerHTML);
        console.log(productName.innerHTML);
    }
});

console.log('This is the extensions!!!!!!!!!');
