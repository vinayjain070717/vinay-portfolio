import type { Experience, Education, Skill, Project, Certificate, Service, JourneyEvent, SocialLink } from "./types";

export const experienceData: Omit<Experience, "id">[] = [
  {
    company: "Amdocs",
    role: "Software Developer",
    description: `**AT&T OPENET Charging – CGF** (Java, Spring Boot, Kafka Streams, KSQL, Kubernetes, UNIX):
- Backend developer on AT&T's online charging system (CGF)
- Built and optimized Kafka Streams / KSQL pipelines processing ~3M+ records
- Improved observability and resilience using structured logging, metrics, alerts

**Metro-X Environment Management** (Node.js, Java, Spring Boot, Kafka, Docker, Kubernetes):
- Contributed to internal environment management platform
- Reduced manual environment setup and testing time from ~1 day to under 30 minutes
- Worked with Kafka, Docker, Kubernetes, CI/CD

**LESOG Order Generation** (Java, Spring Boot, Azure):
- Led migration of legacy telecom order-generation to Spring Boot microservices on Azure
- Designed integrations with CSI, NSDB, SOCS systems
- Rebuilt critical file-based flows into fault-tolerant microservices`,
    start_date: "2021-12-01",
    end_date: null,
    is_current: true,
    company_logo_url: null,
    location: "Pune",
    display_order: 1,
  },
  {
    company: "Tata Consultancy Services",
    role: "Assistant System Engineer",
    description: `**ASOS Retail UK** (Java, Spring Boot, Hibernate, REST, SQL):
- Backend engineer on ASOS (UK) retail systems
- Implemented and optimized REST APIs for catalog, orders, and retail modules
- Collaborated with onshore and cross-functional teams for feature delivery and code quality`,
    start_date: "2021-02-01",
    end_date: "2021-12-01",
    is_current: false,
    company_logo_url: null,
    location: "Bengaluru",
    display_order: 2,
  },
  {
    company: "Customised Technologies Pvt Ltd",
    role: "Software Developer – Internal Tools",
    description: `**Document Management & Quotation System** (C#, WPF, MS Access):
- Built desktop application for sales quotations and customer data management
- Reduced quotation preparation time from ~30 minutes to about 1 minute
- Created reusable invoice templates covering different product lines and pricing`,
    start_date: "2020-12-01",
    end_date: "2021-02-01",
    is_current: false,
    company_logo_url: null,
    location: "India",
    display_order: 3,
  },
  {
    company: "Thinking Machines",
    role: "Software Developer",
    description: `**Centralized CMI & Home Automation Platform** (Java, Spring Boot, Android, Angular):
- Built centralized CMI server and home automation platform from scratch
- Designed REST APIs, database schema, and control flows for device management
- Implemented user/device management, authentication, and real-time control modules`,
    start_date: "2020-01-01",
    end_date: "2020-04-01",
    is_current: false,
    company_logo_url: null,
    location: "Ujjain",
    display_order: 4,
  },
];

export const educationData: Omit<Education, "id">[] = [
  {
    institution: "Shri Vaishnav Institute of Technology and Science, Indore",
    degree: "Bachelor of Technology",
    field_of_study: "Information Technology",
    start_year: 2016,
    end_year: 2020,
    description: "CGPA: 7.71",
    logo_url: null,
    display_order: 1,
  },
];

