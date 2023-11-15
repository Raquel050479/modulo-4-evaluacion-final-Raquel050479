//imports
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//arrancar el servidor
const app = express();

//configurar el servidor
app.use(cors());
app.use(express.json({ limit: '25mb' }));
//ruta de estáticos
app.use(express.static('frontend'));
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
//Listar todos los libros
app.get('/libros', async (req, res) => {
  const connection = await getConnection();
  const query = 'SELECT * from libros';
  const [results] = await connection.query(query);
  const numOfElements = results.length;
  connection.end();
  res.json({
    info: { count: numOfElements },
    results: results,
  });
});

//Obtener un libro por su ID
app.get('/libros/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const idLibro = req.params.id;
    const query = 'SELECT * FROM libros WHERE idLibro = ?';
    const [results] = await connection.query(query, [idLibro]);
    connection.end();
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se ha encontrado ningún libro con ese ID',
      });
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el libro por ID',
    });
  }
});

//Crear un libro nuevo
app.post('/libros', async (req, res) => {
  try {
    const connection = await getConnection();
    //verificar si el libro existe
    const checkQuery = 'SELECT * FROM libros WHERE titulo = ? AND autora = ?';
    const [checkResults] = await connection.query(checkQuery, [
      req.body.titulo,
      req.body.autora,
    ]);
    if (checkQuery.length > 0) {
      return res.json({
        success: false,
        message: 'El libro ya existe en la base de datos.',
      });
    }
    //si el libro no existe en la base de datos, se crea
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

//Actualizar un libro existente
app.put('/libros/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const libroID = req.params.id;
    //verificar si el libro existe
    const checkQuery = 'SELECT * FROM libros WHERE idLibro= ?';
    const [checkResults] = await connection.query(checkQuery, [idLibro]);
    if (checkResults.length === 0) {
      return res.json({
        success: false,
        message: 'No se ha encontrado el libro que quieres actualizar',
      });
    }
    //validar los datos de entrada
    if (
      !req.body.titulo ||
      !req.body.autora ||
      !req.body.genero ||
      !req.body.fechaPublicacion
    ) {
      return res.json({
        success: false,
        message: 'Asegúrate de completar todos los datos',
      });
    }
    //ahora se ejecuta la actualización del libro
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

//Eliminar un libro existente
app.delete('/libros/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const libroID = req.params.id;
    //verificar si el libro existe
    const checkQuery = 'SELECT * FROM libros WHERE idLibro= ?';
    const [checkResults] = await connection.query(checkQuery, [idLibro]);
    if (checkResults.length === 0) {
      return res.json({
        success: false,
        message: 'No se ha encontrado el libro que quieres eliminar',
      });
    }
    //ahora se ejecuta la eliminación del libro
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

//BONUS registro de una usuaria
app.post('/registro', async (req, res) => {
  try {
    const { nombre, apellido, mail, pass } = req.body;

    // Comprobar que no falten datos
    if (!nombre || !apellido || !mail || !pass) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, rellena todos los campos obligatorios.',
      });
    }

    // Comprobar si el correo ya está registrado
    const connection = await getConnection();
    const [checkResults] = await connection.query(
      'SELECT * FROM usuarias WHERE mail = ?',
      [mail]
    );

    if (checkResults.length > 0) {
      throw new Error('El correo ya está registrado');
    }

    // Hash de la contraseña antes de almacenarla en la BD
    const hashedPassword = await bcrypt.hash(pass, 10);

    // Insertar nueva usuaria en la BD
    const [insertResults] = await connection.query(
      'INSERT INTO usuarias (nombre, apellido, mail, pass) VALUES (?, ?, ?, ?)',
      [nombre, apellido, mail, hashedPassword]
    );

    // Generar token JWT
    const token = jwt.sign(
      { usuariaId: insertResults.insertId, mail },
      process.env.JWT_SECRET
    );

    return res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Error en el registro', error);
    return res
      .status(500)
      .json({ success: false, message: 'Error en el registro' });
  }
});

//BONUS login de una usuaria
app.post('/login', async (req, res) => {
  try {
    const { mail, pass } = req.body;
    //comprobar si el correo y la contraseña existen
    if (!mail || !pass) {
      throw new Error('Introduce el correo y la contraseña');
    }
    const connection = await getConnection();
    //obtener la usuaria por el correo
    const selectQuery = 'SELECT * FROM usuarias WHERE mail = ?';
    const [userResults] = await connection.query(selectQuery, [mail]);
    if (userResults.length === 0) {
      throw new Error('Correo incorrecto');
    }
    //verificar la contraseña
    const hashedPassword = userResults[0].pass;
    const passCorrect = await bcrypt.compare(pass, hashedPassword);
    if (!passCorrect) {
      throw new Error('Contraseña incorrecta');
    }
    //Generar un token JWT
    const token = jwt.sign(
      { usuariaId: userResults[0].id, mail },
      process.env.JWT_SECRET
    );
    connection.end();
    res.json({ success: true, token });
  } catch (error) {
    console.log('Error en el inicio de sesión: ', error.message);
    res.status(401).json({ success: false, message: error.message });
  }
});
