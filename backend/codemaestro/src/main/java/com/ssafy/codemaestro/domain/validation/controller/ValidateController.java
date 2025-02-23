package com.ssafy.codemaestro.domain.validation.controller;

import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/validate")
public class ValidateController {
    UserRepository userRepository;

    @Autowired
    public ValidateController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Void> email(@PathVariable String email) {


        boolean isExist = userRepository.existsByEmail(email);

        if (!isExist) {
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.FOUND);
        }
    }

    @GetMapping("/nickname/{nickname}")
    public ResponseEntity<Void> nickname(@PathVariable String nickname) {
        boolean isExist = userRepository.existsByNickname(nickname);

        if (!isExist) {
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.FOUND);
        }
    }
}
