// Obtener el usuario actual desde el localStorage
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
// Si no existe un usuario en el localStorage, redirigir a la página de login (index.html)
if (!currentUser) {
    window.location.href = "index.html";
}

// Función para cargar todos los libros desde el servidor
function loadBooks() {
    // Realizar una solicitud GET a la API para obtener los libros
    fetch("http://localhost:3000/books")
        .then((response) => response.json()) // Convertir la respuesta a JSON
        .then((books) => {
            // Iterar sobre la lista de libros obtenidos
            const container = document.getElementById("booksContainer");
            container.innerHTML = ""; // Limpiar el contenedor de libros antes de agregar nuevos

            // Para cada libro, obtener su calificación promedio
            books.forEach((book) => {
                // Hacer una solicitud GET para obtener las calificaciones del libro
                fetch(
                    `http://localhost:3000/rating?bookId=${book.id}&userId=${currentUser.id}`
                )
                    .then((response) => response.json()) // Convertir la respuesta a JSON
                    .then((ratings) => {
                        // Calcular la calificación promedio
                        const avgRating = ratings.length
                            ? ratings.reduce(
                                  (acc, curr) => acc + curr.rating,
                                  0
                              ) / ratings.length
                            : 0;

                        // Agregar cada libro al contenedor con sus detalles y calificación
                        container.innerHTML += `
                            <div class="col-md-4">
                                <div class="card book-card">
                                    <img src="${
                                        book.image ||
                                        "https://via.placeholder.com/150"
                                    }" class="card-img-top book-image">
                                    <div class="card-body">
                                        <h5 class="card-title">${
                                            book.title
                                        }</h5>
                                        <p class="card-text">${book.author}</p>
                                        <p class="card-text">Rating: ${avgRating.toFixed(
                                            1
                                        )} ⭐</p>
                                        <button class="btn btn-primary" onclick="showBookDetails(${
                                            book.id
                                        })">Ver detalles</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
            });
        })
        .catch((error) => console.error("Error al cargar los libros:", error)); // Manejo de errores en la solicitud
}

// Función para calificar un libro
function rateBook(bookId, rating) {
    // Realizar una solicitud POST para calificar el libro
    fetch("http://localhost:3000/rateBook", {
        method: "POST", // Definir el método HTTP como POST
        headers: {
            "Content-Type": "application/json", // El contenido será un objeto JSON
        },
        body: JSON.stringify({
            bookId, // ID del libro
            userId: currentUser.id, // ID del usuario actual
            rating, // La calificación dada al libro
        }),
    })
        .then((response) => response.json()) // Convertir la respuesta en un objeto JSON
        .then((data) => {
            loadBooks(); // Recargar la lista de libros para reflejar la calificación
        })
        .catch((error) => console.error("Error al calificar el libro:", error)); // Manejo de errores en la solicitud
}

// Manejar el formulario para agregar un libro
document
    .getElementById("addBookForm")
    .addEventListener("submit", function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        // Obtener los valores ingresados por el usuario para el nuevo libro
        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const description = document.getElementById("description").value;
        const image =
            document.getElementById("image").value ||
            "https://via.placeholder.com/150"; // URL de imagen por defecto si no se ingresa una
        // Realizar una solicitud POST para agregar el nuevo libro al servidor
        fetch("http://localhost:3000/addBook", {
            method: "POST", // Definir el método HTTP como POST
            headers: {
                "Content-Type": "application/json", // El contenido será un objeto JSON
            },
            body: JSON.stringify({
                title, // Título del libro
                author, // Autor del libro
                description, // Descripción del libro
                image, // URL de la imagen del libro
                userId: currentUser.id, // ID del usuario que agrega el libro
            }),
        })
            .then((response) => response.json()) // Convertir la respuesta a JSON
            .then((data) => {
                // Si el libro se agregó exitosamente, se cierra el modal y se recargan los libros
                if (data.message === "Libro agregado exitosamente") {
                    $("#addBookModal").modal("hide"); // Cerrar el modal de agregar libro
                    loadBooks(); // Recargar la lista de libros
                }
            })
            .catch((error) =>
                console.error("Error al agregar el libro:", error)
            ); // Manejo de errores en la solicitud
    });
