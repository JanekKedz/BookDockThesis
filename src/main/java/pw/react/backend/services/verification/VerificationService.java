package pw.react.backend.services.verification;


import pw.react.backend.models.user.User;

/**
 * Service interface for verifying users.
 * <p>
 * Implementations of this interface should verify the given user.
 * If the verification is successful, the method will return without any exception.
 * If the verification fails, the method will throw an appropriate exception depending on the implementation.
 */
public interface VerificationService {

    /**
     * Verifies the given user.
     *
     * @param user the user to verify
     * @throws Exception if the verification fails
     */
    void verifyUser(User user) throws Exception;
}
