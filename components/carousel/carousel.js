const src='https://images.squarespace-cdn.com/content/v1/6302837d1ce871273c7849b4/1661109136267-I4W0ZCFB7IG0YHZPLDRV/Sri-Ramakrishna.jpg?format=750w';

const descriptionHTMLData = `
    <h1>Gospel of Sri Ramakrishna</h1>
    <h1>Swami Sarvapriyananda<h1>
    <p> 
        Tuesdays - 7:30 PM EST</br>
        In-person only.</br>
        No registration needed.</br>
        Currently suspended and will resume in late September.
    </p>
`;

const displayPicture = () => {
    const img = document.createElement('img');
    img.src = src;
    img.classList.add('display-picture');
    return img;
};

const tile = (descriptionHTML) => {
    const tile = document.createElement('div');
    tile.classList.add('tile', 'align-center');
    tile.appendChild(displayPicture());
    const description = document.createElement('p');
    description.classList.add('tileDescription');
    description.innerHTML = descriptionHTML;
    tile.appendChild(description);
    return tile;
}

const tileList = () => {
    const list = document.createElement('div');
    list.classList.add('tileList');
    for (let i = 1; i <= 10; i++) {
        list.appendChild(tile(`<h1>${i}<h1>` + descriptionHTMLData));
    }
    return list;
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.append(tileList());
})