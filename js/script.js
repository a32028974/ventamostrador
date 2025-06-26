
document.getElementById("formulario-trabajo").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => { data[key] = value; });

  // Generar número único de trabajo si está vacío
  if (!data["numero_trabajo"]) {
    data["numero_trabajo"] = Date.now().toString().slice(-6);
  }

  const resumen = `
    <h2>Resumen</h2>
    <p><strong>Trabajo:</strong> ${data.numero_trabajo}</p>
    <p><strong>Paciente:</strong> ${data.nombre} (DNI: ${data.dni})</p>
    <p><strong>Vendedor:</strong> ${data.vendedor}</p>
    <p><strong>Cristal:</strong> ${data.cristal}</p>
    <p><strong>Armazón:</strong> ${data.numero_armazon} - ${data.armazon_detalle}</p>
    <p><strong>Forma de Pago:</strong> ${data.forma_pago}</p>
  `;
  document.getElementById("resumen").innerHTML = resumen;
  document.getElementById("resumen").classList.remove("oculto");

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycby5PfVWteJxuXlCfkRDrS73uvFTVtRdWPhtK7rKd4h9sotqPuOZ-kf5ZbdE3ufx9Isxjw/exec", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
      alert("Trabajo guardado exitosamente.");
      window.print();
      form.reset();
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    alert("Error al conectar con el servidor.");
  }
});

function llenarGraduaciones() {
  const esf = [], cil = [];
  for (let i = -24; i <= 24; i += 0.25) esf.push((i >= 0 ? "+" : "") + i.toFixed(2));
  for (let i = -7; i <= 7; i += 0.25) cil.push((i >= 0 ? "+" : "") + i.toFixed(2));
  esf.forEach(v => {
    document.getElementById("od_esf").innerHTML += `<option value="${v}">${v}</option>`;
    document.getElementById("oi_esf").innerHTML += `<option value="${v}">${v}</option>`;
  });
  cil.forEach(v => {
    document.getElementById("od_cil").innerHTML += `<option value="${v}">${v}</option>`;
    document.getElementById("oi_cil").innerHTML += `<option value="${v}">${v}</option>`;
  });
}
llenarGraduaciones();
