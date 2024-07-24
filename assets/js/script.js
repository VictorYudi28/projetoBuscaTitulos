const keyApi = 'ab9fe8e9';
const input = document.getElementById('search-input');
const button = document.getElementById('search-button');
const main = document.querySelector('main');
const favoritesButtonPrin = document.querySelector('.favorites-button');

document.body.addEventListener('keydown',(event)=>{

    if(event.key === 'Enter'){
        checkTitle();
        addVHidden();
    }
    
});

button.addEventListener('click',checkTitle);
favoritesButtonPrin.addEventListener('click',showFavorites);

function checkTitle(){

    if(input.value === ''){
        showMsg('Enter a Title');
    }else{
        searchTitleApi(input.value);
        addVHidden();
    }

}

async function searchTitleApi(title){

    try{

        main.innerHTML = '';

        let req = await fetch(`https://www.omdbapi.com/?s=${encodeURI(title).trim()}&apikey=${keyApi}`);
        let data = await req.json();

        let listTitles = data.Search;

        if(data.Response === 'True'){

            showTitle(listTitles);

        }else{

            showMsg('Title not found');
        
        }
        
    }catch(error){

        console.error();

    }

}

function showMsg(msg){
    
    main.innerHTML = 
    `<div class="title-not-found">
            <h1>${msg}</h1>
            <i class="fa-solid fa-film icon-film"></i>
    </div>`;

}

async function showTitle(listTitles){

    listTitles.forEach( title => {

        main.innerHTML += 

        `
        <div class="title-card">
            <img src="${title.Poster}" alt="title image: ${title.Title}" class="poster">
            <h1 class="title">${title.Title}</h1>
            <p class="date">${title.Year}</p>
            <input type="hidden" id="idTitulo" value="${title.imdbID}">
            <button class="none remove-from-favorites">To remove <i class="fa-solid fa-circle-minus"></i></button>
        </div>

        `

   });

   checkCard();

};

async function checkCard(){

    let cards = document.querySelectorAll('.title-card');
    
    cards.forEach(card => {
        
        card.addEventListener('click',(event)=>{

            searchClickedTitle(event.currentTarget);

        });

    });

}

async function searchClickedTitle(cardTitle){

    const id = getTitleId(cardTitle);

    let req = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${keyApi}`);
    let data = await req.json();

    showTitleClicked(data);
    checkSavesTitulos(data.Title);

}

function getTitleId(card){

    return card.querySelector('input[type=hidden]').value;

}

async function showTitleClicked(title){

    let cards = document.querySelectorAll('.title-card');
    let editButton = document.getElementById('edit-button');

    if(editButton){
        editButton.classList.add('v-hidden');
    }

    for (let i = 0; i < cards.length; i++) {
        
        cards[i].style.display = 'none';
        
    };

    main.innerHTML = 
    `<div class="title-container">
            <img src="${title.Poster}" alt="title image: ${title.Title}" class="img-title">
            <div class="title-information">
                    <div class="title-and-save">
                        <h1 class="title">${title.Title}</h1>
                        <button class="save-button"> Favorites <i class="fa-regular fa-bookmark save"></i> <i class="none-icon fa-solid fa-bookmark save-black"></i> </button>
                    </div>
                    <h3 class="date-place-note">${title.Year} | ${title.Country} | Rating Imdb - <span class="rating">${title.imdbRating}</span>/10</h3>
                    <div class="film-production">
                        <p class="actors"> <strong>Actors:</strong> ${title.Actors}</p>
                        <p class="director"> <strong>Director:</strong> ${title.Director === 'N/A' ? "No director" : title.Director}</p>
                        <p class="whiters"> <strong>Whiters:</strong> ${title.Writer}</p>
                    </div>
                    <div class="additional-information">
                        <p class="genre"><strong>Genre:</strong> ${title.Genre}</p>
                        <p class="release-date"><strong>Release Date:</strong> ${title.Released}</p>
                        <p class="box-office"><strong>BoxOffice:</strong> ${title.BoxOffice}</p>
                        <p class="movie-runtime"><strong>Movie Runtime:</strong> ${title.Runtime}</p>
                    </div>
                <p class="title-description">${title.Plot}</p>
            </div>
    </div>`
    
    const favoritesButton = document.querySelector('.save-button');
    favoritesButton.classList.add('black-color');

    if(favoritesButton.addEventListener('click',()=>{
        addToFavorites(favoritesButton,title);
    }));

}

async function addToFavorites(favoritesButton,title){

    localStorage.setItem(title.Title,title.imdbID);
    changeSaveIcon(favoritesButton);

}

function changeSaveIcon(button){

    let save = button.querySelector('.save');
    let saveBlack = button.querySelector('.save-black');

    if(saveBlack.classList.contains('none-icon')){
        save.style.display = 'none';
        saveBlack.style.display = '';
        saveBlack.style.fontSize = '13px';
    }

}

async function checkSavesTitulos(typedTitle){

    for(let i = 0; i < localStorage.length; i++){

        let key = localStorage.key(i);

        if(key === typedTitle){

            document.querySelector('.save').style.display = 'none';
            document.querySelector('.save-black').style.fontSize = '13px';
            document.querySelector('.save-button').style.cursor = 'default';

        }

    }

}

async function showFavorites(){

    main.innerHTML = '';
    let title,req,data;
    let favoritesTitles = [];

    if(localStorage.length == 0){
        showMsg("You haven't added any titles to your favorites");
    }else{

       for(let i = 0; i < localStorage.length; i++){

            title = localStorage.key(i);
            req = await fetch(`https://www.omdbapi.com/?t=${encodeURI(title).trim()}&apikey=${keyApi}`);
            data = await req.json();

            favoritesTitles.push(data)

       }

       showTitle(favoritesTitles);
       const editButton = document.querySelector('#edit-button');
       editButton.classList.remove('v-hidden');
       editButton.style.color = '#FFF';
       editButton.style.backgroundColor = '#000';
       editButton.addEventListener('click',()=>{editFavoriteTitles(editButton)})

    }

}

function editFavoriteTitles(editButton){

    changeButton(editButton);
    let buttonRemoveFromFavorites = document.querySelectorAll('.remove-from-favorites');
    
    for(let i = 0; i < buttonRemoveFromFavorites.length; i++){

        buttonRemoveFromFavorites[i].classList.remove('none');

        buttonRemoveFromFavorites[i].addEventListener('click',()=>{
            let titleToBeRemoved = buttonRemoveFromFavorites[i].parentNode.querySelector('.title').innerText;
            removeToFavorites(titleToBeRemoved);
        });

    }

}

function removeToFavorites(titleToBeRemoved){

    for(let i = 0; i < localStorage.length; i++){

        let key = localStorage.key(i);

        if(key === titleToBeRemoved){

            localStorage.removeItem(key);

        }

    }

    window.location.href = 'index.html';

}

function changeButton(editButton){

    editButton.style.color = '#000';;
    editButton.style.border = '1px solid #000';
    editButton.style.backgroundColor = 'transparent';

}


function addVHidden(){

    const editButton = document.querySelector('#edit-button');
    if(editButton){
        editButton.classList.add('v-hidden');
    }

}





