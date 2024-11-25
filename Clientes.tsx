import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever, MdPassword } from "react-icons/md";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Logo from "../src/assets/logo-negro.png";

function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const navigate = useNavigate();

  // Función para obtener la lista de clientes desde el backend
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch('http://localhost:3000/ver-clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error('Error al obtener los clientes');
        }

        const data = await response.json();
        setClientes(data);
      } catch (err) {
        console.error('Error:', err);
        alert('Ocurrió un error al cargar los clientes');
      }
    };

    fetchClientes();
  }, []);

  // Función para manejar la edición de un cliente
  const handleEdit = (userid: number) => {
    navigate(`/editar-cliente/${userid}`);
  };

  // Función para manejar la eliminación de un cliente
  const handleDelete = (userid: number) => {
    navigate(`/eliminar-cliente/${userid}`);
  };

  const handlePassword = (userid: number) => {
    navigate(`/contrasena-cliente/${userid}`);
  };

  // Función para generar el PDF al hacer clic en "Exportar Clientes"
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
        doc.text(`Reporte de Clientes`, 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Fecha: ${fechaActual}`, 190, 10, { align: "right" });

        // Preparar los datos para la tabla
        const headers = [["RUT", "Nombre", "Teléfono", "Email"]];
        const data = clientes.map((cliente: any) => [
          cliente.id,
          cliente.nombre+' '+cliente.apellido1+' '+cliente.apellido2,
          cliente.telefono,
          cliente.email,
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

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Clientes - Silcar</title>
        </Helmet>
      </HelmetProvider>

      <div className="text-container" style={{ width: "70%" }}>
        <div className="section-header">
          <h2>Lista de Clientes</h2>
          <Link to="/registrar-cliente">Agregar Cliente</Link>
          {/* Enlace para exportar clientes a PDF */}
          <a href="#" onClick={(e) => { e.preventDefault(); generarPDF(); }}>
            Exportar Clientes
          </a>
        </div>

        <div className="section">
          {clientes.length === 0 ? (
            <p>No hay clientes registrados.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido Paterno</th>
                  <th>Apellido Materno</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.apellido1}</td>
                    <td>{cliente.apellido2}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.telefono}</td>
                    <td>
                      <div className="icon" style={{ color: "#000000" }}>
                        <FaEdit onClick={() => handleEdit(cliente.id)} />
                      </div>
                      <div className="icon" style={{ color: "#000000" }}>
                        <MdDeleteForever onClick={() => handleDelete(cliente.id)} />
                      </div>
                      <div className="icon" style={{ color: "#000000" }}>
                        <MdPassword onClick={() => handlePassword(cliente.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default Clientes;
