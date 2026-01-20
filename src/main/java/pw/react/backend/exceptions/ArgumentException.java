package pw.react.backend.exceptions;

public class ArgumentException extends RuntimeException {

    private final String resourcePath;

    public ArgumentException(String message, String resourcePath) {
        super(message);
        this.resourcePath = resourcePath;
    }


    public ArgumentException(String message) {
        this(message, null);
    }

    public String getResourcePath() {
        return resourcePath;
    }
}
