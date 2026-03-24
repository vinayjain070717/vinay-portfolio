-- Seed data for Vinay Jain Portfolio
-- Run this AFTER schema.sql in the Supabase SQL Editor

-- Profile
INSERT INTO profiles (full_name, title, bio, email, phone, location, linkedin_url, github_url, hackerrank_url) VALUES (
  'Vinay Jain',
  'Software Developer',
  'Passionate Software Developer with 5+ years of experience building scalable microservices, middleware systems, and cloud-native applications. Experienced in Java, Spring Boot, Node.js, and modern cloud technologies like Docker, Kubernetes, and Apache Kafka. I love turning complex problems into elegant solutions.',
  'vinayomjain@gmail.com',
  '+91 7999512904',
  'Pune, Maharashtra, India',
  'https://linkedin.com/in/vinayjain703',
  'https://github.com/vinayjain070717',
  'https://hackerrank.com/profile/monu9425'
);

-- Skills
INSERT INTO skills (name, category, proficiency, icon_name, display_order) VALUES
  ('Java', 'Programming', 95, 'java', 1),
  ('Spring Boot', 'Programming', 90, 'spring', 2),
  ('Node.js', 'Programming', 85, 'nodejs', 3),
  ('JavaScript', 'Programming', 85, 'javascript', 4),
  ('Python', 'Programming', 80, 'python', 5),
  ('Hibernate', 'Programming', 85, 'hibernate', 6),
  ('Microservices', 'Programming', 90, 'microservices', 7),
  ('Shell Scripting', 'Programming', 70, 'terminal', 8),
  ('Mulesoft', 'Programming', 75, 'mulesoft', 9),
  ('C++', 'Programming', 75, 'cplusplus', 10),
  ('Design Patterns', 'Programming', 85, 'patterns', 11),
  ('MySQL', 'Databases', 90, 'mysql', 1),
  ('MongoDB', 'Databases', 75, 'mongodb', 2),
  ('PostgreSQL', 'Databases', 80, 'postgresql', 3),
  ('Docker', 'DevOps & Tools', 85, 'docker', 1),
  ('Kubernetes', 'DevOps & Tools', 80, 'kubernetes', 2),
  ('Apache Kafka', 'DevOps & Tools', 85, 'kafka', 3),
  ('Jenkins', 'DevOps & Tools', 75, 'jenkins', 4),
  ('Git', 'DevOps & Tools', 90, 'git', 5),
  ('Azure', 'DevOps & Tools', 75, 'azure', 6),
  ('Postman', 'DevOps & Tools', 90, 'postman', 7),
  ('Tomcat', 'DevOps & Tools', 80, 'tomcat', 8);

-- Experience
INSERT INTO experience (company, role, description, start_date, end_date, is_current, location, display_order) VALUES
  ('Amdocs', 'Software Developer',
   '**Metro-X R&D Project** (Node JS, Java, Spring Boot, Microservices, Kafka, Docker, Kubernetes):
- Built complete middleware from scratch — Microservices layer as an intermediate between UI and various data sources
- Conducted R&D across multiple accounts to develop tailored Microservices
- Created an automated testing tool that reduced testing time from 1 day to under 30 minutes

**Modernizing LESOG Project** (Java, Spring Boot, Azure, C++):
- Modernized AT&T''s legacy order generator for the Southeast US region from legacy languages to Microservices architecture on Azure Cloud
- Connected with interfaces like CSI, NSDB, SOCS and rewrote legacy logic into Java',
   '2021-12-01', NULL, TRUE, 'Pune', 1),
  ('Tata Consultancy Services', 'Assistant System Engineer',
   '**ASOS Retail UK Project** (Java, Spring Boot, Hibernate, Mulesoft, Azure):
- Worked as a backend developer in the retail domain for ASOS (UK)
- Developed various enhancements and new modules for the application',
   '2021-02-01', '2021-12-01', FALSE, 'Bengaluru (Remote)', 2),
  ('Thinking Machines', 'Software Developer Intern',
   '**Centralized CMI Application** (Java, Spring Boot, Android, Angular):
- Built a centralized CMS server and Home Automation tool, controlled from web and mobile
- Created web application, mobile application, and a centralized server to manage all IoT devices',
   '2020-01-01', '2020-04-01', FALSE, 'Ujjain (M.P)', 3);

