import { nuevaPartida, intentarLetra, usarPista, resolverPalabra, actualizarTiempo, ESTADOS } from "../js/gameEngine.js";

const resultados = [];

function assert(condicion, mensaje) {
    if (!condicion) throw new Error(mensaje);
}

function testVictoriaPorLetras() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "facil", modo: "clasico", palabraPersonalizada: "CODE" });
    intentarLetra(juego, "C");
    intentarLetra(juego, "O");
    intentarLetra(juego, "D");
    intentarLetra(juego, "E");
    assert(juego.estado === ESTADOS.VICTORIA, "Debería ser victoria al adivinar todas las letras");
}

function testDerrotaPorVidas() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "facil", modo: "clasico", palabraPersonalizada: "AAA", tiempoPersonalizado: 0 });
    intentarLetra(juego, "B");
    intentarLetra(juego, "C");
    intentarLetra(juego, "D");
    intentarLetra(juego, "E");
    intentarLetra(juego, "F");
    intentarLetra(juego, "G");
    intentarLetra(juego, "H");
    intentarLetra(juego, "I");
    assert(juego.estado === ESTADOS.DERROTA, "Debe perder al gastar todas las vidas");
}

function testPistaRestaVida() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "normal", modo: "clasico", palabraPersonalizada: "SOL" });
    const vidasAntes = juego.intentosRestantes;
    usarPista(juego);
    assert(juego.intentosRestantes === vidasAntes - 1, "La pista debe restar una vida");
}

function testResolverCorrecto() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "normal", modo: "clasico", palabraPersonalizada: "NUBE" });
    resolverPalabra(juego, "nube");
    assert(juego.estado === ESTADOS.VICTORIA, "Resolver con la palabra correcta debe ganar");
}

function testResolverIncorrectoPenaliza() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "normal", modo: "clasico", palabraPersonalizada: "CIELO" });
    const vidasAntes = juego.intentosRestantes;
    resolverPalabra(juego, "TIERRA");
    assert(juego.intentosRestantes < vidasAntes, "Resolver mal debe quitar vidas");
}

function testContrarrelojAgota() {
    const juego = nuevaPartida({ categoria: "basico", dificultad: "normal", modo: "contrarreloj", tiempoPersonalizado: 2 });
    actualizarTiempo(juego, juego.inicioMs + 3000);
    assert(juego.estado === ESTADOS.DERROTA, "Debe perderse al agotar tiempo en contrarreloj");
}

const pruebas = [
    ["Victoria por letras", testVictoriaPorLetras],
    ["Derrota por vidas", testDerrotaPorVidas],
    ["Pista resta vida", testPistaRestaVida],
    ["Resolver correcto", testResolverCorrecto],
    ["Resolver incorrecto penaliza", testResolverIncorrectoPenaliza],
    ["Contrarreloj se agota", testContrarrelojAgota]
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
