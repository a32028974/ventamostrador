document.getElementById("formulario-trabajo").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  // Generar fecha actual y número de trabajo
  const fecha = new Date();
  const fechaHoy = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  data["fecha"] = fechaHoy;
  data["numero_trabajo"] = Date.now();

  const resumen = `
    <h2>Resumen del trabajo</h2>
    <p><strong>Fecha:</strong> ${data.fecha}</p>
    <p><strong>N° Trabajo:</strong> ${data.numero_trabajo}</p>
    <p><strong>Nombre:</strong> ${data.nombre}</p>
    <p><strong>DNI:</strong> ${data.dni}</p>
    <p><strong>Tipo de Cristal:</strong> ${data.cristal}</p>
    <p><strong>Graduación OD:</strong> ESF ${data.od_esf} CIL ${data.od_cil} EJE ${data.od_eje}</p>
    <p><strong>Graduación OI:</strong> ESF ${data.oi_esf} CIL ${data.oi_cil} EJE ${data.oi_eje}</p>
    <p><strong>ADD:</strong> ${data.add}</p>
    <p><strong>Armazón:</strong> ${data.numero_armazon || "No encontrado"}</p>
    <p><strong>Forma de Pago:</strong> ${data.forma_pago}</p>
  `;

  document.getElementById("resumen").innerHTML = resumen;
  document.getElementById("resumen").classList.remove("oculto");

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwnY731m7CL6alaeRAeBPX9FhKiOR5iqjLNmyEGtmbvf96bDdtggRs-yJ8PMpYKibiy/exec",
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();
    if (result.success) {
      alert("Trabajo guardado exitosamente.");
      window.print();
      form.reset();
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    alert("No se pudo conectar con el servidor");
  }
});

// Llenar selects de graduación
function llenarGraduaciones() {
  const esfValues = [];
  const cilValues = [];

  for (let i = -24; i <= 24; i += 0.25) {
    const valor = i === 0 ? "0" : i.toFixed(2);
    esfValues.push(valor.startsWith("-") ? valor : "+" + valor);
  }

  for (let i = -7; i <= 7; i += 0.25) {
    const valor = i === 0 ? "0" : i.toFixed(2);
    cilValues.push(valor.startsWith("-") ? valor : "+" + valor);
  }

  const od_esf = document.getElementById("od_esf");
  const od_cil = document.getElementById("od_cil");
  const oi_esf = document.getElementById("oi_esf");
  const oi_cil = document.getElementById("oi_cil");

  esfValues.forEach((val) => {
    od_esf.innerHTML += `<option value="${val}">${val}</option>`;
    oi_esf.innerHTML += `<option value="${val}">${val}</option>`;
  });

  cilValues.forEach((val) => {
    od_cil.innerHTML += `<option value="${val}">${val}</option>`;
    oi_cil.innerHTML += `<option value="${val}">${val}</option>`;
  });
}

llenarGraduaciones();