export const skillsData: Omit<Skill, "id">[] = [
  { name: "Java", category: "Programming", proficiency: 95, icon_name: "java", display_order: 1 },
  { name: "Spring Boot", category: "Programming", proficiency: 90, icon_name: "spring", display_order: 2 },
  { name: "Node.js", category: "Programming", proficiency: 85, icon_name: "nodejs", display_order: 3 },
  { name: "JavaScript", category: "Programming", proficiency: 85, icon_name: "javascript", display_order: 4 },
  { name: "Python", category: "Programming", proficiency: 80, icon_name: "python", display_order: 5 },
  { name: "Hibernate", category: "Programming", proficiency: 85, icon_name: "hibernate", display_order: 6 },
  { name: "Microservices", category: "Programming", proficiency: 90, icon_name: "microservices", display_order: 7 },
  { name: "Shell Scripting", category: "Programming", proficiency: 70, icon_name: "terminal", display_order: 8 },
  { name: "Mulesoft", category: "Programming", proficiency: 75, icon_name: "mulesoft", display_order: 9 },
  { name: "C++", category: "Programming", proficiency: 75, icon_name: "cplusplus", display_order: 10 },
  { name: "Design Patterns", category: "Programming", proficiency: 85, icon_name: "patterns", display_order: 11 },
  { name: "Kafka Streams", category: "Programming", proficiency: 85, icon_name: "kafka", display_order: 12 },
  { name: "KSQL", category: "Programming", proficiency: 80, icon_name: "kafka", display_order: 13 },
  { name: "Spring Cloud", category: "Programming", proficiency: 85, icon_name: "spring", display_order: 14 },
  { name: "REST APIs", category: "Programming", proficiency: 95, icon_name: "plug", display_order: 15 },
  { name: "MySQL", category: "Databases", proficiency: 90, icon_name: "mysql", display_order: 1 },
  { name: "MongoDB", category: "Databases", proficiency: 75, icon_name: "mongodb", display_order: 2 },
  { name: "PostgreSQL", category: "Databases", proficiency: 80, icon_name: "postgresql", display_order: 3 },
  { name: "Docker", category: "DevOps & Tools", proficiency: 85, icon_name: "docker", display_order: 1 },
  { name: "Kubernetes", category: "DevOps & Tools", proficiency: 80, icon_name: "kubernetes", display_order: 2 },
  { name: "Apache Kafka", category: "DevOps & Tools", proficiency: 85, icon_name: "kafka", display_order: 3 },
  { name: "Jenkins", category: "DevOps & Tools", proficiency: 75, icon_name: "jenkins", display_order: 4 },
  { name: "Git", category: "DevOps & Tools", proficiency: 90, icon_name: "git", display_order: 5 },
  { name: "Azure", category: "DevOps & Tools", proficiency: 75, icon_name: "azure", display_order: 6 },
  { name: "Postman", category: "DevOps & Tools", proficiency: 90, icon_name: "postman", display_order: 7 },
  { name: "Tomcat", category: "DevOps & Tools", proficiency: 80, icon_name: "tomcat", display_order: 8 },
  { name: "UNIX", category: "DevOps & Tools", proficiency: 80, icon_name: "terminal", display_order: 9 },
  { name: "CI/CD", category: "DevOps & Tools", proficiency: 80, icon_name: "git", display_order: 10 },
  { name: "SonarQube", category: "DevOps & Tools", proficiency: 70, icon_name: "code", display_order: 11 },
];

