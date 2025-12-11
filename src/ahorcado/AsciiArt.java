package ahorcado;

/**
 * Clase que pinta el muñeco del ahorcado.
 * Usamos un switch para decidir qué dibujo toca según las vidas que queden.
 */
public class AsciiArt {


    public static String stage(int intentosRestantes) {
        String dibujo = "";
        

        switch (intentosRestantes) {
            case 6:
                dibujo = 
                  "  +---+\n" +
                  "  |   |\n" +
                  "      |\n" +
                  "      |\n" +
                  "      |\n" +
                  "      |\n" +
                  "=========";
                break;
            case 5:
                dibujo = 
                  "  +---+\n" +
                  "  |   |\n" +
                  "  O   |\n" +
                  "      |\n" +
                  "      |\n" +
                  "      |\n" +
                  "=========";
                break;
            case 4:
                dibujo = 
                  "  +---+\n" +
                  "  |   |\n" +
                  "  O   |\n" +
                  "  |   |\n" +
                  "      |\n" +
                  "      |\n" +
                  "=========";
                break;
            case 3:
                dibujo = 
                  "  +---+\n" +
                  "  |   |\n" +
                  "  O   |\n" +
                  " /|   |\n" +
                  "      |\n" +
                  "      |\n" +
                  "=========";
                break;
            case 2:
                dibujo = 
                  "  +---+\n" +
                  "  |   |\n" +
                  "  O   |\n" +
                  " /|\\  |\n" +
                  "      |\n" +
                  "      |\n" +
                  "=========";
                break;
            case 1:
                dibujo = 
                  "  +---+\n" +
                  "  |   |\n" +
                  "  O   |\n" +
                  " /|\\  |\n" +
                  " /    |\n" +
                  "      |\n" +
                  "=========";
                break;
            case 0:
                dibujo = 
                  "  +---+\n" +
                  "  |   |\n" +
                  "  O   |\n" +
                  " /|\\  |\n" +
                  " / \\  |\n" +
                  "      |\n" +
                  "=========";
                break;
            default:
                // Para casos negativos o mayores a 6, mostramos algo genérico o el poste vacío
                 dibujo = 
                  "  +---+\n" +
                  "  |   |\n" +
                  "      |\n" +
                  "      |\n" +
                  "      |\n" +
                  "      |\n" +
                  "=========";
                break;
        }
        return dibujo;
    }
}
