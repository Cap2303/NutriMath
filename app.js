// ============================================
// ESTADO GLOBAL DE LA APP
// ============================================

let estadoApp = {
    perfil: null,
    comidas: {
        desayuno: [],
        comida: [],
        cena: []
    }
};

const CLAVE_LOCALSTORAGE = 'nutrimath_sesion_v1';

// ============================================
// UTILIDADES
// ============================================

const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

function mostrar(id, contenido) {
    const el = $(id);
    el.innerHTML = contenido;
    el.classList.remove('hidden');
}

function ocultar(id) {
    $(id).classList.add('hidden');
}

// ============================================
// AVISOS FLOTANTES
// ============================================

let timeoutAviso = null;

function mostrarAvisoBloqueo(mensaje, esExito = false) {
    const aviso = $('aviso-bloqueo');
    aviso.textContent = mensaje;
    aviso.classList.add('visible');

    if (esExito) {
        aviso.classList.add('exito');
    } else {
        aviso.classList.remove('exito');
    }

    if (timeoutAviso) clearTimeout(timeoutAviso);
    timeoutAviso = setTimeout(() => {
        aviso.classList.remove('visible');
    }, 2500);
}

// ============================================
// CONTROL DE ACCESO POR PERFIL
// ============================================

const SECCIONES_BLOQUEADAS = ['comidas', 'ecuaciones', 'dashboard', 'dieta'];

function actualizarBloqueoPestañas() {
    const hayPerfil = estadoApp.perfil !== null;

    SECCIONES_BLOQUEADAS.forEach(seccion => {
        const btn = document.querySelector(`.nav-btn[data-seccion="${seccion}"]`);
        if (!btn) return;

        if (hayPerfil) {
            btn.classList.remove('bloqueado');
        } else {
            btn.classList.add('bloqueado');
        }
    });
}

// ============================================
// PERSISTENCIA CON LOCALSTORAGE
// ============================================

function guardarSesion() {
    if (!estadoApp.perfil) {
        mostrarAvisoBloqueo('Primero registra tu perfil antes de guardar');
        return;
    }

    try {
        const datos = JSON.stringify(estadoApp);
        localStorage.setItem(CLAVE_LOCALSTORAGE, datos);

        const btn = $('btn-guardar-sesion');
        btn.textContent = 'Guardado';
        btn.classList.add('guardado');

        setTimeout(() => {
            btn.textContent = 'Guardar Sesión';
            btn.classList.remove('guardado');
        }, 2000);

        mostrarAvisoBloqueo('Sesión guardada correctamente', true);
    } catch (e) {
        alert('Error al guardar la sesión: ' + e.message);
    }
}

function cargarSesion() {
    try {
        const datos = localStorage.getItem(CLAVE_LOCALSTORAGE);
        if (!datos) return false;

        const cargado = JSON.parse(datos);

        if (cargado.perfil) {
            estadoApp.perfil = cargado.perfil;
        }
        if (cargado.comidas) {
            estadoApp.comidas = {
                desayuno: cargado.comidas.desayuno || [],
                comida: cargado.comidas.comida || [],
                cena: cargado.comidas.cena || []
            };
        }
        return true;
    } catch (e) {
        console.error('Error al cargar la sesión:', e);
        return false;
    }
}

function borrarTodo() {
    const confirmar = confirm('¿Seguro que quieres borrar TODA la sesión? Se eliminarán el perfil, las comidas y todos los datos guardados. Esta acción no se puede deshacer.');
    if (!confirmar) return;

    localStorage.removeItem(CLAVE_LOCALSTORAGE);
    location.reload();
}

