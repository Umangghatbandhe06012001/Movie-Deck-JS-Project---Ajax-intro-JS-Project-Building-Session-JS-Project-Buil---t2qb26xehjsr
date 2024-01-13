
const movieList = document.getElementById('movies-list');
const tpage = document.getElementById('totalPage');
const APIKEY = "c7215f3dc56433ece0801a1627d7089f";
let curr_page = 1;
totalPages = 1;
movies = [];
// const searchInput = document.getElementById("search-input");
let currentPage = document.getElementById('currPage');




function getFavMoviesFromLocalStorage() {
    const favMovies = JSON.parse(localStorage.getItem("favouriteMovies"));
    return favMovies === null ? [] : favMovies;
}

function addMovieInfoLocalStorage(mInfo) {
    const localStorageMovies = getFavMoviesFromLocalStorage();

    localStorage.setItem(
        "favouriteMovies" ,
        JSON.stringify([...localStorageMovies,mInfo])

    );
}

function removeFavMoviesFromLocalStorage(mInfo) {
    const localStorageMovies = getFavMoviesFromLocalStorage();
    
    const filteredMovies = localStorageMovies.filter(
        (eMovie) => eMovie.title != mInfo.title
    );

    localStorage.setItem("favouriteMovies", JSON.stringify(filteredMovies));
}



//step 2

function renderMovies(movies = []) {
    movieList.innerHTML = "";
    const favMovies = getFavMoviesFromLocalStorage();
    const favMoviesMapping = favMovies.reduce((acc, curr) => {
        acc[curr.title] = true;
        return acc;
    },{});
    pagination.classList.remove('hide');


    movies.forEach((eMovie) => {
        const { poster_path, title, vote_average, vote_count } = eMovie;
        let listItem = document.createElement("li");
        listItem.className = "card";
        let imageUrl = poster_path?`https://image.tmdb.org/t/p/original${poster_path}`: "";
        let mInfo = {
            title,
            vote_average,
            vote_count,
            poster_path,
        };

        const isFav = favMoviesMapping[title];

        mInfo = JSON.stringify(mInfo);
        mInfo.replaceAll("'", "");


        listItem.innerHTML = `<img class="poster" src=${imageUrl} alt="${title}" />
        <p class="title">${title}</p>
        <section class="vote-fav">
            <section>
                <p>Votes: ${vote_count}</p>
                <p>Rating: ${vote_average}</p>
            </section>
        </section>
        <i mInfo='${mInfo}' class="fa-regular fa-heart fa-2xl fav-icon ${isFav ? "fa-solid" : ""}"></i>`

        const favIconBtn = listItem.querySelector(".fav-icon");

        favIconBtn.addEventListener("click",(event)=>{
            let mInfo = JSON.parse(event.target.getAttribute("mInfo"));
            
            if(favIconBtn.classList.contains("fa-solid")) {
                favIconBtn.classList.remove("fa-solid");

                removeFavMoviesFromLocalStorage(mInfo);
            } else {
                favIconBtn.classList.add("fa-solid");
                addMovieInfoLocalStorage(mInfo);
            }

        });

        movieList.appendChild(listItem);
    });

}


//step 1 
async function fetchMovies() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${APIKEY}&language=en-US&page=${curr_page}`);

        let data = await response.json();
        movies = data.results;
        totalPages = data.total_pages;

        tpage.innerHTML = totalPages;

        if(totalPages > 1) nextBtn.disabled = false;
        else nextBtn.disabled = true;

        renderMovies(movies);
    } catch (error) {
        console.log(error);
    }
}

fetchMovies();

function navigateToPrevious() {
    curr_page--;
    currentPage.innerHTML = curr_page;

    if(searchInput.Value.length > 0) {
        searchMovies();
    }else {
        fetchMovies();

    }

    if(curr_page == 1){
        prevBtn.disabled = true;
    }else {
        prevBtn.disabled = false;
    }

    if(curr_page >= totalPages){
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

function navigateToNext() {
    curr_page++;
    currentPage.innerHTML = curr_page;

    if(searchInput.value.length > 0) {
        searchMovies();
    }else {
        fetchMovies();
    }

    if(curr_page == 1){
        prevBtn.disabled = true;
    }else {
        prevBtn.disabled = false;
    }


    if(curr_page >= totalPages) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}


const prevBtn = document.getElementById('prev-button');
const nextBtn = document.getElementById('next-button');

prevBtn.addEventListener("click", navigateToPrevious);
nextBtn.addEventListener("click", navigateToNext);


prevBtn.disabled = true;

async function searchMovies() {

    const searchText = searchInput.value;
    const url = `https://api.themoviedb.org/3/search/movie?query=${searchText}&api_key=${APIKEY}&language=en-US&page=${curr_page}`;

    const resp = await fetch(url);
    const data = await resp.json();

    movies = data.results;
    totalPages = data.total_pages;
    tpage.innerHTML = totalPages;
    movieList.innerHTML = "";
    renderMovies(movies);
}

