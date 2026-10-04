// ============================================
// BASE DE DATOS DE ALIMENTOS
// Valores por 100g o 100ml (según corresponda)
// ============================================

const BASE_ALIMENTOS = {
    // ---- DESAYUNO ----
    huevo: {
        nombre: "Huevo entero",
        unidad: "g",
        porcionTipica: 50,
        kcal: 146, grasas: 10, proteinas: 12, carbohidratos: 1.2, azucares: 0.4
    },
    jamon: {
        nombre: "Jamón de pierna",
        unidad: "g",
        porcionTipica: 20,
        kcal: 135, grasas: 6, proteinas: 15, carbohidratos: 2.5, azucares: 3
    },
    tortilla_maiz: {
        nombre: "Tortilla de maíz",
        unidad: "g",
        porcionTipica: 30,
        kcal: 183, grasas: 1.5, proteinas: 5, carbohidratos: 40, azucares: 1.2
    },
    tortilla_harina: {
        nombre: "Tortilla de harina",
        unidad: "g",
        porcionTipica: 40,
        kcal: 300, grasas: 8, proteinas: 8, carbohidratos: 50, azucares: 3
    },

    // ---- LÁCTEOS ----
    leche_entera: {
        nombre: "Leche entera (Tetra Pak)",
        unidad: "ml",
        porcionTipica: 200,
        kcal: 47.2, grasas: 2, proteinas: 3.2, carbohidratos: 4.8, azucares: 5.8
    },
    chocomilk: {
        nombre: "Choco Milk (polvo)",
        unidad: "g",
        porcionTipica: 13,
        kcal: 385, grasas: 1.5, proteinas: 6, carbohidratos: 82, azucares: 75
    },

    // ---- CEREALES ----
    corn_flakes: {
        nombre: "Corn Flakes (Kellogg's)",
        unidad: "g",
        porcionTipica: 30,
        kcal: 367, grasas: 0.8, proteinas: 7.5, carbohidratos: 84, azucares: 9
    },

    // ---- PROTEÍNAS ----
    pechuga_pollo: {
        nombre: "Pechuga de pollo",
        unidad: "g",
        porcionTipica: 100,
        kcal: 165, grasas: 3.6, proteinas: 31, carbohidratos: 0, azucares: 0
    },
    bistec_res: {
        nombre: "Bistec de res",
        unidad: "g",
        porcionTipica: 150,
        kcal: 250, grasas: 15, proteinas: 26, carbohidratos: 0, azucares: 0
    },

    // ---- VERDURAS ----
    nopal: {
        nombre: "Nopal",
        unidad: "g",
        porcionTipica: 100,
        kcal: 16, grasas: 0.1, proteinas: 1.3, carbohidratos: 3.3, azucares: 1.2
    },

    // ---- PAN ----
    bolillo: {
        nombre: "Bolillo / Telera",
        unidad: "g",
        porcionTipica: 60,
        kcal: 270, grasas: 2, proteinas: 8, carbohidratos: 55, azucares: 3
    },

    // ---- SNACKS / GOLOSINAS ----
    mini_crunch: {
        nombre: "Nestlé Mini Crunch (pieza)",
        unidad: "g",
        porcionTipica: 12,
        kcal: 517, grasas: 27.7, proteinas: 5, carbohidratos: 60, azucares: 47.4
    },
    golosina_roja: {
        nombre: "Golosina envoltorio rojo",
        unidad: "g",
        porcionTipica: 100,
        kcal: 570, grasas: 40, proteinas: 4, carbohidratos: 55, azucares: 49
    },

    // ---- ACEITES ----
    aceite: {
        nombre: "Aceite de cocina",
        unidad: "ml",
        porcionTipica: 5,
        kcal: 884, grasas: 100, proteinas: 0, carbohidratos: 0, azucares: 0
    }
};

// ============================================
// CÁLCULOS NUTRICIONALES
// ============================================

function calcularMacros(alimento, cantidad) {
    const factor = cantidad / 100;
    return {
        kcal: +(alimento.kcal * factor).toFixed(2),
        grasas: +(alimento.grasas * factor).toFixed(2),
        proteinas: +(alimento.proteinas * factor).toFixed(2),
        carbohidratos: +(alimento.carbohidratos * factor).toFixed(2),
        azucares: +(alimento.azucares * factor).toFixed(2)
    };
}