function restaurarInterfazDesdeSesion() {
    if (!estadoApp.perfil) return;

    const p = estadoApp.perfil;

    $('peso').value = p.peso;
    $('altura').value = p.alturaCm;
    $('edad').value = p.edad;
    $('sexo').value = p.sexo;
    $('objetivo').value = p.objetivo;

    let color;
    if (p.imc < 18.5) color = '#f39c12';
    else if (p.imc < 25) color = '#2ecc71';
    else if (p.imc < 30) color = '#e67e22';
    else color = '#e74c3c';

    const html = `
        <h3>Resultados del Análisis</h3>
        <div class="totales-grid">
            <div class="total-item">
                <span class="valor">${p.imc}</span>
                <span class="etiqueta">IMC · ${p.clasificacion}</span>
            </div>
            <div class="total-item">
                <span class="valor">${p.tmb}</span>
                <span class="etiqueta">TMB (kcal)</span>
            </div>
            <div class="total-item">
                <span class="valor">${p.get}</span>
                <span class="etiqueta">Gasto (kcal)</span>
            </div>
            <div class="total-item" style="background: ${color};">
                <span class="valor">${p.kcalObjetivo}</span>
                <span class="etiqueta">${p.objetivoTexto}</span>
            </div>
        </div>
        <div style="margin-top: 1rem; padding: 0.8rem; background: white; border-radius: 8px;">
            <p><strong>Fórmula usada (Mifflin-St Jeor):</strong></p>
            <p class="paso">
                ${p.sexo === 'm'
                    ? `TMB = (10 × ${p.peso}) + (6.25 × ${p.alturaCm}) − (5 × ${p.edad}) + 5 = ${p.tmb} kcal`
                    : `TMB = (10 × ${p.peso}) + (6.25 × ${p.alturaCm}) − (5 × ${p.edad}) − 161 = ${p.tmb} kcal`}
            </p>
            <p class="paso">GET = TMB × 1.55 (actividad moderada) = ${p.get} kcal</p>
            <p class="paso">Objetivo (${p.objetivoTexto}): ${p.kcalObjetivo} kcal/día</p>
        </div>
    `;
    mostrar('resultado-perfil', html);

    renderizarListaComidas();
    actualizarBloqueoPestañas();
}

// ============================================
// NAVEGACIÓN ENTRE PESTAÑAS
// ============================================

function inicializarNavegacion() {
    const botones = $$('.nav-btn');
    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            const seccionId = btn.dataset.seccion;

            if (SECCIONES_BLOQUEADAS.includes(seccionId) && estadoApp.perfil === null) {
                mostrarAvisoBloqueo('Primero debes registrar tu perfil');
                return;
            }

            botones.forEach(b => b.classList.remove('active'));
            $$('.seccion').forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            $(seccionId).classList.add('active');

            if (seccionId === 'dashboard') {
                renderizarDashboard();
            }
            if (seccionId === 'dieta') {
                renderizarDieta();
            }
        });
    });

    $$('.btn-interno').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.btn-interno').forEach(b => b.classList.remove('active'));
            $$('.panel-ecuacion').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const panelId = `panel-${btn.dataset.tipo}`;
            $(panelId).classList.add('active');
        });
    });
}

// ============================================
// REINICIO DE DATOS AL CAMBIAR PERFIL
// ============================================

function reiniciarDatosPorCambioPerfil() {
    estadoApp.comidas = { desayuno: [], comida: [], cena: [] };

    const listaComidas = $('lista-comidas');
    if (listaComidas) listaComidas.innerHTML = '';

    const resumen = $('resumen-totales');
    if (resumen) resumen.innerHTML = '';

    const tbody = $('tabla-desglose')?.querySelector('tbody');
    if (tbody) tbody.innerHTML = '';

    if (typeof instanciaBarras !== 'undefined' && instanciaBarras) {
        instanciaBarras.destroy();
        instanciaBarras = null;
    }
    if (typeof instanciaAnillo !== 'undefined' && instanciaAnillo) {
        instanciaAnillo.destroy();
        instanciaAnillo = null;
    }

    const contenidoDieta = $('contenido-dieta');
    if (contenidoDieta) contenidoDieta.innerHTML = '';

    ['resultado-2x2', 'resultado-3x3', 'resultado-joules'].forEach(id => {
        const el = $(id);
        if (el) {
            el.innerHTML = '';
            el.classList.add('hidden');
        }
    });

    const cantidadInput = $('cantidad-alimento');
    if (cantidadInput) cantidadInput.value = '';
    const selectAlimento = $('select-alimento');
    if (selectAlimento) selectAlimento.value = '';
}

