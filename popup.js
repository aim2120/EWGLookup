const COPY = {
    unfavoriteButtonText: 'Remove product from Saved Products',
};

const removeFavorite = id => {
    chrome.storage.sync.remove(id);
};

const changeProductToFavorite = (productElement, productID) => {
    const favoriteUnfavoriteContainerElement = productElement.getElementsByClassName('favorite-unfavorite-container')[0];
    favoriteUnfavoriteContainerElement.children[1].src = chrome.runtime.getURL('/images/heart_red.svg');
    favoriteUnfavoriteContainerElement.addEventListener('click', e => removeFavorite(productID));
    favoriteUnfavoriteContainerElement.classList.add('favorited');
};

const getProductElementFromHTML = html => {
    const containerElement = document.createElement('div'); // to temporarily hold the product html
    containerElement.innerHTML = html;
    return containerElement.children[0];
};

const makeLinksWork = element => {
    const anchors = element.getElementsByTagName('a');
    for (let anchor of anchors) {
        anchor.addEventListener('click', e => {
            chrome.tabs.update({
                url: anchor.href,
            });
        });
    }
};

const updatePopup = (changes) => {
    const savedProductsElement = document.getElementsByClassName('saved-products')[0];

    for (let [productID, { oldValue, newValue }] of Object.entries(changes)) {
        if (oldValue !== newValue) {
            if (oldValue) {
                [...savedProductsElement.getElementsByClassName(productID)].forEach(el => {
                    el.remove();
                });
            }
            if (newValue) {
                const productElement = getProductElementFromHTML(newValue);
                changeProductToFavorite(productElement, productID);
                makeLinksWork(productElement);
                savedProductsElement.appendChild(productElement);
            }
        }
    }
};

chrome.storage.onChanged.addListener(updatePopup);

document.addEventListener('DOMContentLoaded', () => {
    const savedProductsElement = document.getElementsByClassName('saved-products')[0];

    chrome.storage.sync.get(products => {
        for (let [productID, html] of Object.entries(products)) {

            const productElement = getProductElementFromHTML(html);
            changeProductToFavorite(productElement, productID);
            makeLinksWork(productElement);
            savedProductsElement.appendChild(productElement);
        }
    });
});