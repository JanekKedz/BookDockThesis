package pw.react.backend.exceptions;

public class UserValidationException extends RuntimeException {

    private final String resourcePath;

    public UserValidationException(String message, String resourcePath) {
        super(message);
        this.resourcePath = resourcePath;
    }

    public UserValidationException(String message) {
        this(message, null);
    }

    public String getResourcePath() {
        return resourcePath;
    }
}
