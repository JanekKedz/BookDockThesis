package pw.react.backend.utils;

/**
 * Utility class for String operations.
 */
public class StringUtils {

    /**
     *
     * Capitalizes the first letter of the given string.
     *
     * @param input the string to capitalize
     * @return the string with the first letter capitalized, or the original string if it is null or empty
     */
    public static String capitalizeFirstLetter(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return input.substring(0, 1).toUpperCase() + input.substring(1);
    }

}