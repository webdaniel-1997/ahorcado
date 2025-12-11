package ahorcado;

import java.util.Random;

/**
 * Clase simple para sacar palabras al azar.
 * No usamos arrays ni listas, solo un switch gigante.
 */
public class DiccionarioSencillo {


    public static String palabraAleatoria(int nivel) {
        Random random = new Random();
        String palabra = "JAVA"; // Por si acaso falla algo, devolvemos esta

        if (nivel == 1) {

            int opcion = random.nextInt(10) + 1; // Número del 1 al 10
            switch (opcion) {
                case 1: palabra = "JAVA"; break;
                case 2: palabra = "CODIGO"; break;
                case 3: palabra = "TECLADO"; break;
                case 4: palabra = "RATON"; break;
                case 5: palabra = "PANTALLA"; break;
                case 6: palabra = "BUCLE"; break;
                case 7: palabra = "CLASE"; break;
                case 8: palabra = "OBJETO"; break;
                case 9: palabra = "DATO"; break;
                case 10: palabra = "RED"; break;
            }
        } else {

            int opcion = random.nextInt(10) + 1;
            switch (opcion) {
                case 1: palabra = "POLIMORFISMO"; break;
                case 2: palabra = "HERENCIA"; break;
                case 3: palabra = "ENCAPSULAMIENTO"; break;
                case 4: palabra = "ABSTRACCION"; break;
                case 5: palabra = "INTERFACE"; break;
                case 6: palabra = "EXCEPCION"; break;
                case 7: palabra = "CONSTRUCTOR"; break;
                case 8: palabra = "DESARROLLO"; break;
                case 9: palabra = "ALGORITMO"; break;
                case 10: palabra = "DEBUGGING"; break;
            }
        }

        return palabra;
    }
}
