package pw.react.backend.services.verification;


import pw.react.backend.exceptions.UserValidationException;
import pw.react.backend.models.user.User;

public class UserVerificationService implements VerificationService {
    @Override
    public void verifyUser(User user) {
        if (user == null)
            throw new UserValidationException("No such user");
    }
}
