import { DICCIONARIO } from "./gameEngine.js";

function hoyISO() {
    return new Date().toISOString().slice(0, 10);
}

function semillaDesdeFecha(fechaISO) {
    return fechaISO.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

export function obtenerPalabraDelDia(categoria = "basico", fechaISO = hoyISO()) {
    const lista = DICCIONARIO[categoria] || DICCIONARIO.basico;
    const semilla = semillaDesdeFecha(fechaISO);
    const indice = semilla % lista.length;
    return lista[indice];
}

function esAyer(ultimaFecha, fechaActual) {
    if (!ultimaFecha) return false;
    const dUlt = new Date(ultimaFecha);
    const dAct = new Date(fechaActual);
    const diff = dAct - dUlt;
    const unDia = 24 * 60 * 60 * 1000;
    return diff > 0 && diff <= unDia + 1000; // margen de 1s
}

export function actualizarRachaDiaria(dailyData, victoria, fechaISO = hoyISO()) {
    const data = { ...(dailyData || { ultimaFecha: null, racha: 0 }) };
    if (victoria) {
        if (esAyer(data.ultimaFecha, fechaISO)) {
            data.racha = (data.racha || 0) + 1;
        } else {
            data.racha = 1;
        }
        data.ultimaFecha = fechaISO;
    } else {
        data.racha = 0;
        data.ultimaFecha = fechaISO;
    }
    return data;
}

export function dataDiariaBase() {
    return { ultimaFecha: null, racha: 0 };
}
