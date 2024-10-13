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

const PORT = 8000;

const videoPlayerSection = document.getElementById("video-player-section");
const videoPlayer = document.getElementById("video-player");
const videoSource = document.getElementById("video-source");
const videoTitle = document.getElementById("video-title");
const videoDescription = document.getElementById("video-description");
const videoViews = document.getElementById("video-views");
const videoDate = document.getElementById("video-date");
const favoriteButton = document.getElementById("favorite-button");

// Función para mostrar una sección
function showSection(section) {
    homeSection.classList.add("hidden");
    addVideoSection.classList.add("hidden");
    searchResultsSection.classList.add("hidden");
    videoPlayerSection.classList.add("hidden");
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
        videoList.innerHTML = "";

        videos.forEach(video => {
            const videoCard = `
                <div class="flex flex-col bg-gray-800 p-6 rounded-xl cursor-pointer hover:bg-gray-900" onclick="playVideo(${video.id})">
                    <img style="width:200px" src="/app/assets/thumbnails/${video.thumbnailPath}">
                    <h3 class="text-lg font-bold">${video.title}</h3>
                    <p>${video.viewsCount ? video.viewsCount : 0} vistas</p>
                    <p>${video.creationDate}</p>
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
        videoList.innerHTML = "";

        videos.forEach(video => {
            const videoCard = `
                <div class="flex flex-col bg-gray-800 p-6 rounded-xl cursor-pointer hover:bg-gray-900" onclick="playVideo(${video.id})">
                    <img style="width:200px" src="/app/assets/thumbnails/${video.thumbnailPath}">
                    <h3 class="text-lg font-bold">${video.title}</h3>
                    <p>${video.viewsCount ? video.viewsCount : 0} vistas</p>
                    <p>${video.creationDate}</p>
                </div>
            `;
            videoList.innerHTML += videoCard;
        });
    } catch (error) {
        console.error("Error al cargar los videos favoritos más vistos:", error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) {
        return "Fecha no disponible";
    }
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// Función para manejar el clic en el botón de favoritos
function toggleFavorite(video) {
    const isFavorite = video.isFavorite;
    const newFavoriteState = !isFavorite;

    fetch(`http://localhost:${PORT}/videos/${video.id}/favorite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite: newFavoriteState }),
    })
    .then(response => response.json())
    .then(updatedVideo => {
        video.isFavorite = updatedVideo.isFavorite;

        if (updatedVideo.isFavorite) {
            favoriteButton.textContent = 'Quitar de Favoritos';
        } else {
            favoriteButton.textContent = 'Agregar a Favoritos';
        }
    })
    .catch(error => console.error('Error al actualizar favoritos:', error));
}

// Función para reproducir un video seleccionado
function playVideo(videoId) {
    fetch(`http://localhost:${PORT}/videos/${videoId}`)
        .then(response => response.json())
        .then(video => {
            videoSource.src = `/app/videos/${video.videoPath}`;
            videoPlayer.load();

            videoTitle.textContent = video.title || "Sin título disponible";
            videoDescription.textContent = video.description || "Sin descripción disponible";
            videoViews.textContent = `Reproducciones: ${video.viewsCount || 0}`;

            const creationDate = video.creationDate;
            if (creationDate && creationDate.includes('-')) {
                const [day, month, year] = creationDate.split("-");
                const formattedDate = new Date(`${year}-${month}-${day}`);
                videoDate.textContent = `Fecha de creación: ${formattedDate.toLocaleDateString()}`;
            } else {
                videoDate.textContent = "Fecha de creación: Fecha no disponible";
            }

            currentVideoId = videoId;
            showSection(videoPlayerSection);
            loadComments(videoId);
        })
        .catch(error => {
            console.error("Error al cargar el video:", error);
        });
}

