const popupContainer = document.createElement('div');
const popupDragger = document.createElement('div');
const popupCloseButton = document.createElement('div');

const closeButtonSVG = `
<svg viewPort="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <line x1="1" y1="19" x2="19" y2="1" stroke="black" stroke-width="2"/>
  <line x1="1" y1="1" x2="19" y2="19" stroke="black" stroke-width="2"/>
</svg>
`;
const heartSVG = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" height="39" width="39" viewBox="-4 1 40 40">
  <path d="M 0 20 v -20 h 20 a 10 10 90 0 1 0 20 a 10 10 90 0 1 -20 0 z" stroke="rgb(17,17,17)" stroke-width="3" fill="red" transform="rotate(225,16,16)"></path>
</svg>
`;

popupContainer.className = 'ewg-popup-container';
popupDragger.className = 'ewg-popup-dragger';
popupCloseButton.className = 'ewg-popup-close-button';

popupContainer.style.top = `${window.innerHeight}px`;
popupCloseButton.style.display = 'none';
popupCloseButton.innerHTML = closeButtonSVG;

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

    const favoriteElement = document.createElement('div');
    favoriteElement.className = 'favorite-product';
    favoriteElement.innerHTML = heartSVG;

    const addFavorite = (id, value) => {
        chrome.storage.sync.set({ [id]: value }, () => {
            console.log(id + ' is set to ' + value);
        });
    };

    for (let product of products) {
        const productElementContainer = document.createElement('div');
        productElementContainer.innerHTML = product;
        const productElement = productElementContainer.children[0];
        const productID = getProductId(productElement);

        const favoriteElementCopy = favoriteElement.cloneNode(true);
        favoriteElementCopy.addEventListener('click', e => addFavorite(productID, productElement.outerHTML));
        productElement.appendChild(favoriteElementCopy);
        popupContent.appendChild(productElement);
    }

    if (products.length === 0) {
        popupContent.innerHTML += '<div class="no-results">Couldn\'t find anything for that, sorry...</div>';
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