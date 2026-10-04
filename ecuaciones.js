// ============================================
// SOLVER DE SISTEMAS DE ECUACIONES
// ============================================

function resolverSistema2x2(a1, b1, c1, a2, b2, c2) {
    const det = (a1 * b2) - (a2 * b1);
    const pasos = [];

    if (Math.abs(det) < 1e-10) {
        return {
            exito: false,
            mensaje: 'El sistema no tiene solución única (las ecuaciones son paralelas o coincidentes).',
            pasos
        };
    }

    pasos.push({
        titulo: 'Ecuación 1 despejada para y',
        formula: `y = (${c1} − ${a1}x) / ${b1}`
    });

    pasos.push({
        titulo: 'Sustituyendo en Ecuación 2',
        formula: `${a2}x + ${b2} · [(${c1} − ${a1}x) / ${b1}] = ${c2}`
    });

    const x = ((c1 * b2) - (c2 * b1)) / det;
    const y = ((a1 * c2) - (a2 * c1)) / det;

    pasos.push({
        titulo: 'Resultado de x',
        formula: `x = ${x.toFixed(2)}`
    });
    pasos.push({
        titulo: 'Sustituyendo x para hallar y',
        formula: `y = (${c1} − ${a1}·${x.toFixed(2)}) / ${b1} = ${y.toFixed(2)}`
    });

    return {
        exito: true,
        x: +x.toFixed(2),
        y: +y.toFixed(2),
        det: +det.toFixed(2),
        pasos
    };
}

function resolverSistema3x3(a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3) {
    const pasos = [];

    const det =
        a1 * (b2 * c3 - b3 * c2) -
        b1 * (a2 * c3 - a3 * c2) +
        c1 * (a2 * b3 - a3 * b2);

    if (Math.abs(det) < 1e-10) {
        return {
            exito: false,
            mensaje: 'El sistema no tiene solución única (determinante = 0).',
            pasos
        };
    }

    pasos.push({
        titulo: 'Despejando y de la Ecuación 2',
        formula: `y = (${d2} − ${a2}x − ${c2}z) / ${b2}`
    });

    const A1 = a1 - (b1 * a2) / b2;
    const C1 = c1 - (b1 * c2) / b2;
    const D1 = d1 - (b1 * d2) / b2;

    const A2 = a3 - (b3 * a2) / b2;
    const C2 = c3 - (b3 * c2) / b2;
    const D2 = d3 - (b3 * d2) / b2;

    pasos.push({
        titulo: 'Sistema 2×2 reducido (después de sustituir)',
        formula: `${A1.toFixed(2)}x + ${C1.toFixed(2)}z = ${D1.toFixed(2)}<br>${A2.toFixed(2)}x + ${C2.toFixed(2)}z = ${D2.toFixed(2)}`
    });

    const det2 = (A1 * C2) - (A2 * C1);
    const z = (A1 * D2 - A2 * D1) / det2;
    const x = (D1 - C1 * z) / A1;
    const y = (d2 - a2 * x - c2 * z) / b2;

    pasos.push({
        titulo: 'Resolviendo el 2×2 resultante',
        formula: `z = ${z.toFixed(2)}<br>x = ${x.toFixed(2)}`
    });

    pasos.push({
        titulo: 'Sustituyendo para hallar y',
        formula: `y = (${d2} − ${a2}·${x.toFixed(2)} − ${c2}·${z.toFixed(2)}) / ${b2} = ${y.toFixed(2)}`
    });

    return {
        exito: true,
        x: +x.toFixed(2),
        y: +y.toFixed(2),
        z: +z.toFixed(2),
        det: +det.toFixed(2),
        pasos
    };
}

// ============================================
// CONVERSIÓN A JOULES
// ============================================

const KCAL_A_JOULES = 4184;

function convertirAJoules(kcal) {
    return kcal * KCAL_A_JOULES;
}

function calcularTrabajo(masaKg, distanciaM) {
    const g = 9.81;
    const fuerza = masaKg * g;
    const trabajo = fuerza * distanciaM;
    return { fuerza: +fuerza.toFixed(2), trabajo: +trabajo.toFixed(2) };
}

// ============================================
// INICIALIZACIÓN DE LOS HANDLERS
// ============================================