-- Education
INSERT INTO education (institution, degree, field_of_study, start_year, end_year, description, display_order) VALUES
  ('Shri Vaishnav Vidyapeeth Vishwavidyalaya', 'Bachelor of Technology', 'Information Technology', 2016, 2020, 'CGPA: 7.71', 1);

-- Projects
INSERT INTO projects (title, description, long_description, tech_stack, github_url, display_order, is_featured) VALUES
  ('Project Approval System', 'Online platform for minor/major project submission process in universities.', 'A comprehensive web application that digitizes the project submission and approval workflow for universities. Features include student project submission, faculty review, status tracking, and automated email notifications.', ARRAY['PHP', 'JavaScript', 'HTML5', 'CSS3', 'Bootstrap 4'], 'https://github.com/vinayjain070717/ProjectApprovalSystem', 1, TRUE),
  ('Centralized CMS Server', 'Central server for drone-mobile communication with admin monitoring panel.', 'A centralized command and monitoring server that bridges communication between drones and mobile devices. Features an admin panel to monitor all communications, integrated log management system, and real-time WebSocket connectivity.', ARRAY['Java', 'Spring Boot', 'Hibernate', 'WebSocket', 'Android', 'MySQL', 'Bootstrap 4'], 'https://github.com/vinayjain070717/Centralized-CMS-Server', 2, TRUE),
  ('Data Modeler', 'Visual tool for managing and creating DDL scripts with a drag-and-drop interface.', 'A web-based database modeling tool that provides a visual interface for designing database schemas, generating DDL scripts, and managing database objects through an intuitive canvas-based UI.', ARRAY['Java', 'JavaScript', 'jQuery', 'JSP', 'MySQL', 'Canvas', 'Tomcat 9'], 'https://github.com/vinayjain070717/DataModeler', 3, TRUE),
  ('Screen Sharing Tool', 'Remote PC control tool over network using Java Socket programming.', 'A desktop application that enables remote screen sharing and control between computers over a network. Built using Java Socket programming with real-time screen capture and input forwarding.', ARRAY['Java', 'Java Swing', 'Socket Programming', 'Gradle'], 'https://github.com/vinayjain070717/Screen-sharing-tool', 4, FALSE),
  ('Logs Management System', 'Reusable logging component with multithreading support for any Java application.', 'A pluggable logging component that can be integrated with any Java application. Features multithreaded log processing, configurable log levels, and efficient file I/O operations.', ARRAY['Java', 'Multithreading', 'Collections'], 'https://github.com/vinayjain070717/LogsManagementSystem', 5, FALSE),
  ('Data Structure Visualizer', 'Interactive visualizer for learning data structures through animations.', 'An educational tool that visualizes data structures and algorithms with step-by-step animations. Supports bubble sort, selection sort, linked lists, stacks, and queues.', ARRAY['HTML', 'JavaScript', 'CSS', 'Canvas'], 'https://github.com/vinayjain070717/dataStructureVisualizer', 6, TRUE),
  ('Photo Editing Tool', 'Desktop photo editing application showcasing image processing in Python.', 'A Python-based photo editing application with various image processing filters and transformations.', ARRAY['Python', 'Tkinter', 'Image Processing'], 'https://github.com/vinayjain070717/photoEditingTool', 7, FALSE),
  ('REST Client', 'API testing tool similar to Postman, built with Python.', 'A desktop REST API client for testing HTTP endpoints.', ARRAY['Python', 'Tkinter', 'Requests'], 'https://github.com/vinayjain070717/rest-client', 8, FALSE),
  ('Inventory Management System', 'CRUD inventory application with PDF generation capabilities.', 'A comprehensive inventory management system featuring create, update, delete, and search operations for items, with PDF report generation.', ARRAY['Java', 'JavaDB', 'File System'], 'https://github.com/vinayjain070717/inventory-management-system', 9, FALSE),
  ('Movie Recommender System', 'A movie recommendation engine built with Java.', 'A recommendation system that suggests movies based on user preferences and viewing patterns.', ARRAY['Java'], 'https://github.com/vinayjain070717/movierecommendersystem', 10, FALSE),
  ('Home Automation', 'IoT home automation system controlled via desktop application.', 'A home automation system for controlling IoT devices through a Python desktop application.', ARRAY['Python'], 'https://github.com/vinayjain070717/Home-Automation-using-desktop-App', 11, FALSE),
  ('Text Editor', 'Advanced plain text editor with features beyond standard notepad.', 'A feature-rich plain text editor with PDF support, text recognition, and advanced editing features.', ARRAY['Python', 'Tkinter', 'PDF'], 'https://github.com/vinayjain070717/text-editor', 12, FALSE),
  ('Food Management System', 'Web-based food ordering and management platform.', 'A complete food management system for handling menus, orders, and user management.', ARRAY['PHP', 'MySQL', 'HTML', 'CSS'], 'https://github.com/vinayjain070717/foodManagementSystem', 13, FALSE);

