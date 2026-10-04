// ============================================
// GRÁFICAS CON CHART.JS
// ============================================

let instanciaBarras = null;
let instanciaAnillo = null;

function inicializarGraficas() {
    // Las gráficas se crean cuando se entra al dashboard
}

function calcularTotalesPorFase() {
    const fases = ['desayuno', 'comida', 'cena'];
    const totales = {};

    fases.forEach(fase => {
        const items = estadoApp.comidas[fase];
        totales[fase] = items.reduce((acc, it) => ({
            kcal: acc.kcal + it.macros.kcal,
            grasas: acc.grasas + it.macros.grasas,
            proteinas: acc.proteinas + it.macros.proteinas,
            azucares: acc.azucares + it.macros.azucares,
            carbohidratos: acc.carbohidratos + it.macros.carbohidratos
        }), { kcal: 0, grasas: 0, proteinas: 0, azucares: 0, carbohidratos: 0 });
    });

    return totales;
}

function calcularTotalesGlobales(totalesPorFase) {
    return Object.values(totalesPorFase).reduce((acc, t) => ({
        kcal: acc.kcal + t.kcal,
        grasas: acc.grasas + t.grasas,
        proteinas: acc.proteinas + t.proteinas,
        azucares: acc.azucares + t.azucares,
        carbohidratos: acc.carbohidratos + t.carbohidratos
    }), { kcal: 0, grasas: 0, proteinas: 0, azucares: 0, carbohidratos: 0 });
}

function renderizarGraficaBarras(totalesPorFase) {
    const ctx = document.getElementById('grafica-barras').getContext('2d');

    if (instanciaBarras) instanciaBarras.destroy();

    instanciaBarras = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Desayuno', 'Comida', 'Cena'],
            datasets: [
                {
                    label: 'Calorías (kcal)',
                    data: [
                        totalesPorFase.desayuno.kcal.toFixed(1),
                        totalesPorFase.comida.kcal.toFixed(1),
                        totalesPorFase.cena.kcal.toFixed(1)
                    ],
                    backgroundColor: '#2ecc71',
                    borderRadius: 8
                },
                {
                    label: 'Grasas (g)',
                    data: [
                        totalesPorFase.desayuno.grasas.toFixed(1),
                        totalesPorFase.comida.grasas.toFixed(1),
                        totalesPorFase.cena.grasas.toFixed(1)
                    ],
                    backgroundColor: '#3498db',
                    borderRadius: 8
                },
                {
                    label: 'Proteínas (g)',
                    data: [
                        totalesPorFase.desayuno.proteinas.toFixed(1),
                        totalesPorFase.comida.proteinas.toFixed(1),
                        totalesPorFase.cena.proteinas.toFixed(1)
                    ],
                    backgroundColor: '#e74c3c',
                    borderRadius: 8
                },
                {
                    label: 'Azúcares (g)',
                    data: [
                        totalesPorFase.desayuno.azucares.toFixed(1),
                        totalesPorFase.comida.azucares.toFixed(1),
                        totalesPorFase.cena.azucares.toFixed(1)
                    ],
                    backgroundColor: '#f39c12',
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#ecf0f1' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderizarGraficaAnillo(totalesGlobales) {
    const ctx = document.getElementById('grafica-anillo').getContext('2d');

    if (instanciaAnillo) instanciaAnillo.destroy();

    const kcalGrasas = totalesGlobales.grasas * 9;
    const kcalProteinas = totalesGlobales.proteinas * 4;
    const kcalAzucares = totalesGlobales.azucares * 4;

    const carbTotal = totalesGlobales.carbohidratos;
    const carbComplejos = Math.max(0, carbTotal - totalesGlobales.azucares);
    const kcalCarbComplejos = carbComplejos * 4;

    const totalKcal = kcalGrasas + kcalProteinas + kcalAzucares + kcalCarbComplejos;

    instanciaAnillo = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [
                `Grasas (${kcalGrasas.toFixed(0)} kcal)`,
                `Proteínas (${kcalProteinas.toFixed(0)} kcal)`,
                `Carbohidratos complejos (${kcalCarbComplejos.toFixed(0)} kcal)`,
                `Azúcares (${kcalAzucares.toFixed(0)} kcal)`
            ],
            datasets: [{
                data: [
                    kcalGrasas.toFixed(1),
                    kcalProteinas.toFixed(1),
                    kcalCarbComplejos.toFixed(1),
                    kcalAzucares.toFixed(1)
                ],
                backgroundColor: [
                    '#3498db',
                    '#e74c3c',
                    '#95a5a6',
                    '#f39c12'
                ],
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const valor = parseFloat(ctx.raw);
                            const pct = ((valor / totalKcal) * 100).toFixed(1);
                            return `${ctx.label}: ${pct}%`;
                        }
                    }
                }
            }
        }
    });
}