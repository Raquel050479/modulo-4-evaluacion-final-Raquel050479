//imports
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
//const bcrypt = require('bcrypt');
//const jwt = require('jwt');
require('dotenv').config();

//arrancar el servidor
const app = express();

//configurar el servidor
app.use(cors());
app.use(express.json({ limit: '25mb' }));

//conexión a la bd
async function getConnection() {
  //crear y configurar la conexion
  const connection = await mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.PASS,
    database: process.env.DATABASE,
  });

  await connection.connect();
  console.log(
    `Conexión establecida con la base de datos (identificador=${connection.threadId})`
  );
  return connection;
}

const port = 3025;
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

//Endpoints
//Obtener todos los libros
app.get('/libros', async (req, res) => {
  const connection = await getConnection();
  const query = 'SELECT * from libros';
  const [results, fields] = await connection.query(query);
  const numOfElements = results.length;
  connection.end();
  res.json({
    info: { count: numOfElements },
    results: results,
  });
});

//Obtener un libro por su ID (GET /libros/:id).
app.get('/libros/:id', async (req, res) => {
  const connection = await getConnection();
  const idLibro = req.params.id;
  console.log(req.params);
  const query = 'SELECT * FROM libros WHERE idLibro = ?';
  const [results] = await connection.query(query, [idLibro]);
  connection.end();
  res.json(results);
});

//Crear un libro nuevo (POST /libros)
app.post('/libros', async (req, res) => {
  try {
    const connection = await getConnection();
    const query =
      'INSERT INTO libros(titulo, autora, genero, fechaPublicacion) VALUES (?, ?, ?, ?)';

    const [results] = await connection.query(query, [
      req.body.titulo,
      req.body.autora,
      req.body.genero,
      req.body.fechaPublicacion,
    ]);
    console.log(results);
    console.log(results.insertId);
    connection.end();
    res.json({
      success: true,
      id: results.insertId,
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Comprueba que ningún dato esté vacío',
    });
  }
});

//Actualizar un libro existente (PUT /libros/:id)
app.put('/libros/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const libroID = req.params.id;
    const query =
      'UPDATE libros SET  titulo =? , autora = ?, genero =?, fechaPublicacion =? WHERE idLibro = ?';
    const [results] = await connection.query(query, [
      req.body.titulo,
      req.body.autora,
      req.body.genero,
      req.body.fechaPublicacion,
      libroID,
    ]);
    connection.end();
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Comprueba los datos que quieres actualizar',
    });
  }
});

//Eliminar un libro (DELETE /libros/:id)
//id: url params
app.delete('/libros/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const libroID = req.params.id;
    const query = 'DELETE FROM libros WHERE idLibro = ? ';
    const [results] = await connection.query(query, [libroID]);
    connection.end();
    console.log(results);
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'No se ha podido eliminar el libro',
    });
  }
});

/*registro de una usuaria
app.post('/registro', async (req, res) => {
  try {
    const { nombre, mail, pass } = req.body;
    const hashedPassword = await bcrypt(pass, 10);
    const token = jwt.create({ nombre, mail }, process.env.JWT_SECRET, {
      secret: hashedPassword,
    });
    res.json({ token });
  } catch (error) {
    console.error('Error en el registro', error);
    res.status(500).json({ error: 'Error en el registro' });
  }
});*/
