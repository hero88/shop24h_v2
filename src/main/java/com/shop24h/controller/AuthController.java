package com.shop24h.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.shop24h.model.Customer;
import com.shop24h.model.ERole;
import com.shop24h.model.Role;
import com.shop24h.model.User;
import com.shop24h.payload.request.ForgotRequest;
import com.shop24h.payload.request.LoginRequest;
import com.shop24h.payload.request.SignUpRequestCilent;
import com.shop24h.payload.request.changePassRequest;
import com.shop24h.payload.response.JwtResponse;
import com.shop24h.payload.response.MessageResponse;
import com.shop24h.repository.CustomerRepository;
import com.shop24h.repository.RoleRepository;
import com.shop24h.repository.UserRepository;
import com.shop24h.security.jwt.JwtUtils;
import com.shop24h.security.services.EmailService;
import com.shop24h.security.services.UserDetailsImpl;
import com.shop24h.security.services.UserDetailsServiceImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class AuthController {
  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @Autowired 
  CustomerRepository customerRepository;

  @Autowired
  UserDetailsServiceImpl userDetailsServiceImpl;

  @Autowired
  EmailService emailService;


  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    try {
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

      SecurityContextHolder.getContext().setAuthentication(authentication);
      String jwt = jwtUtils.generateJwtToken(authentication);
      
      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
      List<String> roles = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          
          .collect(Collectors.toList());
      return ResponseEntity.ok(new JwtResponse(jwt, 
                          userDetails.getId(), 
                          userDetails.getUsername(), 
                          roles, userDetails.getEmail()));
    }
    catch (BadCredentialsException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Wrong username or password");
    }
  }

  // @PostMapping("/signup")
  // public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
  //   if (userRepository.existsByUsername(signUpRequest.getUsername())) {
  //     return ResponseEntity
  //         .badRequest()
  //         .body(new MessageResponse("Error: Username is already taken!"));
  //   }


  //   // Create new user's account
  //   User user = new User(signUpRequest.getUsername(), 
  //              encoder.encode(signUpRequest.getPassword()));

  //   Set<String> strRoles = signUpRequest.getRole();
  //   Set<Role> roles = new HashSet<>();

  //   if (strRoles == null) {
  //     Role userRole = roleRepository.findByName(ERole.ROLE_USER)
  //         .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
  //     roles.add(userRole);
  //   } else {
  //     strRoles.forEach(role -> {
  //       switch (role) {
  //       case "admin":
  //         Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
  //             .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
  //         roles.add(adminRole);

  //         break;
  //       case "mod":
  //         Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
  //             .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
  //         roles.add(modRole);

  //         break;
  //       default:
  //         Role userRole = roleRepository.findByName(ERole.ROLE_USER)
  //             .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
  //         roles.add(userRole);
  //       }
  //     });
  //   }

  //   user.setRoles(roles);
  //   userRepository.save(user);

  //   return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
  // }




  @PostMapping("/signupCilent")
  public ResponseEntity<?> registerUserCilent(@Valid @RequestBody SignUpRequestCilent signUpRequestCilent) {
    if (userRepository.existsByUsername(signUpRequestCilent.getUsername())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Số điện thoại đã được đăng ký"));
    }
  
    Customer customer = customerRepository.findByPhoneNumber(signUpRequestCilent.getPhoneNumber())
        .orElse(new Customer()); // Create new customer if not found
    customer.setFullName(signUpRequestCilent.getFullName());
    customer.setEmail(signUpRequestCilent.getEmail());
    customer.setPhoneNumber(signUpRequestCilent.getPhoneNumber());
    customerRepository.save(customer);
  
    User user = new User(signUpRequestCilent.getUsername(), encoder.encode(signUpRequestCilent.getPassword()));
    Set<Role> roles = new HashSet<>();
    Role userRole = roleRepository.findByName(ERole.ROLE_USER)
        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));   
    
    user.setSecretQuestion(signUpRequestCilent.getSecretQuestion());
    user.setSecretAsnwer(encoder.encode(signUpRequestCilent.getSecretAsnwer().toLowerCase()));
    
    roles.add(userRole);
    user.setRoles(roles);
    user.setCustomer(customer);    
    
    userRepository.save(user);
    customer.setUser(user);
    customerRepository.save(customer);
  
  
    return ResponseEntity.ok().body(new MessageResponse("Đăng ký Thành Công"));
  }
  


  @PutMapping("/user/changePassword")
  public ResponseEntity<?> changePassword( @RequestBody changePassRequest changePass, HttpServletRequest req){

    User user = userDetailsServiceImpl.whoami(req);

      if (encoder.matches(changePass.getOldPass(), user.getPassword())) {   
        // User userFound = userRepository.findByUsername(user.getUsername()).get();           
        user.setPassword(encoder.encode(changePass.getNewPass()));
        return ResponseEntity.ok(userRepository.save(user));
      } else {
        return  ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật Khẩu cũ không đúng");
      }
  }


  @PostMapping("user/forgotPass")
  public ResponseEntity<Object> forgotPass(@RequestBody ForgotRequest forgotRequest){
    try {
      Optional<User> userForgot = userRepository.findByUsername(forgotRequest.getUsername());
      if(userForgot.isPresent()){
        if(userForgot.get().getSecretQuestion().equals(forgotRequest.getSecretQuestion()) && encoder.matches(forgotRequest.getSecretAnswer().toLowerCase(), userForgot.get().getSecretAsnwer())){
          String newPass = RandomStringUtils.randomAlphanumeric(10);
          userForgot.get().setPassword(encoder.encode(newPass));
          userRepository.save(userForgot.get());
          String text = "Mật khẩu mới của bạn là " + newPass + ". Bạn có thể vào hồ sơ cá nhân để thay đổi mật khẩu";
  
          emailService.sendEmail(userForgot.get().getCustomer().getEmail(), text);
          return ResponseEntity.status(HttpStatus.OK).body("Đã gửi mật khẩu mới về email đăng ký của bạn");
        } else {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Câu hỏi và câu trả lời không đúng");
        }
      } else {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không có username này");
      }
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
  }    
  
    
  
}
