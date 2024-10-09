// Referencias a los elementos HTML
const homeSection = document.getElementById("home-section");
const addVideoSection = document.getElementById("add-video-section");
const searchResultsSection = document.getElementById("search-results-section");

const navHome = document.getElementById("nav-home");
const navAddVideo = document.getElementById("nav-add-video");

// Función para mostrar una sección
function showSection(section) {
    homeSection.classList.add("hidden");
    addVideoSection.classList.add("hidden");
    searchResultsSection.classList.add("hidden");
    section.classList.remove("hidden");
}

// Navegar entre secciones
navHome.addEventListener("click", () => showSection(homeSection));
navAddVideo.addEventListener("click", () => showSection(addVideoSection));

// Función para cargar los videos más vistos
async function loadTopVideos() {
    try {
        const response = await fetch("http://localhost:8000/videos/top");
        const videos = await response.json();

        const videoList = document.getElementById("top-videos-list");
        videoList.innerHTML = ""; // Limpiar la lista antes de añadir nuevos videos

        videos.forEach(video => {
            const videoCard = `
                <div class="bg-zinc-700 p-4 rounded video-card" onclick="playVideo(${video.id})">
                    <h3 class="text-lg font-bold">${video.title}</h3>
                    <p>${video.viewsCount} vistas</p>
                </div>
            `;
            videoList.innerHTML += videoCard;
        });
    } catch (error) {
        console.error("Error al cargar los videos más vistos:", error);
    }
}

// Función para mostrar los resultados de búsqueda
function displaySearchResults(videos) {
    const searchResultsList = document.getElementById("search-results-list");
    searchResultsList.innerHTML = ""; // Limpiar la lista antes de añadir nuevos resultados

    videos.forEach(video => {
        const videoCard = `
            <div class="bg-zinc-700 p-4 rounded video-card" onclick="playVideo(${video.id})">
                <h3 class="text-lg font-bold">${video.title}</h3>
                <p>${video.viewsCount || '0'} vistas</p>
            </div>
        `;
        searchResultsList.innerHTML += videoCard;
    });

    // Mostrar la sección de resultados de búsqueda
    showSection(searchResultsSection);
}

// Evento para realizar la búsqueda
document.getElementById("search-button").addEventListener("click", () => {
    const query = document.getElementById("search-bar").value;
    if (query) {
        fetch(`http://localhost:8000/videos/search?query=${query}`)
            .then(response => response.json())
            .then(videos => {
                displaySearchResults(videos);
            })
            .catch(error => {
                console.error("Error al buscar videos:", error);
            });
    }
});

// Función para reproducir un video seleccionado
function playVideo(videoId) {
    console.log(`Reproduciendo video con ID: ${videoId}`);
    // Aquí puedes agregar la lógica para redirigir a la página de reproducción del video
}

// Cargar videos al iniciar la página
window.onload = function() {
    loadTopVideos();
};
