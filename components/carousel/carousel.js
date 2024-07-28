// declare state variables
const viewLimit = 3; // sets the max numnber of tiles to be visible at all times
let visibleStartIndex = 0; // index of the first visible tile
let tileListElement; // reference to the tile list html element

// const src='https://images.squarespace-cdn.com/content/v1/6302837d1ce871273c7849b4/1661109136267-I4W0ZCFB7IG0YHZPLDRV/Sri-Ramakrishna.jpg?format=750w';

// const descriptionHTMLData = `
//     <h1>Gospel of Sri Ramakrishna</h1>
//     <h1>Swami Sarvapriyananda<h1>
//     <p> 
//         Tuesdays - 7:30 PM EST</br>
//         In-person only.</br>
//         No registration needed.</br>
//         Currently suspended and will resume in late September.
//     </p>
// `;

const createElement = (tag, properties = {}) => {
    const element = document.createElement(tag);
    Object.entries(properties).forEach(([key, value]) => element[key] = value );
    return element;
};

const tile = (index) => {
    const tile = createElement('div', { classList: 'tile' });
    const text = createElement('h1', { innerText: index });
    tile.appendChild(text)
    return tile
};

const tileList = (tiles = []) => {
    // const view = tiles.slice(0, viewLimit);
    const spacing = '1.5rem'; // controls the spacing between tiles
    tiles.forEach(tile => {
        tile.style.minWidth = `calc(${100 / viewLimit}% - ${(viewLimit + 1) / viewLimit} * ${spacing})`;
        tile.style.marginLeft = spacing;
    })
    tiles[tiles.length - 1].style.marginRight = spacing;
    return tiles;
};

document.addEventListener('DOMContentLoaded', () => {
    const tiles = [];
    for (let i = 0; i < 10; i++) {
        tiles[i] = tile(i + 1);
    }
    tileListElement = document.querySelector('#carousel .tile-list');
    tileListElement.append(...tileList(tiles));
});

const triggerTransitionEffect = () => {
    tileListElement.classList.remove('transition-effect');
    tileListElement.classList.add('transition-effect');
};

// replicated prev and next functionality using ux from  https://primeng.org/carousel as a reference

const prev = () => {
    const children = tileListElement.children;
    if (visibleStartIndex - viewLimit < 0) return;

    // special case to always ensure viewLimit number tiles in view
    if (visibleStartIndex % viewLimit != 0) {
        visibleStartIndex -= visibleStartIndex % viewLimit;
    } else {
        visibleStartIndex -= viewLimit;
    }
    const offset = children[0].getBoundingClientRect().x - children[visibleStartIndex].getBoundingClientRect().x;
    tileListElement.style.transform = `translate3d(${offset}px, 0px, 0px)`;
    triggerTransitionEffect();
};

const next = () => {
    const children = tileListElement.children;
    if (visibleStartIndex + viewLimit >= children.length) return;

    visibleStartIndex += viewLimit;
    // special case to always ensure viewLimit number tiles in view
    if (children.length - visibleStartIndex < viewLimit) {
        visibleStartIndex -= viewLimit - (children.length - visibleStartIndex);
    }
    const offset = children[0].getBoundingClientRect().x - children[visibleStartIndex].getBoundingClientRect().x;
    tileListElement.style.transform = `translate3d(${offset}px, 0px, 0px)`;
    triggerTransitionEffect();
};