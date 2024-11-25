import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever, MdPassword } from "react-icons/md";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Logo from "../src/assets/logo-negro.png";

function Trabajadores() {
  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrabajadores = async () => {
      try {
        const response = await fetch('http://localhost:3000/ver-trabajadores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error('Error al obtener los trabajadores');
        }

        const data = await response.json();
        setTrabajadores(data);
      } catch (err) {
        console.error('Error:', err);
        alert('Ocurrió un error al cargar los trabajadores');
      }
    };

    fetchTrabajadores();
  }, []);

  // Función para manejar la edición de un cliente
  const handleEdit = (userid: number) => {
    navigate(`/editar-trabajador/${userid}`);
  };

  // Función para manejar la eliminación de un cliente
  const handleDelete = (userid: number) => {
    navigate(`/eliminar-trabajador/${userid}`);
  };

  const handlePassword = (userid: number) => {
    navigate(`/contrasena-trabajador/${userid}`);
  };

  const generarPDF = async () => {
    try {
      // Crear un nuevo documento PDF
      const doc = new jsPDF();

      // Obtener la fecha actual en formato numérico (DD/MM/YYYY)
      const fechaActual = new Date().toLocaleDateString("es-ES");

      // Leer el logo como base64
      const img = new Image();
      img.src = Logo;

      img.onload = () => {
        // Añadir el logo al PDF
        doc.addImage(img, "PNG", 10, 10, 40, 20);

        // Configurar el título del reporte con la fecha
        doc.setFontSize(16);
        doc.text(`Reporte de Trabajadores`, 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Fecha: ${fechaActual}`, 190, 10, { align: "right" });

        // Preparar los datos para la tabla
        const headers = [["RUT", "Nombre", "Teléfono", "Email","Rol","Sueldo"]];
        const data = trabajadores.map((trabajador: any) => [
          trabajador.id,
          trabajador.nombre+' '+trabajador.apellido1+' '+trabajador.apellido2,
          trabajador.telefono,
          trabajador.email,
          trabajador.rol,
          trabajador.sueldo,
        ]);

 

        // Generar la tabla con jspdf-autotable
        (doc as any).autoTable({
          head: headers,
          body: data,
          startY: 40,
          theme: "striped",
          headStyles: { fillColor: [0, 0, 0] },
        });

        // Descargar el PDF
        doc.save("reporte_clientes.pdf");
      };
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("No se pudo generar el reporte. Por favor, intenta nuevamente.");
    }
  };




  const meId = localStorage.getItem('userId')

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Trabajadores - Silcar</title>
        </Helmet>
      </HelmetProvider>

      <body>
      <div className="text-container" style={{width:"70%"}}>
        <div className="section-header">
          <h2>Lista de Trabajadores</h2>
          <Link to="/registrar-trabajador">Agregar Trabajador</Link>
          <a href="#" onClick={(e) => { e.preventDefault(); generarPDF(); }}>
            Exportar Trabajadores
          </a>
        </div>

        <div className="section">
          {trabajadores.length === 0 ? (
            <p>No hay trabajadores registrados.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido Paterno</th>
                  <th>Apellido Materno</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Sueldo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {trabajadores.map((trabajador) => (
                  <tr key={trabajador.id}>
                    <td>{trabajador.nombre}</td>
                    <td>{trabajador.apellido1}</td>
                    <td>{trabajador.apellido2}</td>
                    <td>{trabajador.email}</td>
                    <td>{trabajador.telefono}</td>
                    <td>{trabajador.rol}</td>
                    <td>{trabajador.sueldo}</td>
                    <td>     
                      {meId != trabajador.id && (
                      <>
                      <div className="icon" style={{ color: "#000000" }}>
                        <FaEdit onClick={() => handleEdit(trabajador.id)} />
                      </div>
                      <div className="icon" style={{ color: "#000000" }}>
                        <MdDeleteForever onClick={() => handleDelete(trabajador.id)} />
                      </div>
                      <div className="icon" style={{ color: "#000000" }}>
                        <MdPassword onClick={() => handlePassword(trabajador.id)} />
                      </div>
                      </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </body>
    </>
  );
}

export default Trabajadores;