let sortByDateFlag = 0;
const sortByDateBtn = document.getElementById('sort-by-date');


function sortByDate() {
    if(sortByDateFlag) {
        movies.sort((m1,m2) => {
            return new Date(m2.release_date) - new Date(m1.release_date);
        });
    

        renderMovies(movies);

        sortByDateFlag = !sortByDateFlag;

        sortByDateBtn.innerText = "Sort by date (Oldest to Latest)";
    }else {
        movies.sort((m1,m2) => {
            return new Date(m1.release_date) - new Date(m2.release_date);
        });

        renderMovies(movies);
        sortByDateFlag = !sortByDateFlag;

        sortByDateBtn.innerText = "Sort by date (Latest to Oldest)";
    }
}


sortByDateBtn.addEventListener("click",sortByDate);

let sortByRatingFlag = 0;


const sortByRatingBtn = document.getElementById('sort-by-rating');


function sortByRating() {
    if(sortByRatingFlag) {
        movies.sort((m1,m2) => {
            return m2.vote_average - m1.vote_average;
        });

        renderMovies(movies);
        sortByRatingFlag = !sortByRatingFlag;

        sortByRatingBtn.innerText = "Sort by rating (Lowest to Highest)"
    }else{
        movies.sort((m1,m2) =>{
            return m1.vote_average - m2.vote_average;
        });

        renderMovies(movies);
        sortByRatingFlag = !sortByRatingFlag;

        sortByRatingBtn.innerText = "Sort by rating (Highest to Lowest)";
    }
    
}

sortByRatingBtn.addEventListener("click",sortByRating);
const searchBtn = document.getElementById("search-button");

searchBtn.addEventListener("click", searchMovies);

function onSearchChange(event) {
    let val = event.target.value;

    if(val) {
        searchMovies();
    }else {
        fetchMovies();
    }


}

let timer;

function debounce(event){
    clearTimeout(timer);

    timer = setTimeout(() =>{
        onSearchChange(event);
    },1000);
}

const searchInput = document.getElementById('search-input');

searchInput.addEventListener("input",(event) =>{
    debounce(event);
});


pagination = document.querySelector('.pagination');

function renderFavMovies() {
    movieList.innerHTML = "";
    pagination.classList.add('hide');

    const favMovies = getFavMoviesFromLocalStorage();
    favMovies.map((eFavMovie) =>{
        let listItem = document.createElement("li");
        listItem.className = "card";

        const {poster_path, title, vote_average, vote_count } = eFavMovie;

        const imageUrl = poster_path?`https://image.tmdb.org/t/p/original${poster_path}`:"";

        let mInfo = {
            title,
            vote_count,
            vote_average,
            vote_count,
        }
        mInfo = JSON.stringify(mInfo);
        listItem.innerHTML = `<img
                              class="poster"
                              src=${imageUrl}
                              alt=${title}
                          />
                          <p class="title">${title}</p>
                          <section class="vote-fav">
                              <section>
                              <p>Votes: ${vote_count}</p>
                              <p>Rating: ${vote_average}</p>
                              </section>
                           </section>
                            
                            <i mInfo='${mInfo}' class="fa-regular fa-heart fa-2xl fav-icon fa-solid"></i>`
                            
        

        const favIconBtn = listItem.querySelector(".fav-icon");
        
        
        
        favIconBtn.addEventListener("click", (event) =>{
            let mInfo = JSON.parse(event.target.getAttribute("mInfo"));

            removeFavMoviesFromLocalStorage(mInfo);
            event.target.parentElement.remove();

        });
        movieList.appendChild(listItem);

        
        

    });
}

function displayMovies() {
    if(allTabsBtn.classList.contains("active-tab")){
        renderMovies(movies);
        
    }else{
        renderFavMovies();
        
    }
}

function switchTabs(event){
    allTabsBtn.classList.remove("active-tab");
    favTabsBtn.classList.remove("active-tab");

    event.target.classList.add("active-tab");

    displayMovies();
}





const allTabsBtn = document.getElementById("all-tab");
const favTabsBtn = document.getElementById("favorites-tab");

allTabsBtn.addEventListener("click", switchTabs);
favTabsBtn.addEventListener("click", switchTabs);
