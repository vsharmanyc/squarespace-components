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
}

const tile = (index) => {
    const tile = createElement('div', { classList: 'tile' });
    const text = createElement('h1', { innerText: index });
    tile.appendChild(text)
    return tile
};

const tileList = (tiles = [], viewLimit = 3) => {
    // const view = tiles.slice(0, viewLimit);
    const spacing = '1.5rem'; // controls the spacing between tiles
    tiles.forEach(tile => {
        tile.style.minWidth = `calc(${100 / viewLimit}% - ${(viewLimit + 1) / viewLimit} * ${spacing})`;
        tile.style.marginLeft = spacing;
    })
    tiles[viewLimit - 1].style.marginRight = spacing;
    return tiles;
};

let tileListElement;

document.addEventListener('DOMContentLoaded', () => {
    const tiles = [];
    for (let i = 0; i < 10; i++) {
        tiles[i] = tile(i + 1);
    }
    tileListElement = document.querySelector('#carousel .tile-list');
    tileListElement.append(...tileList(tiles, 3));
})

const visibleStartIndex = 0;

const triggerTransitionEffect = () => {
    tileListElement.classList.remove('transition-effect');
    tileListElement.classList.add('transition-effect');
};

const prev = (event) => {
    tileListElement.style.transform = 'translate3d(0%, 0px, 0px)';
    triggerTransitionEffect();
}

const next = (event) => {
    tileListElement.style.transform = 'translate3d(-100%, 0px, 0px)';
    triggerTransitionEffect();
}