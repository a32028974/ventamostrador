let numeroTrabajo = 100000;

document.getElementById("formulario-trabajo").addEventListener("submit", function (e) {
  e.preventDefault();

  // Validar campos y mostrar resumen
  const resumen = document.getElementById("resumen");
  resumen.innerHTML = "<strong>Resumen de carga:</strong><br><br>";

  const form = e.target;
  const datos = new FormData(form);
  datos.forEach((value, key) => {
    resumen.innerHTML += `<strong>${key}:</strong> ${value}<br>`;
  });

  resumen.classList.remove("oculto");

  // TODO: enviar a Google Sheets y luego:
  numeroTrabajo++;
  form.reset();
});

document.getElementById("buscar-armazon").addEventListener("click", function () {
  const nro = document.getElementById("numero-armazon").value;
  if (!nro) return;

  fetch("https://script.google.com/macros/s/AKfycbyZpgCOy4VFFPE_gq_jpv9Ed5KsPjJqLAX-8SEohVRYl_qAm2PIpEtpAALLvRx9Bdt7Pg/exec?sheet=Stock")
    .then(res => res.json())
    .then(data => {
      const match = data.find(item => item["A"] === nro);
      if (match) {
        document.getElementById("datos-armazon").innerHTML = `
          <p><strong>Modelo:</strong> ${match["B"]}</p>
          <p><strong>Color:</strong> ${match["C"]}</p>
          <p><strong>Tamaño:</strong> ${match["E"]}</p>
          <p><strong>Precio:</strong> ${match["H"]}</p>
        `;
      } else {
        document.getElementById("datos-armazon").innerText = "No encontrado.";
      }
    });
});

function buscarTrabajo() {
  const dni = prompt("Ingresá DNI o número de trabajo:");
  if (dni) {
    // TODO: Buscar en Google Sheet si existe el trabajo y mostrarlo
    alert("Funcionalidad en desarrollo.");
  }
}
