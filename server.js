const express = require("express"); 
const mysql = require("mysql2"); 
const cors = require("cors"); 
const app = express(); 


app.use(express.json());

app.use(cors());


const db = mysql.createConnection({
    host: "localhost", 
    port: 3306, 
    user: "root", 
    database: "biblioteca", 
   
});


db.connect((err) => {
    if (err) {
        
        console.error("Error de conexión a la base de datos:", err);
        return;
    }
    console.log("Conectado a la base de datos"); 
});




app.post("/register", (req, res) => {
    const { username, password } = req.body; 
    const query = "SELECT * FROM users WHERE username = ?"; 
    db.query(query, [username], (err, result) => {
        if (err) {
            // Si ocurre un error en la consulta
            return res.status(500).json({ message: "Error de base de datos" });
        }
        if (result.length > 0) {
            
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        
        const insertQuery =
            "INSERT INTO users (username, password) VALUES (?, ?)";
        db.query(insertQuery, [username, password], (err, result) => {
            if (err) {
                
                return res
                    .status(500)
                    .json({ message: "Error de base de datos" });
            }
            
            res.status(201).json({
                message: "Usuario registrado exitosamente",
            });
        });
    });
});

// Iniciar sesión
app.post("/login", (req, res) => {
    const { username, password } = req.body; 
    const query = "SELECT * FROM users WHERE username = ? AND password = ?"; 
    db.query(query, [username, password], (err, result) => {
        if (err) {
            // Si ocurre un error en la consulta
            return res.status(500).json({ message: "Error de base de datos" });
        }
        if (result.length > 0) {
            
            res.status(200).json({ message: "Login exitoso", user: result[0] });
        } else {
            
            res.status(401).json({
                message: "Usuario o contraseña incorrectos",
            });
        }
    });
});




app.get("/books", (req, res) => {
    const query = "SELECT * FROM books"; 
    db.query(query, (err, result) => {
        if (err) {
            
            return res.status(500).json({ message: "Error de base de datos" });
        }
        res.status(200).json(result); 
    });
});


app.post("/addBook", (req, res) => {
    const { title, author, description, image, userId } = req.body; 
    const query =
        "INSERT INTO books (title, author, description, image, user_id) VALUES (?, ?, ?, ?, ?)"; 
    db.query(
        query,
        [title, author, description, image, userId],
        (err, result) => {
            if (err) {
                
                return res
                    .status(500)
                    .json({ message: "Error de base de datos", error: err });
                console.log(err);
            }
            res.status(201).json({ message: "Libro agregado exitosamente" }); 
        }
    );
});


app.post("/rateBook", (req, res) => {
    const { bookId, userId, rating } = req.body; 
    const query = "SELECT * FROM ratings WHERE book_id = ? AND user_id = ?"; 
    db.query(query, [bookId, userId], (err, result) => {
        if (err) {
            // Si ocurre un error en la consulta
            return res.status(500).json({ message: "Error de base de datos" });
        }
        if (result.length > 0) {
            
            const updateQuery =
                "UPDATE ratings SET rating = ? WHERE book_id = ? AND user_id = ?";
            db.query(updateQuery, [rating, bookId, userId], (err, result) => {
                if (err) {
                    
                    return res.status(500).json({
                        message: "Error al actualizar la calificación",
                    });
                }
                res.status(200).json({ message: "Calificación actualizada" }); 
            });
        } else {
            
            const insertQuery =
                "INSERT INTO ratings (book_id, user_id, rating) VALUES (?, ?, ?)";
            db.query(insertQuery, [bookId, userId, rating], (err, result) => {
                if (err) {
                    
                    return res
                        .status(500)
                        .json({ message: "Error al agregar la calificación" });
                }
                res.status(201).json({ message: "Calificación agregada" }); 
            });
        }
    });
});


const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`); 
});

app.get("/books/:id", (req, res) => {
    const bookId = req.params.id;

    db.query(
        "SELECT * FROM books WHERE id = ?",
        [bookId],
        (error, bookResults) => {
            if (error) throw error;

            if (bookResults.length > 0) {
                
                db.query(
                    "SELECT * FROM ratings WHERE book_id = ?",
                    [bookId],
                    (error, ratingResults) => {
                        if (error) throw error;

                        res.json({
                            book: bookResults[0],
                            ratings: ratingResults,
                        });
                    }
                );
            } else {
                res.status(404).send("Libro no encontrado");
            }
        }
    );
});
