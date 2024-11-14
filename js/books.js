const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "index.html";
}


function loadBooks() {
    
    fetch("http://localhost:3000/books")
        .then((response) => response.json()) 
        .then((books) => {
            
            const container = document.getElementById("booksContainer");
            container.innerHTML = ""; 

            
            books.forEach((book) => {
                
                fetch(`http://localhost:3000/rating`)
                    .then((response) => response.json()) 
                    .then((ratings) => {
                        
                        const avgRating = ratings.length
                            ? ratings.reduce(
                                  (acc, curr) => acc + curr.rating,
                                  0
                              ) / ratings.length
                            : 0;

                        
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
                                        <p class="card-text">Rating: ${avgRating}</p>
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
        .catch((error) => console.error("Error al cargar los libros:", error)); 
}


function rateBook(bookId, rating) {
    
    fetch("http://localhost:3000/rateBook", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json", 
        },
        body: JSON.stringify({
            bookId, 
            userId: currentUser.id, 
            rating, 
        }),
    })
        .then((response) => response.json()) 
        .then((data) => {
            loadBooks(); 
        })

        .catch((error) => console.error("Error al calificar el libro:", error)); 
}


document
    .getElementById("addBookForm")
    .addEventListener("submit", function (event) {
        event.preventDefault(); 

        
        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const description = document.getElementById("description").value;
        const image =
            document.getElementById("image").value ||
            "https://via.placeholder.com/150"; 
        
        fetch("http://localhost:3000/addBook", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json", 
            },
            body: JSON.stringify({
                title, 
                author, 
                description, 
                image, 
                userId: currentUser.id, 
            }),
        })
            .then((response) => response.json()) 
            .then((data) => {
                
                if (data.message === "Libro agregado exitosamente") {
                    console.log(first); 
                    loadBooks(); 
                }
            })
            .catch((error) =>
                console.error("Error al agregar el libro:", error)
            ); 
    });
