package com.autojudge.backend.config;

import com.autojudge.backend.model.ERole;
import com.autojudge.backend.model.Role;
import com.autojudge.backend.model.User;
import com.autojudge.backend.repository.RoleRepository;
import com.autojudge.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles if they don't exist
        initRoles();
        
        // Create admin user if it doesn't exist
        createAdminIfNotExists();
    }
    
    private void initRoles() {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setName(ERole.ROLE_ADMIN);
            roleRepository.save(adminRole);
            
            Role interviewerRole = new Role();
            interviewerRole.setName(ERole.ROLE_INTERVIEWER);
            roleRepository.save(interviewerRole);
            
            Role candidateRole = new Role();
            candidateRole.setName(ERole.ROLE_CANDIDATE);
            roleRepository.save(candidateRole);
            
            System.out.println("Roles initialized");
        }
    }
    
    private void createAdminIfNotExists() {
        if (!userRepository.existsByEmail("admin@autojudge.com")) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEmail("admin@autojudge.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin Role not found."));
            
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            admin.setRoles(roles);
            
            userRepository.save(admin);
            
            System.out.println("Admin user created");
        }
    }
} 