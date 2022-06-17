const handleEWGResults = html => {
     const products = html.getElementsByClassName('product-tile');

    for (const product of products) {
        const productCompany = product.getElementsByClassName('product-company')[0];
        const productName = product.getElementsByClassName('product-name')[0];
        console.log(productCompany.innerHTML);
        console.log(productName.innerHTML);
    }

    return products.length;
};

const handleGoogleResults = html => {
    return 0;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { data, source } = message;
    const domParser = new DOMParser;
    const html = domParser.parseFromString(data, 'text/html');

    let numProductsFound = 0;

    if (source === 'EWG') {
        numProductsFound = handleEWGResults(html);
    } else {
        numProductsFound = handleGoogleResults(html);
    }

    const response = { numProductsFound };

    sendResponse(response);
});

console.log('This is the extensions!!!!!!!!!');