function inicializarEcuaciones() {
    // ---- SISTEMA 2x2 ----
    $('btn-resolver-2x2').addEventListener('click', () => {
        const keyX = $('alimento-x').value;
        const keyY = $('alimento-y').value;
        const calObj = parseFloat($('calorias-objetivo-2').value);
        const grasaObj = parseFloat($('grasas-objetivo-2').value);

        if (!keyX || !keyY || !calObj || !grasaObj) {
            alert('Llena todos los campos del sistema 2×2');
            return;
        }

        const alX = BASE_ALIMENTOS[keyX];
        const alY = BASE_ALIMENTOS[keyY];

        const a1 = alX.kcal / 100, b1 = alY.kcal / 100, c1 = calObj;
        const a2 = alX.grasas / 100, b2 = alY.grasas / 100, c2 = grasaObj;

        const r = resolverSistema2x2(a1, b1, c1, a2, b2, c2);

        if (!r.exito) {
            mostrar('resultado-2x2', `<p style="color:var(--rojo);">${r.mensaje}</p>`);
            return;
        }

        const html = `
            <h3>Solución del Sistema 2×2</h3>
            <div class="totales-grid">
                <div class="total-item">
                    <span class="valor">${r.x}</span>
                    <span class="etiqueta">${alX.unidad} de ${alX.nombre}</span>
                </div>
                <div class="total-item">
                    <span class="valor">${r.y}</span>
                    <span class="etiqueta">${alY.unidad} de ${alY.nombre}</span>
                </div>
            </div>
            <h4 style="margin-top:1rem;">Paso a paso (método de sustitución)</h4>
            ${r.pasos.map(p => `
                <div style="margin: 0.6rem 0;">
                    <strong>${p.titulo}:</strong>
                    <div class="paso">${p.formula}</div>
                </div>
            `).join('')}
        `;
        mostrar('resultado-2x2', html);
    });

    // ---- SISTEMA 3x3 ----
    $('btn-resolver-3x3').addEventListener('click', () => {
        const keyX = $('alimento-x3').value;
        const keyY = $('alimento-y3').value;
        const keyZ = $('alimento-z3').value;
        const cal = parseFloat($('cal-3').value);
        const prot = parseFloat($('prot-3').value);
        const carb = parseFloat($('carb-3').value);

        if (!keyX || !keyY || !keyZ || !cal || !prot || !carb) {
            alert('Llena todos los campos del sistema 3×3');
            return;
        }

        const alX = BASE_ALIMENTOS[keyX];
        const alY = BASE_ALIMENTOS[keyY];
        const alZ = BASE_ALIMENTOS[keyZ];

        const a1 = alX.kcal / 100, b1 = alY.kcal / 100, c1 = alZ.kcal / 100, d1 = cal;
        const a2 = alX.proteinas / 100, b2 = alY.proteinas / 100, c2 = alZ.proteinas / 100, d2 = prot;
        const a3 = alX.carbohidratos / 100, b3 = alY.carbohidratos / 100, c3 = alZ.carbohidratos / 100, d3 = carb;

        const r = resolverSistema3x3(a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3);

        if (!r.exito) {
            mostrar('resultado-3x3', `<p style="color:var(--rojo);">${r.mensaje}</p>`);
            return;
        }

        const html = `
            <h3>Solución del Sistema 3×3</h3>
            <div class="totales-grid">
                <div class="total-item">
                    <span class="valor">${r.x}</span>
                    <span class="etiqueta">${alX.unidad} de ${alX.nombre}</span>
                </div>
                <div class="total-item">
                    <span class="valor">${r.y}</span>
                    <span class="etiqueta">${alY.unidad} de ${alY.nombre}</span>
                </div>
                <div class="total-item">
                    <span class="valor">${r.z}</span>
                    <span class="etiqueta">${alZ.unidad} de ${alZ.nombre}</span>
                </div>
            </div>
            <h4 style="margin-top:1rem;">Paso a paso (método de sustitución)</h4>
            ${r.pasos.map(p => `
                <div style="margin: 0.6rem 0;">
                    <strong>${p.titulo}:</strong>
                    <div class="paso">${p.formula}</div>
                </div>
            `).join('')}
        `;
        mostrar('resultado-3x3', html);
    });

    // ---- CONVERSIÓN A JOULES ----
    $('btn-convertir-joules').addEventListener('click', () => {
        const kcal = parseFloat($('kcal-a-joules').value);
        if (!kcal || kcal <= 0) {
            alert('Ingresa un valor válido de kcal');
            return;
        }

        const joules = convertirAJoules(kcal);
        const pesoPersona = estadoApp.perfil?.peso || 64;
        const trabajoUnaLagartija = calcularTrabajo(pesoPersona, 0.3);
        const lagartijasEquivalentes = Math.round(joules / trabajoUnaLagartija.trabajo);

        const html = `
            <h3>Conversión Energética</h3>
            <div class="totales-grid">
                <div class="total-item">
                    <span class="valor">${kcal}</span>
                    <span class="etiqueta">kcal</span>
                </div>
                <div class="total-item">
                    <span class="valor">${joules.toLocaleString('es-MX')}</span>
                    <span class="etiqueta">Joules</span>
                </div>
                <div class="total-item" style="background: linear-gradient(135deg, #e67e22, #e74c3c);">
                    <span class="valor">${lagartijasEquivalentes}</span>
                    <span class="etiqueta">lagartijas equivalentes</span>
                </div>
            </div>
            <div style="margin-top:1rem; padding:0.8rem; background:white; border-radius:8px;">
                <p><strong>Factor de conversión:</strong></p>
                <p class="paso">1 kcal = 4184 J</p>
                <p class="paso">${kcal} kcal × 4184 = ${joules.toLocaleString('es-MX')} J</p>

                <p style="margin-top:0.8rem;"><strong>Trabajo mecánico por lagartija (W = F · d):</strong></p>
                <p class="paso">F = m · g = ${pesoPersona} kg × 9.81 m/s² = ${trabajoUnaLagartija.fuerza} N</p>
                <p class="paso">W = F · d = ${trabajoUnaLagartija.fuerza} N × 0.3 m = ${trabajoUnaLagartija.trabajo} J</p>
                <p class="paso">Lagartijas = ${joules.toLocaleString('es-MX')} J ÷ ${trabajoUnaLagartija.trabajo} J ≈ ${lagartijasEquivalentes}</p>
            </div>
        `;
        mostrar('resultado-joules', html);
    });
}