
  // === CERRAR MENÚ AL HACER CLIC EN UN ENLACE ===
  const links = document.querySelectorAll(".menu li a");
  links.forEach(link => {
    link.addEventListener("click", () => {
      navbar.classList.remove("active");
    });
  });

  // === CONTROLADOR DEL BOTÓN DE MÚSICA ===
  const musicToggle = document.getElementById("music-toggle");
  const audio = document.querySelector("audio");

  if (musicToggle && audio) {
    musicToggle.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        musicToggle.querySelector("play.png").src = "play.png"; // reemplaza con ícono de pausa
      } else {
        audio.pause();
        musicToggle.querySelector("pausa.png").src = "pausa.png"; // reemplaza con ícono de reproducción
      }
    });
  }
;


// archivo: main.js (debes incluirlo con type="module" en el HTML)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Inicialización Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAOrDg2-KYYS9QWjVKYBsdsbDPsYFSTKW0",
  authDomain: "depilaser-studio.firebaseapp.com",
  databaseURL: "https://depilaser-studio-default-rtdb.firebaseio.com/",
  projectId: "depilaser-studio",
  storageBucket: "depilaser-studio.appspot.com",
  messagingSenderId: "535337712225",
  appId: "1:535337712225:web:1ca2ba142a99317fa9c820"
};
const db = getDatabase(initializeApp(firebaseConfig));

// Preguntas frecuentes
document.addEventListener('DOMContentLoaded', () => {
  const preguntas = document.querySelectorAll('.faq-question');

  preguntas.forEach((pregunta) => {
    pregunta.addEventListener('click', () => {
      preguntas.forEach((otrasPreguntas) => {
        if (otrasPreguntas !== pregunta) {
          otrasPreguntas.classList.remove('active');
          const otraRespuesta = otrasPreguntas.nextElementSibling;
          if (otraRespuesta) otraRespuesta.style.maxHeight = null;
        }
      });

      const respuesta = pregunta.nextElementSibling;
      if (!respuesta) return;

      if (pregunta.classList.contains('active')) {
        pregunta.classList.remove('active');
        respuesta.style.maxHeight = null;
      } else {
        pregunta.classList.add('active');
        respuesta.style.maxHeight = respuesta.scrollHeight + 'px';
      }
    });
  });
});

// Mostrar botón de WhatsApp al hacer scroll
window.addEventListener('scroll', () => {
  const scrollPosition = window.scrollY + window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const whatsappButton = document.querySelector('.whatsapp-button');

  if (whatsappButton) {
    whatsappButton.classList.toggle('visible', scrollPosition >= documentHeight - 10);
  }
});

// Modal de reservas
window.abrirFormulario = () => {
  const modal = document.getElementById("formularioModal");
  if (modal) modal.style.display = "block";
};

window.cerrarFormulario = () => {
  const modal = document.getElementById("formularioModal");
  if (modal) modal.style.display = "none";
};



// Envío de formulario a Firebase
const form = document.getElementById("formReserva");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(form).entries());

    try {
      await push(ref(db, "reservas"), datos);
      mostrarConfirmacion("✅ ¡Reserva enviada con éxito!");
      form.reset();
      setTimeout(cerrarFormulario, 2000);
    } catch (err) {
      mostrarConfirmacion("❌ Error: " + err.message);
    }
  });
}

// Alerta flotante
function mostrarConfirmacion(mensaje) {
  const alerta = document.createElement("div");
  alerta.className = "alerta-confirmacion";
  alerta.textContent = mensaje;
  document.body.appendChild(alerta);
  setTimeout(() => alerta.remove(), 2500);
}



//para trasncisiones de las secciones
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.2 // Se activa cuando el 20% de la sección es visible
});

// Selecciona todas las secciones con clase "seccion"
document.querySelectorAll('.seccion').forEach(section => {
  observer.observe(section);
});