// Función para agregar el video a favoritos
function addToFavorites(video) {
    fetch(`http://localhost:${PORT}/videos/${video.id}/favorite`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(updatedVideo => {
        video.isFavorite = updatedVideo.isFavorite;
        favoriteButton.textContent = 'Quitar de Favoritos';
    })
    .catch(error => console.error('Error al agregar a favoritos:', error));
}

// Función para quitar el video de favoritos
function removeFromFavorites(video) {
    fetch(`http://localhost:${PORT}/videos/${video.id}/favorite`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(updatedVideo => {
        video.isFavorite = updatedVideo.isFavorite;
        favoriteButton.textContent = 'Agregar a Favoritos';
    })
    .catch(error => console.error('Error al quitar de favoritos:', error));
}

// Función para manejar el clic en el botón de favoritos
function toggleFavorite(video) {
    if (video.isFavorite) {
        removeFromFavorites(video);
    } else {
        addToFavorites(video);
    }
}

function displaySearchResults(videos) {
    const searchResultsSection = document.getElementById("search-results-section");
    const searchResultsList = document.getElementById("search-results-list");
    searchResultsList.innerHTML = "";  // Limpiar resultados anteriores

    if (videos.length === 0) {
        searchResultsList.innerHTML = "<p>No se encontraron videos.</p>";
        return;
    }

    videos.forEach(video => {
        const videoCard = `
            <div class="flex flex-col bg-gray-800 p-6 rounded-xl cursor-pointer hover:bg-gray-900" onclick="playVideo(${video.id})">
                <img style="width:200px" src="/app/assets/thumbnails/${video.thumbnailPath}">
                <h3 class="text-lg font-bold">${video.title}</h3>
                <p>${video.viewsCount || 0} vistas</p>
                <p>${video.creationDate}</p>
            </div>
        `;
        searchResultsList.innerHTML += videoCard;
    });

    // Mostrar la sección de resultados de búsqueda
    searchResultsSection.classList.remove("hidden");
    showSection(searchResultsSection);
}


// Evento para realizar la búsqueda
document.getElementById("search-button").addEventListener("click", () => {
    const query = document.getElementById("search-bar").value;
    
    if (query) {
        fetch(`http://localhost:${PORT}/videos/search?query=${query}`)
            .then(response => response.json())
            .then(videos => {
                displaySearchResults(videos);  // Mostrar los resultados
            })
            .catch(error => {
                console.error("Error al buscar videos:", error);
            });
    } else {
        console.log("El campo de búsqueda está vacío.");
    }
});

let currentVideoId = null;

// Función para cargar y mostrar los comentarios de un video
function loadComments(videoId) {
    fetch(`http://localhost:${PORT}/videos/${videoId}/comments`)
        .then(response => response.json())
        .then(comments => {
            const commentsList = document.getElementById("comments-list");
            commentsList.innerHTML = "";

            comments.forEach(comment => {
                const commentElement = `
                    <div class="comment-item mb-4 p-2 bg-gray-800 rounded-md">
                        <p class="text-sm text-gray-300">${comment.comment}</p>
                        <p class="text-xs text-gray-500">${new Date(comment.creationDate).toLocaleDateString()}</p>
                    </div>
                `;
                commentsList.innerHTML += commentElement;
            });
        })
        .catch(error => {
            console.error('Error al cargar los comentarios:', error);
        });
}

// Función para agregar un nuevo comentario
function addComment(videoId) {
    const commentText = document.getElementById("comment-text").value.trim();
    const commentError = document.getElementById("comment-error");

    if (!commentText) {
        commentError.textContent = "El comentario no puede estar vacío.";
        commentError.classList.remove("hidden");
        return;
    }
    if (commentText.length > 100) {
        commentError.textContent = "El comentario no puede tener más de 100 caracteres.";
        commentError.classList.remove("hidden");
        return;
    }

    commentError.classList.add("hidden");

    fetch(`http://localhost:${PORT}/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: commentText })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al agregar el comentario.');
        }
        return response.json();
    })
    .then(newComment => {
        document.getElementById("comment-text").value = "";

        loadCommentsWithoutReloadingVideo(videoId);
    })
    .catch(error => {
        commentError.textContent = "Hubo un error al agregar el comentario. Inténtalo de nuevo.";
        commentError.classList.remove("hidden");
        console.error('Error al agregar el comentario:', error);
    });
}

document.getElementById("add-comment-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const videoId = document.getElementById("video-id").value;
    addComment(videoId);
});

// Nueva función para cargar comentarios sin detener el video
function loadCommentsWithoutReloadingVideo(videoId) {
    fetch(`http://localhost:${PORT}/videos/${videoId}/comments`)
        .then(response => response.json())
        .then(comments => {
            const commentsList = document.getElementById("comments-list");
            commentsList.innerHTML = "";

            comments.forEach(comment => {
                const commentElement = `
                    <div class="comment-item mb-4 p-2 bg-gray-800 rounded-md">
                        <p class="text-sm text-gray-300">${comment.comment}</p>
                        <p class="text-xs text-gray-500">${new Date(comment.creationDate).toLocaleDateString()}</p>
                    </div>
                `;
                commentsList.innerHTML += commentElement;
            });
        })
        .catch(error => {
            console.error('Error al cargar los comentarios:', error);
        });
}

document.getElementById("add-comment-form").addEventListener("submit", function(event) {
    event.preventDefault();
    addComment(currentVideoId);
});

// Función para manejar la subida del video
document.getElementById("add-video-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    loadingIndicator.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    successMessage.classList.add("hidden");

    const title = document.getElementById("video-title").value;
    const description = document.getElementById("video-description").value;
    const fileInput = document.getElementById("video-file");
    const thumbnailInput = document.getElementById("thumbnail-file");

    const videoFile = fileInput.files[0];
    if (!videoFile) {
        loadingIndicator.classList.add("hidden");
        errorMessage.classList.remove("hidden");
        errorMessage.textContent = "Por favor, selecciona un archivo de video.";
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
            successMessage.classList.remove("hidden");
        } else {
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

returnHomeButton.addEventListener("click", () => {
    successMessage.classList.add("hidden");
    showSection(homeSection);
});

window.onload = function() {
    loadTopVideos();
    loadTopFavoriteVideos();
};
