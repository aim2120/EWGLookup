const removeFavorite = id => {
    chrome.storage.sync.remove(id);
};

const addProductHTMLToPage = (productID, html, savedProductsElement, containerElement) => {
    containerElement.innerHTML = html;
    const productElement = containerElement.children[0];
    productElement.getElementsByClassName('favorite-product')[0].addEventListener('click', e => removeFavorite(productID));
    productElement.classList.add(productID);
    savedProductsElement.appendChild(productElement);
};

const updatePopup = (changes) => {
    const savedProductsElement = document.getElementsByClassName('saved-products')[0];
    const productElementContainer = document.createElement('div'); // to temporarily hold the product html

    for (let [productID, { oldValue, newValue }] of Object.entries(changes)) {
        if (oldValue !== newValue) {
            if (oldValue) {
                [...savedProductsElement.getElementsByClassName(productID)].forEach(el => {
                    el.remove();
                });
            }
            if (newValue) {
                addProductHTMLToPage(productID, newValue, savedProductsElement, productElementContainer);
            }
        }
    }
};

chrome.storage.onChanged.addListener(updatePopup);

document.addEventListener('DOMContentLoaded', () => {
    const savedProductsElement = document.getElementsByClassName('saved-products')[0];
    const productElementContainer = document.createElement('div'); // to temporarily hold the product html

    chrome.storage.sync.get(products => {
        for (let [productID, html] of Object.entries(products)) {
            addProductHTMLToPage(productID, html, savedProductsElement, productElementContainer);
        }
    });
});