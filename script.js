// script.js adaptado para nuevo Google Sheet

const URL_GUARDAR = "https://script.google.com/macros/s/AKfycbwV9CdSjhlgsG4pIa8LFHtO9u3x-gTrc4mlEX3-Z_HwHdXsgmrI--WWA6bTCi-1ZKob3Q/exec";
const resumen = document.getElementById("resumen");

function generarOpcionesSelect(min, max) {
  const opciones = ['<option value="">Seleccionar</option>'];
  for (let i = min * 4; i <= max * 4; i++) {
    const valor = (i / 4).toFixed(2);
    opciones.push(`<option value="${valor > 0 ? '+' + valor : valor}">${valor > 0 ? '+' + valor : valor}</option>`);
  }
  return opciones.join('\n');
}

document.addEventListener("DOMContentLoaded", () => {
  const campos = ["od_esf", "oi_esf"];
  campos.forEach(id => {
    document.getElementById(id).innerHTML = generarOpcionesSelect(-24, 24);
  });

  const camposCil = ["od_cil", "oi_cil"];
  camposCil.forEach(id => {
    document.getElementById(id).innerHTML = generarOpcionesSelect(-7, 7);
  });
});

document.getElementById("formulario-trabajo").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;

  if (!validarGraduaciones()) return;

  const data = new FormData(form);
  const datos = Object.fromEntries(data.entries());

  const fecha = new Date().toLocaleDateString("es-AR");
  const trabajoID = datos.numero_trabajo || Date.now();

  const tipoCristal = `${datos.cristal || ""}`;
  const armazon = document.getElementById("datos-armazon").innerText || "No encontrado";

  const graduacionOD = `ESF ${datos.od_esf} ${datos.od_cil ? "CIL " + datos.od_cil : ""} ${datos.od_eje ? "EJE " + datos.od_eje + "°" : ""}`;
  const graduacionOI = `ESF ${datos.oi_esf} ${datos.oi_cil ? "CIL " + datos.oi_cil : ""} ${datos.oi_eje ? "EJE " + datos.oi_eje + "°" : ""}`;

  const payload = {
    estado: "",
    fecha_encarga: fecha,
    fecha_retira: datos.fecha_retira || "",
    numero_trabajo: trabajoID,
    dni: datos.dni,
    nombre: datos.nombre,
    cristal: tipoCristal,
    numero_armazon: datos.numero_armazon,
    armazon_detalle: armazon,
    total: datos.total,
    sena: datos.sena,
    saldo: datos.saldo,
    forma_pago: datos.forma_pago,
    otro_concepto: datos.otro_concepto || "",
    descripcion: datos.descripcion || "",
    tipo: datos.tipo || "",
    esf_od: datos.od_esf,
    cil_od: datos.od_cil,
    eje_od: datos.od_eje,
    esf_oi: datos.oi_esf,
    cil_oi: datos.oi_cil,
    eje_oi: datos.oi_eje,
    add: datos.add || ""
  };

  mostrarResumen(payload);

  try {
    const response = await fetch(URL_GUARDAR, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const resultado = await response.json();

    if (resultado.estado === "ok") {
      alert("Trabajo registrado correctamente");
      window.print();
      form.reset();
      resumen.classList.add("oculto");
    } else {
      alert("Error al registrar el trabajo");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo conectar con el servidor");
  }
});

function validarGraduaciones() {
  const od_cil = document.querySelector("[name='od_cil']").value;
  const od_eje = document.querySelector("[name='od_eje']").value;
  const oi_cil = document.querySelector("[name='oi_cil']").value;
  const oi_eje = document.querySelector("[name='oi_eje']").value;

  if (od_cil && (od_eje === "" || od_eje < 0 || od_eje > 180)) {
    alert("Si OD tiene CIL, debe tener EJE entre 0 y 180");
    return false;
  }
  if (oi_cil && (oi_eje === "" || oi_eje < 0 || oi_eje > 180)) {
    alert("Si OI tiene CIL, debe tener EJE entre 0 y 180");
    return false;
  }
  return true;
}

function mostrarResumen(data) {
  resumen.innerHTML = `<h3>Resumen del trabajo</h3>
  <p><strong>Fecha:</strong> ${data.fecha_encarga}</p>
  <p><strong>N° Trabajo:</strong> ${data.numero_trabajo}</p>
  <p><strong>Nombre:</strong> ${data.nombre}</p>
  <p><strong>DNI:</strong> ${data.dni}</p>
  <p><strong>Tipo de Cristal:</strong> ${data.cristal}</p>
  <p><strong>Graduación OD:</strong> ESF ${data.esf_od} CIL ${data.cil_od} EJE ${data.eje_od}</p>
  <p><strong>Graduación OI:</strong> ESF ${data.esf_oi} CIL ${data.cil_oi} EJE ${data.eje_oi}</p>
  <p><strong>ADD:</strong> ${data.add}</p>
  <p><strong>Armazón:</strong> ${data.armazon_detalle}</p>
  <p><strong>Forma de Pago:</strong> ${data.forma_pago}</p>`;
  resumen.classList.remove("oculto");
}
