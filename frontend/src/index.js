// Referencias a los elementos HTML
const homeSection = document.getElementById("home-section");
const addVideoSection = document.getElementById("add-video-section");
const searchResultsSection = document.getElementById("search-results-section");

const navHome = document.getElementById("nav-home");
const navAddVideo = document.getElementById("nav-add-video");

const loadingIndicator = document.getElementById("loading-indicator");
const errorMessage = document.getElementById("error-message");
const successMessage = document.getElementById("success-message");
const returnHomeButton = document.getElementById("return-home");

const PORT = 8000

const videoPlayerSection = document.getElementById("video-player-section");
const videoPlayer = document.getElementById("video-player");
const videoSource = document.getElementById("video-source");
const videoTitle = document.getElementById("video-title");
const videoDescription = document.getElementById("video-description");
const videoViews = document.getElementById("video-views");

// Función para mostrar una sección
// Función para mostrar una sección (se actualiza para ocultar también el reproductor)
function showSection(section) {
    homeSection.classList.add("hidden");
    addVideoSection.classList.add("hidden");
    searchResultsSection.classList.add("hidden");
    videoPlayerSection.classList.add("hidden"); // Ocultar la sección del reproductor al cambiar

    section.classList.remove("hidden");
}


// Navegar entre secciones
navHome.addEventListener("click", () => showSection(homeSection));
navAddVideo.addEventListener("click", () => showSection(addVideoSection));

// Función para cargar los videos más vistos
async function loadTopVideos() {
    try {
        const response = await fetch(`http://localhost:${PORT}/videos/top`);
        const videos = await response.json();

        const videoList = document.getElementById("top-videos-list");
        videoList.innerHTML = ""; // Limpiar la lista antes de añadir nuevos videos

        videos.forEach(video => {
            const videoCard = `
                <div class="flex flex-col bg-gray-800 p-6 rounded-xl cursor-pointer hover:bg-gray-900" onclick="playVideo(${video.id})">
                    <img style="width:200px" src="/app/assets/thumbnails/${video.thumbnailPath}">
                    <h3 class="text-lg font-bold">${video.title}</h3>
                    <p>${video.viewsCount ? video.viewsCount : 0} vistas</p>
                </div>
            `;
            videoList.innerHTML += videoCard;
        });
    } catch (error) {
        console.error("Error al cargar los videos más vistos:", error);
    }
}


// Función para cargar los videos favoritos más vistos
async function loadTopFavoriteVideos() {
    try {
        const response = await fetch(`http://localhost:${PORT}/videos/favorites`);
        const videos = await response.json();

        const videoList = document.getElementById("favorite-videos-list");
        videoList.innerHTML = ""; // Limpiar la lista antes de añadir nuevos videos

        videos.forEach(video => {
            const videoCard = `
                <div class="flex flex-col bg-gray-800 p-6 rounded-xl cursor-pointer hover:bg-gray-900" onclick="playVideo(${video.id})">
                    <img style="width:200px" src="/app/assets/thumbnails/${video.thumbnailPath}">
                    <h3 class="text-lg font-bold">${video.title}</h3>
                    <p>${video.viewsCount ? video.viewsCount : 0} vistas</p>
                </div>
            `;
            videoList.innerHTML += videoCard;
        });
    } catch (error) {
        console.error("Error al cargar los videos más vistos:", error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) {
        return "Fecha no disponible";
    }
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// Función para mostrar los resultados de búsqueda
function displaySearchResults(videos) {
    const searchResultsList = document.getElementById("search-results-list");
    searchResultsList.innerHTML = ""; // Limpiar la lista antes de añadir nuevos resultados

    videos.forEach(video => {
        const videoCard = `
            <div class="flex flex-col md:flex-row bg-gray-800 p-4 rounded-xl mb-4 shadow-lg cursor-pointer hover:bg-gray-900" onclick="playVideo(${video.id})">
                <img class="w-full md:w-48 rounded-lg mb-4 md:mb-0" src="/app/assets/thumbnails/${video.thumbnailPath}" alt="${video.title} Thumbnail">
                <div class="flex-1 md:ml-6">
                    <h3 class="text-lg font-bold text-accent">${video.title}</h3>
                    <p class="text-sm text-gray-400">${video.description ? video.description.slice(0, 100) : 'No description available...'}...</p>
                    <div class="mt-2 text-sm text-gray-500">
                        <p>Fecha de creación: ${formatDate(video.creationDate)}</p>
                        <p>Reproducciones: ${video.viewsCount ? video.viewsCount : 0}</p>
                        <p>Favorito: ${video.isFavorite ? 'Sí' : 'No'}</p>
                    </div>
                </div>
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
        fetch(`http://localhost:${PORT}/videos/search?query=${query}`)
            .then(response => response.json())
            .then(videos => {
                displaySearchResults(videos);  // Mostrar los resultados con la función actualizada
            })
            .catch(error => {
                console.error("Error al buscar videos:", error);
            });
    }
});

// Función para reproducir un video seleccionado
function playVideo(videoId) {
    fetch(`http://localhost:${PORT}/videos/${videoId}`)
        .then(response => response.json())
        .then(video => {
            // Actualizar los detalles del video
            videoSource.src = `/app/videos/${video.videoPath}`; // Ruta al video
            videoPlayer.load(); // Cargar el nuevo video en el reproductor
            videoTitle.textContent = video.title;
            videoDescription.textContent = video.description || "Sin descripción disponible.";
            videoViews.textContent = `Reproducciones: ${video.viewsCount || 0}`;

            // Mostrar la sección del reproductor de video
            showSection(videoPlayerSection);
        })
        .catch(error => {
            console.error("Error al cargar el video:", error);
        });
}

// Evento para manejar la subida del video
document.getElementById("add-video-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // Evitar el comportamiento predeterminado del formulario

    // Mostrar el indicador de carga y ocultar mensajes de error o éxito
    loadingIndicator.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    successMessage.classList.add("hidden");

    const title = document.getElementById("video-title").value;
    const description = document.getElementById("video-description").value;
    const fileInput = document.getElementById("video-file");
    const thumbnailInput = document.getElementById("thumbnail-file");

    // Validar archivo de video
    const videoFile = fileInput.files[0];
    if (!videoFile) {
        loadingIndicator.classList.add("hidden");
        errorMessage.classList.remove("hidden");
        errorMessage.textContent = "Por favor, selecciona un archivo de video."; // Mensaje de error
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", videoFile);
    if (thumbnailInput.files.length > 0) {
        formData.append("thumbnail", thumbnailInput.files[0]);
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/videos", {
            method: "POST",
            body: formData,
        });

        loadingIndicator.classList.add("hidden");

        if (response.ok) {
            // Mostrar mensaje de éxito
            successMessage.classList.remove("hidden");
        } else {
            // Mostrar mensaje de error en caso de fallo en la carga
            errorMessage.classList.remove("hidden");
            errorMessage.textContent = "Error al subir el video. Inténtalo de nuevo.";
        }
    } catch (error) {
        console.error("Error al subir el video:", error);
        loadingIndicator.classList.add("hidden");
        errorMessage.classList.remove("hidden");
        errorMessage.textContent = "Hubo un error al conectar con el servidor.";
    }
});

// Manejo del botón de éxito para volver a la página de inicio
returnHomeButton.addEventListener("click", () => {
    successMessage.classList.add("hidden"); // Ocultar mensaje de éxito
    showSection(homeSection); // Regresar a la página de inicio
});

// Cargar videos al iniciar la página
window.onload = function() {
    loadTopVideos();
    loadTopFavoriteVideos();
};
