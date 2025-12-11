// ...existing code...
package ahorcado;

import java.time.LocalDateTime;

/**
 * Lógica del juego del ahorcado.
 */
public class JuegoAhorcado {

    private String palabraSecreta;
    private String letrasAcertadas;
    private String letrasFalladas;
    private int intentosRestantes;
    private EstadoPartida estado;
    private LocalDateTime inicioPartida;

    /**
        * Crea un nuevo juego del ahorcado.
     */
    public JuegoAhorcado(String palabra, int intentosIniciales) {
        assert palabra != null && !palabra.isEmpty() : "La palabra no puede estar vacía";
        assert intentosIniciales > 0 : "Intentos iniciales deben ser > 0";

        this.palabraSecreta = palabra.toUpperCase();
        this.intentosRestantes = intentosIniciales;
        this.letrasAcertadas = "";
        this.letrasFalladas = "";
        this.estado = EstadoPartida.EN_CURSO;
        this.inicioPartida = LocalDateTime.now();
    }

    /**
     * Procesa un intento con una letra.
    */

    public void intentarLetra(char letra) throws LetraRepetidaException, IntentoInvalidoException {
        if (!Character.isLetter(letra)) {
            throw new IntentoInvalidoException("El carácter '" + letra + "' no es válido. Solo letras.");
        }

        char letraMayus = Character.toUpperCase(letra);

        if (letrasAcertadas.indexOf(letraMayus) != -1 || letrasFalladas.indexOf(letraMayus) != -1) {
            throw new LetraRepetidaException("La letra '" + letraMayus + "' ya la has dicho.");
        }

        if (palabraSecreta.indexOf(letraMayus) != -1) {
            letrasAcertadas += letraMayus;
            if (todasLetrasAcertadas()) {
                estado = EstadoPartida.VICTORIA;
            }
        } else {
            letrasFalladas += letraMayus;
            intentosRestantes--;
            if (intentosRestantes <= 0) {
                estado = EstadoPartida.DERROTA;
            }
        }

        assert intentosRestantes >= 0 : "Intentos negativos";
    }

    private boolean todasLetrasAcertadas() {
        for (int i = 0; i < palabraSecreta.length(); i++) {
            char c = palabraSecreta.charAt(i);
            if (letrasAcertadas.indexOf(c) == -1) {
                return false;
            }
        }
        return true;
    }

    /**
     * Intento de resolver la palabra completa.
     * 
     */
    public void resolver(String intentoPalabra) {
        if (intentoPalabra.toUpperCase().equals(palabraSecreta)) {
            estado = EstadoPartida.VICTORIA;
        } else {
            intentosRestantes--;
            if (intentosRestantes <= 0) {
                estado = EstadoPartida.DERROTA;
            }
        }
    }

    /**
     * Revela una letra pendiente y resta una vida.
     */
    public void pedirPista() {
        if (intentosRestantes <= 1) {
            return;
        }

        char letraPista = 0;
        for (int i = 0; i < palabraSecreta.length(); i++) {
            char c = palabraSecreta.charAt(i);
            if (letrasAcertadas.indexOf(c) == -1) {
                letraPista = c;
                break;
            }
        }

        if (letraPista != 0) {
            letrasAcertadas += letraPista;
            intentosRestantes--;
            if (todasLetrasAcertadas()) {
                estado = EstadoPartida.VICTORIA;
            }
        }
    }

    /**
     * Devuelve la palabra oculta (ej. "_ A _ A").
     */
    public String getPalabraOculta() {
        String resultado = "";
        for (int i = 0; i < palabraSecreta.length(); i++) {
            char c = palabraSecreta.charAt(i);
            if (letrasAcertadas.indexOf(c) != -1) {
                resultado += c + " ";
            } else {
                resultado += "_ ";
            }
        }
        return resultado.trim();
    }

    public int getIntentosRestantes() { return intentosRestantes; }

    public String getLetrasFalladas() { return letrasFalladas; }

    public EstadoPartida getEstado() { return estado; }

    public String getPalabraSecreta() { return palabraSecreta; }

    /**
     * Duración desde el inicio de la partida.
     */
    public java.time.Duration getDuracion() {
        return java.time.Duration.between(inicioPartida, LocalDateTime.now());
    }
}