-- Certificates (Badges)
INSERT INTO certificates (title, issuer, description, credential_url, display_order, type, star_rating) VALUES
  ('Problem Solving', 'HackerRank', '5 Star Gold Badge', 'https://hackerrank.com/profile/monu9425', 1, 'badge', 5),
  ('C++', 'HackerRank', '5 Star Gold Badge', 'https://hackerrank.com/profile/monu9425', 2, 'badge', 5),
  ('Java', 'HackerRank', '5 Star Gold Badge', 'https://hackerrank.com/profile/monu9425', 3, 'badge', 5),
  ('Python', 'HackerRank', '5 Star Gold Badge', 'https://hackerrank.com/profile/monu9425', 4, 'badge', 5),
  ('30 Days of Code', 'HackerRank', 'Gold Badge', 'https://hackerrank.com/profile/monu9425', 5, 'badge', 5),
  ('10 Days of JS', 'HackerRank', 'Silver Badge', 'https://hackerrank.com/profile/monu9425', 6, 'badge', 3),
  ('SQL', 'HackerRank', '4 Star Silver Badge', 'https://hackerrank.com/profile/monu9425', 7, 'badge', 4),
  ('C Language', 'HackerRank', 'Silver Badge', 'https://hackerrank.com/profile/monu9425', 8, 'badge', 3),
  ('Ruby', 'HackerRank', '3 Star Bronze Badge', 'https://hackerrank.com/profile/monu9425', 9, 'badge', 3);

-- Certificates (Skill Certificates)
INSERT INTO certificates (title, issuer, description, credential_url, display_order, type) VALUES
  ('Python (Basic)', 'HackerRank', 'Verified Skill Certificate', 'https://hackerrank.com/profile/monu9425', 10, 'certificate'),
  ('Problem Solving (Basic)', 'HackerRank', 'Verified Skill Certificate', 'https://hackerrank.com/profile/monu9425', 11, 'certificate'),
  ('C++ (Basic)', 'HackerRank', 'Verified Skill Certificate', 'https://hackerrank.com/profile/monu9425', 12, 'certificate'),
  ('SQL (Basic)', 'HackerRank', 'Verified Skill Certificate', 'https://hackerrank.com/profile/monu9425', 13, 'certificate'),
  ('C (Basic)', 'HackerRank', 'Verified Skill Certificate', 'https://hackerrank.com/profile/monu9425', 14, 'certificate'),
  ('C (Intermediate)', 'HackerRank', 'Verified Skill Certificate', 'https://hackerrank.com/profile/monu9425', 15, 'certificate'),
  ('JavaScript (Basic)', 'HackerRank', 'Verified Skill Certificate', 'https://hackerrank.com/profile/monu9425', 16, 'certificate'),
  ('Java (Basic)', 'HackerRank', 'Verified Skill Certificate', 'https://hackerrank.com/profile/monu9425', 17, 'certificate');

-- Services
INSERT INTO services (title, description, icon_name, display_order) VALUES
  ('Backend Development', 'Scalable microservices and REST APIs using Java, Spring Boot, and Node.js', 'Server', 1),
  ('API Design & Integration', 'RESTful API design, third-party integrations, and middleware development', 'Plug', 2),
  ('Cloud & DevOps', 'Docker, Kubernetes, CI/CD pipelines, and cloud deployment on Azure', 'Cloud', 3),
  ('Database Architecture', 'Schema design, optimization, and management for MySQL, PostgreSQL, MongoDB', 'Database', 4);

