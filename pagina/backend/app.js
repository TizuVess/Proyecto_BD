const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de la base de datos
const dbConfig = {
  user: 'SYSTEM',
  password: 'bdsm_msed',
  connectString: 'localhost:1521/XEPDB1', // Cambia según tu configuración
};

// Ruta para registro
app.post('/register', async (req, res) => {
  const { nombre, email, usuario, contrasena } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Llamar al procedimiento almacenado
    const result = await connection.execute(
      `BEGIN
         PR_USUARIOS_CRUD(
           P_OPERACION => 'INSERT',
           P_COD_USUARIO => NULL,
           P_NOMBRE => :nombre,
           P_EMAIL => :email,
           P_USUARIO => :usuario,
           P_CONTRASEÑA => :contrasena
         );
       END;`,
      { nombre, email, usuario, contrasena }
    );

    res.status(200).send({ message: 'Usuario registrado correctamente' });
    await connection.close();
  } catch (err) {
    console.error('Error en la base de datos:', err);
    res.status(500).send({
      error: 'Error al registrar el usuario',
      details: err.message,
    });
  }
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor ejecutándose en http://localhost:3000');
});
