// Importación de dependencias
const express = require("express"); // Framework de servidor web
const mysql = require("mysql2"); // Cliente MySQL para Node.js
const cors = require("cors"); // Middleware para permitir peticiones desde otros dominios
const app = express(); // Inicializar la aplicación Express

// Middleware para parsear el cuerpo de las peticiones como JSON
app.use(express.json());
// Habilitar CORS para permitir solicitudes desde dominios externos
app.use(cors());

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
    host: "localhost", // Host donde se encuentra la base de datos
    port: 3306, // Puerto de MySQL (por defecto 3306)
    user: "root", // Usuario de la base de datos
    database: "biblioteca", // Nombre de la base de datos
});

// Conexión a la base de datos MySQL
db.connect((err) => {
    if (err) {
        // Si ocurre un error en la conexión
        console.error("Error de conexión a la base de datos:", err);
        return;
    }
    console.log("Conectado a la base de datos"); // Si la conexión es exitosa
});

// Rutas para manejar usuarios (registro y login)

// Registrar un nuevo usuario
app.post("/register", (req, res) => {
    const { username, password } = req.body; // Obtener los datos del cuerpo de la petición
    const query = "SELECT * FROM users WHERE username = ?"; // Consultar si el usuario ya existe
    db.query(query, [username], (err, result) => {
        if (err) {
            // Si ocurre un error en la consulta
            return res.status(500).json({ message: "Error de base de datos" });
        }
        if (result.length > 0) {
            // Si el usuario ya existe en la base de datos
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        // Si el usuario no existe, insertarlo en la base de datos
        const insertQuery =
            "INSERT INTO users (username, password) VALUES (?, ?)";
        db.query(insertQuery, [username, password], (err, result) => {
            if (err) {
                // Si ocurre un error al insertar el nuevo usuario
                return res
                    .status(500)
                    .json({ message: "Error de base de datos" });
            }
            // Responder con éxito si el usuario fue registrado
            res.status(201).json({
                message: "Usuario registrado exitosamente",
            });
        });
    });
});

// Iniciar sesión
app.post("/login", (req, res) => {
    const { username, password } = req.body; // Obtener los datos de la solicitud
    const query = "SELECT * FROM users WHERE username = ? AND password = ?"; // Consultar por el usuario y la contraseña
    db.query(query, [username, password], (err, result) => {
        if (err) {
            // Si ocurre un error en la consulta
            return res.status(500).json({ message: "Error de base de datos" });
        }
        if (result.length > 0) {
            // Si se encuentra un usuario con las credenciales correctas
            res.status(200).json({ message: "Login exitoso", user: result[0] });
        } else {
            // Si no se encuentra el usuario o la contraseña es incorrecta
            res.status(401).json({
                message: "Usuario o contraseña incorrectos",
            });
        }
    });
});

// Rutas para manejar libros

// Obtener todos los libros
app.get("/books", (req, res) => {
    const query = "SELECT * FROM books"; // Consulta para obtener todos los libros
    db.query(query, (err, result) => {
        if (err) {
            // Si ocurre un error en la consulta
            return res.status(500).json({ message: "Error de base de datos" });
        }
        res.status(200).json(result); // Retornar todos los libros en formato JSON
    });
});

// Agregar un nuevo libro
app.post("/addBook", (req, res) => {
    const { title, author, description, image, userId } = req.body; // Obtener los datos del libro a agregar
    const query =
        "INSERT INTO books (title, author, description, image, user_id) VALUES (?, ?, ?, ?, ?)"; // Consulta para agregar un libro
    db.query(
        query,
        [title, author, description, image, userId],
        (err, result) => {
            if (err) {
                // Si ocurre un error al agregar el libro
                return res
                    .status(500)
                    .json({ message: "Error de base de datos", error: err });
            }
            res.status(201).json({ message: "Libro agregado exitosamente" }); // Retornar mensaje de éxito
        }
    );
});

// Agregar o actualizar la calificación de un libro
app.post("/rateBook", (req, res) => {
    const { bookId, userId, rating } = req.body; // Obtener los datos de la calificación
    const query = "SELECT * FROM ratings WHERE book_id = ? AND user_id = ?"; // Consultar si ya existe una calificación del libro por el usuario
    db.query(query, [bookId, userId], (err, result) => {
        if (err) {
            // Si ocurre un error en la consulta
            return res.status(500).json({ message: "Error de base de datos" });
        }
        if (result.length > 0) {
            // Si ya existe una calificación, se actualiza
            const updateQuery =
                "UPDATE ratings SET rating = ? WHERE book_id = ? AND user_id = ?";
            db.query(updateQuery, [rating, bookId, userId], (err, result) => {
                if (err) {
                    // Si ocurre un error al actualizar la calificación
                    return res
                        .status(500)
                        .json({
                            message: "Error al actualizar la calificación",
                        });
                }
                res.status(200).json({ message: "Calificación actualizada" }); // Retornar mensaje de éxito
            });
        } else {
            // Si no existe una calificación, se agrega una nueva
            const insertQuery =
                "INSERT INTO ratings (book_id, user_id, rating) VALUES (?, ?, ?)";
            db.query(insertQuery, [bookId, userId, rating], (err, result) => {
                if (err) {
                    // Si ocurre un error al insertar la calificación
                    return res
                        .status(500)
                        .json({ message: "Error al agregar la calificación" });
                }
                res.status(201).json({ message: "Calificación agregada" }); // Retornar mensaje de éxito
            });
        }
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000; // Usar el puerto del entorno o 3000 por defecto
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`); // Confirmar que el servidor está corriendo
});
