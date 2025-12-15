package pw.react.backend.services;

import lombok.SneakyThrows;
import pw.react.backend.dao.UserRepository;
import pw.react.backend.exceptions.ArgumentException;
import pw.react.backend.exceptions.UnauthorizedException;
import pw.react.backend.exceptions.UserValidationException;
import pw.react.backend.models.user.User;
import pw.react.backend.services.verification.VerificationService;
import pw.react.backend.web.UserDto;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class UserMainService implements UserService {

    protected final UserRepository userRepository;

    public UserMainService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean emailFormat(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        Pattern pattern = Pattern.compile(emailRegex);
        Matcher matcher = pattern.matcher(email);
        return matcher.matches();
    }

    @SneakyThrows
    @Override
    public void verifyUser(VerificationService verification, User user) {
        verification.verifyUser(user);
    }

    @Override
    public User register(UserDto user) {
        if (user.email() == null || user.name() == null || user.surname() == null || user.phoneNumber() == null || user.username() == null || user.password() == null) {
            throw new ArgumentException("Not all arguments provided");
        }
        if (!emailFormat(user.email())) {
            throw new UserValidationException("Invalid email format");
        }
        if (userRepository.existsByEmailAndDeletedFalse(user.email())) {
            throw new UnauthorizedException("User with email " + user.email() + " already exists");
        }
        if (userRepository.existsByPhoneNumberAndDeletedFalse(user.phoneNumber())) {
            throw new UnauthorizedException("User with phone number " + user.phoneNumber() + " already exists");
        }
        User newUser = UserDto.convertToUser(user);
        return userRepository.save(newUser);
    }

    @Override
    public User getUserByEmailOrPhoneNumber(String data, VerificationService verification) {
        Optional<User> user = userRepository.findByEmail(data);
        if (user.isEmpty() || user.get().isDeleted()) {
            user = userRepository.findByPhoneNumber(data);
        }
        verifyUser(verification, user.orElse(null));
        if (user.isEmpty()) {
            throw new UserValidationException("User with email or phone number " + data + " not found");
        }
        return user.get();
    }

    @Override
    public boolean deleteUserByEmail(User currentUser, VerificationService verification) {
        currentUser.setDeleted(true);
        userRepository.save(currentUser);
        return currentUser.isDeleted();
    }

    @Override
    public User updateUser(User currentUser, UserDto user, VerificationService verification) {

        if(user.name() != null)
            currentUser.setName(user.name());
        if(user.surname() != null)
            currentUser.setSurname(user.surname());
        return userRepository.save(currentUser);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserValidationException("User with id " + id + " not found"));
    }
    @Override
    public List<User> getAllUsers() {
        // Example: Fetch all users from the database
        return userRepository.findAll();
    }
}
