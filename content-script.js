const COPY = {
    noResultsText: 'Couldn\'t find anything for that, sorry...',
    favoriteButtonText: 'Add product to Saved Products',
    unfavoriteButtonText: 'Remove product from Saved Products',
    closeButtonText: 'Close window',
};

const popupContainer = document.createElement('div');
const popupDragger = document.createElement('div');
const popupCloseButton = document.createElement('img');

popupContainer.className = 'ewg-popup-container';
popupDragger.className = 'ewg-popup-dragger';
popupCloseButton.className = 'ewg-popup-close-button';

popupContainer.style.top = `${window.innerHeight}px`;
popupCloseButton.src = chrome.runtime.getURL('/images/closeButton.svg');
popupCloseButton.alt = COPY.closeButtonText;
popupCloseButton.title = COPY.closeButtonText;
popupCloseButton.style.display = 'none';

popupContainer.appendChild(popupDragger);
popupContainer.appendChild(popupCloseButton);
document.body.appendChild(popupContainer);

const setEventListeners = () => {
    let isMovingEWGBorder = false;

    popupDragger.addEventListener('mousedown', e => {
        isMovingEWGBorder = true;
    });

    popupDragger.addEventListener('mouseup', e => {
        isMovingEWGBorder = false;
    });

    document.body.addEventListener('mousemove', e => {
        if (isMovingEWGBorder) {
            popupContainer.style.top = e.clientY + 'px';
        }
    });

    popupCloseButton.addEventListener('click', e => {
        popupContainer.style.top = `${window.innerHeight}px`;
        popupCloseButton.style.display = 'none';

        const popupContentElement = document.getElementsByClassName('ewg-popup-content');

        if (popupContentElement.length > 0) {
            popupContainer.removeChild(popupContentElement[0]);
        }
    });
};

const getProductID = (productElement) => {
    const productID = productElement.getElementsByTagName('a')[0].href;
    return productID;
};

const getSavedProducts = async () => {
    return new Promise(resolve => {
        chrome.storage.sync.get(null, dict => {
            resolve(dict);
        });
    });
};

const removeFavorite = id => {
    chrome.storage.sync.remove(id);
};

const addFavorite = (id, element) => {
    chrome.storage.sync.set({ [id]: element.outerHTML }, () => { });
};

const changeProductToFavorite = (productElement, productID) => {
    const favoriteUnfavoriteContainerElement = productElement.getElementsByClassName('favorite-unfavorite-container')[0];
    favoriteUnfavoriteContainerElement.children[1].src = chrome.runtime.getURL('/images/heart_red.svg');
    favoriteUnfavoriteContainerElement.addEventListener('click', e => removeFavorite(productID));
    window.setTimeout(() => {
        favoriteUnfavoriteContainerElement.classList.add('favorited');
    }, 1000);
};

const changeProductToUnfavorite = (productElement, productID) => {
    const favoriteUnfavoriteContainerElement = productElement.getElementsByClassName('favorite-unfavorite-container')[0];
    favoriteUnfavoriteContainerElement.children[1].src = chrome.runtime.getURL('/images/heart_empty.svg');
    favoriteUnfavoriteContainerElement.addEventListener('click', e => addFavorite(productID, productElement));
    favoriteUnfavoriteContainerElement.classList.remove('favorited');
};

const createFavoriteUnfavoriteElement = () => {
    const unfavoriteElement = document.createElement('img');
    unfavoriteElement.alt = COPY.unfavoriteButtonText;
    unfavoriteElement.title = COPY.unfavoriteButtonText;
    unfavoriteElement.className = 'unfavorite-product';
    unfavoriteElement.src = chrome.runtime.getURL('/images/closeButton.svg');

    const favoriteElement = document.createElement('img');
    favoriteElement.alt = COPY.favoriteButtonText;
    favoriteElement.title = COPY.favoriteButtonText;
    favoriteElement.className = 'favorite-product';

    const favoriteUnfavoriteContainerElement = document.createElement('div');
    favoriteUnfavoriteContainerElement.className = 'favorite-unfavorite-container';

    favoriteUnfavoriteContainerElement.appendChild(unfavoriteElement);
    favoriteUnfavoriteContainerElement.appendChild(favoriteElement);

    return favoriteUnfavoriteContainerElement;
};

const populateSearchResults = async results => {
    const savedProducts = await getSavedProducts();
    const { products } = results;
    const popupContent = document.createElement('div');
    popupContent.className = 'ewg-popup-content';

    const productElementContainer = document.createElement('div'); // to temporarily hold the product html

    const favoriteUnfavoriteContainerElement = createFavoriteUnfavoriteElement();

    for (let product of products) {
        productElementContainer.innerHTML = product;
        const productElement = productElementContainer.children[0];

        const productID = getProductID(productElement);
        const favoriteUnfavoriteContainerElementCopy = favoriteUnfavoriteContainerElement.cloneNode(true);

        productElement.appendChild(favoriteUnfavoriteContainerElementCopy);
        productElement.classList.add(productID);

        if (productID in savedProducts) {
            changeProductToFavorite(productElement, productID);
        } else {
            changeProductToUnfavorite(productElement, productID);
        }

        popupContent.appendChild(productElement);
    }

    if (products.length === 0) {
        const noResultsElement = document.createElement('div');
        noResultsElement.class = 'no-results';
        noResultsElement.textContent = COPY.noResultsText;
        popupContent.appendChild(noResultsElement);
    }

    const popupContentElement = document.getElementsByClassName('ewg-popup-content');

    if (popupContentElement.length > 0) {
        popupContentElement[0].remove();
    } else {
        popupContainer.style.top = `${window.innerHeight - 360}px`;
        popupCloseButton.style.display = 'block';
        setEventListeners();
    }

    popupContainer.appendChild(popupContent);

    return new Promise(resolve => {
        resolve('content received results');
    });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { results } = message;
    populateSearchResults(results).then(returnMessage => sendResponse(returnMessage));
    return true;
});

const updateContent = (changes) => {
    for (let [productID, {oldValue, newValue}] of Object.entries(changes)) {
        const productElement = document.getElementsByClassName(productID)[0];

        if (productElement) {
            if (newValue) { // the product is saved
                changeProductToFavorite(productElement, productID);
            } else { // the product was removed
                changeProductToUnfavorite(productElement, productID);
            }
        }
    }
};

chrome.storage.onChanged.addListener(updateContent);