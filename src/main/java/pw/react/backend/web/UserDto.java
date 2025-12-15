package pw.react.backend.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import pw.react.backend.models.user.Role;
import pw.react.backend.models.user.User;


public record UserDto (
        @Schema(description = "User ID, ignored when creating a user", example = "1")
        Long id,
        @Schema(description = "User email, ignored when editing a user", example = "user@email.com")
        @Email String email,

        @Schema(description = "User name", example = "John")
        String name,

        @Schema(description = "User surname", example = "Doe")
        String surname,

        @Schema(description = "User phone number", example = "+1234567890")
        String phoneNumber,

        @Schema(description = "Username", example = "JohnDoe")
        String username,

        @Schema(description = "Role", example = "Enum of Roles")
        Role role,

        @Schema(description = "Password", example = "Password, ideally encryptted")
        String password,


        boolean deleted) {

    public static UserDto valueFrom(User user) {
        return new UserDto(user.getUserId(), user.getEmail(), user.getName(), user.getSurname(), user.getPhoneNumber(), user.getUsername(), user.getRole(), user.getPassword(), user.isDeleted());
    }

    public static User convertToUser(UserDto userDto) {
        User user = new User();
        if (userDto.id() != null) {
            user.setUserId(userDto.id());
        }
        user.setEmail(userDto.email());
        user.setName(userDto.name());
        user.setSurname(userDto.surname());
        user.setPassword(userDto.password());
        user.setRole(userDto.role());
        user.setUsername(userDto.username());
        user.setPhoneNumber(userDto.phoneNumber());
        return user;
    }
}