// ============================================
// MÓDULO PERFIL
// ============================================

function calcularPerfil() {
    const peso = parseFloat($('peso').value);
    const alturaCm = parseFloat($('altura').value);
    const edad = parseInt($('edad').value);
    const sexo = $('sexo').value;
    const objetivo = $('objetivo').value;

    // ---- VALIDACIÓN 1: Campos vacíos ----
    if (!peso || !alturaCm || !edad) {
        alert('Por favor llena todos los campos:\n- Peso\n- Altura\n- Edad');
        return;
    }

    // ---- VALIDACIÓN 2: Peso ----
    if (peso < 30 || peso > 250) {
        alert(`Peso fuera de rango.\n\nDebe estar entre 30 kg y 250 kg.\nIngresaste: ${peso} kg`);
        return;
    }

    // ---- VALIDACIÓN 3: Altura ----
    if (alturaCm < 120 || alturaCm > 230) {
        alert(`Altura fuera de rango.\n\nDebe estar entre 120 cm y 230 cm.\nIngresaste: ${alturaCm} cm`);
        return;
    }

    // ---- VALIDACIÓN 4: Edad ----
    if (edad < 10 || edad > 100) {
        alert(`Edad fuera de rango.\n\nDebe estar entre 10 y 100 años.\nIngresaste: ${edad} años`);
        return;
    }

    const alturaM = alturaCm / 100;
    const imc = +(peso / (alturaM * alturaM)).toFixed(2);

    let tmb;
    if (sexo === 'm') {
        tmb = (10 * peso) + (6.25 * alturaCm) - (5 * edad) + 5;
    } else {
        tmb = (10 * peso) + (6.25 * alturaCm) - (5 * edad) - 161;
    }

    const get = tmb * 1.55;

    let kcalObjetivo;
    let objetivoTexto;
    if (objetivo === 'volumen') {
        kcalObjetivo = Math.round(get + 400);
        objetivoTexto = 'Volumen limpio (+400 kcal)';
    } else if (objetivo === 'deficit') {
        kcalObjetivo = Math.round(get - 400);
        objetivoTexto = 'Déficit (-400 kcal)';
    } else {
        kcalObjetivo = Math.round(get);
        objetivoTexto = 'Mantenimiento';
    }

    let clasificacion, color;
    if (imc < 18.5) { clasificacion = 'Bajo peso'; color = '#f39c12'; }
    else if (imc < 25) { clasificacion = 'Normal'; color = '#2ecc71'; }
    else if (imc < 30) { clasificacion = 'Sobrepeso'; color = '#e67e22'; }
    else { clasificacion = 'Obesidad'; color = '#e74c3c'; }

    const perfilAnterior = estadoApp.perfil;
    const huboCambio = perfilAnterior !== null && (
        perfilAnterior.peso !== peso ||
        perfilAnterior.alturaCm !== alturaCm ||
        perfilAnterior.edad !== edad ||
        perfilAnterior.sexo !== sexo ||
        perfilAnterior.objetivo !== objetivo
    );

    estadoApp.perfil = {
        peso, alturaCm, edad, sexo, objetivo,
        imc, clasificacion, tmb: Math.round(tmb),
        get: Math.round(get), kcalObjetivo, objetivoTexto
    };

    if (huboCambio) {
        reiniciarDatosPorCambioPerfil();
    }

    const html = `
        <h3>Resultados del Análisis</h3>
        <div class="totales-grid">
            <div class="total-item">
                <span class="valor">${imc}</span>
                <span class="etiqueta">IMC · ${clasificacion}</span>
            </div>
            <div class="total-item">
                <span class="valor">${Math.round(tmb)}</span>
                <span class="etiqueta">TMB (kcal)</span>
            </div>
            <div class="total-item">
                <span class="valor">${Math.round(get)}</span>
                <span class="etiqueta">Gasto (kcal)</span>
            </div>
            <div class="total-item" style="background: ${color};">
                <span class="valor">${kcalObjetivo}</span>
                <span class="etiqueta">${objetivoTexto}</span>
            </div>
        </div>
        <div style="margin-top: 1rem; padding: 0.8rem; background: white; border-radius: 8px;">
            <p><strong>Fórmula usada (Mifflin-St Jeor):</strong></p>
            <p class="paso">
                ${sexo === 'm'
                    ? `TMB = (10 × ${peso}) + (6.25 × ${alturaCm}) − (5 × ${edad}) + 5 = ${Math.round(tmb)} kcal`
                    : `TMB = (10 × ${peso}) + (6.25 × ${alturaCm}) − (5 × ${edad}) − 161 = ${Math.round(tmb)} kcal`}
            </p>
            <p class="paso">GET = TMB × 1.55 (actividad moderada) = ${Math.round(get)} kcal</p>
            <p class="paso">Objetivo (${objetivoTexto}): ${kcalObjetivo} kcal/día</p>
        </div>
    `;

    mostrar('resultado-perfil', html);
    actualizarBloqueoPestañas();

    if (huboCambio) {
        mostrarAvisoBloqueo('Perfil actualizado. Se borraron los datos anteriores');
    } else {
        mostrarAvisoBloqueo('Perfil registrado correctamente', true);
    }
}

