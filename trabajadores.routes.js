//encargado de administrar la llamada de los procedimientos
import express from 'express';
import oracledb from 'oracledb';
import bcrypt from 'bcrypt';

const router = express.Router();

const dbConfig = {
  user: 'SYSTEM',
  password: 'admin',
  connectString: 'localhost:1521/XEPDB1',
};

// Obtener todos los trabajadores
router.get('/', async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute('SELECT * FROM EMSD_TRABAJADORES');
    await connection.close();
    res.status(200).send(result.rows);
  } catch (err) {
    console.error('Error al obtener trabajadores:', err);
    res.status(500).send({ error: 'Error al obtener trabajadores', details: err.message });
  }
});

// Crear un trabajador
router.post('/', async (req, res) => {
  const { nombre, apellido1, apellido2, telefono, codRol, sueldo, contrasena } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10); // Hashear la contraseña

    const connection = await oracledb.getConnection(dbConfig);

    // Llamar al procedimiento almacenado para insertar
    await connection.execute(
      `BEGIN
         EMSD_TRABAJADORES_CRUD(
           P_OPCION => 'INSERT',
           P_COD_TRABAJADOR => NULL,
           P_NOMBRE => :nombre,
           P_APELLIDO1 => :apellido1,
           P_APELLIDO2 => :apellido2,
           P_TELEFONO => :telefono,
           P_COD_ROL => :codRol,
           P_SUELDO => :sueldo,
           P_EMAIL => EMSD_EMAIL_TRABAJADOR(:nombre, :apellido1), -- Generar email automáticamente
           P_CONTRASENA => :hashedPassword
         );
       END;`,
      {
        nombre,
        apellido1,
        apellido2,
        telefono,
        codRol,
        sueldo,
        hashedPassword,
      }
    );

    await connection.close();
    res.status(201).send({ message: 'Trabajador registrado correctamente.' });
  } catch (err) {
    console.error('Error al registrar trabajador:', err);
    res.status(500).send({ error: 'Error al registrar trabajador', details: err.message });
  }
});

// Actualizar un trabajador
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido1, apellido2, telefono, codRol, sueldo, contrasena } = req.body;

  try {
    const hashedPassword = contrasena ? await bcrypt.hash(contrasena, 10) : null; // Solo hashear si se envía contraseña

    const connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `BEGIN
         EMSD_TRABAJADORES_CRUD(
           P_OPCION => 'UPDATE',
           P_COD_TRABAJADOR => :id,
           P_NOMBRE => :nombre,
           P_APELLIDO1 => :apellido1,
           P_APELLIDO2 => :apellido2,
           P_TELEFONO => :telefono,
           P_COD_ROL => :codRol,
           P_SUELDO => :sueldo,
           P_EMAIL => NULL, -- No se actualiza el email automáticamente
           P_CONTRASENA => :hashedPassword
         );
       END;`,
      {
        id,
        nombre,
        apellido1,
        apellido2,
        telefono,
        codRol,
        sueldo,
        hashedPassword,
      }
    );

    await connection.close();
    res.status(200).send({ message: 'Trabajador actualizado correctamente.' });
  } catch (err) {
    console.error('Error al actualizar trabajador:', err);
    res.status(500).send({ error: 'Error al actualizar trabajador', details: err.message });
  }
});

// Eliminar un trabajador
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `BEGIN
         EMSD_TRABAJADORES_CRUD(
           P_OPCION => 'DELETE',
           P_COD_TRABAJADOR => :id,
           P_NOMBRE => NULL,
           P_APELLIDO1 => NULL,
           P_APELLIDO2 => NULL,
           P_TELEFONO => NULL,
           P_COD_ROL => NULL,
           P_SUELDO => NULL,
           P_EMAIL => NULL,
           P_CONTRASENA => NULL
         );
       END;`,
      { id }
    );

    await connection.close();
    res.status(200).send({ message: 'Trabajador eliminado correctamente.' });
  } catch (err) {
    console.error('Error al eliminar trabajador:', err);
    res.status(500).send({ error: 'Error al eliminar trabajador', details: err.message });
  }
});

export default router;
