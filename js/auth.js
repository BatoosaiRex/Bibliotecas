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
                    
                    alert("El usuario ya existe.");
                    return;
                }

                
                const insertQuery =
                    "INSERT INTO users (username, password) VALUES (?, ?)";
                connection.execute(
                    insertQuery,
                    [username, password],
                    (err, results) => {
                        if (err) {
                            
                            console.error(
                                "Error al registrar el usuario: ",
                                err
                            );
                            alert("Hubo un error al registrar el usuario.");
                            return;
                        }

                        
                        alert("Usuario registrado con éxito.");
                        window.location.href = "index.html"; 
                    }
                );
            });
        });
}


if (document.getElementById("loginForm")) {
   
    document
        .getElementById("loginForm")
        .addEventListener("submit", function (e) {
            e.preventDefault(); 

            
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            
            const query =
                "SELECT * FROM users WHERE username = ? AND password = ?";
            connection.execute(query, [username, password], (err, results) => {
                if (err) {
                    
                    console.error("Error al verificar las credenciales: ", err);
                    alert("Hubo un error al verificar las credenciales.");
                    return;
                }

                if (results.length > 0) {
                    
                    const user = results[0];
                    
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    
                    window.location.href = "books.html";
                } else {
                    
                    alert("Usuario o contraseña incorrectos.");
                }
            });
        });
}


document.getElementById("logout").addEventListener("click", function () {
    
    localStorage.removeItem("currentUser");
  
    window.location.href = "index.html";
});


app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000"); 
});
