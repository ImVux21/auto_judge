-- First insert the roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_CANDIDATE');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_INTERVIEWER');
INSERT INTO roles (id, name) VALUES (3, 'ROLE_ADMIN');

-- Now insert the user and assign the role
INSERT INTO users (first_name, last_name, email, password) 
VALUES ('John', 'Smith', 'john.smith@example.com', '$2a$10$XzI/Xq5rVQy1Vr1QMLWGnOu4AHNqYpTbHUVBZ1YwHZM.jyK4CQHVq');

-- Assign the ROLE_INTERVIEWER role to the user
INSERT INTO user_roles (user_id, role_id) VALUES (1, 2);

-- Interview 1: Java Developer Position
INSERT INTO interviews (title, job_role, description, time_limit, created_by, created_at, active)
VALUES ('Java Backend Developer Interview', 'Java Developer', 'Technical assessment for mid-level Java developers with Spring Boot experience', 60, 1, NOW(), true);

-- Questions for Interview 1
-- Multiple choice questions
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Which of the following is NOT a feature of Java 8?', 'MULTIPLE_CHOICE', 2, 'Java Fundamentals', 1, NULL, 1);

INSERT INTO options (text, correct, question_id)
VALUES ('Lambda expressions', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('Stream API', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('Optional class', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('Virtual threads', true, currval('questions_id_seq'));

-- Another multiple choice question
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Which annotation is used to define a REST endpoint in Spring?', 'MULTIPLE_CHOICE', 2, 'Spring Framework', 1, NULL, 2);

INSERT INTO options (text, correct, question_id)
VALUES ('@RestController', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('@RequestMapping', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('@GetMapping', true, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('All of the above', false, currval('questions_id_seq'));

-- Open-ended question
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Explain the difference between @RequestParam and @PathVariable annotations in Spring MVC.', 'OPEN_ENDED', 3, 'Spring Framework', 1, '@RequestParam is used to extract query parameters from the URL (e.g., ?name=value), while @PathVariable is used to extract values from the URI path (e.g., /users/{id}). @RequestParam can have default values and can be optional, while @PathVariable is typically required and represents a part of the URI path.', 3);

-- Coding question
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Write a Java function that checks if a string is a palindrome (reads the same forwards and backwards).', 'CODING', 3, 'Java Programming', 1, 'public boolean isPalindrome(String str) {\n    if (str == null) return false;\n    String cleaned = str.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();\n    int left = 0;\n    int right = cleaned.length() - 1;\n    while (left < right) {\n        if (cleaned.charAt(left) != cleaned.charAt(right)) {\n            return false;\n        }\n        left++;\n        right--;\n    }\n    return true;\n}', 4);

-- Interview 2: Frontend Developer Position
INSERT INTO interviews (title, job_role, description, time_limit, created_by, created_at, active)
VALUES ('Frontend Developer Assessment', 'Frontend Developer', 'Technical interview for Angular specialists with 2+ years experience', 45, 1, NOW(), true);

-- Questions for Interview 2
-- Multiple choice question
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Which of the following is NOT an Angular hook?', 'MULTIPLE_CHOICE', 2, 'Angular', 2, NULL, 1);

INSERT INTO options (text, correct, question_id)
VALUES ('ngOnInit', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('ngOnChanges', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('ngAfterViewInit', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('ngOnRender', true, currval('questions_id_seq'));

-- Open-ended question
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Explain the difference between Promises and Observables in JavaScript.', 'OPEN_ENDED', 3, 'JavaScript', 2, 'Promises handle a single event when an async operation completes or fails. Observables are like streams and can emit multiple values over time. Observables are cancellable, support operators like map, filter, and reduce, and can be synchronous or asynchronous. Promises are always asynchronous and cannot be cancelled once created.', 2);

-- Coding question
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Create a simple Angular component that displays a list of items from an array and allows adding new items through a form.', 'CODING', 4, 'Angular', 2, '// item-list.component.ts\nimport { Component } from ''@angular/core'';\n\n@Component({\n  selector: ''app-item-list'',\n  templateUrl: ''./item-list.component.html'',\n  styleUrls: [''./item-list.component.css'']\n})\nexport class ItemListComponent {\n  items: string[] = [''Item 1'', ''Item 2'', ''Item 3''];\n  newItem: string = '''';\n\n  addItem() {\n    if (this.newItem.trim()) {\n      this.items.push(this.newItem);\n      this.newItem = '''';\n    }\n  }\n}\n\n// item-list.component.html\n<div>\n  <h2>Items</h2>\n  <ul>\n    <li *ngFor="let item of items">{{ item }}</li>\n  </ul>\n  <div>\n    <input [(ngModel)]="newItem" placeholder="New item">\n    <button (click)="addItem()">Add</button>\n  </div>\n</div>', 3);

-- Interview 3: DevOps Engineer Position
INSERT INTO interviews (title, job_role, description, time_limit, created_by, created_at, active)
VALUES ('DevOps Engineer Technical Assessment', 'DevOps Engineer', 'Comprehensive evaluation of CI/CD, containerization, and cloud infrastructure skills', 90, 1, NOW(), true);

-- Questions for Interview 3
-- Multiple choice question
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Which of the following is NOT a container orchestration platform?', 'MULTIPLE_CHOICE', 3, 'Containerization', 3, NULL, 1);

INSERT INTO options (text, correct, question_id)
VALUES ('Kubernetes', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('Docker Swarm', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('Jenkins', true, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('Amazon ECS', false, currval('questions_id_seq'));

-- Another multiple choice question
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Which AWS service is primarily used for container orchestration?', 'MULTIPLE_CHOICE', 2, 'Cloud Services', 3, NULL, 2);

INSERT INTO options (text, correct, question_id)
VALUES ('AWS Lambda', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('Amazon EKS', true, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('Amazon S3', false, currval('questions_id_seq'));

INSERT INTO options (text, correct, question_id)
VALUES ('Amazon RDS', false, currval('questions_id_seq'));

-- Open-ended question
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Explain the concept of Infrastructure as Code and list its benefits.', 'OPEN_ENDED', 3, 'DevOps Practices', 3, 'Infrastructure as Code (IaC) is the practice of managing and provisioning infrastructure through machine-readable definition files rather than manual processes. Benefits include: 1) Consistency and reproducibility of environments, 2) Version control for infrastructure, 3) Faster deployment and scaling, 4) Reduced risk of human error, 5) Documentation of infrastructure, 6) Cost reduction through automation, and 7) Improved collaboration between development and operations teams.', 3);

-- Coding question
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Write a Dockerfile for a Spring Boot application that runs on Java 17.', 'CODING', 4, 'Containerization', 3, 'FROM eclipse-temurin:17-jdk-alpine\nWORKDIR /app\nCOPY target/*.jar app.jar\nEXPOSE 8080\nENTRYPOINT ["java", "-jar", "app.jar"]\n', 4);

-- Another coding question
INSERT INTO questions (text, type, difficulty_level, category, interview_id, model_answer, order_index)
VALUES ('Create a basic GitHub Actions workflow file to build and test a Java application.', 'CODING', 4, 'CI/CD', 3, 'name: Java CI with Maven\n\non:\n  push:\n    branches: [ main ]\n  pull_request:\n    branches: [ main ]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n\n    steps:\n    - uses: actions/checkout@v3\n    - name: Set up JDK 17\n      uses: actions/setup-java@v3\n      with:\n        java-version: ''17''\n        distribution: ''temurin''\n        cache: maven\n    - name: Build with Maven\n      run: mvn -B package --file pom.xml\n    - name: Test with Maven\n      run: mvn test', 5);