// ============================================
// MÓDULO COMIDAS
// ============================================

function poblarSelectAlimentos() {
    const selects = ['select-alimento', 'alimento-x', 'alimento-y', 'alimento-x3', 'alimento-y3', 'alimento-z3'];
    selects.forEach(selId => {
        const sel = $(selId);
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Selecciona --</option>';
        Object.keys(BASE_ALIMENTOS).forEach(key => {
            const al = BASE_ALIMENTOS[key];
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = `${al.nombre} (por 100${al.unidad})`;
            sel.appendChild(opt);
        });
    });
}

function agregarAlimento() {
    const tiempo = $('tiempo-comida').value;
    const keyAlimento = $('select-alimento').value;
    const cantidad = parseFloat($('cantidad-alimento').value);

    if (!keyAlimento || !cantidad || cantidad <= 0) {
        alert('Selecciona un alimento y una cantidad válida');
        return;
    }

    const alimento = BASE_ALIMENTOS[keyAlimento];
    const macros = calcularMacros(alimento, cantidad);

    estadoApp.comidas[tiempo].push({
        key: keyAlimento,
        nombre: alimento.nombre,
        unidad: alimento.unidad,
        cantidad,
        macros
    });

    $('cantidad-alimento').value = '';
    $('select-alimento').value = '';

    renderizarListaComidas();
}

function eliminarAlimento(tiempo, index) {
    estadoApp.comidas[tiempo].splice(index, 1);
    renderizarListaComidas();
}

function renderizarListaComidas() {
    const contenedor = $('lista-comidas');
    const tiempos = ['desayuno', 'comida', 'cena'];
    let html = '';

    tiempos.forEach(tiempo => {
        const items = estadoApp.comidas[tiempo];
        if (items.length === 0) return;

        const totales = items.reduce((acc, it) => ({
            kcal: acc.kcal + it.macros.kcal,
            grasas: acc.grasas + it.macros.grasas,
            proteinas: acc.proteinas + it.macros.proteinas,
            azucares: acc.azucares + it.macros.azucares
        }), { kcal: 0, grasas: 0, proteinas: 0, azucares: 0 });

        html += `<div class="comida-bloque">
            <h4>${tiempo}</h4>`;

        items.forEach((it, idx) => {
            html += `
                <div class="item-alimento">
                    <div class="info">
                        <strong>${it.nombre}</strong> · ${it.cantidad}${it.unidad}
                        <br>
                        <small>${it.macros.kcal} kcal · ${it.macros.grasas}g grasa · ${it.macros.proteinas}g prot · ${it.macros.azucares}g azúc</small>
                    </div>
                    <button class="btn-eliminar" onclick="eliminarAlimento('${tiempo}', ${idx})">×</button>
                </div>
            `;
        });

        html += `
            <div style="margin-top: 0.6rem; padding-top: 0.6rem; border-top: 2px solid var(--naranja); font-size: 0.9rem;">
                <strong>Subtotal:</strong> ${totales.kcal.toFixed(1)} kcal · ${totales.grasas.toFixed(1)}g grasa · ${totales.proteinas.toFixed(1)}g prot · ${totales.azucares.toFixed(1)}g azúc
            </div>
        </div>`;
    });

    if (html === '') {
        html = '<p style="text-align:center; color:#7f8c8d; padding:1rem;">Aún no has registrado alimentos.</p>';
    }

    contenedor.innerHTML = html;
}

