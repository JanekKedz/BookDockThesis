package pw.react.backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import pw.react.backend.exceptions.ArgumentException;
import pw.react.backend.models.user.User;
import pw.react.backend.services.UserService;
import pw.react.backend.services.verification.VerificationService;
import pw.react.backend.utils.BodyArgumentDeserializer;

import java.util.HashMap;
import java.util.Map;

import static pw.react.backend.utils.StringUtils.capitalizeFirstLetter;

/**
 * BaseController provides common functionality for all controllers.
 *
 * This abstract class handles:
 * - User authentication and retrieval from authorization headers.
 * - Deserialization of request body arguments.
 * - Verification service integration.
 */
public abstract class BaseController {

    /**
     * Verification service used to validate user actions.
     */
    protected final VerificationService verification;

    /**
     * A map defining expected request body arguments and their corresponding types.
     */
    protected final HashMap<String, Class<?>> BODY_ARGUMENTS = new HashMap<>();

    @Autowired
    private UserService userService;

    /**
     * Constructs a BaseController with the specified verification service and expected body arguments.
     *
     * @param verificationService the verification service to use
     * @param BODY_ARGUMENTS       a map defining expected request body arguments
     */
    protected BaseController(VerificationService verificationService,
                             HashMap<String, Class<?>> BODY_ARGUMENTS) {
        this.verification = verificationService;
        this.BODY_ARGUMENTS.putAll(BODY_ARGUMENTS);

    }

    /**
     * Retrieves the user associated with the given authorization header.
     *
     * @param header the authorization header containing user credentials
     * @return the authenticated User object
     * @throws IllegalArgumentException if the header is invalid
     */
    public User getUser(String header) {
        String email = parseEmailFromHeader(header);
        return userService.getUserByEmailOrPhoneNumber(email, verification);
    }

    /**
     * Parses the email from the authorization header.
     *
     * @param emailHeader the authorization header containing the email
     * @return the extracted email
     * @throws IllegalArgumentException if the email header is null or invalid
     */
    private String parseEmailFromHeader(String emailHeader) {
        if (emailHeader == null) {
            throw new IllegalArgumentException("Invalid email in Authorization header");
        }
        return emailHeader;
    }

    /**
     * Deserializes a specific argument from the request body.
     *
     * @param body the request body containing arguments
     * @param key  the key of the argument to deserialize
     * @param <T>  the expected type of the deserialized argument
     * @return the deserialized argument
     * @throws ArgumentException if the argument is missing or invalid
     */
    public <T> T deserializeArgument(Map<String, Object> body, String key) {
        T t = BodyArgumentDeserializer.deserializeBodyArgument(body, key, BODY_ARGUMENTS.get(key));

        if(t == null) {
            throw new ArgumentException(capitalizeFirstLetter(key) + " is required");
        }

        return t;
    }
}
