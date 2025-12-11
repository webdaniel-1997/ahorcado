package ahorcado;

/**
 * Error que salta si escribes algo raro (números, símbolos o nada).
 */
public class IntentoInvalidoException extends Exception {
    public IntentoInvalidoException(String mensaje) {
        super(mensaje);
    }
}
