const popupContainer = document.createElement('div');
const popupDragger = document.createElement('div');

popupContainer.className = 'ewg-popup-container';
popupDragger.className = 'ewg-popup-dragger';

popupContainer.style.top = `${window.innerHeight}px`;

popupContainer.appendChild(popupDragger);
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
        popupContentElement[0].innerHTML = popupContent.innerHTML;
    } else {
        popupContainer.appendChild(popupContent);
        popupContainer.style.top = `${window.innerHeight - 360}px`;
        setEventListeners();
    }

    sendResponse('we got it!');
});


console.log('This is the extensions!!!!!!!!!');