function limpiarTodo() {
    if (!confirm('¿Seguro que quieres borrar todos los alimentos registrados en esta sesión?')) return;
    estadoApp.comidas = { desayuno: [], comida: [], cena: [] };
    renderizarListaComidas();
}

// ============================================
// MÓDULO DASHBOARD
// ============================================

function renderizarDashboard() {
    const totalesPorFase = calcularTotalesPorFase();
    const totalesGlobales = calcularTotalesGlobales(totalesPorFase);

    const hayDatos = totalesGlobales.kcal > 0;

    if (!hayDatos) {
        $('resumen-totales').innerHTML = `
            <p style="text-align:center; color:#7f8c8d; grid-column: 1 / -1; padding: 1rem;">
                Aún no hay alimentos registrados. Ve a la pestaña <strong>Comidas</strong> para empezar.
            </p>
        `;
        $('tabla-desglose').querySelector('tbody').innerHTML = '';
        return;
    }

    $('resumen-totales').innerHTML = `
        <div class="total-item">
            <span class="valor">${totalesGlobales.kcal.toFixed(0)}</span>
            <span class="etiqueta">Calorías totales</span>
        </div>
        <div class="total-item" style="background: linear-gradient(135deg, #3498db, #2980b9);">
            <span class="valor">${totalesGlobales.grasas.toFixed(1)}</span>
            <span class="etiqueta">Grasas (g)</span>
        </div>
        <div class="total-item" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">
            <span class="valor">${totalesGlobales.proteinas.toFixed(1)}</span>
            <span class="etiqueta">Proteínas (g)</span>
        </div>
        <div class="total-item" style="background: linear-gradient(135deg, #f39c12, #e67e22);">
            <span class="valor">${totalesGlobales.azucares.toFixed(1)}</span>
            <span class="etiqueta">Azúcares (g)</span>
        </div>
    `;

    const tbody = $('tabla-desglose').querySelector('tbody');
    const fases = ['desayuno', 'comida', 'cena'];
    let html = '';

    fases.forEach(fase => {
        const items = estadoApp.comidas[fase];
        const t = totalesPorFase[fase];

        if (items.length === 0) return;

        const nombres = items.map(it => `${it.nombre} (${it.cantidad}${it.unidad})`).join(', ');

        html += `
            <tr>
                <td style="text-transform:capitalize; font-weight:600;">${fase}</td>
                <td style="font-size:0.85rem;">${nombres}</td>
                <td>${t.kcal.toFixed(1)}</td>
                <td>${t.grasas.toFixed(1)}</td>
                <td>${t.proteinas.toFixed(1)}</td>
                <td>${t.azucares.toFixed(1)}</td>
            </tr>
        `;
    });

    html += `
        <tr style="background: #ecf0f1; font-weight: 700;">
            <td colspan="2">TOTAL</td>
            <td>${totalesGlobales.kcal.toFixed(1)}</td>
            <td>${totalesGlobales.grasas.toFixed(1)}</td>
            <td>${totalesGlobales.proteinas.toFixed(1)}</td>
            <td>${totalesGlobales.azucares.toFixed(1)}</td>
        </tr>
    `;

    tbody.innerHTML = html;

    renderizarGraficaBarras(totalesPorFase);
    renderizarGraficaAnillo(totalesGlobales);
}

// ============================================
// MÓDULO DIETA RECOMENDADA
// ============================================

