//Funcionalidad del apartado de trabajadores


import React, { useState, useEffect } from 'react';
import axios from 'axios';



const Trabajadores = () => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido1: '',
    apellido2: '',
    telefono: '',
    codRol: '',
    sueldo: '',
    email: '',
    contrasena: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Obtener trabajadores al cargar la página
  useEffect(() => {
    axios.get('/api/trabajadores')
      .then(response => setTrabajadores(response.data))
      .catch(error => console.error(error));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      axios.put(`/api/trabajadores/${editingId}`, formData)
        .then(() => {
          setIsEditing(false);
          setEditingId(null);
          fetchTrabajadores();
        })
        .catch(error => console.error(error));
    } else {
      axios.post('/api/trabajadores', formData)
        .then(() => fetchTrabajadores())
        .catch(error => console.error(error));
    }
    setFormData({
      nombre: '',
      apellido1: '',
      apellido2: '',
      telefono: '',
      codRol: '',
      sueldo: '',
      email: '',
      contrasena: '',
    });
  };

  const fetchTrabajadores = () => {
    axios.get('/api/trabajadores')
      .then(response => setTrabajadores(response.data))
      .catch(error => console.error(error));
  };

  const handleEdit = (id: number) => {
    const trabajador = trabajadores.find((t: any) => t.COD_TRABAJADOR === id);
    setFormData(trabajador);
    setIsEditing(true);
    setEditingId(id);
  };

  const handleDelete = (id: number) => {
    axios.delete(`/api/trabajadores/${id}`)
      .then(() => fetchTrabajadores())
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h1>Trabajadores</h1>
      <form onSubmit={handleSubmit}>
        <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
        <input name="apellido1" value={formData.apellido1} onChange={handleChange} placeholder="Apellido Paterno" required />
        <input name="apellido2" value={formData.apellido2} onChange={handleChange} placeholder="Apellido Materno" />
        <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono" />
        <button type="submit">{isEditing ? 'Actualizar' : 'Agregar'}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido Paterno</th>
            <th>Apellido Materno</th>
            <th>Teléfono</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          {trabajadores.map((trabajador: any) => (
            <tr key={trabajador.COD_TRABAJADOR}>
              <td>{trabajador.NOMBRE_TRABAJADOR}</td>
              <td>{trabajador.APELLIDO1_TRABAJADOR}</td>
              <td>{trabajador.APELLIDO2_TRABAJADOR}</td>
              <td>{trabajador.TELEFONO}</td>
              <td>
                <button onClick={() => handleEdit(trabajador.COD_TRABAJADOR)}>Editar</button>
                <button onClick={() => handleDelete(trabajador.COD_TRABAJADOR)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Trabajadores;
