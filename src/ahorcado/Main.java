package ahorcado;

import java.util.Scanner;

/**
 * Clase principal. Aqui esta el menu y el control del juego.
 */
public class Main {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean salir = false;

        System.out.println("=========================================");
        System.out.println("    BIENVENIDO AL JUEGO DEL AHORCADO     ");
        System.out.println("=========================================");

        while (!salir) {
            System.out.println("\n--- MENU PRINCIPAL ---");
            System.out.println("1) Aleatorio   2) Dos jugadores   3) Salir");
            System.out.print("Elige opcion: ");

            String opcion = scanner.nextLine().trim();

            switch (opcion) {
                case "1":
                    jugarModoAleatorio(scanner);
                    break;
                case "2":
                    jugarModoDosJugadores(scanner);
                    break;
                case "3":
                    salir = true;
                    System.out.println("Gracias por jugar! Hasta pronto.");
                    break;
                default:
                    System.out.println("Opcion no valida. Intentalo de nuevo.");
            }
        }

        scanner.close();
    }

    private static void jugarModoAleatorio(Scanner scanner) {
        System.out.println("\n--- SELECCIONA DIFICULTAD ---");
        System.out.println("1) Basico   2) Avanzado");
        System.out.print("Elige (1/2): ");

        String input = scanner.nextLine().trim();
        int nivel = 1; // Por defecto
        try {
            nivel = Integer.parseInt(input);
            if (nivel != 1 && nivel != 2) nivel = 1;
        } catch (NumberFormatException e) {
            // se mantiene en 1
        }

        String palabra = DiccionarioSencillo.palabraAleatoria(nivel);
        iniciarJuego(scanner, palabra);
    }

    private static void jugarModoDosJugadores(Scanner scanner) {
        System.out.println("\n--- MODO 2 JUGADORES ---");
        System.out.print("Jugador 1, palabra secreta (solo letras): ");
        String palabra = scanner.nextLine().toUpperCase();

        if (palabra.isEmpty() || !esSoloLetras(palabra)) {
            System.out.println("Error: La palabra debe contener solo letras y no estar vacia.");
            return;
        }

        for (int i = 0; i < 40; i++) {
            System.out.println();
        }
        System.out.println("Consola limpia. Turno del Jugador 2.");

        iniciarJuego(scanner, palabra);
    }

    private static boolean esSoloLetras(String str) {
        for (int i = 0; i < str.length(); i++) {
            if (!Character.isLetter(str.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    private static void iniciarJuego(Scanner scanner, String palabra) {
        JuegoAhorcado juego = new JuegoAhorcado(palabra, 6);

        System.out.println("\nEmpieza la partida!");

        while (juego.getEstado() == EstadoPartida.EN_CURSO) {
            mostrarEstadoTurno(juego);

            System.out.println("\nLetra / RESOLVER / PISTA");
            System.out.print("> ");

            String entrada = scanner.nextLine().trim();

            try {
                procesarEntrada(scanner, juego, entrada);
            } catch (LetraRepetidaException e) {
                System.out.println(">>> AVISO: " + e.getMessage());
            } catch (IntentoInvalidoException e) {
                System.out.println(">>> ERROR: " + e.getMessage());
            } catch (Exception e) {
                System.out.println(">>> ERROR INESPERADO: " + e.getMessage());
            }
        }

        finalizarPartida(juego);
    }

    private static void mostrarEstadoTurno(JuegoAhorcado juego) {
        System.out.println("\n-----------------------------------------");
        System.out.println(AsciiArt.stage(juego.getIntentosRestantes()));
        System.out.println("Palabra: " + juego.getPalabraOculta());
        System.out.println("Intentos restantes: " + juego.getIntentosRestantes());
        String fallos = juego.getLetrasFalladas().isEmpty() ? "-" : juego.getLetrasFalladas();
        System.out.println("Fallos: " + fallos);
        System.out.println(renderTeclado(juego));
    }

    private static void procesarEntrada(Scanner scanner, JuegoAhorcado juego, String entrada) throws LetraRepetidaException, IntentoInvalidoException {
        if (entrada.isEmpty()) {
            throw new IntentoInvalidoException("No has introducido nada.");
        }

        if (entrada.equalsIgnoreCase("RESOLVER")) {
            System.out.print("Introduce la palabra completa: ");
            String intento = scanner.nextLine();
            juego.resolver(intento);

        } else if (entrada.equalsIgnoreCase("PISTA")) {
            juego.pedirPista();
            System.out.println(">>> Pista usada!");

        } else if (entrada.length() > 1) {
            juego.resolver(entrada);

        } else {
            juego.intentarLetra(entrada.charAt(0));
        }
    }

    private static void finalizarPartida(JuegoAhorcado juego) {
        System.out.println("\n-----------------------------------------");
        System.out.println(AsciiArt.stage(juego.getIntentosRestantes()));

        if (juego.getEstado() == EstadoPartida.VICTORIA) {
            System.out.println("FELICIDADES! Has ganado.");
            System.out.println("La palabra era: " + juego.getPalabraSecreta());
        } else {
            System.out.println("GAME OVER! Te has quedado sin intentos.");
            System.out.println("La palabra era: " + juego.getPalabraSecreta());
        }

        java.time.Duration duracion = juego.getDuracion();
        long minutos = duracion.toMinutes();
        long segundos = duracion.minusMinutes(minutos).getSeconds();
        System.out.println("Duracion de la partida: " + minutos + " min " + segundos + " s");

        System.out.println("-----------------------------------------");
    }

    private static String renderTeclado(JuegoAhorcado juego) {
        String[] filas = {"QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"};
        StringBuilder sb = new StringBuilder();
        sb.append("\nTeclado:\n");
        for (String fila : filas) {
            sb.append(formatearFila(fila, juego)).append("\n");
        }
        sb.append("   [X]=acierto  (X)=fallo  X=libre");
        return sb.toString();
    }

    private static String formatearFila(String fila, JuegoAhorcado juego) {
        StringBuilder sb = new StringBuilder("   ");
        for (int i = 0; i < fila.length(); i++) {
            char letra = fila.charAt(i);
            sb.append(formatearLetra(letra, juego));
            if (i < fila.length() - 1) sb.append(" ");
        }
        return sb.toString();
    }

    private static String formatearLetra(char letra, JuegoAhorcado juego) {
        if (juego.getLetrasAcertadas().indexOf(letra) != -1) {
            return "[" + letra + "]";
        }
        if (juego.getLetrasFalladas().indexOf(letra) != -1) {
            return "(" + letra + ")";
        }
        return " " + letra + " ";
    }
}