const MENUS_RECOMENDADOS = {
    volumen: [
        { tiempo: 'desayuno', key: 'huevo', cantidad: 300 },
        { tiempo: 'desayuno', key: 'jamon', cantidad: 100 },
        { tiempo: 'desayuno', key: 'tortilla_maiz', cantidad: 120 },
        { tiempo: 'desayuno', key: 'leche_entera', cantidad: 200 },
        { tiempo: 'desayuno', key: 'chocomilk', cantidad: 13 },
        { tiempo: 'comida', key: 'pechuga_pollo', cantidad: 250 },
        { tiempo: 'comida', key: 'nopal', cantidad: 150 },
        { tiempo: 'comida', key: 'tortilla_maiz', cantidad: 60 },
        { tiempo: 'comida', key: 'mini_crunch', cantidad: 24 },
        { tiempo: 'cena', key: 'bolillo', cantidad: 60 },
        { tiempo: 'cena', key: 'bistec_res', cantidad: 150 },
        { tiempo: 'cena', key: 'corn_flakes', cantidad: 40 },
        { tiempo: 'cena', key: 'leche_entera', cantidad: 250 }
    ],
    mantenimiento: [
        { tiempo: 'desayuno', key: 'huevo', cantidad: 200 },
        { tiempo: 'desayuno', key: 'jamon', cantidad: 80 },
        { tiempo: 'desayuno', key: 'tortilla_maiz', cantidad: 90 },
        { tiempo: 'desayuno', key: 'leche_entera', cantidad: 200 },
        { tiempo: 'desayuno', key: 'chocomilk', cantidad: 10 },
        { tiempo: 'comida', key: 'pechuga_pollo', cantidad: 200 },
        { tiempo: 'comida', key: 'nopal', cantidad: 150 },
        { tiempo: 'comida', key: 'tortilla_maiz', cantidad: 60 },
        { tiempo: 'cena', key: 'bolillo', cantidad: 60 },
        { tiempo: 'cena', key: 'bistec_res', cantidad: 120 },
        { tiempo: 'cena', key: 'corn_flakes', cantidad: 30 },
        { tiempo: 'cena', key: 'leche_entera', cantidad: 200 }
    ],
    deficit: [
        { tiempo: 'desayuno', key: 'huevo', cantidad: 150 },
        { tiempo: 'desayuno', key: 'jamon', cantidad: 60 },
        { tiempo: 'desayuno', key: 'tortilla_maiz', cantidad: 60 },
        { tiempo: 'comida', key: 'pechuga_pollo', cantidad: 200 },
        { tiempo: 'comida', key: 'nopal', cantidad: 200 },
        { tiempo: 'comida', key: 'tortilla_maiz', cantidad: 30 },
        { tiempo: 'cena', key: 'bistec_res', cantidad: 100 },
        { tiempo: 'cena', key: 'nopal', cantidad: 100 },
        { tiempo: 'cena', key: 'bolillo', cantidad: 40 }
    ]
};

const DESCRIPCION_OBJETIVO = {
    volumen: 'Menú de volumen limpio diseñado para sostener un superávit calórico agresivo, con alta carga proteica y calórica para ganar masa muscular sin grasa extra.',
    mantenimiento: 'Menú balanceado para mantener el peso y la composición corporal actual, con proteína suficiente para conservar masa muscular.',
    deficit: 'Menú hipocalórico con alta densidad proteica y vegetales, ideal para perder grasa preservando la masa muscular.'
};

function calcularMacrosMenu(menu) {
    return menu.reduce((acc, item) => {
        const al = BASE_ALIMENTOS[item.key];
        const m = calcularMacros(al, item.cantidad);
        return {
            kcal: acc.kcal + m.kcal,
            grasas: acc.grasas + m.grasas,
            proteinas: acc.proteinas + m.proteinas,
            azucares: acc.azucares + m.azucares,
            carbohidratos: acc.carbohidratos + m.carbohidratos
        };
    }, { kcal: 0, grasas: 0, proteinas: 0, azucares: 0, carbohidratos: 0 });
}

