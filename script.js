let numeroTrabajo = 100000; 
const resumen = document.getElementById("resumen");

// URL para guardar datos en Google Sheet
const URL_GUARDAR = "https://script.google.com/macros/s/AKfycbzn6mj__xRB8JjPdkYgrsyTtb1sRNX2Hcs5O0byIlaG0dXCz-cUVRNaprPKYrnF2EQp/exec";
const URL_ARMAZONES = "https://script.google.com/macros/s/AKfycbyZpgCOy4VFFPE_gq_jpv9Ed5KsPjJqLAX-8SEohVRYl_qAm2PIpEtpAALLvRx9Bdt7Pg/exec";

// Generar opciones para selectores de ESF y CIL
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
  const trabajoID = numeroTrabajo++;

  let subtipo = "";
  if (datos.tipo_lente === "monofocal") {
    subtipo = datos.subtipo_monofocal ? `de ${datos.subtipo_monofocal}` : "";
  } else if (datos.tipo_lente === "bifocal") {
    if (datos.subtipo_bifocal === "kriptock_comun") subtipo = "kriptock común";
    if (datos.subtipo_bifocal === "kriptock_invisible") subtipo = "kriptock invisible";
    if (datos.subtipo_bifocal === "flattop") subtipo = "flattop";
  }

  const tipoCristal = `${datos.tipo_lente} ${subtipo} ${datos.material} ${datos.cristal}${datos.marca_antirreflejo ? " marca: " + datos.marca_antirreflejo : ""}${datos.color ? " color: " + datos.color : ""}`;

  const armazon = datos.opcion_armazon === "no_registrado"
    ? datos.armazon_no_registrado
    : datos.opcion_armazon === "cliente"
    ? datos.armazon_cliente
    : document.getElementById("datos-armazon").innerText || "No encontrado";

  const graduacionOD = `ESF ${datos.od_esf} ${datos.od_cil ? "CIL " + datos.od_cil : ""} ${datos.od_eje ? "EJE " + datos.od_eje + "°" : ""}`;
  const graduacionOI = `ESF ${datos.oi_esf} ${datos.oi_cil ? "CIL " + datos.oi_cil : ""} ${datos.oi_eje ? "EJE " + datos.oi_eje + "°" : ""}`;

  const payload = {
    fecha,
    trabajoID,
    dni: datos.dni,
    nombre: datos.nombre,
    tipoCristal,
    armazon,
    oculista: datos.jimena ? "JIMENA" : datos.oculista || "",
    observaciones: datos.otros_adicionales || "",
    od: graduacionOD,
    oi: graduacionOI,
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
    // Si se guardó bien, actualizar el stock
    const numero = document.getElementById("numero-armazon").value;
    if (numero) {
      await fetch(`${URL_ARMAZONES}?vender=${numero}`, {
        method: "GET",
      });
    }

    window.print();
    form.reset();
    resumen.classList.add("oculto");
  } else {
    alert("Ocurrió un error al guardar el trabajo. Intentá de nuevo.");
  }
} catch (error) {
  console.error("Error en la carga:", error);
  alert("No se pudo guardar el trabajo. Verificá tu conexión.");
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
  <p><strong>Fecha:</strong> ${data.fecha}</p>
  <p><strong>N° Trabajo:</strong> ${data.trabajoID}</p>
  <p><strong>Nombre:</strong> ${data.nombre}</p>
  <p><strong>DNI:</strong> ${data.dni}</p>
  <p><strong>Tipo de Cristal:</strong> ${data.tipoCristal}</p>
  <p><strong>Graduación OD:</strong> ${data.od}</p>
  <p><strong>Graduación OI:</strong> ${data.oi}</p>
  <p><strong>Armazón:</strong> ${data.armazon}</p>
  <p><strong>Oculista:</strong> ${data.oculista}</p>
  <p><strong>Observaciones:</strong> ${data.observaciones}</p>`;
  resumen.classList.remove("oculto");
}

document.getElementById("buscar-armazon").addEventListener("click", async () => {
  const nro = document.getElementById("numero-armazon").value;
  if (!nro) return;

  const response = await fetch(`${URL_ARMAZONES}?sheet=Stock`);
  const result = await response.json();
  const encontrado = result.find(r => r["A"] === nro);

  const datosDiv = document.getElementById("datos-armazon");
  if (encontrado) {
    const info = `Modelo: ${encontrado["B"]}, Color: ${encontrado["C"]}, Tamaño: ${encontrado["E"]}, Precio: ${encontrado["H"]}`;
    alert("Armazón encontrado: " + info);
    datosDiv.innerHTML = `
      <p><strong>Modelo:</strong> ${encontrado["B"]}</p>
      <p><strong>Color:</strong> ${encontrado["C"]}</p>
      <p><strong>Tamaño:</strong> ${encontrado["E"]}</p>
      <p><strong>Precio:</strong> ${encontrado["H"]}</p>`;
  } else {
    alert("No se encontró el armazón.");
    datosDiv.innerHTML = "<p style='color:red;'>No se encontró el armazón.</p>";
  }
});

document.getElementById("btn-consulta").addEventListener("click", async () => {
  const valor = document.getElementById("consulta").value.trim();
  if (!valor) {
    alert("Ingresá un número de trabajo o DNI");
    return;
  }

  const response = await fetch(`${URL_GUARDAR}?consultar=${valor}`);
  const resultado = await response.json();

  if (!resultado || !resultado.encontrado) {
    alert("No se encontró ningún trabajo con ese dato.");
    return;
  }

  const form = document.getElementById("formulario-trabajo");

  form.nombre.value = resultado.nombre || "";
  form.dni.value = resultado.dni || "";
  form.oculista.value = resultado.oculista || "";
  form.jimena.checked = resultado.oculista?.toUpperCase() === "JIMENA";
  form.otros_adicionales.value = resultado.observaciones || "";
  form.od_esf.value = extraerDato(resultado.od, "ESF");
  form.od_cil.value = extraerDato(resultado.od, "CIL");
  form.od_eje.value = extraerDato(resultado.od, "EJE");
  form.oi_esf.value = extraerDato(resultado.oi, "ESF");
  form.oi_cil.value = extraerDato(resultado.oi, "CIL");
  form.oi_eje.value = extraerDato(resultado.oi, "EJE");

  alert("Trabajo cargado en el formulario.");
});

function extraerDato(texto, clave) {
  if (!texto) return "";
  const regex = new RegExp(`${clave} ([^\\s°]+)`);
  const match = texto.match(regex);
  return match ? match[1] : "";
}

document.querySelectorAll("input[name='tipo_lente']").forEach(radio => {
  radio.addEventListener("change", actualizarOpcionesTipoLente);
});

function actualizarOpcionesTipoLente() {
  const tipo = document.querySelector("input[name='tipo_lente']:checked").value;
  const divMonofocal = document.getElementById("opciones-monofocal");
  const divBifocal = document.getElementById("opciones-bifocal");

  divMonofocal.classList.add("oculto");
  divBifocal.classList.add("oculto");

  limpiarRadios("subtipo_monofocal");
  limpiarRadios("subtipo_bifocal");

  if (tipo === "monofocal") {
    divMonofocal.classList.remove("oculto");
  } else if (tipo === "bifocal") {
    divBifocal.classList.remove("oculto");
  }
}

function limpiarRadios(nombre) {
  document.querySelectorAll(`input[name='${nombre}']`).forEach(el => el.checked = false);
}
