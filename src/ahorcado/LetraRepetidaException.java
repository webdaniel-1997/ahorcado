package ahorcado;

/**
 * Error para cuando repites una letra que ya habías dicho.
 */
public class LetraRepetidaException extends Exception {
    public LetraRepetidaException(String mensaje) {
        super(mensaje);
    }
}
