const popupContainer = document.createElement('div');
const popupDragger = document.createElement('div');

popupContainer.className = 'ewg-popup-container';
popupContainer.style.top = `${window.innerHeight}px`;
popupDragger.className = 'ewg-popup-dragger';

popupContainer.appendChild(popupDragger);
document.body.appendChild(popupContainer);

const setEventListeners = () => {
    let isMovingEWGBorder = false;

    popupDragger.addEventListener('mousedown', e => {
        console.log('mousedown');
        isMovingEWGBorder = true;
    });

    document.body.addEventListener('mouseup', e => {
        console.log('mouseup');
        isMovingEWGBorder = false;
    });

    document.body.addEventListener('mousemove', e => {
        if (isMovingEWGBorder) {
            console.log('moving');
            popupContainer.style.top = e.offsetY + 'px';
        }
    });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { results } = message;
    const { products } = results;

    const popupContent = document.createElement('div');
    popupContent.className = 'ewg-popup-content';

    for (let product of products) {
        popupContent.innerHTML += product;
    }

    if (products.length === 0) {
        popupContent.innerHTML += '<h1>Couldn\'t find anything for that, sorry...</h1>';
    }

    const popupContentElement = document.getElementsByClassName('ewg-popup-content');

    if (popupContentElement.length > 0) {
        popupContentElement[0].innerHTML = popup.innerHTML;
    } else {
        popupContainer.appendChild(popupContent);
        popupContainer.style.top = `${window.innerHeight - 360}px`;
        //setEventListeners();
    }

    sendResponse('we got it!');
});


console.log('This is the extensions!!!!!!!!!');