function calcularMetasPerfil(perfil) {
    const { peso, kcalObjetivo, objetivo } = perfil;

    let factorProteina;
    if (objetivo === 'volumen') factorProteina = 2.0;
    else if (objetivo === 'deficit') factorProteina = 2.2;
    else factorProteina = 1.8;

    const proteinas = +(peso * factorProteina).toFixed(1);
    const grasas = +(peso * 1.0).toFixed(1);
    const kcalAzucaresMax = kcalObjetivo * 0.10;
    const azucares = +(kcalAzucaresMax / 4).toFixed(1);
    const kcalRestantes = kcalObjetivo - (proteinas * 4) - (grasas * 9);
    const carbohidratos = +(kcalRestantes / 4).toFixed(1);

    return { proteinas, grasas, azucares, carbohidratos };
}

function escalarMenu(menuBase, kcalObjetivo) {
    const kcalBase = menuBase.reduce((acc, item) => {
        const al = BASE_ALIMENTOS[item.key];
        return acc + calcularMacros(al, item.cantidad).kcal;
    }, 0);

    const factor = kcalObjetivo / kcalBase;

    return menuBase.map(item => ({
        ...item,
        cantidad: +(item.cantidad * factor).toFixed(2)
    }));
}

function renderizarDieta() {
    if (!estadoApp.perfil) return;

    const { objetivo, kcalObjetivo } = estadoApp.perfil;
    const menuBase = MENUS_RECOMENDADOS[objetivo];

    const kcalBase = menuBase.reduce((acc, item) => {
        const al = BASE_ALIMENTOS[item.key];
        return acc + calcularMacros(al, item.cantidad).kcal;
    }, 0);
    const factorEscala = kcalObjetivo / kcalBase;

    const menu = escalarMenu(menuBase, kcalObjetivo);
    const macrosMenu = calcularMacrosMenu(menu);
    const metas = calcularMetasPerfil(estadoApp.perfil);

    const comidas = {
        desayuno: menu.filter(m => m.tiempo === 'desayuno'),
        comida: menu.filter(m => m.tiempo === 'comida'),
        cena: menu.filter(m => m.tiempo === 'cena')
    };

    let html = `
        <div class="dieta-header">
            <h3>Objetivo: ${estadoApp.perfil.objetivoTexto}</h3>
            <p><strong>Meta diaria:</strong> ${kcalObjetivo} kcal · ${metas.proteinas} g proteína · ${metas.grasas} g grasa · ${metas.azucares} g azúcar máx</p>
            <p style="margin-top:0.6rem;">${DESCRIPCION_OBJETIVO[objetivo]}</p>
        </div>

        <div class="aviso-escalado">
            <strong>Porciones ajustadas a tus ${kcalObjetivo} kcal objetivo</strong>
            <p>El menú base aporta ${kcalBase.toFixed(0)} kcal. Se aplicó una regla de 3 con factor de escala ${factorEscala.toFixed(4)} para adaptar cada porción exactamente a tu meta calórica.</p>
            <p class="paso">Factor = ${kcalObjetivo} kcal ÷ ${kcalBase.toFixed(0)} kcal = ${factorEscala.toFixed(4)}</p>
        </div>
    `;

    const nombresFase = { desayuno: 'Desayuno', comida: 'Comida', cena: 'Cena' };

    ['desayuno', 'comida', 'cena'].forEach(fase => {
        const items = comidas[fase];
        if (items.length === 0) return;

        const kcalFase = items.reduce((acc, item) => {
            const al = BASE_ALIMENTOS[item.key];
            return acc + calcularMacros(al, item.cantidad).kcal;
        }, 0);

        html += `<div class="comida-dieta">
            <h4>${nombresFase[fase]} <span class="badge-kcal">${kcalFase.toFixed(1)} kcal</span></h4>`;

        items.forEach(item => {
            const al = BASE_ALIMENTOS[item.key];
            const m = calcularMacros(al, item.cantidad);
            html += `
                <div class="item-dieta">
                    <div>
                        <span class="nombre-dieta">${al.nombre}</span>
                        <div class="macros-dieta">${m.kcal} kcal · ${m.grasas}g grasa · ${m.proteinas}g prot · ${m.azucares}g azúc</div>
                    </div>
                    <span class="cantidad-dieta">${item.cantidad} ${al.unidad}</span>
                </div>
            `;
        });

        html += `</div>`;
    });

    const difKcal = macrosMenu.kcal - kcalObjetivo;
    const difProt = macrosMenu.proteinas - metas.proteinas;
    const difGras = macrosMenu.grasas - metas.grasas;
    const difAzuc = macrosMenu.azucares - metas.azucares;

    const claseCerca = (dif, base) => Math.abs(dif) / base < 0.15 ? 'cerca' : 'lejos';

    html += `
        <div class="resumen-dieta">
            <h4>Comparativa: Menú sugerido vs. Metas del perfil</h4>
            <div class="tabla-wrapper">
                <table class="tabla-comp-dieta">
                    <thead>
                        <tr>
                            <th>Métrica</th>
                            <th>Menú sugerido</th>
                            <th>Meta del perfil</th>
                            <th>Diferencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Calorías (kcal)</td>
                            <td>${macrosMenu.kcal.toFixed(1)}</td>
                            <td>${kcalObjetivo}</td>
                            <td class="${claseCerca(difKcal, kcalObjetivo)}">${difKcal >= 0 ? '+' : ''}${difKcal.toFixed(1)}</td>
                        </tr>
                        <tr>
                            <td>Proteínas (g)</td>
                            <td>${macrosMenu.proteinas.toFixed(1)}</td>
                            <td>${metas.proteinas}</td>
                            <td class="${claseCerca(difProt, metas.proteinas)}">${difProt >= 0 ? '+' : ''}${difProt.toFixed(1)}</td>
                        </tr>
                        <tr>
                            <td>Grasas (g)</td>
                            <td>${macrosMenu.grasas.toFixed(1)}</td>
                            <td>${metas.grasas}</td>
                            <td class="${claseCerca(difGras, metas.grasas)}">${difGras >= 0 ? '+' : ''}${difGras.toFixed(1)}</td>
                        </tr>
                        <tr>
                            <td>Azúcares (g)</td>
                            <td>${macrosMenu.azucares.toFixed(1)}</td>
                            <td>${metas.azucares}</td>
                            <td class="${claseCerca(difAzuc, metas.azucares)}">${difAzuc >= 0 ? '+' : ''}${difAzuc.toFixed(1)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <button class="btn-cargar-dieta" onclick="cargarDietaEnRegistro()">
            Cargar este menú en mi registro de comidas
        </button>
    `;

    $('contenido-dieta').innerHTML = html;
}

