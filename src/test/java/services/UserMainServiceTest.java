package services;


import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import pw.react.backend.dao.UserRepository;
import pw.react.backend.exceptions.ArgumentException;
import pw.react.backend.exceptions.UnauthorizedException;
import pw.react.backend.models.user.Role;
import pw.react.backend.models.user.User;
import pw.react.backend.services.UserMainService;
import pw.react.backend.web.UserDto;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserMainServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    UserMainService service;

    @Test
    void register_encodesPassword_beforeSaving() {
        // given
        UserDto dto = new UserDto(
                null,
                "editor@abc.pl",
                "Editor",
                "Wisniewski",
                "567765543",
                "editorek",
                Role.EDITOR,
                "plainPassword",
                false
        );

        when(userRepository.existsByEmailAndDeletedFalse(dto.email())).thenReturn(false);
        when(userRepository.existsByPhoneNumberAndDeletedFalse(dto.phoneNumber())).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("HASHED");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // when
        User saved = service.register(dto);

        // then
        verify(passwordEncoder).encode("plainPassword");
        verify(userRepository).save(captor.capture());

        User toDb = captor.getValue();
        assertThat(toDb.getPassword()).isEqualTo("HASHED");
        assertThat(saved.getPassword()).isEqualTo("HASHED");

        // sanity: fields copied from dto
        assertThat(toDb.getEmail()).isEqualTo(dto.email());
        assertThat(toDb.getUsername()).isEqualTo(dto.username());
        assertThat(toDb.getPhoneNumber()).isEqualTo(dto.phoneNumber());
        assertThat(toDb.getRole()).isEqualTo(Role.EDITOR);
    }

    @Test
    void register_throws_when_missing_required_fields() {
        // email is null -> should throw ArgumentException (your code checks for nulls)
        UserDto bad = new UserDto(
                null,
                null,
                "Name",
                "Surname",
                "123",
                "user",
                Role.EDITOR,
                "pass",
                false
        );

        assertThatThrownBy(() -> service.register(bad))
                .isInstanceOf(ArgumentException.class);
    }

    @Test
    void register_throws_when_email_already_exists() {
        UserDto dto = new UserDto(
                null,
                "admin@abc.pl",
                "Admin",
                "X",
                "999",
                "admin",
                Role.ADMIN,
                "pass",
                false
        );

        when(userRepository.existsByEmailAndDeletedFalse(dto.email())).thenReturn(true);

        assertThatThrownBy(() -> service.register(dto))
                .isInstanceOf(UnauthorizedException.class);

        // should not encode or save if blocked early
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_throws_when_phone_already_exists() {
        UserDto dto = new UserDto(
                null,
                "new@abc.pl",
                "New",
                "User",
                "123",
                "newuser",
                Role.SAILOR,
                "pass",
                false
        );

        when(userRepository.existsByEmailAndDeletedFalse(dto.email())).thenReturn(false);
        when(userRepository.existsByPhoneNumberAndDeletedFalse(dto.phoneNumber())).thenReturn(true);

        assertThatThrownBy(() -> service.register(dto))
                .isInstanceOf(UnauthorizedException.class);

        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }
}
