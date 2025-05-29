document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('simulator-form');

  // Crear contenedor de resultados si no existe
  let resultadosDiv = document.getElementById('resultados');
  if (!resultadosDiv) {
    resultadosDiv = document.createElement('div');
    resultadosDiv.id = 'resultados';
    form.parentNode.appendChild(resultadosDiv);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Obtener valores del formulario
    const transporte = form.transporte.value;
    const tipoCarga = form.tipoCarga.value;
    const urgencia = form.urgencia.value;
    const distancia = parseFloat(form.distancia.value);
    const peso = parseFloat(form.peso.value);
    const clima = form.clima.value;
    const estadoCarretera = form.estadoCarretera.value;
    const trafico = form.trafico.value;

    // Validación básica
    if (
      !transporte || !tipoCarga || !urgencia || !distancia || !peso ||
      !clima || !estadoCarretera || !trafico
    ) {
      resultadosDiv.innerHTML = '<p style="color:red;">Por favor, complete todos los campos correctamente.</p>';
      return;
    }

    // Parámetros base de velocidad promedio (km/h)
    const velocidadesBase = {
      camion: 70,
      moto: 80,
      bicicleta: 25,
      dron: 50
    };

 const ajusteClima = {
  soleado: 1.05,     // mejora 5%
  nublado: 1,        // ya no reduce
  lluvia: 0.85       // menos penalización
};

const ajusteCarretera = {
  buena: 1.1,        // mejora 10%
  regular: 0.95,     // menor penalización
  mala: 0.8          // menor penalización que antes
};

const ajusteTrafico = {
  bajo: 1.1,         // mejora 10%
  medio: 0.95,       // mejora respecto a 0.85
  alto: 0.8          // menos restrictivo
};

const ajusteCarga = {
  perecedera: 1,                   // ya no penaliza
  no_perecedera: 1.05,            // mejora leve
  fragil: 0.95,                   // reduce penalización
  materiales_construccion: 1,     // ya no penaliza
  quimicos: 0.9,                  // menos castigo
  equipos_electronicos: 0.95,     // menos penalización
  textiles: 1,
  otros: 1.05                     // mejora leve
};

    // Ajuste por peso (en toneladas)
    let ajustePeso = 1;
    if (peso > 1000) {
      const toneladas = peso / 1000;
      ajustePeso = 1 - (0.02 * (toneladas - 1));
      if (ajustePeso < 0.5) ajustePeso = 0.5; // no bajar más del 50%
    }

    // Calcular velocidad efectiva
    let velocidadBase = velocidadesBase[transporte] || 50;
    let velocidad = velocidadBase *
                    (ajusteClima[clima] || 1) *
                    (ajusteCarretera[estadoCarretera] || 1) *
                    (ajusteCarga[tipoCarga] || 1) *
                    ajustePeso;
    if (velocidad < 8) velocidad = 8;

  // Calcular tiempo sin paradas
const tiempoSinParadas = distancia / velocidad;

// Aumentar realismo: más descansos, tráfico, curvas de montaña, control de peso, peajes, etc.

// Nuevos ajustes:
const descansos = Math.floor(tiempoSinParadas / 3);     // descanso cada 3h
const tiempoDescansos = descansos * 0.75;               // 45 min por descanso
const tiempoCargaDescarga = 1.3;                          // 1 hora
const tiempoMontaña = distancia > 300 ? 1 : 0;          // Añadir 1h por geografía difícil

// Tiempo total ajustado
const tiempoTotalHoras = tiempoSinParadas + tiempoDescansos + tiempoCargaDescarga + tiempoMontaña;


// Costo base por km según tipo de transporte
const costoPorKmBase = {
  camion: 0.75,
  moto: 0.8,
  bicicleta: 0.1,
  dron: 1.5
};
let costoPorKm = costoPorKmBase[transporte] || 1;

// Ajuste por tipo de carga con valores más detallados
let factorCargaCosto = 1;
switch (tipoCarga) {
  case 'quimicos':
    factorCargaCosto = 1.4; // +40% por carga peligrosa
    break;
  case 'fragil':
  case 'equipos_electronicos':
    factorCargaCosto = 1.25; // +25% por carga frágil
    break;
  case 'perecedera':
    factorCargaCosto = 1.15; // +15% por carga perecedera
    break;
  default:
    factorCargaCosto = 1; // carga normal sin incremento
}

// Aplicar ajuste por tipo de carga
costoPorKm *= factorCargaCosto;

// Cálculo costo total base (sin urgencia)
const costoTransporte = costoPorKm * distancia;

// Ajuste por urgencia (también para tiempo y costo)
let factorUrgenciaTiempo = 1;
let factorUrgenciaCosto = 1;

if (urgencia === 'alta') {
  factorUrgenciaTiempo = 0.85; // reduce tiempo (más rápido)
  factorUrgenciaCosto = 1.3;   // +30% en costo
} else if (urgencia === 'media') {
  factorUrgenciaTiempo = 0.95; // reduce un poco el tiempo
  factorUrgenciaCosto = 1.1;   // +10% en costo
} else {
  factorUrgenciaTiempo = 1;    // sin ajuste
  factorUrgenciaCosto = 1;
}

// Cálculo final ajustado por urgencia
const tiempoFinal = tiempoTotalHoras * factorUrgenciaTiempo;
const costoFinal = costoTransporte * factorUrgenciaCosto;


// Dentro del bloque if (transporte === 'camion') {...}

let recomendacionCamion = '';
let velocidadRecomendada = velocidad; // base

const pesoToneladas = peso / 1000;
if (pesoToneladas <= 3.5) {
  recomendacionCamion = 'Camión ligero (hasta 3.5 toneladas)';
  velocidadRecomendada = 50;
} else if (pesoToneladas <= 12) {
  recomendacionCamion = 'Camión mediano (3.5 - 12 toneladas)';
  velocidadRecomendada = 40;
} else if (pesoToneladas <= 25) {
  recomendacionCamion = 'Camión pesado (12 - 25 toneladas)';
  velocidadRecomendada = 35;
} else {
  recomendacionCamion = 'Camión extra pesado (más de 25 toneladas)';
  velocidadRecomendada = 30;
}

// Ajustes adicionales por clima y urgencia
if (clima === 'nublado') velocidadRecomendada -= 5;
if (clima === 'lluvia') velocidadRecomendada -= 10;
if (urgencia === 'alta' && clima !== 'lluvia') velocidadRecomendada += 10;
else if (urgencia === 'media' && clima === 'soleado') velocidadRecomendada += 5;
if (velocidadRecomendada < 25) velocidadRecomendada = 25;

// Recomendación según tipo de carga para tipo de camión
let tipoCamionCarga = '';
switch(tipoCarga) {
  case 'perecedera':
    tipoCamionCarga = 'Camión refrigerado';
    break;
  case 'fragil':
    tipoCamionCarga = 'Camión con suspensión especial para carga frágil';
    break;
  case 'materiales_construccion':
    tipoCamionCarga = 'Camión volquete o caja abierta';
    break;
  case 'quimicos':
    tipoCamionCarga = 'Camión cisterna o especializado con contención para químicos';
    break;
  case 'equipos_electronicos':
    tipoCamionCarga = 'Camión cerrado con amortiguación para equipos electrónicos';
    break;
  case 'textiles':
    tipoCamionCarga = 'Camión caja seca o cerrada estándar';
    break;
  default:
    tipoCamionCarga = 'Camión estándar';
}



// === NUEVA SECCIÓN: SOSTENIBILIDAD Y EMISIONES ===
let emisionesCO2 = 0;
let mensajeEmisiones = '';
let recomendacionSostenible = '';

// Factores de emisión estimados (kg CO2 por tonelada-km)
const factoresEmision = {
  camion: 0.13,
  moto: 0.11,
  bicicleta: 0.01, // muy bajo
  dron: 0.2        // alto por baterías y vuelos cortos
};

// Cálculo general
if (transporte in factoresEmision) {
  emisionesCO2 = (peso / 1000) * distancia * factoresEmision[transporte];
  emisionesCO2 = Math.round(emisionesCO2 * 100) / 100;

  if (emisionesCO2 > 100) {
    recomendacionSostenible = 'Busca alternativas más limpias como vehículos eléctricos o rutas más cortas.';
  } else if (emisionesCO2 > 50) {
    recomendacionSostenible = 'Considera consolidar envíos o reducir viajes innecesarios.';
  } else {
    recomendacionSostenible = 'Buena elección: impacto ambiental relativamente bajo.';
  }

  mensajeEmisiones = `
    <h4>Sostenibilidad</h4>
    <p><strong>Emisiones estimadas de CO₂:</strong> ${emisionesCO2} kg</p>
    <p>${recomendacionSostenible}</p>
  `;
}

    // Conclusiones y recomendaciones variadas
    const conclusiones = [];

    if (tiempoFinal > 5) conclusiones.push("El tiempo estimado es elevado, considera un transporte más rápido o planifica bien las paradas.");
    if (costoFinal > 500) conclusiones.push("El costo es alto, optimiza la carga o elige un transporte más económico.");
    if (tipoCarga === 'perecedera' && tiempoFinal > 3) conclusiones.push("La carga perecedera puede no resistir un tiempo prolongado.");
    if (transporte === 'dron' && peso > 10) conclusiones.push("El peso excede el límite recomendado para drones.");
    if (clima === 'lluvia') conclusiones.push("Las condiciones de lluvia pueden afectar la seguridad y velocidad del transporte.");
    if (estadoCarretera === 'mala') conclusiones.push("El estado malo de la carretera puede incrementar el riesgo y tiempo de entrega.");
    if (trafico === 'alto') conclusiones.push("El tráfico alto puede ocasionar retrasos considerables.");
    if (['fragil', 'equipos_electronicos'].includes(tipoCarga)) conclusiones.push("Manipula la carga con cuidado para evitar daños.");
    if (urgencia === 'alta') conclusiones.push("La alta urgencia puede incrementar los costos y riesgos del transporte.");

    // Mostrar resultados
    resultadosDiv.innerHTML = `
     <h3>Resultados de la simulación</h3>
  <p><strong>Velocidad promedio estimada:</strong> ${velocidad.toFixed(2)} km/h</p>
  <p><strong>Paradas totales (descanso + carga/descarga):</strong> ${descansos + 1}</p>
  <p><strong>Tiempo total estimado (con paradas):</strong> ${tiempoTotalHoras.toFixed(2)} horas</p>
  <p><strong>Tiempo final ajustado por urgencia:</strong> ${tiempoFinal.toFixed(2)} horas</p>
  <p><strong>Costo estimado de transporte:</strong> $${costoFinal.toFixed(2)}</p>
  <p><strong>Recomendación de camión:</strong> ${recomendacionCamion}</p>
  <p><strong>Velocidad sugerida según condiciones:</strong> ${velocidadRecomendada} km/h</p>
  <p><strong>Tipo de camión sugerido según carga:</strong> ${tipoCamionCarga}</p>
  ${mensajeEmisiones}

${transporte === 'camion' ? `
  <p><strong>Recomendación tipo camión según peso:</strong> ${recomendacionCamion} - velocidad recomendada: ${velocidadRecomendada} km/h</p>
  <p><strong>Recomendación tipo camión según carga:</strong> ${tipoCamionCarga}</p>
` : ''}


      <h4>Recomendaciones y conclusiones</h4>
      <ul>
        ${conclusiones.map(c => `<li>${c}</li>`).join('')}
      </ul>
    `;
  });
});
