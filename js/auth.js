const mysql = require("mysql2");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "biblioteca",
});

connection.connect((err) => {
    if (err) {
        console.error("Error de conexión a la base de datos: " + err.stack);
        return;
    }

    console.log("Conexión a la base de datos exitosa.");
});

if (document.getElementById("registerForm")) {
    document
        .getElementById("registerForm")
        .addEventListener("submit", function (e) {
            e.preventDefault();

            const username = document.getElementById("newUsername").value;
            const password = document.getElementById("newPassword").value;

            const query = "SELECT * FROM users WHERE username = ?";
            connection.execute(query, [username], (err, results) => {
                if (err) {
                    console.error("Error al verificar el usuario: ", err);
                    alert("Hubo un error al verificar el usuario.");
                    return;
                }

                if (results.length > 0) {
                    // Si el usuario ya existe, mostrar un mensaje de error.
                    alert("El usuario ya existe.");
                    return;
                }

                // Si el usuario no existe, insertarlo en la base de datos.
                const insertQuery =
                    "INSERT INTO users (username, password) VALUES (?, ?)";
                connection.execute(
                    insertQuery,
                    [username, password],
                    (err, results) => {
                        if (err) {
                            // Si ocurre un error al registrar el usuario, se muestra un mensaje de error.
                            console.error(
                                "Error al registrar el usuario: ",
                                err
                            );
                            alert("Hubo un error al registrar el usuario.");
                            return;
                        }

                        // Si el registro es exitoso, se muestra un mensaje y se redirige al login.
                        alert("Usuario registrado con éxito.");
                        window.location.href = "index.html"; // Redirigir al login.
                    }
                );
            });
        });
}

// Verificar si existe el formulario de inicio de sesión en el HTML.
if (document.getElementById("loginForm")) {
    // Si existe, agregar un evento al formulario que se activará cuando se envíe.
    document
        .getElementById("loginForm")
        .addEventListener("submit", function (e) {
            e.preventDefault(); // Evitar que el formulario recargue la página al enviarse.

            // Obtener los valores ingresados por el usuario en los campos de nombre de usuario y contraseña.
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            // Verificar si las credenciales ingresadas coinciden con las almacenadas en la base de datos.
            const query =
                "SELECT * FROM users WHERE username = ? AND password = ?";
            connection.execute(query, [username, password], (err, results) => {
                if (err) {
                    // Si ocurre un error al verificar las credenciales, se muestra un mensaje de error.
                    console.error("Error al verificar las credenciales: ", err);
                    alert("Hubo un error al verificar las credenciales.");
                    return;
                }

                if (results.length > 0) {
                    // Si las credenciales son correctas, se obtiene el primer usuario encontrado.
                    const user = results[0];
                    // Se guarda la información del usuario en el localStorage.
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    // Se redirige a la página de libros.
                    window.location.href = "books.html";
                } else {
                    // Si las credenciales son incorrectas, se muestra un mensaje de error.
                    alert("Usuario o contraseña incorrectos.");
                }
            });
        });
}

// Agregar un evento al botón de cerrar sesión.
document.getElementById("logout").addEventListener("click", function () {
    // Eliminar el usuario guardado en el localStorage (cerrar sesión).
    localStorage.removeItem("currentUser");
    // Redirigir al formulario de inicio de sesión.
    window.location.href = "index.html";
});

// Levantar el servidor para que escuche en el puerto 3000.
app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000"); // Mensaje de éxito al iniciar el servidor.
});
