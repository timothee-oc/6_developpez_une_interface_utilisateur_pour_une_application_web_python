const baseUrl = "http://localhost:8000/api/v1/"
const myCategories = ["Sci-Fi", "Sport", "Thriller"]

let categoryDivs = document.querySelectorAll(".category")
let categoryTitles = document.querySelectorAll(".category-title")

const modal = document.querySelector(".modal")
const modalBackground = document.querySelector(".modal-background")
let modalTitle = modal.querySelector(".modal-title")
let modalImage = modal.querySelector(".modal-image")
let modalInfos = modal.querySelector(".modal-infos")
setCloseModalEvent(modal.querySelector(".modal-button"))
setCloseModalEvent(modalBackground)

function setCloseModalEvent(triggerNode) {
    triggerNode.addEventListener("click", () => {
        modalInfos.innerHTML = ""
        modal.style["display"] = "none"
        modalBackground.style["display"] = "none"
        document.body.style["overflow"] = "auto"
    })
}

async function main() {    
    const bestMoviesData = await getBestMoviesData(range=8)

    const firstBestData = bestMoviesData[0]
    document.querySelector(".first-best-title").innerText = firstBestData.title
    document.querySelector(".first-best-description").innerText = firstBestData.long_description
    document.querySelector(".first-best-image").src = firstBestData.image_url

    setModalContent(document.querySelector(".first-best-button"), firstBestData)
    
    for (let i = 0; i < categoryDivs.length; i++) {
        let categoryBestsData
        if (i === 0) {
            categoryTitles[i].innerText = "Film les mieux notés"
            categoryBestsData = bestMoviesData.slice(1)
        }
        else {
            categoryTitles[i].innerText = myCategories[i-1]
            categoryBestsData = await getBestMoviesData(range=7, myCategories[i-1])
        }
        let categoryImgs = categoryDivs[i].querySelectorAll(".movie-image")
        setCategoryImgSrcs(categoryImgs, categoryBestsData)
        for (let j = 0; j < categoryImgs.length; j++) {
            setModalContent(categoryImgs[j], categoryBestsData[j])
        }
        setButtonEvents(categoryImgs, categoryDivs[i])
    }
}

async function getBestMoviesData(range, genre=null) {
    let genreParam = ""
    if (genre) {
        genreParam = "&genre=" + genre
    }
    const allMoviesByScoreUrl = baseUrl + "titles/?sort_by=-imdb_score" + genreParam
    let response = await (await fetch(allMoviesByScoreUrl)).json()
    let allMoviesByScore = []
    for (let i = 0; i < response.results.length; i++) {
        allMoviesByScore.push(await (await fetch(response.results[i].url)).json())
    }
    while (allMoviesByScore.length < range) {
        response = await (await fetch(response.next)).json()
        let temp = []
        for (let i = 0; i < response.results.length; i++) {
            temp.push(await (await fetch(response.results[i].url)).json())
        }
        allMoviesByScore = allMoviesByScore.concat(temp)
    }
    return allMoviesByScore.slice(0, range)
}

function setCategoryImgSrcs(categoryImgs, moviesData) {
    for (let i = 0; i < categoryImgs.length; i++) {
        categoryImgs[i].src = moviesData[i].image_url
    }
}

function setButtonEvents(categoryImgs, categoryDiv) {
    let nextButton = categoryDiv.querySelector(".next-button")
    let previousButton = categoryDiv.querySelector(".previous-button")
    let startShowingIndex = 0

    nextButton.addEventListener("click", () => {
        if (startShowingIndex < categoryImgs.length - 4) {
            categoryImgs[startShowingIndex].style["display"] = "none"
            categoryImgs[startShowingIndex + 4].style.removeProperty("display")
            startShowingIndex++
            if (startShowingIndex === categoryImgs.length - 4) {
                nextButton.disabled = true
            }
        }
        if (startShowingIndex > 0) {
            previousButton.disabled = false
        }
    })
    previousButton.addEventListener("click", () => {
        if (startShowingIndex > 0) {
            startShowingIndex--
            categoryImgs[startShowingIndex].style.removeProperty("display")
            categoryImgs[startShowingIndex + 4].style["display"] = "none"
            if (startShowingIndex === 0) {
                previousButton.disabled = true
            }
        }
        if (startShowingIndex < categoryImgs.length - 4) {
            nextButton.disabled = false
        }
    })
}

function setModalContent(modalTriggerNode, movieData) {
    modalTriggerNode.addEventListener("click", () => {
        modalTitle.innerText = movieData.title
        modalImage.src = movieData.image_url
        const infosNeeded = [
            "Genre(s) : " + movieData.genres.join(", "),
            "Date published : " + movieData.date_published,
            "Rated : " + movieData.rated,
            "IMDB score : " + movieData.imdb_score,
            "Director(s) : " + movieData.directors.join(", "),
            "Actor(s) : " + movieData.actors.join(", "),
            "Duration : " + Math.floor(movieData.duration / 60) + " hour(s) and " + movieData.duration % 60 + " minute(s)",
            "Countrie(s) : " + movieData.countries.join(", "),
            "Description : " + movieData.long_description
        ]
        for (let i = 0; i < infosNeeded.length; i++) {
            let info = document.createElement("li")
            info.innerText = infosNeeded[i]
            modalInfos.appendChild(info) 
        }
        modal.style["display"] = "flex"
        modalBackground.style["display"] = "block"
        document.body.style["overflow"] = "hidden"
    })
}

main()