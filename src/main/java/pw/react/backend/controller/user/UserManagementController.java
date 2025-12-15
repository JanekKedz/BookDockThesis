package pw.react.backend.controller.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import pw.react.backend.web.UserDto;

import java.util.Map;

public interface UserManagementController {

    ResponseEntity<UserDto> registerUser(@RequestBody(required = false) Map<String, Object> body);

    ResponseEntity<UserDto> getUserData(@RequestHeader(value = "Authorization") String authorization);

    ResponseEntity<Boolean> deleteUser(@RequestHeader(value = "Authorization") String authorization);

    ResponseEntity<UserDto> updateUser(@RequestBody(required = false) Map<String, Object> body,
                                       @RequestHeader(value = "Authorization") String authorization);
}
