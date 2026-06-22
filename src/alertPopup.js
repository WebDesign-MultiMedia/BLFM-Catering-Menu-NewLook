function showEventAlert() {
  Swal.fire({
    html: `
      <div style="
        font-family:'Cookie',system-ui;
        font-size:2.6rem;
        color:#fff;
        text-shadow:2px 2px 4px black;
        line-height:1.2;
        margin-bottom:0.75rem;
      ">
        Hacemos Comida Para Eventos
      </div>
      <p style="
        font-family:'Roboto',sans-serif;
        font-size:0.95rem;
        color:rgba(255,255,255,0.92);
        text-shadow:1px 1px 2px black;
        line-height:1.8;
        margin:0;
      ">
        Perfecto para fiestas de cumpleaños, bautizos, baby showers, eventos de oficina y más.
        Todos los platillos están disponibles por charola o por libra.
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
