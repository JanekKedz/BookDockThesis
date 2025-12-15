package pw.react.backend.services;


import pw.react.backend.models.user.User;
import pw.react.backend.services.verification.VerificationService;
import pw.react.backend.web.UserDto;

import java.util.List;

/**
 * Service interface for managing users.
 * <p>
 * Implementations of this interface should provide methods for user registration, retrieval, update, and deletion.
 * Additionally, it should handle user verification using the provided verification service.
 */
public interface UserService {

    /**
     * Verifies the given user using the provided verification service.
     *
     * @param verification the verification service to use
     * @param user the user to verify
     */
    void verifyUser(VerificationService verification, User user);

    /**
     * Registers a new user.
     *
     * @param user the user data transfer object containing the user details
     * @return the registered user
     */
    User register(UserDto user);

    /**
     * Retrieves a user by their email or phone number.
     *
     * @param email the email of the user to retrieve
     * @param verification the verification service to use
     * @return the retrieved user
     */
    User getUserByEmailOrPhoneNumber(String email, VerificationService verification);

    /**
     * Deletes a user by their email.
     *
     * @param currentUser the current user to delete
     * @param verification the verification service to use
     * @return true if the user was successfully deleted, false otherwise
     */
    boolean deleteUserByEmail(User currentUser, VerificationService verification);

    /**
     * Updates the details of an existing user.
     *
     * @param currentUser the current user to update
     * @param user the user data transfer object containing the updated user details
     * @param verification the verification service to use
     * @return the updated user
     */
    User updateUser(User currentUser, UserDto user, VerificationService verification);

    /**
     * Retrieves a user by their ID.
     *
     * @param id the ID of the user to retrieve
     * @return the retrieved user
     */
    User getUserById(Long id);
    /**
     * Retrieves all users.
     *
     * @return all lists of users
     */
    List<User> getAllUsers();;

}