export const projectsData: Omit<Project, "id">[] = [
  {
    title: "Project Approval System",
    description: "Online platform for minor/major project submission process in universities.",
    long_description: "A comprehensive web application that digitizes the project submission and approval workflow for universities. Features include student project submission, faculty review, status tracking, and automated email notifications.",
    tech_stack: ["PHP", "JavaScript", "HTML5", "CSS3", "Bootstrap 4"],
    github_url: "https://github.com/vinayjain070717/ProjectApprovalSystem",
    live_url: null,
    thumbnail_url: null,
    display_order: 1,
    is_featured: true,
  },
  {
    title: "Centralized CMS Server",
    description: "Central server for drone-mobile communication with admin monitoring panel.",
    long_description: "A centralized command and monitoring server that bridges communication between drones and mobile devices. Features an admin panel to monitor all communications, integrated log management system, and real-time WebSocket connectivity.",
    tech_stack: ["Java", "Spring Boot", "Hibernate", "WebSocket", "Android", "MySQL", "Bootstrap 4"],
    github_url: "https://github.com/vinayjain070717/Centralized-CMS-Server",
    live_url: null,
    thumbnail_url: null,
    display_order: 2,
    is_featured: true,
  },
  {
    title: "Data Modeler",
    description: "Visual tool for managing and creating DDL scripts with a drag-and-drop interface.",
    long_description: "A web-based database modeling tool that provides a visual interface for designing database schemas, generating DDL scripts, and managing database objects through an intuitive canvas-based UI.",
    tech_stack: ["Java", "JavaScript", "jQuery", "JSP", "MySQL", "Canvas", "Tomcat 9"],
    github_url: "https://github.com/vinayjain070717/DataModeler",
    live_url: null,
    thumbnail_url: null,
    display_order: 3,
    is_featured: true,
  },
  {
    title: "Screen Sharing Tool",
    description: "Remote PC control tool over network using Java Socket programming.",
    long_description: "A desktop application that enables remote screen sharing and control between computers over a network. Built using Java Socket programming with real-time screen capture and input forwarding.",
    tech_stack: ["Java", "Java Swing", "Socket Programming", "Gradle"],
    github_url: "https://github.com/vinayjain070717/Screen-sharing-tool",
    live_url: null,
    thumbnail_url: null,
    display_order: 4,
    is_featured: false,
  },
  {
    title: "Logs Management System",
    description: "Reusable logging component with multithreading support for any Java application.",
    long_description: "A pluggable logging component that can be integrated with any Java application. Features multithreaded log processing, configurable log levels, and efficient file I/O operations.",
    tech_stack: ["Java", "Multithreading", "Collections"],
    github_url: "https://github.com/vinayjain070717/LogsManagementSystem",
    live_url: null,
    thumbnail_url: null,
    display_order: 5,
    is_featured: false,
  },
  {
    title: "Data Structure Visualizer",
    description: "Interactive visualizer for learning data structures through animations.",
    long_description: "An educational tool that visualizes data structures and algorithms with step-by-step animations. Supports bubble sort, selection sort, linked lists, stacks, and queues.",
    tech_stack: ["HTML", "JavaScript", "CSS", "Canvas"],
    github_url: "https://github.com/vinayjain070717/dataStructureVisualizer",
    live_url: null,
    thumbnail_url: null,
    display_order: 6,
    is_featured: true,
  },
  {
    title: "Photo Editing Tool",
    description: "Desktop photo editing application showcasing image processing in Python.",
    long_description: "A Python-based photo editing application with various image processing filters and transformations, built with Tkinter for the GUI and PIL/OpenCV for image processing.",
    tech_stack: ["Python", "Tkinter", "Image Processing"],
    github_url: "https://github.com/vinayjain070717/photoEditingTool",
    live_url: null,
    thumbnail_url: null,
    display_order: 7,
    is_featured: false,
  },
  {
    title: "REST Client",
    description: "API testing tool similar to Postman, built with Python.",
    long_description: "A desktop REST API client for testing HTTP endpoints, supporting GET, POST, PUT, DELETE methods with request/response visualization.",
    tech_stack: ["Python", "Tkinter", "Requests"],
    github_url: "https://github.com/vinayjain070717/rest-client",
    live_url: null,
    thumbnail_url: null,
    display_order: 8,
    is_featured: false,
  },
  {
    title: "Inventory Management System",
    description: "CRUD inventory application with PDF generation capabilities.",
    long_description: "A comprehensive inventory management system featuring create, update, delete, and search operations for items, with the ability to generate PDF reports of selected inventory.",
    tech_stack: ["Java", "JavaDB", "File System"],
    github_url: "https://github.com/vinayjain070717/inventory-management-system",
    live_url: null,
    thumbnail_url: null,
    display_order: 9,
    is_featured: false,
  },
  {
    title: "Movie Recommender System",
    description: "A movie recommendation engine built with Java.",
    long_description: "A recommendation system that suggests movies based on user preferences and viewing patterns.",
    tech_stack: ["Java"],
    github_url: "https://github.com/vinayjain070717/movierecommendersystem",
    live_url: null,
    thumbnail_url: null,
    display_order: 10,
    is_featured: false,
  },
  {
    title: "Home Automation",
    description: "IoT home automation system controlled via desktop application.",
    long_description: "A home automation system that allows controlling IoT devices through a Python desktop application.",
    tech_stack: ["Python"],
    github_url: "https://github.com/vinayjain070717/Home-Automation-using-desktop-App",
    live_url: null,
    thumbnail_url: null,
    display_order: 11,
    is_featured: false,
  },
  {
    title: "Text Editor",
    description: "Advanced plain text editor with features beyond standard notepad.",
    long_description: "A feature-rich plain text editor with PDF support, text recognition, and advanced editing features built with Python and Tkinter.",
    tech_stack: ["Python", "Tkinter", "PDF"],
    github_url: "https://github.com/vinayjain070717/text-editor",
    live_url: null,
    thumbnail_url: null,
    display_order: 12,
    is_featured: false,
  },
  {
    title: "Food Management System",
    description: "Web-based food ordering and management platform.",
    long_description: "A complete food management system for handling menus, orders, and user management.",
    tech_stack: ["PHP", "MySQL", "HTML", "CSS"],
    github_url: "https://github.com/vinayjain070717/foodManagementSystem",
    live_url: null,
    thumbnail_url: null,
    display_order: 13,
    is_featured: false,
  },
];

