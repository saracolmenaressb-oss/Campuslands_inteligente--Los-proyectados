const preguntas = [
    {
    id:1,
    categoria:"Estado emocional",
    pregunta:"¿Cómo te has sentido emocionalmente durante la última semana?",
    tipo:"emoji",
    opciones:[
    {emoji:"😀",texto:"Muy bien",valor:0},
    {emoji:"🙂",texto:"Bien",valor:1},
    {emoji:"😐",texto:"Regular",valor:2},
    {emoji:"😔",texto:"Mal",valor:3},
    {emoji:"😭",texto:"Muy mal",valor:4}
    ]
    },
    {
    id:2,
    categoria:"Estado emocional",
    pregunta:"¿Con qué frecuencia te has sentido triste?"
    },
    {
    id:3,
    categoria:"Estado emocional",
    pregunta:"¿Te has sentido solo desde que llegaste a esta ciudad?"
    },
    {
    id:4,
    categoria:"Estado emocional",
    pregunta:"¿Has sentido ansiedad por tus responsabilidades académicas?"
    },
    {
    id:5,
    categoria:"Estado emocional",
    pregunta:"¿Has perdido interés en actividades que antes disfrutabas?"
    },
    {
    id:6,
    categoria:"Adaptación universitaria",
    pregunta:"¿Te sientes adaptado a la vida universitaria?"
    },
    {
    id:7,
    categoria:"Adaptación universitaria",
    pregunta:"¿Has pensado en abandonar tus estudios?"
    },
    {
    id:8,
    categoria:"Adaptación universitaria",
    pregunta:"¿Sientes que tus calificaciones afectan tu bienestar emocional?"
    },
    {
    id:9,
    categoria:"Adaptación universitaria",
    pregunta:"¿Te sientes motivado para continuar tu carrera?"
    },
    {
    id:10,
    categoria:"Red de apoyo",
    pregunta:"¿Tienes amigos o compañeros con quienes hablar?"
    },
    {
    id:11,
    categoria:"Red de apoyo",
    pregunta:"¿Mantienes comunicación con tu familia?"
    },
    {
    id:12,
    categoria:"Red de apoyo",
    pregunta:"¿Participas en actividades universitarias?"
    },
    {
    id:13,
    categoria:"Riesgo psicológico",
    pregunta:"¿Has sentido que nada tiene sentido?"
    },
    {
    id:14,
    categoria:"Riesgo psicológico",
    pregunta:"¿Has tenido pensamientos de hacerte daño?",
    critica:true
    },
    {
    id:15,
    categoria:"Riesgo psicológico",
    pregunta:"¿Has pensado que sería mejor no seguir viviendo?",
    critica:true
    }
    ];
    const opcionesNormales = [
    {texto:"Nunca",valor:0},
    {texto:"Pocas veces",valor:1},
    {texto:"A veces",valor:2},
    {texto:"Frecuentemente",valor:3},
    {texto:"Siempre",valor:4}
    ];
    const contenedor = document.getElementById("contenedorPreguntas");
    let categoriaActual = "";
    preguntas.forEach(pregunta=>{
    if(categoriaActual!==pregunta.categoria){
    categoriaActual = pregunta.categoria;
    contenedor.innerHTML += `
    <div class="categoria">
    <h2>${categoriaActual}</h2>
    </div>
    `;
    }
    let htmlOpciones = "";
    if(pregunta.tipo==="emoji"){
    htmlOpciones = `
    <div class="emoji-group">
    ${pregunta.opciones.map(op=>`
    <label class="emoji-btn">
    <input
    type="radio"
    name="p${pregunta.id}"
    value="${op.valor}"
    hidden>
    ${op.emoji}
    <span class="emoji-texto">
    ${op.texto}
    </span>
    </label>
    `).join("")}
    </div>
    `;
    }else{
    htmlOpciones = `
    <div class="opciones">
    ${opcionesNormales.map(op=>`
    <label class="opcion">
    <input
    type="radio"
    name="p${pregunta.id}"
    value="${op.valor}"
    required>
    ${op.texto}
    </label>
    `).join("")}
    </div>
    `;
    }
    contenedor.innerHTML += `
    <div class="pregunta-card">
    <div class="numero">
    Pregunta ${pregunta.id}
    </div>
    <div class="pregunta">
    ${pregunta.pregunta}
    </div>
    ${htmlOpciones}
    </div>
    `;
    });
    const formulario = document.getElementById("formulario");
    formulario.addEventListener("submit",(e)=>{
    e.preventDefault();
    let puntaje = 0;
    let critica = false;
    preguntas.forEach(p=>{
    const respuesta =
    document.querySelector(
    `input[name="p${p.id}"]:checked`
    );
    if(!respuesta) return;
    const valor = Number(respuesta.value);
    puntaje += valor;
    if(
    p.critica &&
    valor >= 3
    ){
    critica = true;
    }
    });
    let nivel = "";
    if(critica){
    nivel = "CRÍTICO";
    }else if(puntaje <= 15){
    nivel = "BAJO";
    }else if(puntaje <= 30){
    nivel = "MEDIO";
    }else if(puntaje <= 45){
    nivel = "ALTO";
    }else{
    nivel = "CRÍTICO";
    }
    const evaluacion = {
    fecha:new Date().toLocaleDateString(),
    puntaje,
    nivel
    };
    const historial =
    JSON.parse(
    localStorage.getItem("evaluaciones")
    ) || [];
    historial.push(evaluacion);
    localStorage.setItem(
    "evaluaciones",
    JSON.stringify(historial)
    );
    if(
    nivel==="ALTO" ||
    nivel==="CRÍTICO"
    ){
    const alertas =
    JSON.parse(
    localStorage.getItem("alertas")
    ) || [];
    alertas.push({
    fecha:new Date().toLocaleDateString(),
    puntaje,
    nivel
    });
    localStorage.setItem(
    "alertas",
    JSON.stringify(alertas)
    );
    }
    mostrarResultado(nivel,puntaje);
    });
    function mostrarResultado(
    nivel,
    puntaje
    ){
    const resultado =
    document.getElementById("resultado");
    let mensaje = "";
    switch(nivel){
    case "BAJO":
    mensaje = `
    <h2>🟢 Riesgo Bajo</h2>
    <p>
    Gracias por responder.
    Sigue participando en actividades universitarias.
    </p>
    `;
    break;
    case "MEDIO":
    mensaje = `
    <h2>🟡 Riesgo Medio</h2>
    <p>
    Te recomendamos solicitar acompañamiento psicológico.
    </p>
    `;
    break;
    case "ALTO":
    mensaje = `
    <h2>🟠 Riesgo Alto</h2>
    <p>
    Hemos detectado señales de alerta.
    Te sugerimos contactar a Bienestar Universitario.
    </p>
    `;
    break;
    case "CRÍTICO":
    mensaje = `
    <h2>🔴 Riesgo Crítico</h2>
    <p>
    Se ha generado una alerta para el administrador.
    Nuestro equipo intentará contactarte.
    </p>
    `;
    break;
    }
    resultado.innerHTML = `
    ${mensaje}
    <p><strong>Puntaje:</strong> ${puntaje}</p>
    <div class="acciones-ayuda">
    <a
    class="btn-ayuda"
    href="https://wa.me/573001234567"
    target="_blank">
    💬 Hablar por WhatsApp
    </a>
    <a
    class="btn-ayuda"
    href="#">
    📅 Horarios de atención
    </a>
    </div>
    `;
    resultado.style.display = "block";
    window.scrollTo({
    top:document.body.scrollHeight,
    behavior:"smooth"
    });
}