-- Journey Events
INSERT INTO journey_events (title, description, date, event_type, icon_name, display_order) VALUES
  ('Started B.Tech in IT', 'Began Bachelor of Technology in Information Technology at Shri Vaishnav Vidyapeeth Vishwavidyalaya', '2016-07-01', 'education', 'GraduationCap', 1),
  ('Internship at Thinking Machines', 'Built a Centralized CMS Server and Home Automation system using Java, Spring Boot, and Android', '2020-01-01', 'career', 'Briefcase', 2),
  ('Graduated B.Tech', 'Completed B.Tech in Information Technology with 7.71 CGPA', '2020-07-01', 'education', 'Award', 3),
  ('Joined TCS', 'Started as Assistant System Engineer working on ASOS Retail UK Project', '2021-02-01', 'career', 'Briefcase', 4),
  ('Joined Amdocs', 'Promoted to Software Developer, working on Metro-X R&D and LESOG modernization projects', '2021-12-01', 'career', 'Rocket', 5),
  ('HackerRank Gold Badges', 'Earned 5-star gold badges in Problem Solving, Java, Python, and C++', '2022-01-01', 'achievement', 'Trophy', 6);

-- Social Links
INSERT INTO social_links (platform_name, url, icon_name, display_order, is_visible) VALUES
  ('LinkedIn', 'https://linkedin.com/in/vinayjain703', 'Linkedin', 1, TRUE),
  ('GitHub', 'https://github.com/vinayjain070717', 'Github', 2, TRUE),
  ('HackerRank', 'https://hackerrank.com/profile/monu9425', 'Code2', 3, TRUE),
  ('Email', 'mailto:vinayomjain@gmail.com', 'Mail', 4, TRUE);

-- Site Config defaults
INSERT INTO site_config (config_key, config_value, config_type) VALUES
  ('primary_color', '#6366f1', 'color'),
  ('accent_color', '#06b6d4', 'color'),
  ('font_heading', 'Inter', 'string'),
  ('font_body', 'Inter', 'string'),
  ('default_theme', 'dark', 'string'),
  ('hero_title', 'Hi, I''m Vinay Jain', 'string'),
  ('hero_subtitle', 'Software Developer | Building Scalable Microservices', 'string'),
  ('hero_cta_text', 'View My Work', 'string'),
  ('hero_cta_url', '#projects', 'string'),
  ('hero_background_style', 'particles', 'string'),
  ('footer_text', 'Let''s build something amazing together.', 'string'),
  ('footer_copyright', '© 2026 Vinay Jain. All rights reserved.', 'string'),
  ('site_title', 'Vinay Jain | Software Developer Portfolio', 'string'),
  ('meta_description', 'Portfolio of Vinay Jain — Software Developer specializing in Java, Spring Boot, Microservices, Node.js, and Cloud Technologies.', 'string'),
  ('og_image_url', '', 'string');

-- Site Sections
INSERT INTO site_sections (section_key, label, display_order, is_visible) VALUES
  ('hero', 'Hero', 1, TRUE),
  ('about', 'About Me', 2, TRUE),
  ('services', 'Services', 3, TRUE),
  ('skills', 'Skills', 4, TRUE),
  ('experience', 'Experience', 5, TRUE),
  ('education', 'Education', 6, TRUE),
  ('projects', 'Projects', 7, TRUE),
  ('certificates', 'Certificates', 8, TRUE),
  ('coding-stats', 'Coding Stats', 9, TRUE),
  ('journey', 'Journey', 10, TRUE),
  ('resume', 'Resume', 11, TRUE),
  ('contact', 'Contact', 12, TRUE);

-- Nav Items
INSERT INTO nav_items (label, section_key, display_order, is_visible) VALUES
  ('About', 'about', 1, TRUE),
  ('Skills', 'skills', 2, TRUE),
  ('Experience', 'experience', 3, TRUE),
  ('Projects', 'projects', 4, TRUE),
  ('Certificates', 'certificates', 5, TRUE),
  ('Journey', 'journey', 6, TRUE),
  ('Contact', 'contact', 7, TRUE);
