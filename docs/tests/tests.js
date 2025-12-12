import { nuevaPartida, intentarLetra, usarPista, resolverPalabra, actualizarTiempo, ESTADOS } from "../js/gameEngine.js";
import { registrarResultado } from "../js/storage.js";

const resultados = [];

function assert(cond, msg) { if (!cond) throw new Error(msg); }

function testVictoriaPorLetras() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "facil", modo: "clasico", palabraPersonalizada: "CODE" });
    "CODE".split("").forEach(l => intentarLetra(juego, l));
    assert(juego.estado === ESTADOS.VICTORIA, "Debe ganar al descubrir todas las letras");
}

function testDerrotaPorVidas() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "dificil", modo: "clasico", palabraPersonalizada: "AA" });
    "BCDEFGHIJK".split("").forEach(l => intentarLetra(juego, l));
    assert(juego.estado === ESTADOS.DERROTA, "Debe perder al gastar vidas");
}

function testPistaRestaVida() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "normal", modo: "clasico", palabraPersonalizada: "SOL" });
    const antes = juego.intentosRestantes;
    usarPista(juego);
    assert(juego.intentosRestantes === antes - 1, "La pista quita una vida");
}

function testResolverCorrecto() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "normal", modo: "clasico", palabraPersonalizada: "NUBE" });
    resolverPalabra(juego, "nube");
    assert(juego.estado === ESTADOS.VICTORIA, "Resolver bien gana");
}

function testResolverIncorrectoPenaliza() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "normal", modo: "clasico", palabraPersonalizada: "CIELO" });
    const antes = juego.intentosRestantes;
    resolverPalabra(juego, "tierra");
    assert(juego.intentosRestantes < antes, "Resolver mal resta vidas");
}

function testContrarrelojAgota() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "normal", modo: "contrarreloj", tiempoPersonalizado: 2 });
    actualizarTiempo(juego, juego.inicioMs + 3000);
    assert(juego.estado === ESTADOS.DERROTA, "Debe perder por tiempo");
}

function testRegistrarResultado() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "facil", modo: "clasico", palabraPersonalizada: "CODE" });
    "CODE".split("").forEach(l => intentarLetra(juego, l));
    const resumen = {
        victoria: true,
        modo: "clasico",
        dificultad: "facil",
        categoria: "basico",
        palabra: "CODE",
        pistasUsadas: 0,
        vidasIniciales: juego.vidasIniciales,
        intentosRestantes: juego.intentosRestantes,
        tiempoJugadoMs: 1000,
        tiempoRestanteMs: 0,
        fechaISO: new Date().toISOString(),
        palabraDiaria: false
    };
    const stats = registrarResultado(undefined, resumen, null);
    assert(stats.partidas === 1 && stats.victorias === 1, "Debe registrar partidas y victorias");
}

const pruebas = [
    ["Victoria por letras", testVictoriaPorLetras],
    ["Derrota por vidas", testDerrotaPorVidas],
    ["Pista resta vida", testPistaRestaVida],
    ["Resolver correcto", testResolverCorrecto],
    ["Resolver incorrecto penaliza", testResolverIncorrectoPenaliza],
    ["Contrarreloj se agota", testContrarrelojAgota],
    ["Registrar resultado", testRegistrarResultado]
];

export function runAllTests() {
    const contenedor = typeof document !== "undefined" ? document.getElementById("resultados") : null;
    pruebas.forEach(([nombre, fn]) => {
        try {
            fn();
            resultados.push({ nombre, ok: true });
        } catch (e) {
            resultados.push({ nombre, ok: false, error: e.message });
        }
    });

    if (contenedor) {
        contenedor.innerHTML = resultados.map(r => `<li class="${r.ok ? "ok" : "fail"}">${r.ok ? "✔" : "✖"} ${r.nombre}${r.error ? ` - ${r.error}` : ""}</li>`).join("");
    }
    if (typeof console !== "undefined") {
        console.group("Tests Ahorcado");
        resultados.forEach(r => {
            if (r.ok) console.log("OK -", r.nombre);
            else console.error("FAIL -", r.nombre, r.error);
        });
        console.groupEnd();
    }
}

if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", runAllTests);
}
