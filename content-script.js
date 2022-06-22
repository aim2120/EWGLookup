const COPY = {
    noResultsText: 'Couldn\'t find anything for that, sorry...',
    favoriteButtonText: 'Add product to Saved Products',
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
        console.log('mousedown');
        isMovingEWGBorder = true;
    });

    popupDragger.addEventListener('mouseup', e => {
        console.log('mouseup');
        isMovingEWGBorder = false;
    });

    document.body.addEventListener('mousemove', e => {
        if (isMovingEWGBorder) {
            console.log('moving');
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

const getProductId = (productElement) => {
    const productCompany = productElement.getElementsByClassName('product-company')[0].textContent.trim();
    const productName = productElement.getElementsByClassName('product-name')[0].textContent.trim();
    const productID = `${productCompany.replaceAll(' ', '_')}-${productName.replaceAll(' ', '_')}`;
    return productID;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { results } = message;
    const { products } = results;

    const popupContent = document.createElement('div');
    popupContent.className = 'ewg-popup-content';


    const favoriteElement = document.createElement('img');
    favoriteElement.src = chrome.runtime.getURL('/images/heart_empty.svg');
    favoriteElement.alt = COPY.favoriteButtonText;
    favoriteElement.title = COPY.favoriteButtonText; 
    favoriteElement.className = 'favorite-product';

    const addFavorite = (id, element) => {
        element.getElementsByClassName('favorite-product')[0].src = chrome.runtime.getURL('/images/heart_red.svg');
        chrome.storage.sync.set({ [id]: element.outerHTML }, () => {});
    };

    const productElementContainer = document.createElement('div'); // to temporarily hold the product html

    for (let product of products) {
        productElementContainer.innerHTML = product;
        const productElement = productElementContainer.children[0];
        const productID = getProductId(productElement);

        const favoriteElementCopy = favoriteElement.cloneNode(true);
        favoriteElementCopy.addEventListener('click', e => addFavorite(productID, productElement));
        productElement.appendChild(favoriteElementCopy);
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
        popupContentElement[0].innerHTML = popupContent.innerHTML;
    } else {
        popupContainer.appendChild(popupContent);
        popupContainer.style.top = `${window.innerHeight - 360}px`;
        popupCloseButton.style.display = 'block';
        setEventListeners();
    }

    sendResponse('we got it!');
});


console.log('This is the extensions!!!!!!!!!');