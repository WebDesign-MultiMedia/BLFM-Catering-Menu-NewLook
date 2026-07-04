function showEventAlert() {
  const lang = localStorage.getItem("blfm-lang") || "es";
  const copy = {
    es: {
      title: "Hacemos Comida Para Eventos",
      body: "Perfecto para fiestas de cumpleaños, bautizos, baby showers, eventos de oficina y más. Todos los platillos están disponibles en charola chica, mediana o grande.",
    },
    en: {
      title: "We Cater Your Events",
      body: "Perfect for birthday parties, baptisms, baby showers, office events and more. All dishes are available in small, medium, or full trays.",
    },
  }[lang];

  Swal.fire({
    html: `
      <div style="
        font-family:'Roboto',sans-serif;
        font-weight:800;
        font-size:2rem;
        color:#fff;
        text-shadow:2px 2px 4px black;
        line-height:1.2;
        margin-bottom:0.75rem;
      ">
        ${copy.title}
      </div>
      <p style="
        font-family:'Roboto',sans-serif;
        font-size:0.95rem;
        color:rgba(255,255,255,0.92);
        text-shadow:1px 1px 2px black;
        line-height:1.8;
        margin:0;
      ">
        ${copy.body}
      </p>
    `,
    showConfirmButton: false,
    timer: 7000,
    timerProgressBar: true,
    background: '#006341',
    backdrop: 'rgba(0,0,0,0.75)',
    customClass: {
      popup:         'swal-popup-custom',
      timerProgressBar: 'swal-timer-custom',
      htmlContainer: 'swal-html-custom',
    }
  });
}

// Show the popup right away, as soon as the page loads — the menu
// itself is visible immediately underneath, this just floats on top of it.
document.addEventListener("DOMContentLoaded", () => {
  showEventAlert();
});
