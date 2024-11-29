import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaFileInvoiceDollar } from "react-icons/fa";
import { FaFileInvoice, FaFileExcel, FaFileCircleCheck } from "react-icons/fa6";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Logo from "../src/assets/logo-negro.png";

import { FaFilePdf } from "react-icons/fa6";





function Venta () {
    const [ventas, setVentas] = useState<any[]>([]);

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
          const headers = [["Codigo Venta", "Trabajador", "Cliente", "Patente Vehiculo","Fecha y Hora","Servicios Realizados","Precio Final","Estado"]];
          const data = ventas
          .filter((venta: any) => venta.rol !== 1)
          .map((venta: any) => [
            venta.id,
            venta.trabajador,
            venta.cliente,
            venta.patente,
            venta.fecha,
            venta.servicios,
            venta.costo,
            venta.estado
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
          doc.save("reporte_ventas.pdf");
        };
      } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert("No se pudo generar el reporte. Por favor, intenta nuevamente.");
      }
    };

   // Función para obtener las ventas
   const fetchVentas = async () => {
    try {
        const response = await fetch('http://localhost:3000/ver-ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        });

        if (!response.ok) {
        throw new Error('Error al obtener las ventas realizadas');
        }

        const data = await response.json();
        setVentas(data);
        } catch (err) {
            console.error('Error:', err);
            alert('Ocurrió un error al cargar las ventas realizadas');
        }
    };

        // Llamar a fetchVentas cuando el componente se monta
        useEffect(() => {
            fetchVentas();
        }, []);

    const handleCancelSell = async (id:number) => {
        const confirmDelete = window.confirm(`¿Estás seguro de que deseas anular la venta: ${id}?`);
        if (!confirmDelete) return;

        try {
            const response = await fetch('http://localhost:3000/anular-venta', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            });
        
            if (!response.ok) {
              throw new Error('Error al anular venta.');
            }

            fetchVentas();

            alert('Venta anulada correctamente.');
          } catch (err) {
            console.error('Error:', err);
            alert('Ocurrió un error al intentar anular la venta.');
          }
        };

        const handleConfirmSell = async (id:number) => {
            const confirmDelete = window.confirm(`¿Estás seguro de que deseas cancelar la anulación de la venta: ${id}?`);
            if (!confirmDelete) return;
    
            try {
                const response = await fetch('http://localhost:3000/cancelar-anulacion-venta', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id }),
                });
            
                if (!response.ok) {
                  throw new Error('Error al cancelar anulación de la venta.');
                }
    
                fetchVentas();
    
                alert('Venta confirmada correctamente.');
              } catch (err) {
                console.error('Error:', err);
                alert('Ocurrió un error al intentar cancelar la anulación de la venta.');
              }
            };

    return (
        <>  
        <HelmetProvider>
            <Helmet>
                <title>Ventas - Silcar</title>
            </Helmet>
        </HelmetProvider>

        <body>
            <div className="text-container" style={{width:"80%"}}>
                <div className="section-header">
                    <h1>Ventas</h1>
                    <Link to="/realizar-venta"><FaFileInvoiceDollar className="icon" style={{color:"#000000"}}/></Link>
                    <FaFilePdf onClick={(e) => { e.preventDefault(); generarPDF(); }} />
                </div> 
                <div className="section">
          {ventas.length === 0 ? (
            <p>No hay ventas registradas.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Código venta</th>
                  <th>Trabajador</th>
                  <th>Cliente</th>
                  <th>Patente vehículo</th> 
                  <th>Fecha y hora</th>
                  <th>Servicios realizados</th>
                  <th>Precio final</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.id}>
                    <td>{venta.id}</td> 
                    <td>{venta.trabajador}</td>
                    <td>{venta.cliente}</td>
                    <td>{venta.patente}</td>
                    <td>{venta.fecha}</td>
                    <td>
                        {venta.servicios.length > 0 && venta.servicios.map((servicio:string) => <>{servicio}<br/></>)}
                        {venta.otros_servicios && <div>Otros servicios: {venta.otros_servicios}</div>}
                    </td>
                    <td>{venta.costo}</td>
                    <td>{venta.estado}</td>
                    <td>
                        <FaFileInvoice className="icon" style={{color:"#000000"}}/>
                        {venta.estado == "COMPLETADA" ? 
                        <FaFileExcel className="icon" style={{color:"#000000"}} onClick={() => handleCancelSell(venta.id)}/> : 
                            <FaFileCircleCheck className="icon" style={{color:"#000000"}} onClick={() => handleConfirmSell(venta.id)}/>}
                        
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

export default Venta