export const certificatesData: Omit<Certificate, "id">[] = [
  { title: "Problem Solving", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/profile/monu94259", badge_image_url: null, description: "5 Star Gold Badge", display_order: 1, type: "badge", star_rating: 5 },
  { title: "C++", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/profile/monu94259", badge_image_url: null, description: "5 Star Gold Badge", display_order: 2, type: "badge", star_rating: 5 },
  { title: "Java", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/profile/monu94259", badge_image_url: null, description: "5 Star Gold Badge", display_order: 3, type: "badge", star_rating: 5 },
  { title: "Python", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/profile/monu94259", badge_image_url: null, description: "5 Star Gold Badge", display_order: 4, type: "badge", star_rating: 5 },
  { title: "30 Days of Code", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/profile/monu94259", badge_image_url: null, description: "Gold Badge", display_order: 5, type: "badge", star_rating: 5 },
  { title: "10 Days of JS", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/profile/monu94259", badge_image_url: null, description: "Silver Badge", display_order: 6, type: "badge", star_rating: 3 },
  { title: "SQL", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/profile/monu94259", badge_image_url: null, description: "4 Star Silver Badge", display_order: 7, type: "badge", star_rating: 4 },
  { title: "C Language", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/profile/monu94259", badge_image_url: null, description: "Silver Badge", display_order: 8, type: "badge", star_rating: 3 },
  { title: "Ruby", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/profile/monu94259", badge_image_url: null, description: "3 Star Bronze Badge", display_order: 9, type: "badge", star_rating: 3 },
  { title: "Python (Basic)", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/certificates/0254079a3ad5", badge_image_url: null, description: "Verified Skill Certificate", display_order: 10, type: "certificate" },
  { title: "Problem Solving (Basic)", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/certificates/5087c7b2eb80", badge_image_url: null, description: "Verified Skill Certificate", display_order: 11, type: "certificate" },
  { title: "C++ (Basic)", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/certificates/e35f03737c42", badge_image_url: null, description: "Verified Skill Certificate", display_order: 12, type: "certificate" },
  { title: "SQL (Basic)", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/certificates/e47df1b7beec", badge_image_url: null, description: "Verified Skill Certificate", display_order: 13, type: "certificate" },
  { title: "C (Basic)", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/certificates/8983168e31c2", badge_image_url: null, description: "Verified Skill Certificate", display_order: 14, type: "certificate" },
  { title: "C (Intermediate)", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/certificates/7d2e0df4bc11", badge_image_url: null, description: "Verified Skill Certificate", display_order: 15, type: "certificate" },
  { title: "JavaScript (Basic)", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/certificates/20a5a858d689", badge_image_url: null, description: "Verified Skill Certificate", display_order: 16, type: "certificate" },
  { title: "Java (Basic)", issuer: "HackerRank", issue_date: null, credential_url: "https://www.hackerrank.com/certificates/c28c882dd580", badge_image_url: null, description: "Verified Skill Certificate", display_order: 17, type: "certificate" },
  { title: "Machine Learning", issuer: "Certification", issue_date: null, credential_url: null, badge_image_url: null, description: "Machine Learning Certification", display_order: 18, type: "certificate" },
  { title: "Python Data Structures", issuer: "Certification", issue_date: null, credential_url: null, badge_image_url: null, description: "Python Data Structures Certification", display_order: 19, type: "certificate" },
];

export const servicesData: Omit<Service, "id">[] = [
  { title: "Backend Development", description: "Scalable microservices and REST APIs using Java, Spring Boot, and Node.js", icon_name: "Server", display_order: 1 },
  { title: "API Design & Integration", description: "RESTful API design, third-party integrations, and middleware development", icon_name: "Plug", display_order: 2 },
  { title: "Cloud & DevOps", description: "Docker, Kubernetes, CI/CD pipelines, and cloud deployment on Azure", icon_name: "Cloud", display_order: 3 },
  { title: "Database Architecture", description: "Schema design, optimization, and management for MySQL, PostgreSQL, MongoDB", icon_name: "Database", display_order: 4 },
  { title: "Event-Driven Architecture", description: "Kafka Streams, KSQL, event sourcing, and real-time data pipelines for high-throughput processing", icon_name: "Zap", display_order: 5 },
];

export const journeyData: Omit<JourneyEvent, "id">[] = [
  { title: "Started B.Tech in IT", description: "Began Bachelor of Technology in Information Technology at Shri Vaishnav Institute of Technology and Science, Indore", date: "2016-07-01", event_type: "education", icon_name: "GraduationCap", display_order: 1 },
  { title: "Internship at Thinking Machines", description: "Built a Centralized CMS Server and Home Automation system using Java, Spring Boot, and Android", date: "2020-01-01", event_type: "career", icon_name: "Briefcase", display_order: 2 },
  { title: "Graduated B.Tech", description: "Completed B.Tech in Information Technology with 7.71 CGPA", date: "2020-07-01", event_type: "education", icon_name: "Award", display_order: 3 },
  { title: "Joined Customised Technologies", description: "Built document management and quotation system for IoT product company", date: "2020-12-01", event_type: "career", icon_name: "Briefcase", display_order: 4 },
  { title: "Joined TCS", description: "Started as Assistant System Engineer working on ASOS Retail UK Project", date: "2021-02-01", event_type: "career", icon_name: "Briefcase", display_order: 5 },
  { title: "Joined Amdocs", description: "Software Developer on AT&T OPENET Charging (CGF), Metro-X environment management, and LESOG order-generation migration", date: "2021-12-01", event_type: "career", icon_name: "Rocket", display_order: 6 },
  { title: "AT&T OPENET Charging Project", description: "Started working on AT&T's online charging system, processing ~3M+ billing records via Kafka Streams", date: "2024-01-01", event_type: "career", icon_name: "Rocket", display_order: 7 },
  { title: "HackerRank Gold Badges", description: "Earned 5-star gold badges in Problem Solving, Java, Python, and C++", date: "2022-01-01", event_type: "achievement", icon_name: "Trophy", display_order: 8 },
];

export const socialLinksData: Omit<SocialLink, "id">[] = [
  { platform_name: "LinkedIn", url: "https://linkedin.com/in/vinayjain703", icon_name: "Linkedin", display_order: 1, is_visible: true },
  { platform_name: "GitHub", url: "https://github.com/vinayjain070717", icon_name: "Github", display_order: 2, is_visible: true },
  { platform_name: "HackerRank", url: "https://www.hackerrank.com/profile/monu94259", icon_name: "Code2", display_order: 3, is_visible: true },
  { platform_name: "Email", url: "mailto:vinayomjain@gmail.com", icon_name: "Mail", display_order: 4, is_visible: true },
];
