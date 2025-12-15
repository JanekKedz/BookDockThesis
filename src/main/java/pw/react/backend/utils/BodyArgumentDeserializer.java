package pw.react.backend.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.util.Map;

/**
 * Utility class for deserializing body arguments from a map.
 */
public class BodyArgumentDeserializer {

    private static final ObjectMapper MAPPER;

    static {
        MAPPER = new ObjectMapper();
        MAPPER.registerModule(new JavaTimeModule());
    }

    /**
     * Deserializes a body argument from a map to the specified target class.
     *
     * @param body the map containing the body arguments
     * @param key the key of the argument to deserialize
     * @param targetClass the class to deserialize the argument to
     * @param <T> the type of the target class
     * @return the deserialized argument, or null if the body is null or does not contain the key
     */
    @SuppressWarnings("unchecked")
    public static <T> T deserializeBodyArgument(Map<String, Object> body, String key, Class<?> targetClass) {
        if (body == null || !body.containsKey(key)) {
            return null;
        }
        Object value = body.get(key);
        return (T) MAPPER.convertValue(value, targetClass);
    }
}