function cargarDietaEnRegistro() {
    if (!estadoApp.perfil) return;

    const { objetivo, kcalObjetivo } = estadoApp.perfil;
    const menuBase = MENUS_RECOMENDADOS[objetivo];
    const menuEscalado = escalarMenu(menuBase, kcalObjetivo);

    estadoApp.comidas = { desayuno: [], comida: [], cena: [] };

    menuEscalado.forEach(item => {
        const al = BASE_ALIMENTOS[item.key];
        const macros = calcularMacros(al, item.cantidad);
        estadoApp.comidas[item.tiempo].push({
            key: item.key,
            nombre: al.nombre,
            unidad: al.unidad,
            cantidad: item.cantidad,
            macros
        });
    });

    renderizarListaComidas();
    mostrarAvisoBloqueo('Menú cargado en tu registro de comidas', true);
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarNavegacion();
    poblarSelectAlimentos();

    $('btn-calcular-perfil').addEventListener('click', calcularPerfil);
    $('btn-agregar-alimento').addEventListener('click', agregarAlimento);
    $('btn-limpiar').addEventListener('click', limpiarTodo);
    $('btn-guardar-sesion').addEventListener('click', guardarSesion);
    $('btn-borrar-todo').addEventListener('click', borrarTodo);

    if (typeof inicializarEcuaciones === 'function') inicializarEcuaciones();
    if (typeof inicializarGraficas === 'function') inicializarGraficas();

    const seRestauro = cargarSesion();

    if (seRestauro) {
        restaurarInterfazDesdeSesion();
        mostrarAvisoBloqueo('Sesión anterior restaurada', true);
    } else {
        actualizarBloqueoPestañas();
    }

    console.log('NutriMath iniciado');
});