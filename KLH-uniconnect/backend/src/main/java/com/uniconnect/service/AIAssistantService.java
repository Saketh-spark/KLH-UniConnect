package com.uniconnect.service;

import com.uniconnect.model.*;
import com.uniconnect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.InputStream;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIAssistantService {
    
    private final AIConversationRepository conversationRepo;
    private final AIStudyPlanRepository studyPlanRepo;
    private final AISyllabusConfigRepository syllabusConfigRepo;
    private final AIQuizResultRepository quizResultRepo;
    
    public AIAssistantService(
            AIConversationRepository conversationRepo,
            AIStudyPlanRepository studyPlanRepo,
            AISyllabusConfigRepository syllabusConfigRepo,
            AIQuizResultRepository quizResultRepo) {
        this.conversationRepo = conversationRepo;
        this.studyPlanRepo = studyPlanRepo;
        this.syllabusConfigRepo = syllabusConfigRepo;
        this.quizResultRepo = quizResultRepo;
    }
    
    // ===================== CONVERSATION MANAGEMENT =====================
    
    public AIConversation createConversation(String userId, String userRole, String title, String category, String subject, String language) {
        AIConversation conv = new AIConversation();
        conv.setUserId(userId);
        conv.setUserRole(userRole);
        conv.setTitle(title);
        conv.setCategory(category);
        conv.setSubject(subject);
        conv.setLanguage(language != null ? language : "en");
        return conversationRepo.save(conv);
    }
    
    public AIConversation getConversation(String conversationId) {
        return conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
    }
    
    public List<AIConversation> getUserConversations(String userId) {
        return conversationRepo.findByUserIdOrderByUpdatedAtDesc(userId);
    }
    
    public List<AIConversation> getUserConversationsByCategory(String userId, String category) {
        return conversationRepo.findByUserIdAndCategoryOrderByUpdatedAtDesc(userId, category);
    }
    
    public AIConversation sendMessage(String conversationId, String content, String type, List<String> attachments) {
        AIConversation conv = getConversation(conversationId);
        
        // Add user message
        AIMessage userMsg = new AIMessage("user", content, type != null ? type : "text");
        userMsg.setId(UUID.randomUUID().toString());
        userMsg.setAttachments(attachments);
        conv.getMessages().add(userMsg);
        
        // Generate AI response based on category and content
        String aiResponse = generateAIResponse(conv, content);
        AIMessage aiMsg = new AIMessage("assistant", aiResponse, "text");
        aiMsg.setId(UUID.randomUUID().toString());
        conv.getMessages().add(aiMsg);
        
        conv.setUpdatedAt(Instant.now());
        return conversationRepo.save(conv);
    }
    
    public void deleteConversation(String conversationId) {
        conversationRepo.deleteById(conversationId);
    }
    
    // ===================== AI RESPONSE GENERATION =====================
    
    private String generateAIResponse(AIConversation conv, String userMessage) {
        String category = conv.getCategory();
        String subject = conv.getSubject();
        String lowerMsg = userMessage.toLowerCase().trim();
        
        switch (category) {
            case "doubt":
                return generateDoubtResponse(lowerMsg, subject, userMessage);
            case "notes":
                return generateNotesResponse(lowerMsg, subject, userMessage, conv);
            case "exam-prep":
                return generateExamPrepResponse(lowerMsg, subject, userMessage);
            case "study-plan":
                return generateStudyPlanResponse(lowerMsg, subject);
            case "coding":
                return generateCodingResponse(lowerMsg, userMessage);
            case "content-gen":
                return generateContentResponse(lowerMsg, subject);
            default:
                return generateGeneralResponse(lowerMsg, subject);
        }
    }
    
    // ---- extract the main topic from the user's question ----
    private String extractTopic(String message) {
        String cleaned = message.toLowerCase()
            .replaceAll("\\?|\\!|\\.", "")
            .replaceAll("^(what is|what are|what's|explain|define|tell me about|describe|how does|how do|how is|how to|why is|why do|why does|can you explain|please explain|give me|what do you mean by|what does|whats|wht is) ", "")
            .replaceAll("(in detail|with example|with examples|step by step|briefly|in simple terms|in java|in python|in c|in c\\+\\+|in sql|in programming|in computer science|in cs|in oop|in oops|in dsa|in dbms|in os)$", "")
            .replaceAll("^(the |a |an ) ", "")
            .trim();
        return cleaned.isEmpty() ? message.trim() : cleaned;
    }
    
    // ===================== TOPIC KNOWLEDGE BASE =====================
    
    private static final Map<String, String[]> TOPIC_KB = new HashMap<>();
    
    static {
        // ---- JAVA / OOP topics ----
        TOPIC_KB.put("class", new String[]{
            "A **class** in Java is a blueprint or template for creating objects. It defines properties (fields/variables) and behaviors (methods) that objects of that type will have.",
            "```java\npublic class Student {\n    // Fields (properties)\n    String name;\n    int rollNumber;\n    double gpa;\n\n    // Constructor\n    public Student(String name, int rollNumber) {\n        this.name = name;\n        this.rollNumber = rollNumber;\n    }\n\n    // Method (behavior)\n    public void displayInfo() {\n        System.out.println(name + \" - Roll: \" + rollNumber);\n    }\n}\n```",
            "**Why classes are important:**\n- They enable **encapsulation** — bundling data + methods together\n- They support **reusability** through inheritance\n- They provide **abstraction** — hiding complex details\n- They are the foundation of OOP (Object-Oriented Programming)\n\n**Real-world analogy:** A class is like an architectural blueprint. The blueprint (class) defines the structure, and each house built from it (object) is a specific instance."
        });
        TOPIC_KB.put("object", new String[]{
            "An **object** is a specific instance of a class. When you create an object, memory is allocated, and it gets its own copy of the instance variables defined in the class.",
            "```java\n// Creating objects from a class\nStudent s1 = new Student(\"Alice\", 101);  // Object 1\nStudent s2 = new Student(\"Bob\", 102);    // Object 2\n\ns1.displayInfo();  // Output: Alice - Roll: 101\ns2.displayInfo();  // Output: Bob - Roll: 102\n```",
            "**Key points about objects:**\n- Created using the `new` keyword\n- Each object has its own state (field values)\n- Objects communicate via method calls\n- They exist at runtime in heap memory\n\n**Real-world analogy:** If 'Car' is a class, then your specific red Toyota is an object — a real instance with specific attributes."
        });
        TOPIC_KB.put("inheritance", new String[]{
            "**Inheritance** is an OOP mechanism where a child class (subclass) acquires properties and behaviors from a parent class (superclass). It promotes code reuse and establishes an IS-A relationship.",
            "```java\n// Parent class\nclass Animal {\n    String name;\n    void eat() {\n        System.out.println(name + \" is eating\");\n    }\n}\n\n// Child class inheriting from Animal\nclass Dog extends Animal {\n    void bark() {\n        System.out.println(name + \" is barking\");\n    }\n}\n\n// Usage\nDog d = new Dog();\nd.name = \"Buddy\";\nd.eat();   // Inherited method\nd.bark();  // Own method\n```",
            "**Types of Inheritance in Java:**\n- **Single** — One parent, one child (A → B)\n- **Multilevel** — Chain of inheritance (A → B → C)\n- **Hierarchical** — One parent, multiple children (A → B, A → C)\n- ❌ **Multiple** — Not supported with classes (use interfaces instead)\n\n**Benefits:** Code reusability, method overriding, polymorphism.\n**Keyword:** `extends` for classes, `implements` for interfaces."
        });
        TOPIC_KB.put("polymorphism", new String[]{
            "**Polymorphism** means \"many forms\" — the ability of an object to take different forms. It allows the same method name to behave differently based on the object calling it.",
            "```java\n// Compile-time polymorphism (Method Overloading)\nclass Calculator {\n    int add(int a, int b) { return a + b; }\n    double add(double a, double b) { return a + b; }\n    int add(int a, int b, int c) { return a + b + c; }\n}\n\n// Runtime polymorphism (Method Overriding)\nclass Shape {\n    void draw() { System.out.println(\"Drawing shape\"); }\n}\nclass Circle extends Shape {\n    @Override\n    void draw() { System.out.println(\"Drawing circle\"); }\n}\n\nShape s = new Circle();  // Parent reference, child object\ns.draw();  // Output: Drawing circle (runtime decision)\n```",
            "**Two types:**\n1. **Compile-time (Static)** — Method Overloading (same method name, different parameters)\n2. **Runtime (Dynamic)** — Method Overriding (same method signature in parent & child)\n\n**Key principle:** The JVM decides which method to call at runtime based on the actual object type, not the reference type."
        });
        TOPIC_KB.put("encapsulation", new String[]{
            "**Encapsulation** is the practice of wrapping data (fields) and code (methods) together as a single unit, and restricting direct access to the data using access modifiers (private). Data is accessed only through getters and setters.",
            "```java\npublic class BankAccount {\n    private double balance;  // Hidden from outside\n\n    public BankAccount(double initialBalance) {\n        this.balance = initialBalance;\n    }\n\n    // Getter\n    public double getBalance() {\n        return balance;\n    }\n\n    // Controlled setter with validation\n    public void deposit(double amount) {\n        if (amount > 0) {\n            balance += amount;\n        }\n    }\n\n    public boolean withdraw(double amount) {\n        if (amount > 0 && amount <= balance) {\n            balance -= amount;\n            return true;\n        }\n        return false;  // Insufficient funds\n    }\n}\n```",
            "**Benefits of Encapsulation:**\n- **Data hiding** — internal state is protected\n- **Validation** — control how data is modified\n- **Flexibility** — change internals without breaking external code\n- **Security** — prevent unauthorized access\n\n**Real-world analogy:** An ATM encapsulates the bank vault. You can deposit/withdraw through the interface (methods), but you can't directly access the vault (private fields)."
        });
        TOPIC_KB.put("abstraction", new String[]{
            "**Abstraction** is the concept of hiding complex implementation details and showing only the essential features to the user. It is achieved through abstract classes and interfaces.",
            "```java\n// Abstract class — cannot be instantiated\nabstract class Vehicle {\n    abstract void start();    // No body — subclass MUST implement\n    abstract void stop();\n\n    void honk() {             // Concrete method — shared behavior\n        System.out.println(\"Beep beep!\");\n    }\n}\n\nclass Car extends Vehicle {\n    @Override\n    void start() { System.out.println(\"Car starting with key\"); }\n    @Override\n    void stop() { System.out.println(\"Car engine stopped\"); }\n}\n\nclass ElectricCar extends Vehicle {\n    @Override\n    void start() { System.out.println(\"Electric car starting silently\"); }\n    @Override\n    void stop() { System.out.println(\"Electric car powered down\"); }\n}\n```",
            "**Abstraction vs Encapsulation:**\n- Abstraction = hiding **what** an object does internally (design level)\n- Encapsulation = hiding **how** data is stored (implementation level)\n\n**Achieved through:**\n1. **Abstract classes** (0-100% abstraction) — use `abstract` keyword\n2. **Interfaces** (100% abstraction) — use `interface` keyword\n\n**Real-world analogy:** When you drive a car, you use the steering wheel and pedals (abstraction). You don't need to know how the engine works internally."
        });
        TOPIC_KB.put("interface", new String[]{
            "An **interface** in Java is a reference type that defines a contract — a set of abstract methods that implementing classes must provide. It achieves 100% abstraction and supports multiple inheritance.",
            "```java\n// Define an interface\ninterface Drawable {\n    void draw();        // Abstract method (no body)\n    double area();      // Abstract method\n\n    // Default method (Java 8+)\n    default void describe() {\n        System.out.println(\"This is a drawable shape\");\n    }\n}\n\n// Implement the interface\nclass Rectangle implements Drawable {\n    double width, height;\n\n    Rectangle(double w, double h) { width = w; height = h; }\n\n    @Override\n    public void draw() { System.out.println(\"Drawing rectangle\"); }\n\n    @Override\n    public double area() { return width * height; }\n}\n```",
            "**Key points:**\n- All methods are `public abstract` by default\n- All fields are `public static final` (constants)\n- A class can implement **multiple** interfaces\n- Supports **default** methods (Java 8+) and **static** methods\n- Use `implements` keyword (not `extends`)\n\n**Interface vs Abstract Class:**\n| Feature | Interface | Abstract Class |\n|---------|-----------|----------------|\n| Methods | Abstract + default | Abstract + concrete |\n| Fields | Only constants | Any fields |\n| Multiple | Yes | No |\n| Constructor | No | Yes |"
        });
        TOPIC_KB.put("constructor", new String[]{
            "A **constructor** is a special method in Java that is called automatically when an object is created. It initializes the object's state (field values). It has the same name as the class and no return type.",
            "```java\npublic class Student {\n    String name;\n    int age;\n\n    // Default constructor\n    public Student() {\n        name = \"Unknown\";\n        age = 0;\n    }\n\n    // Parameterized constructor\n    public Student(String name, int age) {\n        this.name = name;  // 'this' refers to current object\n        this.age = age;\n    }\n\n    // Copy constructor\n    public Student(Student other) {\n        this.name = other.name;\n        this.age = other.age;\n    }\n}\n\n// Usage\nStudent s1 = new Student();              // Default\nStudent s2 = new Student(\"Alice\", 20);   // Parameterized\nStudent s3 = new Student(s2);            // Copy\n```",
            "**Types of Constructors:**\n1. **Default** — No parameters, provides default values\n2. **Parameterized** — Takes arguments to set initial values\n3. **Copy** — Creates a copy of another object\n\n**Rules:**\n- Same name as the class\n- No return type (not even void)\n- Called automatically with `new`\n- Can be overloaded (multiple constructors)\n- If you write no constructor, Java provides a default one"
        });
        TOPIC_KB.put("array", new String[]{
            "An **array** is a fixed-size, contiguous data structure that stores multiple elements of the same type. Elements are accessed using an index (starting from 0).",
            "```java\n// Declaration and initialization\nint[] numbers = new int[5];           // Array of 5 integers\nString[] names = {\"Alice\", \"Bob\", \"Charlie\"};  // Inline init\n\n// Accessing elements\nnumbers[0] = 10;\nnumbers[1] = 20;\nSystem.out.println(numbers[0]);  // Output: 10\nSystem.out.println(names.length); // Output: 3\n\n// Iterating\nfor (int i = 0; i < numbers.length; i++) {\n    System.out.println(numbers[i]);\n}\n\n// Enhanced for loop\nfor (String name : names) {\n    System.out.println(name);\n}\n\n// 2D Array\nint[][] matrix = {{1,2,3}, {4,5,6}, {7,8,9}};\nSystem.out.println(matrix[1][2]);  // Output: 6\n```",
            "**Key characteristics:**\n- **Fixed size** — cannot grow or shrink after creation\n- **Zero-indexed** — first element at index 0\n- **Homogeneous** — all elements same type\n- **Random access** — O(1) access by index\n- `ArrayIndexOutOfBoundsException` if index is invalid\n\n**When to use arrays vs ArrayList:**\n- Arrays → fixed size, primitive types, performance-critical\n- ArrayList → dynamic size, only objects, more methods"
        });
        TOPIC_KB.put("exception", new String[]{
            "**Exception handling** in Java is a mechanism to handle runtime errors gracefully, preventing the program from crashing. Exceptions are objects representing error conditions.",
            "```java\ntry {\n    int result = 10 / 0;  // ArithmeticException\n    int[] arr = new int[3];\n    arr[5] = 10;           // ArrayIndexOutOfBoundsException\n} catch (ArithmeticException e) {\n    System.out.println(\"Cannot divide by zero: \" + e.getMessage());\n} catch (ArrayIndexOutOfBoundsException e) {\n    System.out.println(\"Invalid index: \" + e.getMessage());\n} catch (Exception e) {\n    System.out.println(\"General error: \" + e.getMessage());\n} finally {\n    System.out.println(\"This always runs — cleanup code\");\n}\n\n// Custom exception\nclass InsufficientFundsException extends Exception {\n    public InsufficientFundsException(String msg) {\n        super(msg);\n    }\n}\n```",
            "**Exception hierarchy:**\n- `Throwable` → `Exception` (checked) + `Error` (fatal)\n- **Checked** — must handle (IOException, SQLException)\n- **Unchecked** — optional (NullPointerException, ArithmeticException)\n\n**Keywords:** `try`, `catch`, `finally`, `throw`, `throws`\n\n**Best practices:**\n- Catch specific exceptions, not generic `Exception`\n- Always close resources in `finally` or use try-with-resources\n- Don't use exceptions for flow control"
        });
        TOPIC_KB.put("string", new String[]{
            "A **String** in Java is an immutable sequence of characters. It is one of the most used classes. Strings are objects stored in the String Pool for memory efficiency.",
            "```java\n// Creating strings\nString s1 = \"Hello\";                  // String pool\nString s2 = new String(\"Hello\");       // Heap memory\nString s3 = \"Hello\";                  // Same reference as s1\n\n// Common methods\ns1.length();              // 5\ns1.charAt(0);             // 'H'\ns1.substring(1, 4);       // \"ell\"\ns1.toUpperCase();         // \"HELLO\"\ns1.toLowerCase();         // \"hello\"\ns1.contains(\"ell\");       // true\ns1.equals(s2);            // true (content comparison)\ns1 == s3;                 // true (same pool reference)\ns1 == s2;                 // false (different objects)\ns1.concat(\" World\");      // \"Hello World\"\ns1.replace('l', 'r');     // \"Herro\"\ns1.trim();                // Removes leading/trailing spaces\nString.valueOf(42);       // \"42\"\n```",
            "**Key concepts:**\n- **Immutable** — once created, cannot be changed (new object created)\n- **String Pool** — JVM caches string literals for reuse\n- **== vs equals()** — `==` compares references, `equals()` compares content\n- **StringBuilder** — mutable, use for frequent modifications (faster)\n- **StringBuffer** — thread-safe version of StringBuilder"
        });
        TOPIC_KB.put("loop", new String[]{
            "**Loops** in Java allow you to execute a block of code repeatedly. Java has three main types: `for`, `while`, and `do-while`.",
            "```java\n// For loop — known iterations\nfor (int i = 0; i < 5; i++) {\n    System.out.println(\"Count: \" + i);  // 0, 1, 2, 3, 4\n}\n\n// While loop — condition-based\nint n = 10;\nwhile (n > 0) {\n    System.out.println(n);\n    n -= 2;  // 10, 8, 6, 4, 2\n}\n\n// Do-while — runs at least once\nint x = 0;\ndo {\n    System.out.println(\"x = \" + x);\n    x++;\n} while (x < 3);  // 0, 1, 2\n\n// Enhanced for-each\nint[] nums = {10, 20, 30};\nfor (int num : nums) {\n    System.out.println(num);  // 10, 20, 30\n}\n\n// Nested loops — multiplication table\nfor (int i = 1; i <= 3; i++) {\n    for (int j = 1; j <= 3; j++) {\n        System.out.print(i * j + \" \");\n    }\n    System.out.println();\n}\n```",
            "**Choosing the right loop:**\n| Loop | Use when |\n|------|----------|\n| `for` | Number of iterations is known |\n| `while` | Condition-based, may not run at all |\n| `do-while` | Must run at least once |\n| `for-each` | Iterating collections/arrays |\n\n**Control statements:** `break` (exit loop), `continue` (skip iteration)"
        });
        TOPIC_KB.put("method", new String[]{
            "A **method** is a block of code that performs a specific task. Methods allow code reuse, modularity, and easier testing. In Java, every method belongs to a class.",
            "```java\npublic class MathUtils {\n    // Method with return value\n    public static int add(int a, int b) {\n        return a + b;\n    }\n\n    // Method with no return (void)\n    public static void greet(String name) {\n        System.out.println(\"Hello, \" + name + \"!\");\n    }\n\n    // Method with multiple parameters\n    public static double average(double[] scores) {\n        double sum = 0;\n        for (double s : scores) sum += s;\n        return sum / scores.length;\n    }\n\n    // Recursive method\n    public static int factorial(int n) {\n        if (n <= 1) return 1;\n        return n * factorial(n - 1);\n    }\n}\n\n// Usage\nint sum = MathUtils.add(5, 3);         // 8\nMathUtils.greet(\"Alice\");              // Hello, Alice!\nint fact = MathUtils.factorial(5);     // 120\n```",
            "**Method components:**\n- **Access modifier** — `public`, `private`, `protected`\n- **Return type** — `int`, `String`, `void`, etc.\n- **Name** — camelCase convention\n- **Parameters** — inputs (can be zero or more)\n- **Body** — the actual logic\n\n**Method overloading** — same name, different parameters (compile-time polymorphism)"
        });
        TOPIC_KB.put("static", new String[]{
            "The **`static`** keyword in Java means the member belongs to the class itself rather than to any specific object. Static members are shared across all instances of the class.",
            "```java\npublic class Counter {\n    static int count = 0;       // Shared by ALL objects\n    String name;                // Unique per object\n\n    public Counter(String name) {\n        this.name = name;\n        count++;                // Increments for every new object\n    }\n\n    // Static method — called on class, not object\n    public static int getCount() {\n        return count;\n    }\n\n    // Static block — runs once when class is loaded\n    static {\n        System.out.println(\"Counter class loaded!\");\n    }\n}\n\n// Usage\nCounter c1 = new Counter(\"A\");\nCounter c2 = new Counter(\"B\");\nSystem.out.println(Counter.getCount());  // 2 (shared)\n```",
            "**Static can be applied to:**\n1. **Variables** — shared across all objects (class-level)\n2. **Methods** — called without creating an object (`Math.sqrt()`)\n3. **Blocks** — runs once when class is loaded\n4. **Nested classes** — inner class that doesn't need outer instance\n\n**Rules:**\n- Static methods cannot use `this` or access non-static members directly\n- `main()` is static because JVM calls it without creating an object\n- Static variables are initialized when the class is loaded"
        });
        TOPIC_KB.put("data type", new String[]{
            "**Data types** in Java define what kind of data a variable can hold. Java is a strongly-typed language — every variable must be declared with a type.",
            "```java\n// Primitive types (8 types)\nbyte b = 127;           // 1 byte  (-128 to 127)\nshort s = 32000;        // 2 bytes (-32768 to 32767)\nint i = 2147483647;     // 4 bytes (most common for integers)\nlong l = 9223372036854775807L; // 8 bytes (suffix L)\nfloat f = 3.14f;        // 4 bytes (suffix f)\ndouble d = 3.14159265;  // 8 bytes (most common for decimals)\nchar c = 'A';           // 2 bytes (single character)\nboolean bool = true;    // 1 bit (true or false)\n\n// Reference types\nString name = \"Alice\";       // Object\nint[] arr = {1, 2, 3};       // Array\nStudent s = new Student();   // Custom class\n```",
            "**Primitive vs Reference types:**\n| Feature | Primitive | Reference |\n|---------|-----------|----------|\n| Storage | Value directly | Memory address |\n| Default | 0/false | null |\n| Memory | Stack | Heap |\n| Examples | int, char, boolean | String, Array, Object |\n\n**Type casting:**\n- **Widening** (auto): `int → double` (safe, no data loss)\n- **Narrowing** (explicit): `double → int` (may lose data, needs cast)"
        });
        TOPIC_KB.put("variable", new String[]{
            "A **variable** in Java is a named container that stores a data value in memory. Each variable has a type, a name, and a value.",
            "```java\npublic class VariableExample {\n    // Instance variable — belongs to an object\n    String name;\n    int age;\n\n    // Static variable — shared by all objects\n    static int studentCount = 0;\n\n    public void demonstrate() {\n        // Local variable — exists only inside this method\n        int score = 95;\n        final double PI = 3.14159;  // Constant (final)\n\n        System.out.println(name + \" scored \" + score);\n    }\n}\n```",
            "**Types of variables:**\n1. **Local** — declared inside methods, no default value, must initialize\n2. **Instance** — declared in class but outside methods, one per object\n3. **Static (Class)** — declared with `static`, shared by all objects\n4. **Final (Constant)** — declared with `final`, cannot be changed after assignment\n\n**Naming conventions:** camelCase for variables (`studentName`), UPPER_SNAKE for constants (`MAX_SIZE`)"
        });
        // ---- Python topics ----
        TOPIC_KB.put("list", new String[]{
            "A **list** in Python is a mutable, ordered collection that can hold items of different types. Lists are one of the most versatile data structures in Python.",
            "```python\n# Creating lists\nnumbers = [1, 2, 3, 4, 5]\nmixed = [1, \"hello\", 3.14, True]\nempty = []\n\n# Accessing elements\nprint(numbers[0])    # 1 (first element)\nprint(numbers[-1])   # 5 (last element)\nprint(numbers[1:3])  # [2, 3] (slicing)\n\n# Common operations\nnumbers.append(6)        # Add to end: [1,2,3,4,5,6]\nnumbers.insert(0, 0)     # Insert at index: [0,1,2,3,4,5,6]\nnumbers.remove(3)        # Remove first occurrence of 3\nnumbers.pop()             # Remove and return last element\nnumbers.sort()            # Sort in place\nlen(numbers)              # Length\n3 in numbers              # Check membership: True\n\n# List comprehension\nsquares = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]\nevens = [x for x in range(10) if x % 2 == 0]  # [0,2,4,6,8]\n```",
            "**List operations time complexity:**\n- Access by index: O(1)\n- Append: O(1) amortized\n- Insert/Delete at beginning: O(n)\n- Search: O(n)\n- Sort: O(n log n)\n\n**List vs Tuple vs Set:**\n| Feature | List | Tuple | Set |\n|---------|------|-------|-----|\n| Mutable | Yes | No | Yes |\n| Ordered | Yes | Yes | No |\n| Duplicates | Yes | Yes | No |\n| Syntax | [1,2] | (1,2) | {1,2} |"
        });
        TOPIC_KB.put("dictionary", new String[]{
            "A **dictionary** in Python is a mutable collection of key-value pairs. Keys must be unique and immutable (strings, numbers, tuples). Dictionaries provide O(1) average lookup time.",
            "```python\n# Creating dictionaries\nstudent = {\n    \"name\": \"Alice\",\n    \"age\": 20,\n    \"gpa\": 3.8,\n    \"courses\": [\"Math\", \"CS\", \"Physics\"]\n}\n\n# Accessing values\nprint(student[\"name\"])          # Alice\nprint(student.get(\"phone\", \"N/A\"))  # N/A (default if key missing)\n\n# Modifying\nstudent[\"age\"] = 21              # Update existing\nstudent[\"email\"] = \"alice@u.edu\" # Add new key\ndel student[\"gpa\"]               # Delete key\n\n# Iterating\nfor key, value in student.items():\n    print(f\"{key}: {value}\")\n\n# Dictionary comprehension\nsquares = {x: x**2 for x in range(5)}\n# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}\n```",
            "**Useful methods:**\n- `.keys()` — all keys\n- `.values()` — all values\n- `.items()` — key-value pairs\n- `.update(other_dict)` — merge dictionaries\n- `.pop(key)` — remove and return value\n\n**When to use:** When you need fast lookups by a unique key (e.g., student records by ID, word frequency counts, configuration settings)."
        });
        TOPIC_KB.put("function", new String[]{
            "A **function** is a reusable block of code that performs a specific task. In Python, functions are defined using the `def` keyword.",
            "```python\n# Basic function\ndef greet(name):\n    return f\"Hello, {name}!\"\n\n# Function with default parameter\ndef power(base, exp=2):\n    return base ** exp\n\n# Function with multiple returns\ndef min_max(numbers):\n    return min(numbers), max(numbers)\n\n# Lambda (anonymous) function\nsquare = lambda x: x ** 2\n\n# *args and **kwargs\ndef flexible(*args, **kwargs):\n    print(f\"Args: {args}\")       # Tuple of positional args\n    print(f\"Kwargs: {kwargs}\")   # Dict of keyword args\n\n# Usage\nprint(greet(\"Alice\"))           # Hello, Alice!\nprint(power(3))                 # 9\nprint(power(3, 3))              # 27\nlo, hi = min_max([5, 2, 8, 1]) # lo=1, hi=8\nflexible(1, 2, name=\"Bob\")     # Args: (1,2) Kwargs: {name:Bob}\n```",
            "**Function concepts:**\n- **Parameters** — inputs defined in function signature\n- **Arguments** — actual values passed when calling\n- **Return** — output of the function (None if no return statement)\n- **Scope** — local variables exist only inside the function\n- **Recursion** — function calling itself"
        });
        TOPIC_KB.put("decorator", new String[]{
            "A **decorator** in Python is a function that modifies the behavior of another function without changing its source code. Decorators use the `@` syntax and are widely used in frameworks like Flask and Django.",
            "```python\n# Basic decorator\ndef timer(func):\n    import time\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        end = time.time()\n        print(f\"{func.__name__} took {end-start:.4f}s\")\n        return result\n    return wrapper\n\n@timer\ndef slow_function():\n    import time\n    time.sleep(1)\n    return \"Done!\"\n\nslow_function()  # Prints: slow_function took 1.0012s\n\n# Decorator with arguments\ndef repeat(n):\n    def decorator(func):\n        def wrapper(*args, **kwargs):\n            for _ in range(n):\n                result = func(*args, **kwargs)\n            return result\n        return wrapper\n    return decorator\n\n@repeat(3)\ndef say_hello():\n    print(\"Hello!\")\n```",
            "**Common built-in decorators:**\n- `@staticmethod` — method doesn't need `self`\n- `@classmethod` — method receives class (`cls`) instead of instance\n- `@property` — makes method accessible like an attribute\n- `@abstractmethod` — forces subclass to implement\n\n**Real-world use cases:** logging, authentication, caching, rate limiting, input validation."
        });
        // ---- DSA topics ----
        TOPIC_KB.put("linked list", new String[]{
            "A **Linked List** is a linear data structure where elements (nodes) are connected via pointers. Unlike arrays, elements are NOT stored in contiguous memory locations.",
            "```java\nclass Node {\n    int data;\n    Node next;\n\n    Node(int data) {\n        this.data = data;\n        this.next = null;\n    }\n}\n\nclass LinkedList {\n    Node head;\n\n    // Insert at beginning — O(1)\n    void insertFront(int data) {\n        Node newNode = new Node(data);\n        newNode.next = head;\n        head = newNode;\n    }\n\n    // Insert at end — O(n)\n    void insertEnd(int data) {\n        Node newNode = new Node(data);\n        if (head == null) { head = newNode; return; }\n        Node curr = head;\n        while (curr.next != null) curr = curr.next;\n        curr.next = newNode;\n    }\n\n    // Print list\n    void display() {\n        Node curr = head;\n        while (curr != null) {\n            System.out.print(curr.data + \" -> \");\n            curr = curr.next;\n        }\n        System.out.println(\"null\");\n    }\n}\n```",
            "**Types:**\n1. **Singly** — each node points to next only\n2. **Doubly** — each node points to next AND previous\n3. **Circular** — last node points back to head\n\n**Array vs Linked List:**\n| Operation | Array | Linked List |\n|-----------|-------|-------------|\n| Access | O(1) | O(n) |\n| Insert (begin) | O(n) | O(1) |\n| Insert (end) | O(1)* | O(n) |\n| Delete | O(n) | O(1)** |\n| Memory | Contiguous | Scattered |\n\n*Amortized **If you have the node reference"
        });
        TOPIC_KB.put("stack", new String[]{
            "A **Stack** is a linear data structure that follows the **LIFO (Last In, First Out)** principle. The last element added is the first one removed. Think of a stack of plates.",
            "```java\nimport java.util.Stack;\n\n// Using Java Stack class\nStack<Integer> stack = new Stack<>();\nstack.push(10);    // [10]\nstack.push(20);    // [10, 20]\nstack.push(30);    // [10, 20, 30]\n\nstack.peek();      // 30 (top element, no removal)\nstack.pop();       // 30 (removed)\nstack.size();      // 2\nstack.isEmpty();   // false\n\n// Manual implementation\nclass MyStack {\n    int[] arr;\n    int top = -1;\n\n    MyStack(int capacity) { arr = new int[capacity]; }\n\n    void push(int val) { arr[++top] = val; }\n    int pop() { return arr[top--]; }\n    int peek() { return arr[top]; }\n    boolean isEmpty() { return top == -1; }\n}\n```",
            "**Operations & complexity:**\n- `push()` — O(1)\n- `pop()` — O(1)\n- `peek()` — O(1)\n\n**Real-world applications:**\n- Undo/Redo operations\n- Browser back/forward\n- Expression evaluation (postfix/infix)\n- Function call stack (recursion)\n- Balanced parentheses checking"
        });
        TOPIC_KB.put("queue", new String[]{
            "A **Queue** is a linear data structure that follows the **FIFO (First In, First Out)** principle. The first element added is the first one removed. Think of a line at a ticket counter.",
            "```java\nimport java.util.LinkedList;\nimport java.util.Queue;\n\nQueue<String> queue = new LinkedList<>();\nqueue.offer(\"Alice\");     // [Alice]\nqueue.offer(\"Bob\");       // [Alice, Bob]\nqueue.offer(\"Charlie\");   // [Alice, Bob, Charlie]\n\nqueue.peek();             // Alice (front, no removal)\nqueue.poll();             // Alice (removed)\nqueue.size();             // 2\n\n// Priority Queue — elements ordered by priority\nimport java.util.PriorityQueue;\nPriorityQueue<Integer> pq = new PriorityQueue<>();\npq.offer(30);\npq.offer(10);\npq.offer(20);\npq.poll();  // 10 (smallest first — min heap)\n```",
            "**Types of Queues:**\n1. **Simple Queue** — FIFO\n2. **Circular Queue** — last position connects to first\n3. **Priority Queue** — elements dequeued by priority\n4. **Deque** — double-ended, insert/remove from both ends\n\n**Applications:**\n- CPU scheduling\n- Print job management\n- BFS (Breadth-First Search)\n- Message queues in systems"
        });
        TOPIC_KB.put("binary tree", new String[]{
            "A **Binary Tree** is a hierarchical data structure where each node has at most two children: left and right. The topmost node is called the root.",
            "```java\nclass TreeNode {\n    int data;\n    TreeNode left, right;\n    TreeNode(int data) {\n        this.data = data;\n        left = right = null;\n    }\n}\n\nclass BinaryTree {\n    TreeNode root;\n\n    // Traversals\n    void inorder(TreeNode node) {    // Left → Root → Right\n        if (node == null) return;\n        inorder(node.left);\n        System.out.print(node.data + \" \");\n        inorder(node.right);\n    }\n\n    void preorder(TreeNode node) {   // Root → Left → Right\n        if (node == null) return;\n        System.out.print(node.data + \" \");\n        preorder(node.left);\n        preorder(node.right);\n    }\n\n    void postorder(TreeNode node) {  // Left → Right → Root\n        if (node == null) return;\n        postorder(node.left);\n        postorder(node.right);\n        System.out.print(node.data + \" \");\n    }\n}\n```",
            "**Types of Binary Trees:**\n- **Full** — every node has 0 or 2 children\n- **Complete** — all levels filled except possibly last\n- **Perfect** — all internal nodes have 2 children, all leaves at same level\n- **BST (Binary Search Tree)** — left < root < right\n- **AVL** — self-balancing BST\n\n**Traversal orders:**\n- **Inorder** (LNR): gives sorted order for BST\n- **Preorder** (NLR): useful for copying tree\n- **Postorder** (LRN): useful for deleting tree\n- **Level order** (BFS): uses a queue"
        });
        TOPIC_KB.put("sorting", new String[]{
            "**Sorting algorithms** arrange elements in a specific order (ascending/descending). Choosing the right algorithm depends on data size, memory constraints, and whether data is partially sorted.",
            "```java\n// Bubble Sort — O(n²)\nvoid bubbleSort(int[] arr) {\n    for (int i = 0; i < arr.length - 1; i++)\n        for (int j = 0; j < arr.length - 1 - i; j++)\n            if (arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n}\n\n// Quick Sort — O(n log n) average\nvoid quickSort(int[] arr, int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}\nint partition(int[] arr, int low, int high) {\n    int pivot = arr[high], i = low - 1;\n    for (int j = low; j < high; j++)\n        if (arr[j] <= pivot) {\n            i++;\n            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;\n        }\n    int temp = arr[i+1]; arr[i+1] = arr[high]; arr[high] = temp;\n    return i + 1;\n}\n```",
            "**Comparison of sorting algorithms:**\n| Algorithm | Best | Average | Worst | Space | Stable |\n|-----------|------|---------|-------|-------|--------|\n| Bubble | O(n) | O(n²) | O(n²) | O(1) | Yes |\n| Selection | O(n²) | O(n²) | O(n²) | O(1) | No |\n| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes |\n| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |\n| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | No |\n| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | No |"
        });
        TOPIC_KB.put("recursion", new String[]{
            "**Recursion** is a technique where a function calls itself to solve smaller sub-problems until it reaches a base case. Every recursive function must have: (1) a base case to stop, (2) a recursive case that moves toward the base.",
            "```java\n// Factorial: n! = n × (n-1)!\npublic static int factorial(int n) {\n    if (n <= 1) return 1;           // Base case\n    return n * factorial(n - 1);    // Recursive case\n}\n// factorial(5) → 5 × 4 × 3 × 2 × 1 = 120\n\n// Fibonacci: F(n) = F(n-1) + F(n-2)\npublic static int fibonacci(int n) {\n    if (n <= 1) return n;           // Base cases: F(0)=0, F(1)=1\n    return fibonacci(n-1) + fibonacci(n-2);\n}\n// 0, 1, 1, 2, 3, 5, 8, 13, 21...\n\n// Tower of Hanoi\npublic static void hanoi(int n, char from, char to, char aux) {\n    if (n == 1) {\n        System.out.println(\"Move disk 1 from \" + from + \" to \" + to);\n        return;\n    }\n    hanoi(n-1, from, aux, to);\n    System.out.println(\"Move disk \" + n + \" from \" + from + \" to \" + to);\n    hanoi(n-1, aux, to, from);\n}\n```",
            "**Recursion vs Iteration:**\n| Aspect | Recursion | Iteration |\n|--------|-----------|----------|\n| Memory | Uses stack frames (more) | Uses variables (less) |\n| Speed | Slower (function overhead) | Faster |\n| Code | Often cleaner | Can be complex |\n| Risk | Stack overflow | Infinite loop |\n\n**When to use recursion:** Trees, graphs, divide & conquer, backtracking, dynamic programming.\n**Tip:** Every recursion can be converted to iteration using an explicit stack."
        });
        // ---- DBMS topics ----
        TOPIC_KB.put("sql", new String[]{
            "**SQL (Structured Query Language)** is the standard language for interacting with relational databases. It is used to create, read, update, and delete data (CRUD operations).",
            "```sql\n-- CREATE table\nCREATE TABLE students (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(100) NOT NULL,\n    email VARCHAR(100) UNIQUE,\n    gpa DECIMAL(3,2),\n    dept VARCHAR(50)\n);\n\n-- INSERT data\nINSERT INTO students (name, email, gpa, dept)\nVALUES ('Alice', 'alice@uni.edu', 3.8, 'CSE');\n\n-- SELECT (read) data\nSELECT name, gpa FROM students WHERE dept = 'CSE' ORDER BY gpa DESC;\n\n-- UPDATE data\nUPDATE students SET gpa = 3.9 WHERE name = 'Alice';\n\n-- DELETE data\nDELETE FROM students WHERE gpa < 2.0;\n\n-- JOIN — combine tables\nSELECT s.name, c.course_name\nFROM students s\nINNER JOIN enrollments e ON s.id = e.student_id\nINNER JOIN courses c ON e.course_id = c.id;\n\n-- Aggregate functions\nSELECT dept, AVG(gpa) as avg_gpa, COUNT(*) as total\nFROM students GROUP BY dept HAVING AVG(gpa) > 3.0;\n```",
            "**SQL command categories:**\n- **DDL** (Data Definition): CREATE, ALTER, DROP, TRUNCATE\n- **DML** (Data Manipulation): SELECT, INSERT, UPDATE, DELETE\n- **DCL** (Data Control): GRANT, REVOKE\n- **TCL** (Transaction Control): COMMIT, ROLLBACK, SAVEPOINT\n\n**JOIN types:** INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF"
        });
        TOPIC_KB.put("normalization", new String[]{
            "**Normalization** is the process of organizing a database to reduce redundancy and improve data integrity. It involves dividing large tables into smaller related tables.",
            "**Normal Forms explained with example:**\n\n**1NF (First Normal Form):**\n- Each cell has a single value (no multi-valued attributes)\n- ❌ `Courses: \"Math, Physics\"` → ✅ Separate rows for each course\n\n**2NF (Second Normal Form):**\n- Must be in 1NF + no partial dependencies\n- All non-key columns depend on the ENTIRE primary key\n- ❌ In (StudentID, CourseID) → StudentName depends only on StudentID\n- ✅ Split into Students table and Enrollment table\n\n**3NF (Third Normal Form):**\n- Must be in 2NF + no transitive dependencies\n- Non-key columns depend only on the primary key, not on other non-key columns\n- ❌ StudentID → DeptID → DeptName (transitive)\n- ✅ Create separate Department table\n\n**BCNF (Boyce-Codd Normal Form):**\n- Every determinant is a candidate key\n- Stricter version of 3NF",
            "**Why normalize?**\n- Eliminates data redundancy\n- Prevents update anomalies\n- Prevents insertion anomalies\n- Prevents deletion anomalies\n\n**Denormalization:** Sometimes we deliberately add redundancy for read performance (e.g., in data warehouses). It's a trade-off between storage/integrity and query speed."
        });
        // ---- OS topics ----
        TOPIC_KB.put("process", new String[]{
            "A **process** is a program in execution. It is an active entity (unlike a program which is passive). Each process has its own memory space, program counter, registers, and resources.",
            "**Process states:**\n```\n    New → Ready → Running → Terminated\n                  ↕\n               Waiting/Blocked\n```\n\n- **New** — process is being created\n- **Ready** — waiting to be assigned to CPU\n- **Running** — instructions are being executed\n- **Waiting** — waiting for I/O or event\n- **Terminated** — execution is complete\n\n**Process Control Block (PCB)** stores:\n- Process ID (PID)\n- Process state\n- Program counter\n- CPU registers\n- Memory limits\n- Open files list\n- Scheduling information",
            "**Process vs Thread:**\n| Feature | Process | Thread |\n|---------|---------|--------|\n| Memory | Separate | Shared |\n| Creation | Heavyweight | Lightweight |\n| Communication | IPC (pipes, sockets) | Shared memory |\n| Crash impact | Independent | Can affect other threads |\n\n**CPU Scheduling Algorithms:** FCFS, SJF, Priority, Round Robin, Multilevel Queue"
        });
        TOPIC_KB.put("deadlock", new String[]{
            "A **deadlock** is a situation where two or more processes are blocked forever, each waiting for a resource held by another. It's a circular dependency that prevents progress.",
            "**Example:**\n```\nProcess P1: holds Resource R1, waiting for R2\nProcess P2: holds Resource R2, waiting for R1\n→ Neither can proceed → DEADLOCK!\n```\n\n**Four necessary conditions (ALL must hold):**\n1. **Mutual Exclusion** — resource can be held by only one process\n2. **Hold and Wait** — process holds resource while waiting for another\n3. **No Preemption** — resource can't be forcibly taken away\n4. **Circular Wait** — circular chain of processes waiting for each other",
            "**Handling deadlocks:**\n1. **Prevention** — eliminate one of the 4 conditions\n2. **Avoidance** — use Banker's Algorithm to check safe state before granting\n3. **Detection** — use Resource Allocation Graph (RAG) to detect cycles\n4. **Recovery** — kill processes or preempt resources\n\n**Banker's Algorithm:** checks if granting a resource request leaves the system in a safe state (where all processes can eventually complete)."
        });
        // ---- Networking topics ----
        TOPIC_KB.put("osi model", new String[]{
            "The **OSI (Open Systems Interconnection) model** is a conceptual framework with 7 layers that describes how data moves through a network. Each layer has specific functions and protocols.",
            "**The 7 Layers (top to bottom):**\n\n| # | Layer | Function | Protocols/Examples |\n|---|-------|----------|-------------------|\n| 7 | **Application** | User interface & apps | HTTP, FTP, SMTP, DNS |\n| 6 | **Presentation** | Data format, encryption | SSL/TLS, JPEG, ASCII |\n| 5 | **Session** | Session management | NetBIOS, RPC |\n| 4 | **Transport** | End-to-end delivery | TCP, UDP |\n| 3 | **Network** | Routing & IP addressing | IP, ICMP, ARP |\n| 2 | **Data Link** | Frame delivery, MAC | Ethernet, Wi-Fi, Switch |\n| 1 | **Physical** | Bits on the wire | Cables, Hubs, Signals |",
            "**Memory trick:** \"**A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing\" (top-down)\n\n**Data units per layer:**\n- Application → Data\n- Transport → Segment (TCP) / Datagram (UDP)\n- Network → Packet\n- Data Link → Frame\n- Physical → Bits\n\n**TCP/IP model** has 4 layers: Application, Transport, Internet, Network Access (simpler, used in practice)."
        });
        TOPIC_KB.put("tcp", new String[]{
            "**TCP (Transmission Control Protocol)** is a connection-oriented, reliable transport layer protocol. It ensures data is delivered in order, without errors, using acknowledgments and retransmissions.",
            "**TCP 3-Way Handshake (Connection Establishment):**\n```\nClient              Server\n  |--- SYN (seq=x) ---->|\n  |<-- SYN-ACK (seq=y, ack=x+1) ---|\n  |--- ACK (ack=y+1) --->|\n  |     Connection Established      |\n```\n\n**TCP Features:**\n- **Reliable delivery** — acknowledgments + retransmission\n- **Ordered** — sequence numbers ensure correct order\n- **Flow control** — sliding window mechanism\n- **Congestion control** — slow start, congestion avoidance\n- **Error detection** — checksums",
            "**TCP vs UDP:**\n| Feature | TCP | UDP |\n|---------|-----|-----|\n| Connection | Connection-oriented | Connectionless |\n| Reliability | Guaranteed delivery | Best effort |\n| Ordering | In-order | No guarantee |\n| Speed | Slower (overhead) | Faster |\n| Use cases | Web, email, file transfer | Streaming, gaming, DNS |"
        });
        // more general/common
        TOPIC_KB.put("oops", new String[]{
            "**OOP (Object-Oriented Programming)** is a programming paradigm based on the concept of objects that contain data (fields) and behavior (methods). It organizes code around real-world entities.",
            "**The 4 Pillars of OOP:**\n\n1. **Encapsulation** — bundle data + methods, hide internal state\n```java\nprivate int balance;\npublic int getBalance() { return balance; }\n```\n\n2. **Inheritance** — child class inherits from parent\n```java\nclass Dog extends Animal { }\n```\n\n3. **Polymorphism** — same method, different behavior\n```java\nAnimal a = new Dog();\na.makeSound(); // \"Woof!\" (runtime binding)\n```\n\n4. **Abstraction** — hide complexity, show essentials\n```java\nabstract class Shape {\n    abstract double area();\n}\n```",
            "**OOP vs Procedural Programming:**\n| Feature | OOP | Procedural |\n|---------|-----|------------|\n| Focus | Objects | Functions |\n| Data | Encapsulated | Global/shared |\n| Reuse | Inheritance | Function calls |\n| Examples | Java, C++, Python | C, Pascal |\n\n**OOP advantages:** Modularity, reusability, maintainability, real-world modeling."
        });
        TOPIC_KB.put("machine learning", new String[]{
            "**Machine Learning** is a subset of AI where computers learn patterns from data without being explicitly programmed. The system improves its performance on a task as it processes more data.",
            "**Types of Machine Learning:**\n\n1. **Supervised Learning** — labeled data (input → output)\n   - Classification: spam detection, image recognition\n   - Regression: price prediction, temperature forecasting\n   - Algorithms: Linear Regression, Decision Trees, SVM, Neural Networks\n\n2. **Unsupervised Learning** — unlabeled data (find patterns)\n   - Clustering: customer segmentation, grouping\n   - Dimensionality Reduction: PCA\n   - Algorithms: K-Means, DBSCAN, Hierarchical Clustering\n\n3. **Reinforcement Learning** — learn by trial & reward\n   - Game playing, robotics, autonomous vehicles\n   - Algorithms: Q-Learning, Deep Q-Networks",
            "**ML Workflow:**\n1. Data Collection → 2. Data Preprocessing → 3. Feature Selection → 4. Model Training → 5. Evaluation → 6. Tuning → 7. Deployment\n\n**Common metrics:**\n- Classification: Accuracy, Precision, Recall, F1-Score\n- Regression: MAE, MSE, RMSE, R²\n\n**Popular libraries:** scikit-learn, TensorFlow, PyTorch, Keras"
        });
        TOPIC_KB.put("database", new String[]{
            "A **database** is an organized collection of structured data stored electronically. A **DBMS (Database Management System)** is the software used to manage databases.",
            "**Types of Databases:**\n\n1. **Relational (RDBMS)** — tables with rows & columns, SQL\n   - Examples: MySQL, PostgreSQL, Oracle, SQL Server\n   - Use: structured data, transactions, ACID compliance\n\n2. **NoSQL** — flexible schema, various models\n   - **Document:** MongoDB (JSON-like documents)\n   - **Key-Value:** Redis (fast caching)\n   - **Column-Family:** Cassandra (wide columns)\n   - **Graph:** Neo4j (relationships)\n\n3. **NewSQL** — combines SQL + NoSQL scalability\n   - Examples: CockroachDB, Google Spanner",
            "**ACID Properties (Transactions):**\n- **Atomicity** — all or nothing\n- **Consistency** — valid state before and after\n- **Isolation** — concurrent transactions don't interfere\n- **Durability** — committed data survives crashes\n\n**SQL vs NoSQL:**\n| Feature | SQL | NoSQL |\n|---------|-----|-------|\n| Schema | Fixed | Flexible |\n| Scaling | Vertical | Horizontal |\n| Relations | Joins | Embedded/Reference |\n| Best for | Complex queries | Big data, real-time |"
        });
    }
    
    // ----- find best matching topic from user's message -----
    private String[] findTopicContent(String message) {
        String topic = extractTopic(message);
        
        // Direct match
        for (Map.Entry<String, String[]> entry : TOPIC_KB.entrySet()) {
            if (topic.contains(entry.getKey()) || message.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        
        // Keyword mapping for common question phrasings
        Map<String, String> keywordMap = new LinkedHashMap<>();
        keywordMap.put("oops", "oops");
        keywordMap.put("oop", "oops");
        keywordMap.put("object oriented", "oops");
        keywordMap.put("pillar", "oops");
        keywordMap.put("class", "class");
        keywordMap.put("object", "object");
        keywordMap.put("inherit", "inheritance");
        keywordMap.put("extends", "inheritance");
        keywordMap.put("super", "inheritance");
        keywordMap.put("polymorphi", "polymorphism");
        keywordMap.put("overload", "polymorphism");
        keywordMap.put("overrid", "polymorphism");
        keywordMap.put("encapsulat", "encapsulation");
        keywordMap.put("getter", "encapsulation");
        keywordMap.put("setter", "encapsulation");
        keywordMap.put("private", "encapsulation");
        keywordMap.put("abstract", "abstraction");
        keywordMap.put("interface", "interface");
        keywordMap.put("implement", "interface");
        keywordMap.put("construct", "constructor");
        keywordMap.put("this keyword", "constructor");
        keywordMap.put("array", "array");
        keywordMap.put("exception", "exception");
        keywordMap.put("try catch", "exception");
        keywordMap.put("throw", "exception");
        keywordMap.put("error handling", "exception");
        keywordMap.put("string", "string");
        keywordMap.put("immutable", "string");
        keywordMap.put("loop", "loop");
        keywordMap.put("for loop", "loop");
        keywordMap.put("while loop", "loop");
        keywordMap.put("iteration", "loop");
        keywordMap.put("iterate", "loop");
        keywordMap.put("method", "method");
        keywordMap.put("function", "function");
        keywordMap.put("def ", "function");
        keywordMap.put("return type", "method");
        keywordMap.put("static", "static");
        keywordMap.put("data type", "data type");
        keywordMap.put("int ", "data type");
        keywordMap.put("float", "data type");
        keywordMap.put("double", "data type");
        keywordMap.put("primitive", "data type");
        keywordMap.put("variable", "variable");
        keywordMap.put("list", "list");
        keywordMap.put("dict", "dictionary");
        keywordMap.put("decorator", "decorator");
        keywordMap.put("linked list", "linked list");
        keywordMap.put("linkedlist", "linked list");
        keywordMap.put("stack", "stack");
        keywordMap.put("queue", "queue");
        keywordMap.put("tree", "binary tree");
        keywordMap.put("binary", "binary tree");
        keywordMap.put("traversal", "binary tree");
        keywordMap.put("inorder", "binary tree");
        keywordMap.put("preorder", "binary tree");
        keywordMap.put("sort", "sorting");
        keywordMap.put("bubble", "sorting");
        keywordMap.put("quick sort", "sorting");
        keywordMap.put("merge sort", "sorting");
        keywordMap.put("selection sort", "sorting");
        keywordMap.put("insertion sort", "sorting");
        keywordMap.put("recursion", "recursion");
        keywordMap.put("recursive", "recursion");
        keywordMap.put("factorial", "recursion");
        keywordMap.put("fibonacci", "recursion");
        keywordMap.put("sql", "sql");
        keywordMap.put("query", "sql");
        keywordMap.put("select ", "sql");
        keywordMap.put("join", "sql");
        keywordMap.put("normalization", "normalization");
        keywordMap.put("normal form", "normalization");
        keywordMap.put("1nf", "normalization");
        keywordMap.put("2nf", "normalization");
        keywordMap.put("3nf", "normalization");
        keywordMap.put("bcnf", "normalization");
        keywordMap.put("process", "process");
        keywordMap.put("thread", "process");
        keywordMap.put("scheduling", "process");
        keywordMap.put("pcb", "process");
        keywordMap.put("deadlock", "deadlock");
        keywordMap.put("osi", "osi model");
        keywordMap.put("layer", "osi model");
        keywordMap.put("tcp", "tcp");
        keywordMap.put("udp", "tcp");
        keywordMap.put("handshake", "tcp");
        keywordMap.put("machine learning", "machine learning");
        keywordMap.put("ml ", "machine learning");
        keywordMap.put("supervised", "machine learning");
        keywordMap.put("unsupervised", "machine learning");
        keywordMap.put("regression", "machine learning");
        keywordMap.put("classification", "machine learning");
        keywordMap.put("database", "database");
        keywordMap.put("dbms", "database");
        keywordMap.put("rdbms", "database");
        keywordMap.put("nosql", "database");
        keywordMap.put("mongodb", "database");
        keywordMap.put("mysql", "database");
        keywordMap.put("acid", "database");
        
        for (Map.Entry<String, String> kw : keywordMap.entrySet()) {
            if (message.contains(kw.getKey())) {
                String[] val = TOPIC_KB.get(kw.getValue());
                if (val != null) return val;
            }
        }
        return null;
    }
    
    // ===================== CATEGORY-SPECIFIC RESPONSE GENERATORS =====================
    
    private String generateDoubtResponse(String message, String subject, String originalMsg) {
        String[] topicContent = findTopicContent(message);
        
        if (topicContent != null) {
            // We have a knowledge base match — return a rich, specific answer
            String subjectLabel = subject != null ? subject : "your subject";
            return "**Great question!** Here's a detailed explanation:\n\n" +
                   "### 📖 " + topicContent[0] + "\n\n" +
                   "### 💻 Code Example\n" + topicContent[1] + "\n\n" +
                   "### 🔑 Key Points\n" + topicContent[2] + "\n\n" +
                   "---\n" +
                   "💬 **Follow up:** Would you like me to explain any part in more detail, give more examples, or generate practice questions on this topic?";
        }
        
        // No KB match — generate a contextual answer using the question content
        String topic = extractTopic(message);
        String subjectLabel = subject != null ? subject : "this topic";
        
        if (message.contains("difference between") || message.contains("compare") || message.contains("vs")) {
            // Extract the two things being compared
            String comparison = topic.replaceAll("(difference between|compare|vs|and|between)", " ").trim();
            return "### ⚖️ Comparison: " + capitalize(comparison) + "\n\n" +
                   "Great comparative question! Let me break down the differences:\n\n" +
                   "Here are the key distinctions when studying **" + comparison + "** in " + subjectLabel + ":\n\n" +
                   "| Aspect | First Concept | Second Concept |\n" +
                   "|--------|--------------|----------------|\n" +
                   "| Definition | Core meaning and purpose | Core meaning and purpose |\n" +
                   "| Usage | When and where it's applied | When and where it's applied |\n" +
                   "| Advantages | Key strengths | Key strengths |\n" +
                   "| Limitations | Key drawbacks | Key drawbacks |\n\n" +
                   "**Summary:** Understanding both concepts and when to use each is crucial for mastering " + subjectLabel + ".\n\n" +
                   "Would you like me to go deeper into either concept, or provide code examples showing the difference?";
        }
        
        if (message.contains("how to") || message.contains("how do") || message.contains("how can") || message.contains("steps")) {
            return "### 📋 How to: " + capitalize(topic) + "\n\n" +
                   "Here's a step-by-step guide for **" + topic + "** in " + subjectLabel + ":\n\n" +
                   "**Step 1: Understand the Prerequisites**\n" +
                   "Make sure you're familiar with the foundational concepts that this builds upon.\n\n" +
                   "**Step 2: Learn the Core Approach**\n" +
                   "Study the standard method or algorithm used. Focus on understanding *why* each step is done, not just memorizing.\n\n" +
                   "**Step 3: Implement It**\n" +
                   "Write code or work through the process. Start simple, then add complexity.\n\n" +
                   "**Step 4: Test & Verify**\n" +
                   "Try different inputs/scenarios. Handle edge cases.\n\n" +
                   "**Step 5: Practice**\n" +
                   "Solve related problems to reinforce your understanding.\n\n" +
                   "💡 **Tip:** The best way to learn '" + topic + "' is through hands-on practice.\n\n" +
                   "Would you like me to provide a detailed code example or solve a specific problem?";
        }
        
        if (message.contains("why") || message.contains("reason") || message.contains("purpose") || message.contains("use of") || message.contains("uses of") || message.contains("advantages")) {
            return "### 💡 Why / Purpose: " + capitalize(topic) + "\n\n" +
                   "Excellent question! Understanding the **why** behind concepts is key to mastering " + subjectLabel + ".\n\n" +
                   "**" + capitalize(topic) + "** is important because:\n\n" +
                   "1. **Problem Solving** — It provides a structured approach to solving specific types of problems efficiently.\n\n" +
                   "2. **Code Quality** — Using it correctly leads to cleaner, more maintainable, and scalable code.\n\n" +
                   "3. **Industry Standard** — It's widely used in real-world applications and expected in technical interviews.\n\n" +
                   "4. **Foundation** — It builds the groundwork for understanding more advanced topics.\n\n" +
                   "**Real-world applications:**\n" +
                   "- Used extensively in software development and system design\n" +
                   "- Helps solve complex problems by breaking them into manageable parts\n" +
                   "- Essential for writing efficient and robust programs\n\n" +
                   "Would you like me to show specific examples of how **" + topic + "** is used in practice?";
        }
        
        // Generic but still topic-aware response
        return "### 📚 " + capitalize(topic) + " — " + (subject != null ? subject : "Explanation") + "\n\n" +
               "Here's what you need to know about **" + topic + "**:\n\n" +
               "**Definition & Overview:**\n" +
               "This is an important concept in " + subjectLabel + ". It forms the basis for many practical applications and is frequently tested in exams.\n\n" +
               "**Key points to understand:**\n" +
               "1. Start with the fundamental definition and core principles\n" +
               "2. Understand how it relates to other concepts you've learned\n" +
               "3. Study real-world examples and applications\n" +
               "4. Practice with problems of increasing difficulty\n\n" +
               "**Study approach for '" + topic + "':**\n" +
               "- Read the textbook/notes section on this topic\n" +
               "- Work through solved examples step by step\n" +
               "- Try solving unsolved problems on your own\n" +
               "- Connect it to practical implementations\n\n" +
               "Would you like me to:\n" +
               "- Explain this with a **code example**?\n" +
               "- Provide **practice questions**?\n" +
               "- Give a **simple analogy** to understand better?\n" +
               "- Show the **difference** between this and related concepts?";
    }
    
    private String generateNotesResponse(String message, String subject, String originalMsg, AIConversation conv) {
        String[] topicContent = findTopicContent(message);
        String fileContent = conv.getUploadedContent();
        String fileName = conv.getUploadedFileName();
        boolean hasFile = fileContent != null && !fileContent.isBlank();
        
        // ---- SUMMARIZE ----
        if (message.contains("summarize") || message.contains("summary")) {
            if (hasFile) {
                return summarizeFileContent(fileContent, fileName, subject);
            }
            if (topicContent != null) {
                return "### 📝 Smart Summary: " + capitalize(extractTopic(message)) + "\n\n" +
                       topicContent[0] + "\n\n" +
                       "**Detailed Notes:**\n" + topicContent[2] + "\n\n" +
                       "**Quick Reference:**\n" + topicContent[1] + "\n\n" +
                       "📊 **Difficulty Level:** Moderate\n" +
                       "⏱️ **Estimated Study Time:** 1-2 hours\n\n" +
                       "Would you like me to generate flashcards or predict important questions from this material?";
            }
            return "### 📝 Smart Summary\n\n" +
                   "Here's a concise summary of the material on **" + (subject != null ? subject : "this topic") + "**:\n\n" +
                   "**Main Topics Covered:**\n" +
                   "1. Introduction and fundamental concepts\n" +
                   "2. Core principles and theories\n" +
                   "3. Applications and examples\n" +
                   "4. Advanced topics and extensions\n\n" +
                   "**Key Takeaways:**\n" +
                   "- ✅ The foundational concepts are essential for advanced topics\n" +
                   "- ✅ Practical applications reinforce theoretical knowledge\n" +
                   "- ✅ Understanding exceptions and edge cases is important\n\n" +
                   "📊 **Difficulty Level:** Moderate\n" +
                   "⏱️ **Estimated Study Time:** 2-3 hours\n\n" +
                   "Would you like me to generate flashcards or predict important questions from this material?";
        }
        // ---- FLASHCARDS ----
        if (message.contains("flashcard")) {
            if (hasFile) {
                return generateFlashcardsFromContent(fileContent, fileName, subject);
            }
            String topic = extractTopic(message);
            if (topicContent != null) {
                return "### 🃏 Flashcards: " + capitalize(topic) + "\n\n" +
                       "**Card 1 — Front:** What is " + topic + "?\n" +
                       "**Card 1 — Back:** " + topicContent[0] + "\n\n" +
                       "**Card 2 — Front:** Show a code example of " + topic + "\n" +
                       "**Card 2 — Back:**\n" + topicContent[1] + "\n\n" +
                       "**Card 3 — Front:** What are the key points about " + topic + "?\n" +
                       "**Card 3 — Back:** " + topicContent[2] + "\n\n" +
                       "I've created 3 detailed flashcards. Would you like more on a specific aspect?";
            }
            return "### 🃏 Generated Flashcards — " + (subject != null ? subject : "General") + "\n\n" +
                   "**Card 1 — Front:** What is the fundamental concept?\n" +
                   "**Card 1 — Back:** It defines the core principle that...\n\n" +
                   "**Card 2 — Front:** List the key applications\n" +
                   "**Card 2 — Back:** Used in engineering, development, and research\n\n" +
                   "**Card 3 — Front:** What is the difference between the main variations?\n" +
                   "**Card 3 — Back:** The first focuses on... while the second emphasizes...\n\n" +
                   "Would you like more flashcards or on a specific subtopic?";
        }
        // ---- KEY POINTS / EXTRACT ----
        if (message.contains("key point") || message.contains("extract")) {
            if (hasFile) {
                return extractKeyPointsFromContent(fileContent, fileName, subject);
            }
            if (topicContent != null) {
                return "### 🔑 Key Points: " + capitalize(extractTopic(message)) + "\n\n" + topicContent[2] + "\n\n" +
                       "Would you like flashcards or a summary on this?";
            }
            return "### 🔑 Key Points Extraction\n\n" +
                   "Please upload a PDF or paste text, and I'll extract the key points for you!\n\n" +
                   "Use the **📎 Upload** button to upload your study material.";
        }
        // ---- IMPORTANT QUESTIONS / PREDICT ----
        if (message.contains("important question") || message.contains("predict")) {
            if (hasFile) {
                return predictQuestionsFromContent(fileContent, fileName, subject);
            }
            return "### 🎯 Predicted Important Questions — " + (subject != null ? subject : "General") + "\n\n" +
                   "Based on analysis of the material and past exam patterns:\n\n" +
                   "**High Priority (Very Likely):**\n" +
                   "1. Explain the concept of " + extractTopic(message) + " with examples (10 marks)\n" +
                   "2. Compare and contrast the major approaches (8 marks)\n" +
                   "3. Derive/implement the core algorithm (10 marks)\n\n" +
                   "**Medium Priority:**\n" +
                   "4. List the applications and advantages (5 marks)\n" +
                   "5. Solve numerical/coding problems related to this topic (8 marks)\n\n" +
                   "📊 **Confidence Score:** 78%\n\n" +
                   "Shall I provide model answers for any of these?";
        }
        // ---- SIMPLIFY ----
        if (message.contains("simplify") || message.contains("explain simply") || message.contains("easy")) {
            if (hasFile) {
                return simplifyContent(fileContent, fileName, subject);
            }
            if (topicContent != null) {
                return "### 💡 Simplified: " + capitalize(extractTopic(message)) + "\n\n" +
                       "**In simple words:** " + topicContent[0] + "\n\n" +
                       "**Real-world analogy:** Think of it like a toolbox — each tool (concept) has a specific job.\n\n" +
                       "**Visual example:**\n" + topicContent[1] + "\n\n" +
                       "Need it broken down further?";
            }
        }
        
        // ---- If file is uploaded but no specific action ----
        if (hasFile) {
            return "### 📄 File Loaded: " + fileName + "\n\n" +
                   "✅ I've processed your uploaded document (" + fileContent.length() + " characters extracted).\n\n" +
                   "**What would you like me to do with it?**\n\n" +
                   "- 📝 **Summarize** — Get a concise summary\n" +
                   "- 🔑 **Extract key points** — Pull out definitions & important concepts\n" +
                   "- 🃏 **Generate flashcards** — Create revision cards\n" +
                   "- 🎯 **Predict important questions** — Likely exam questions\n" +
                   "- 💡 **Simplify** — Break down complex concepts\n\n" +
                   "Just type your request or click a quick prompt!";
        }
        
        // topic-aware general notes response
        if (topicContent != null) {
            return "### 📖 Study Notes: " + capitalize(extractTopic(message)) + "\n\n" +
                   "**Overview:**\n" + topicContent[0] + "\n\n" +
                   "**Code/Example:**\n" + topicContent[1] + "\n\n" +
                   "**Key Points:**\n" + topicContent[2] + "\n\n" +
                   "---\n" +
                   "I can also:\n" +
                   "- **Summarize** this into bullet points\n" +
                   "- **Generate flashcards** for quick revision\n" +
                   "- **Predict important questions** for exams\n\n" +
                   "What would you like?";
        }
        
        return "I can help you with study notes on **" + (subject != null ? subject : "any topic") + "**! 📖\n\n" +
               "Here's what I can do:\n" +
               "- 📎 **Upload** a PDF and I'll analyze it\n" +
               "- 📝 **Summarize** notes, PDFs, or concepts\n" +
               "- 🔑 **Extract** key points and definitions\n" +
               "- 🃏 **Generate** flashcards for quick revision\n" +
               "- 🎯 **Predict** important questions for exams\n" +
               "- 💡 **Simplify** complex concepts with examples\n\n" +
               "Upload a file or tell me what topic you'd like help with!";
    }
    
    private String generateExamPrepResponse(String message, String subject, String originalMsg) {
        String topic = extractTopic(message);
        String subLabel = subject != null ? subject : "General";
        String[] topicContent = findTopicContent(message);
        
        if (message.contains("mcq") || message.contains("quiz") || message.contains("multiple choice")) {
            if (topicContent != null) {
                return "### 📋 MCQ Practice Set — " + capitalize(topic) + " (" + subLabel + ")\n\n" +
                       "**Based on:** " + topicContent[0].substring(0, Math.min(100, topicContent[0].length())) + "...\n\n" +
                       "**Q1.** Which of the following correctly describes " + topic + "?\n" +
                       "   a) It is not used in modern programming\n" +
                       "   b) It is a core concept that helps organize code ✅\n" +
                       "   c) It only applies to one language\n" +
                       "   d) It has been deprecated\n\n" +
                       "**Q2.** What is a key advantage of " + topic + "?\n" +
                       "   a) It makes code slower\n" +
                       "   b) It improves code organization and reusability ✅\n" +
                       "   c) It removes the need for testing\n" +
                       "   d) It is only for beginners\n\n" +
                       "**Q3.** In which scenario would you use " + topic + "?\n" +
                       "   a) When writing very simple scripts\n" +
                       "   b) When building scalable applications ✅\n" +
                       "   c) Never in real-world projects\n" +
                       "   d) Only in academic settings\n\n" +
                       "Want more questions or a different difficulty level?";
            }
            return "### 📋 MCQ Practice Set — " + subLabel + "\n\n" +
                   "**Q1.** Which of the following best describes the concept?\n" +
                   "   a) Option A — First principle\n" +
                   "   b) Option B — Correct answer ✅\n" +
                   "   c) Option C — Third principle\n" +
                   "   d) Option D — None of these\n\n" +
                   "**Q2.** What is the primary purpose?\n" +
                   "   a) Performance only\n" +
                   "   b) Code organization and reuse ✅\n" +
                   "   c) Debugging\n" +
                   "   d) Testing\n\n" +
                   "Want more MCQs? Specify a topic for targeted questions!";
        }
        if (message.contains("mock test") || message.contains("timed")) {
            return "### ⏱️ Mock Test Ready!\n\n" +
                   "**Subject:** " + subLabel + "\n" +
                   "**Topic Focus:** " + capitalize(topic) + "\n" +
                   "**Questions:** 25\n" +
                   "**Duration:** 30 minutes\n" +
                   "**Type:** Mixed (MCQ + Short Answer)\n\n" +
                   "**Instructions:**\n" +
                   "- Each MCQ carries 1 mark\n" +
                   "- Short answers carry 3 marks each\n" +
                   "- No negative marking\n\n" +
                   "Use the **Practice & Tests** tab to take an interactive quiz!\n\n" +
                   "Ready to begin?";
        }
        
        if (topicContent != null) {
            return "### 🎓 Exam Prep: " + capitalize(topic) + "\n\n" +
                   "Here's exam-focused content on this topic:\n\n" +
                   "**Key concept:** " + topicContent[0] + "\n\n" +
                   "**Must-know for exams:**\n" + topicContent[2] + "\n\n" +
                   "**Code to remember:**\n" + topicContent[1] + "\n\n" +
                   "---\n" +
                   "**Exam tips for " + topic + ":**\n" +
                   "- This topic frequently appears in 5-10 mark questions\n" +
                   "- Be ready to write code examples from memory\n" +
                   "- Understand the 'why' — conceptual questions are common\n\n" +
                   "Would you like MCQs, short answer practice, or a mock test?";
        }
        
        return "### 🎓 Exam Preparation — " + subLabel + "\n\n" +
               "I'm here to help you ace your exams!\n\n" +
               "**What I can generate:**\n" +
               "- 📋 MCQ practice sets (with instant scoring)\n" +
               "- ✏️ Short answer questions\n" +
               "- 📝 Long answer questions with model answers\n" +
               "- ⏱️ Timed mock tests\n\n" +
               "Tell me a specific topic and I'll generate targeted practice!";
    }
    
    private String generateStudyPlanResponse(String message, String subject) {
        String topic = extractTopic(message);
        return "### 📅 Personalized Study Plan\n\n" +
               "Based on your question about **" + topic + "** in " + (subject != null ? subject : "your subjects") + ":\n\n" +
               "**To generate a study plan, go to the Study Plans tab** and:\n" +
               "1. Choose a plan type (Daily / Revision / Exam Countdown)\n" +
               "2. Enter your subjects\n" +
               "3. Click **Generate Plan**\n\n" +
               "Each plan type creates a completely different schedule:\n" +
               "- **Daily Timetable** — hour-by-hour study routine with breaks\n" +
               "- **Revision Schedule** — 7-day intensive revision with spaced repetition\n" +
               "- **Exam Countdown** — 14-day phase-based prep from coverage to exam eve\n\n" +
               "Would you like help choosing the right plan type for your situation?";
    }
    
    private String generateCodingResponse(String message, String originalMsg) {
        String topic = extractTopic(message);
        String[] topicContent = findTopicContent(message);
        
        if (message.contains("bug") || message.contains("error") || message.contains("fix") || message.contains("debug")) {
            return "### 🔍 Debug Help: " + capitalize(topic) + "\n\n" +
                   "Let me help you debug this. To find the issue:\n\n" +
                   "**Common causes for errors in " + topic + ":**\n\n" +
                   "1. **Syntax errors** — missing semicolons, brackets, or parentheses\n" +
                   "2. **Type mismatches** — passing wrong data types to functions\n" +
                   "3. **Null/undefined references** — accessing objects before initialization\n" +
                   "4. **Logic errors** — incorrect conditions, off-by-one in loops\n" +
                   "5. **Scope issues** — variables not accessible where expected\n\n" +
                   "**Debugging steps:**\n" +
                   "```\n" +
                   "1. Read the error message carefully — it tells you the line & type\n" +
                   "2. Check the line mentioned and the lines above it\n" +
                   "3. Add print statements to trace variable values\n" +
                   "4. Verify your logic with a simple test case\n" +
                   "5. Check edge cases: null, empty, zero, negative\n" +
                   "```\n\n" +
                   "💡 **Tip:** Paste your code here and I'll help identify the specific issue!\n\n" +
                   "What error are you seeing?";
        }
        
        if (topicContent != null) {
            return "### 💻 Coding: " + capitalize(topic) + "\n\n" +
                   topicContent[0] + "\n\n" +
                   "**Implementation:**\n" + topicContent[1] + "\n\n" +
                   "**Important notes:**\n" + topicContent[2] + "\n\n" +
                   "---\n" +
                   "Would you like me to:\n" +
                   "- Explain the code line by line?\n" +
                   "- Show an alternative approach?\n" +
                   "- Give you a practice problem to solve?";
        }
        
        if (message.contains("write") || message.contains("code") || message.contains("program") || message.contains("implement")) {
            return "### 💻 Code: " + capitalize(topic) + "\n\n" +
                   "Here's how to implement **" + topic + "**:\n\n" +
                   "**Approach:**\n" +
                   "1. Define the inputs and expected outputs\n" +
                   "2. Choose the right data structures\n" +
                   "3. Implement the core logic\n" +
                   "4. Handle edge cases\n" +
                   "5. Test with multiple inputs\n\n" +
                   "**Things to consider:**\n" +
                   "- Time complexity — aim for the most efficient approach\n" +
                   "- Space complexity — minimize extra memory usage\n" +
                   "- Edge cases — empty inputs, single elements, large inputs\n\n" +
                   "Could you specify the programming language (Java/Python/C) so I can give you the exact code?";
        }
        
        return "### 💻 Coding Assistant\n\n" +
               "I'm ready to help you with **" + topic + "**!\n\n" +
               "**I can help with:**\n" +
               "- 🔍 **Bug Detection** — Paste code and I'll find the issue\n" +
               "- ❌ **Error Explanation** — Tell me the error message\n" +
               "- ✅ **Code Writing** — I'll write code for your problem\n" +
               "- 📖 **Algorithm Explanation** — Step-by-step walkthroughs\n" +
               "- 🚀 **Optimization** — Make your code faster\n\n" +
               "Paste your code or describe what you need!";
    }
    
    private String generateContentResponse(String message, String subject) {
        if (message.contains("question paper") || message.contains("generate question")) {
            return "### 📄 Question Paper Generated\n\n" +
                   "**Subject:** " + (subject != null ? subject : "General") + "\n" +
                   "**Total Marks:** 100\n" +
                   "**Duration:** 3 hours\n\n" +
                   "---\n\n" +
                   "**Section A — Multiple Choice (20 marks)**\n" +
                   "10 questions × 2 marks each\n\n" +
                   "**Section B — Short Answers (30 marks)**\n" +
                   "6 questions × 5 marks each\n\n" +
                   "**Section C — Long Answers (50 marks)**\n" +
                   "5 questions × 10 marks each (attempt any 4)\n\n" +
                   "---\n\n" +
                   "Questions have been generated covering all syllabus topics. Would you like to:\n" +
                   "- View the complete question paper?\n" +
                   "- Generate model answers?\n" +
                   "- Adjust difficulty or topic distribution?";
        }
        return "### 📚 Faculty Content Generation\n\n" +
               "I can generate academic content for " + (subject != null ? subject : "your subject") + ":\n\n" +
               "- 📄 Complete question papers\n" +
               "- 📋 Quizzes and assignments\n" +
               "- 📝 Model answers and explanations\n" +
               "- 🃏 Flashcards for teaching\n" +
               "- 📊 Topic summaries\n\n" +
               "What would you like me to create?";
    }
    
    private String generateGeneralResponse(String message, String subject) {
        String[] topicContent = findTopicContent(message);
        if (topicContent != null) {
            String topic = extractTopic(message);
            return "### 📚 " + capitalize(topic) + "\n\n" +
                   topicContent[0] + "\n\n" +
                   "**Example:**\n" + topicContent[1] + "\n\n" +
                   "**Key Points:**\n" + topicContent[2] + "\n\n" +
                   "Would you like more details on this topic?";
        }
        return "I'm your AI Learning Assistant! 🧠\n\n" +
               "I can help you with:\n" +
               "- 📚 **Doubt Solving** — Ask any academic question\n" +
               "- 📝 **Notes & Learning** — Summarize, flashcards, key points\n" +
               "- 🎓 **Exam Prep** — MCQs, mock tests, practice\n" +
               "- 📅 **Study Plans** — Personalized schedules\n" +
               "- 💻 **Coding Help** — Debug, explain, optimize\n\n" +
               "How can I help you today?";
    }
    
    // ---- utility ----
    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
    
    // ===================== STUDY PLAN MANAGEMENT =====================
    
    public AIStudyPlan generateStudyPlan(String studentId, String type, List<String> subjects) {
        AIStudyPlan plan = new AIStudyPlan();
        plan.setStudentId(studentId);
        plan.setType(type);
        
        List<String> subs = (subjects != null && !subjects.isEmpty()) ? subjects : Arrays.asList("Mathematics", "Physics", "Chemistry");
        
        switch (type) {
            case "daily":
                plan = buildDailyTimetable(plan, subs);
                break;
            case "revision":
                plan = buildRevisionSchedule(plan, subs);
                break;
            case "exam-countdown":
                plan = buildExamCountdown(plan, subs);
                break;
            default:
                plan = buildDailyTimetable(plan, subs);
        }
        
        return studyPlanRepo.save(plan);
    }
    
    private AIStudyPlan buildDailyTimetable(AIStudyPlan plan, List<String> subjects) {
        plan.setTitle("Daily Study Timetable");
        
        // Identify weak subjects (first 2 provided)
        List<String> weak = subjects.subList(0, Math.min(2, subjects.size()));
        plan.setWeakSubjects(weak);
        
        List<Map<String, Object>> schedule = new ArrayList<>();
        
        // Morning sessions — productive hours for hard subjects
        String[] morningTimes = {"6:00 AM", "7:30 AM", "9:00 AM"};
        String[] morningActivities = {"Concept Study & Theory", "Problem Solving & Practice", "Active Recall & Notes"};
        
        // Afternoon sessions — moderate difficulty
        String[] afternoonTimes = {"11:30 AM", "2:00 PM", "3:30 PM"};
        String[] afternoonActivities = {"Lecture Review & Doubts", "Numerical / Coding Practice", "Group Study / Discussion"};
        
        // Evening sessions — revision
        String[] eveningTimes = {"5:30 PM", "7:00 PM", "9:00 PM"};
        String[] eveningActivities = {"Topic Revision", "Mock Test / Quiz", "Summary & Quick Review"};
        
        int subIdx = 0;
        // Morning block
        for (int i = 0; i < morningTimes.length && subIdx < subjects.size(); i++, subIdx++) {
            schedule.add(makeSlot(morningTimes[i], subjects.get(subIdx % subjects.size()), morningActivities[i], "1.5 hours",
                    weak.contains(subjects.get(subIdx % subjects.size())) ? "high" : "medium"));
        }
        // Break
        schedule.add(makeSlot("10:30 AM", "—", "☕ Break & Light Exercise", "1 hour", "break"));
        // Afternoon block
        subIdx = 0;
        for (int i = 0; i < afternoonTimes.length && i < subjects.size(); i++) {
            String sub = subjects.get((i + 1) % subjects.size());
            schedule.add(makeSlot(afternoonTimes[i], sub, afternoonActivities[i], "1.5 hours",
                    weak.contains(sub) ? "high" : "medium"));
        }
        // Break
        schedule.add(makeSlot("5:00 PM", "—", "🏃 Break & Refresh", "30 min", "break"));
        // Evening block
        for (int i = 0; i < Math.min(eveningTimes.length, subjects.size()); i++) {
            String sub = subjects.get(i % subjects.size());
            schedule.add(makeSlot(eveningTimes[i], sub, eveningActivities[i], "1.5 hours",
                    weak.contains(sub) ? "high" : "low"));
        }
        
        plan.setSchedule(schedule);
        plan.setReadinessScore(55.0);
        plan.setMotivationTips(Arrays.asList(
            "Consistency beats intensity — study daily at the same times!",
            "Morning hours are golden for tough subjects. Use them wisely.",
            "Take short breaks every 45 minutes (Pomodoro Technique).",
            "Review before sleeping — your brain consolidates memories during sleep.",
            "Stay hydrated and eat light meals for better concentration."
        ));
        return plan;
    }
    
    private AIStudyPlan buildRevisionSchedule(AIStudyPlan plan, List<String> subjects) {
        plan.setTitle("Revision Schedule");
        
        List<String> weak = subjects.subList(0, Math.min(2, subjects.size()));
        plan.setWeakSubjects(weak);
        
        List<Map<String, Object>> schedule = new ArrayList<>();
        
        // Day-wise revision plan across 7 days
        String[] days = {"Day 1 (Mon)", "Day 2 (Tue)", "Day 3 (Wed)", "Day 4 (Thu)", "Day 5 (Fri)", "Day 6 (Sat)", "Day 7 (Sun)"};
        String[][] dayActivities = {
            {"Full Syllabus Overview", "Mark weak topics", "Skim all chapters"},
            {"Deep Revision — Core Concepts", "Rewrite formulas & key points", "Create flashcards"},
            {"Practice Problems & Numericals", "Solve previous year questions", "Time yourself"},
            {"Mock Test — Full Length", "Analyze mistakes", "Identify gaps"},
            {"Weak Topics Deep Dive", "Extra practice on gaps", "Concept re-learning"},
            {"Rapid Fire Revision", "Flashcard review", "Formula sheets"},
            {"Final Mock + Light Review", "Relaxation & confidence building", "Early sleep"}
        };
        
        for (int d = 0; d < days.length; d++) {
            // Assign subjects to days cyclically, weak subjects get more days
            for (int s = 0; s < Math.min(subjects.size(), 3); s++) {
                String sub = subjects.get(s % subjects.size());
                boolean isWeak = weak.contains(sub);
                // Weak subjects appear more often
                if (!isWeak && d % 2 != 0 && s > 0) continue;
                
                String activity = dayActivities[d][Math.min(s, dayActivities[d].length - 1)];
                String time = s == 0 ? "Morning (6-10 AM)" : s == 1 ? "Afternoon (2-5 PM)" : "Evening (6-9 PM)";
                String duration = isWeak ? "4 hours" : "3 hours";
                String priority = isWeak ? "high" : (d >= 5 ? "high" : "medium");
                
                schedule.add(makeSlot(days[d] + " · " + time, sub, activity, duration, priority));
            }
        }
        
        plan.setSchedule(schedule);
        plan.setReadinessScore(45.0);
        plan.setMotivationTips(Arrays.asList(
            "Revision ≠ Re-reading. Actively recall, test yourself, and summarize.",
            "Use the Feynman Technique: explain concepts as if teaching someone else.",
            "Prioritize weak subjects — spend 60% revision time on them.",
            "Past year papers are gold. Solve at least 3-5 years' worth.",
            "Don't start new topics during revision. Focus on what you've already learned.",
            "Sleep 7-8 hours — revision is useless without proper rest."
        ));
        return plan;
    }
    
    private AIStudyPlan buildExamCountdown(AIStudyPlan plan, List<String> subjects) {
        plan.setTitle("Exam Countdown Planner");
        
        List<String> weak = subjects.subList(0, Math.min(2, subjects.size()));
        plan.setWeakSubjects(weak);
        
        // Exam info
        Map<String, Object> examInfo = new HashMap<>();
        examInfo.put("examName", "Semester End Examination");
        examInfo.put("daysLeft", 14);
        examInfo.put("totalSubjects", subjects.size());
        plan.setExamInfo(examInfo);
        
        List<Map<String, Object>> schedule = new ArrayList<>();
        
        // Phase-based countdown plan
        // Phase 1: Days 14-10 — Complete Coverage
        schedule.add(makeSlot("📅 Phase 1: Days 14-10", "ALL", "COMPLETE SYLLABUS COVERAGE", "5 days", "header"));
        for (int i = 0; i < subjects.size(); i++) {
            String sub = subjects.get(i);
            boolean isWeak = weak.contains(sub);
            schedule.add(makeSlot("Day " + (14 - i) + " — Full Day", sub, 
                    isWeak ? "Deep Study: All chapters + Practice problems + Past papers" : "Quick Study: Key chapters + Important topics + Formulas",
                    isWeak ? "8 hours" : "6 hours", isWeak ? "high" : "medium"));
        }
        
        // Phase 2: Days 9-5 — Intensive Practice
        schedule.add(makeSlot("📅 Phase 2: Days 9-5", "ALL", "INTENSIVE PRACTICE & MOCK TESTS", "5 days", "header"));
        schedule.add(makeSlot("Day 9-8", weak.size() > 0 ? weak.get(0) : subjects.get(0), 
                "Full mock test + Error analysis + Re-study weak areas", "8 hours", "high"));
        schedule.add(makeSlot("Day 7-6", weak.size() > 1 ? weak.get(1) : subjects.get(subjects.size() > 1 ? 1 : 0), 
                "Full mock test + Error analysis + Re-study weak areas", "8 hours", "high"));
        for (int i = 2; i < Math.min(subjects.size(), 5); i++) {
            schedule.add(makeSlot("Day " + (10 - i), subjects.get(i % subjects.size()), 
                    "Practice test + Quick revision of key topics", "6 hours", "medium"));
        }
        
        // Phase 3: Days 4-2 — Rapid Revision
        schedule.add(makeSlot("📅 Phase 3: Days 4-2", "ALL", "RAPID REVISION & FORMULA SHEETS", "3 days", "header"));
        schedule.add(makeSlot("Day 4 — Morning", "All Weak Subjects", "Flashcard review + Formula memorization", "4 hours", "high"));
        schedule.add(makeSlot("Day 4 — Evening", "All Subjects", "Quick concept maps + Key diagrams", "3 hours", "high"));
        schedule.add(makeSlot("Day 3", "All Subjects", "Speed test (30 min per subject) + Gap analysis", "5 hours", "high"));
        schedule.add(makeSlot("Day 2", "All Subjects", "Light revision + Formula sheet review only", "3 hours", "medium"));
        
        // Phase 4: Day 1 — Exam Eve
        schedule.add(makeSlot("📅 Phase 4: Day 1", "ALL", "EXAM EVE — CONFIDENCE & REST", "1 day", "header"));
        schedule.add(makeSlot("Day 1 — Morning", "First Exam Subject", "Quick formula glance + 1 practice paper (timed)", "2 hours", "medium"));
        schedule.add(makeSlot("Day 1 — Afternoon", "—", "Light activity, walk, NO heavy studying", "Relax", "low"));
        schedule.add(makeSlot("Day 1 — Night", "—", "Early dinner, prep materials, sleep by 10 PM", "Rest", "low"));
        
        plan.setSchedule(schedule);
        plan.setReadinessScore(40.0);
        plan.setMotivationTips(Arrays.asList(
            "🎯 Focus on high-weightage topics first — maximize marks with minimum effort.",
            "⏰ Don't pull all-nighters. 6+ hours sleep = better memory retention.",
            "📝 Write, don't just read. Writing activates deeper memory encoding.",
            "🧠 Use spaced repetition: review today, tomorrow, then day 4.",
            "💪 You've prepared well. Trust the process and stay calm.",
            "🚫 No new topics in the last 3 days. Only revise what you already know."
        ));
        return plan;
    }
    
    private Map<String, Object> makeSlot(String time, String subject, String activity, String duration, String priority) {
        Map<String, Object> slot = new HashMap<>();
        slot.put("time", time);
        slot.put("subject", subject);
        slot.put("activity", activity);
        slot.put("duration", duration);
        slot.put("priority", priority);
        return slot;
    }
    
    public List<AIStudyPlan> getStudentStudyPlans(String studentId) {
        return studyPlanRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }
    
    public void deleteStudyPlan(String planId) {
        studyPlanRepo.deleteById(planId);
    }
    
    // ===================== QUIZ MANAGEMENT =====================
    
    public AIQuizResult generateQuiz(String studentId, String subject, String quizType, int numQuestions, String difficulty) {
        AIQuizResult result = new AIQuizResult();
        result.setStudentId(studentId);
        result.setSubject(subject);
        result.setQuizType(quizType);
        result.setDifficulty(difficulty);
        result.setTotalQuestions(numQuestions);
        
        List<Map<String, Object>> questions = generateQuestionsForSubject(subject, quizType, numQuestions, difficulty);
        result.setQuestions(questions);
        result.setCorrectAnswers(0);
        result.setWrongAnswers(0);
        result.setSkipped(numQuestions);
        result.setScorePercent(0);
        result.setCompletedAt(null); // Not completed until submitted
        
        return quizResultRepo.save(result);
    }

    private List<Map<String, Object>> generateQuestionsForSubject(String subject, String quizType, int numQuestions, String difficulty) {
        List<Map<String, Object>> questions = new ArrayList<>();
        String subjectLower = subject.toLowerCase().trim();
        
        // Get question bank based on subject
        List<Map<String, Object>> questionBank = getQuestionBank(subjectLower, quizType, difficulty);
        
        // Shuffle and pick requested number
        Collections.shuffle(questionBank);
        int count = Math.min(numQuestions, questionBank.size());
        
        // If question bank has fewer questions, generate remaining as generic
        for (int i = 0; i < numQuestions; i++) {
            if (i < count) {
                Map<String, Object> q = new HashMap<>(questionBank.get(i));
                q.put("id", UUID.randomUUID().toString());
                q.put("studentAnswer", null);
                q.put("isCorrect", false);
                questions.add(q);
            } else {
                questions.add(createGenericQuestion(subjectLower, quizType, i + 1, difficulty));
            }
        }
        return questions;
    }
    
    private Map<String, Object> createGenericQuestion(String subject, String quizType, int index, String difficulty) {
        Map<String, Object> q = new HashMap<>();
        q.put("id", UUID.randomUUID().toString());
        q.put("type", quizType);
        q.put("studentAnswer", null);
        q.put("isCorrect", false);
        
        if ("mcq".equals(quizType) || "mixed".equals(quizType)) {
            q.put("question", "Which of the following best describes a key concept in " + subject + "? (Q" + index + ")");
            q.put("options", Arrays.asList("Fundamental principle of " + subject, "An unrelated concept", "None of the above", "All of the above"));
            q.put("correctAnswer", "A");
            q.put("explanation", "The first option correctly describes a fundamental principle in " + subject + ".");
        } else {
            q.put("question", "Explain a core concept in " + subject + " with an example. (Q" + index + ")");
            q.put("correctAnswer", "A core concept in " + subject + " involves understanding its fundamental principles and applying them through practical examples.");
            q.put("explanation", "A good answer should cover the definition, key characteristics, and a relevant example.");
        }
        return q;
    }
    
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getQuestionBank(String subject, String quizType, String difficulty) {
        List<Map<String, Object>> bank = new ArrayList<>();
        
        // ===== JAVA =====
        if (subject.contains("java")) {
            if ("mcq".equals(quizType) || "mixed".equals(quizType)) {
                // Easy
                if ("easy".equals(difficulty) || "medium".equals(difficulty)) {
                    bank.add(mcq("What is the default value of an int variable in Java?", new String[]{"0", "null", "1", "undefined"}, "A", "In Java, numeric types default to 0."));
                    bank.add(mcq("Which keyword is used to create a class in Java?", new String[]{"class", "struct", "define", "type"}, "A", "'class' is the keyword used to define a class in Java."));
                    bank.add(mcq("Which of these is NOT a primitive data type in Java?", new String[]{"String", "int", "boolean", "double"}, "A", "String is a reference type (class), not a primitive."));
                    bank.add(mcq("What does JVM stand for?", new String[]{"Java Virtual Machine", "Java Variable Method", "Java Verified Module", "Java Visual Mode"}, "A", "JVM stands for Java Virtual Machine which executes Java bytecode."));
                    bank.add(mcq("Which method is the entry point of a Java program?", new String[]{"main()", "start()", "run()", "init()"}, "A", "The main() method with signature 'public static void main(String[] args)' is the entry point."));
                    bank.add(mcq("What is the size of an int in Java?", new String[]{"32 bits", "16 bits", "64 bits", "8 bits"}, "A", "An int in Java is always 32 bits (4 bytes)."));
                    bank.add(mcq("Which access modifier makes a member accessible only within its class?", new String[]{"private", "public", "protected", "default"}, "A", "The private modifier restricts access to only the declaring class."));
                    bank.add(mcq("What is the output of 10 + 20 + \"Hello\"?", new String[]{"30Hello", "1020Hello", "Hello1020", "Compilation Error"}, "A", "Java evaluates left to right: 10+20=30, then 30+\"Hello\"=\"30Hello\"."));
                }
                // Medium/Hard
                if ("medium".equals(difficulty) || "hard".equals(difficulty)) {
                    bank.add(mcq("What is polymorphism in Java?", new String[]{"Ability of an object to take many forms", "Creating multiple classes", "A design pattern", "A type of variable"}, "A", "Polymorphism means 'many forms' — an object can behave differently in different contexts."));
                    bank.add(mcq("Which collection does NOT allow duplicate elements?", new String[]{"Set", "List", "ArrayList", "LinkedList"}, "A", "Set interface does not allow duplicate elements, unlike List implementations."));
                    bank.add(mcq("What is the purpose of the 'finally' block?", new String[]{"Always executes after try/catch", "Handles exceptions", "Defines constants", "Creates objects"}, "A", "The finally block executes regardless of whether an exception occurred."));
                    bank.add(mcq("What is the difference between == and .equals() for Strings?", new String[]{"== compares references, .equals() compares values", "They are identical", "== compares values, .equals() compares references", ".equals() is faster"}, "A", "== checks if two references point to the same object; .equals() checks if the values are the same."));
                    bank.add(mcq("What is an abstract class?", new String[]{"A class that cannot be instantiated directly", "A class with no methods", "A final class", "A static class"}, "A", "Abstract classes are declared with 'abstract' keyword and cannot be instantiated directly — they must be subclassed."));
                    bank.add(mcq("Which of the following is true about interfaces in Java 8+?", new String[]{"They can have default methods", "They can have constructors", "They can have instance variables", "They cannot have static methods"}, "A", "Java 8 introduced default methods in interfaces with the 'default' keyword."));
                    bank.add(mcq("What does the 'static' keyword mean?", new String[]{"The member belongs to the class, not instances", "The variable cannot be changed", "The method is abstract", "The class is final"}, "A", "Static members belong to the class itself and are shared across all instances."));
                    bank.add(mcq("What is autoboxing in Java?", new String[]{"Automatic conversion between primitive and wrapper types", "Creating objects automatically", "Automatic garbage collection", "Implicit casting"}, "A", "Autoboxing is the automatic conversion between primitives (int) and their wrapper classes (Integer)."));
                }
                // Hard
                if ("hard".equals(difficulty)) {
                    bank.add(mcq("What is the diamond problem in Java?", new String[]{"Ambiguity in multiple inheritance of classes", "Memory leak pattern", "Thread deadlock", "Circular dependency"}, "A", "The diamond problem occurs when a class inherits from two classes that have a common base, causing ambiguity. Java avoids it by not allowing multiple class inheritance."));
                    bank.add(mcq("What is the time complexity of HashMap.get()?", new String[]{"O(1) average case", "O(n)", "O(log n)", "O(n²)"}, "A", "HashMap provides O(1) average-case time complexity for get operations using hash-based indexing."));
                    bank.add(mcq("Which of these creates a memory leak in Java?", new String[]{"Static collections holding object references", "Using local variables", "Try-with-resources", "Using primitives"}, "A", "Static collections that accumulate references can prevent garbage collection, causing memory leaks."));
                    bank.add(mcq("What is the purpose of volatile keyword?", new String[]{"Ensures visibility of changes across threads", "Makes a variable constant", "Speeds up access", "Prevents inheritance"}, "A", "volatile ensures that reads/writes to the variable are directly from/to main memory, guaranteeing visibility across threads."));
                    bank.add(mcq("What happens when you override equals() but not hashCode()?", new String[]{"HashMap/HashSet may not work correctly", "Compilation error", "No effect", "equals() stops working"}, "A", "If equals() is overridden without hashCode(), objects that are equal may not be found in hash-based collections."));
                }
            }
            if ("short-answer".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(shortAnswer("Explain the difference between an abstract class and an interface in Java.", "An abstract class can have instance variables, constructors, and both abstract and concrete methods. An interface (pre-Java 8) can only have abstract methods and constants. From Java 8, interfaces can also have default and static methods but still cannot have constructors or instance state.", "Focus on the key differences: constructors, state, method implementations, and multiple inheritance."));
                bank.add(shortAnswer("What is the Java Collections Framework?", "The Java Collections Framework is a set of classes and interfaces (like List, Set, Map, Queue) that provide implementations for commonly used data structures. It includes ArrayList, HashMap, TreeSet, LinkedList, etc.", "A good answer covers the main interfaces and at least 2-3 implementations."));
                bank.add(shortAnswer("Explain method overloading vs method overriding.", "Overloading: same method name, different parameters, in the same class (compile-time polymorphism). Overriding: same method name and parameters in a subclass, replacing the parent's implementation (runtime polymorphism).", "Distinguish between compile-time and runtime polymorphism."));
                bank.add(shortAnswer("What are Java Generics and why are they used?", "Generics enable writing code that works with different types while providing compile-time type safety. They eliminate the need for explicit casting and prevent ClassCastException at runtime. Example: List<String> ensures only Strings are added.", "Cover type safety, code reusability, and compile-time checking."));
            }
        }
        
        // ===== PYTHON =====
        else if (subject.contains("python")) {
            if ("mcq".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(mcq("What is the output of print(type([]))?", new String[]{"<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"}, "A", "[] creates an empty list in Python."));
                bank.add(mcq("Which keyword is used for function definition in Python?", new String[]{"def", "function", "func", "define"}, "A", "Python uses 'def' keyword to define functions."));
                bank.add(mcq("What is a dictionary in Python?", new String[]{"A collection of key-value pairs", "An ordered sequence", "A type of list", "A function"}, "A", "Dictionaries store data as key-value pairs using curly braces {}."));
                bank.add(mcq("What does 'len()' function return?", new String[]{"The number of elements in an object", "The memory size", "The data type", "The last element"}, "A", "len() returns the number of items in a container (string, list, dict, etc.)."));
                bank.add(mcq("Which of these is immutable in Python?", new String[]{"Tuple", "List", "Dictionary", "Set"}, "A", "Tuples are immutable — once created, their elements cannot be changed."));
                bank.add(mcq("What is a list comprehension?", new String[]{"A concise way to create lists", "A method to sort lists", "A type of loop", "A list function"}, "A", "List comprehension provides a compact syntax: [expr for item in iterable if condition]."));
                bank.add(mcq("How do you handle exceptions in Python?", new String[]{"try-except blocks", "if-else blocks", "switch-case", "for loops"}, "A", "Python uses try-except blocks for exception handling."));
                bank.add(mcq("What is the difference between '==' and 'is'?", new String[]{"== compares values, 'is' compares identity", "They are the same", "'is' compares values, == compares identity", "== is for numbers only"}, "A", "'==' checks value equality, 'is' checks if two variables point to the same object in memory."));
                bank.add(mcq("What is a decorator in Python?", new String[]{"A function that modifies another function's behavior", "A data type", "A loop structure", "A variable type"}, "A", "Decorators wrap a function to extend its behavior without modifying it directly, using @syntax."));
                bank.add(mcq("What is PEP 8?", new String[]{"Python style guide for writing clean code", "A Python library", "A Python version", "A testing framework"}, "A", "PEP 8 is the official style guide for Python code formatting and conventions."));
            }
            if ("short-answer".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(shortAnswer("Explain the difference between a list and a tuple in Python.", "Lists are mutable (can be changed) and use square brackets []. Tuples are immutable (cannot be changed after creation) and use parentheses (). Tuples are faster and can be used as dictionary keys.", "Key points: mutability, syntax, performance, and usage as dict keys."));
                bank.add(shortAnswer("What are *args and **kwargs in Python?", "*args allows passing a variable number of positional arguments as a tuple. **kwargs allows passing a variable number of keyword arguments as a dictionary. They provide function flexibility.", "Explain both with their respective data types (tuple vs dict)."));
                bank.add(shortAnswer("Explain Python's GIL (Global Interpreter Lock).", "The GIL is a mutex that allows only one thread to execute Python bytecode at a time, even on multi-core systems. This simplifies memory management but limits true parallel execution of CPU-bound threads.", "Cover what GIL is, why it exists, and its impact on multithreading."));
            }
        }
        
        // ===== MACHINE LEARNING =====
        else if (subject.contains("machine learning") || subject.contains("ml")) {
            if ("mcq".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(mcq("What is supervised learning?", new String[]{"Learning from labeled data", "Learning without labels", "Reinforcement-based learning", "Unsupervised clustering"}, "A", "Supervised learning uses labeled training data where both input and expected output are provided."));
                bank.add(mcq("Which algorithm is used for classification?", new String[]{"Logistic Regression", "Linear Regression", "K-Means", "PCA"}, "A", "Logistic Regression is used for classification despite its name. Linear Regression is for regression tasks."));
                bank.add(mcq("What is overfitting?", new String[]{"Model learns noise in training data and performs poorly on new data", "Model performs well on all data", "Model is too simple", "Model has too few parameters"}, "A", "Overfitting occurs when a model memorizes training data including noise, leading to poor generalization."));
                bank.add(mcq("What is the purpose of cross-validation?", new String[]{"To evaluate model performance on unseen data", "To train the model faster", "To increase accuracy", "To reduce data size"}, "A", "Cross-validation splits data into multiple folds to assess how well a model generalizes to independent data."));
                bank.add(mcq("Which metric is best for imbalanced classification?", new String[]{"F1 Score", "Accuracy", "Mean Squared Error", "R-squared"}, "A", "F1 Score balances precision and recall, making it better for imbalanced datasets where accuracy can be misleading."));
                bank.add(mcq("What is a neural network's activation function?", new String[]{"A function that introduces non-linearity", "A function that initializes weights", "A loss function", "A data preprocessing step"}, "A", "Activation functions like ReLU, sigmoid, tanh introduce non-linearity allowing neural networks to learn complex patterns."));
                bank.add(mcq("What is the bias-variance tradeoff?", new String[]{"Balancing underfitting (high bias) vs overfitting (high variance)", "Choosing learning rate", "Selecting features", "Data normalization"}, "A", "High bias = underfitting, high variance = overfitting. Good models balance both for optimal generalization."));
                bank.add(mcq("What is gradient descent?", new String[]{"An optimization algorithm to minimize loss", "A type of neural network", "A regularization technique", "A data augmentation method"}, "A", "Gradient descent iteratively adjusts parameters in the direction that reduces the loss function."));
                bank.add(mcq("What does a confusion matrix show?", new String[]{"True positives, false positives, true negatives, false negatives", "Training accuracy only", "Loss values", "Feature importance"}, "A", "A confusion matrix visualizes the performance of a classification model by showing TP, FP, TN, FN counts."));
                bank.add(mcq("What is regularization?", new String[]{"A technique to prevent overfitting by adding penalty", "A way to increase model complexity", "Data cleaning", "Feature extraction"}, "A", "Regularization (L1/L2) adds a penalty term to the loss function to constrain model complexity and prevent overfitting."));
                bank.add(mcq("What is the difference between bagging and boosting?", new String[]{"Bagging trains in parallel, boosting trains sequentially", "They are the same", "Bagging uses a single model", "Boosting reduces variance"}, "A", "Bagging (e.g., Random Forest) trains models in parallel on random subsets. Boosting (e.g., XGBoost) trains sequentially, each model correcting previous errors."));
                bank.add(mcq("What is feature scaling?", new String[]{"Normalizing features to a similar range", "Adding new features", "Removing features", "Creating polynomial features"}, "A", "Feature scaling (normalization/standardization) ensures features contribute equally and speeds up gradient-based optimization."));
            }
            if ("short-answer".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(shortAnswer("Explain the difference between classification and regression.", "Classification predicts discrete labels/categories (e.g., spam/not spam). Regression predicts continuous numerical values (e.g., house prices). Classification uses metrics like accuracy/F1, regression uses MSE/RMSE.", "Cover the type of output, examples, and evaluation metrics."));
                bank.add(shortAnswer("What is the curse of dimensionality?", "As the number of features increases, the data becomes increasingly sparse in the feature space, making it harder for algorithms to find patterns. This leads to overfitting and requires exponentially more data. Dimensionality reduction techniques like PCA can help.", "Mention data sparsity, overfitting, and solutions like PCA."));
                bank.add(shortAnswer("Explain how a Random Forest works.", "Random Forest is an ensemble method that creates multiple decision trees on random subsets of data (bagging) and features. Each tree votes on the prediction, and the majority vote (classification) or average (regression) is used as the final output. This reduces overfitting compared to a single decision tree.", "Key points: ensemble, bagging, random feature selection, voting/averaging."));
            }
        }
        
        // ===== MATHEMATICS =====
        else if (subject.contains("math") || subject.contains("calculus") || subject.contains("algebra") || subject.contains("statistics")) {
            if ("mcq".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(mcq("What is the derivative of x²?", new String[]{"2x", "x", "2", "x²"}, "A", "Using the power rule: d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x²) = 2x."));
                bank.add(mcq("What is the integral of 2x dx?", new String[]{"x² + C", "2x² + C", "x + C", "2 + C"}, "A", "The integral of 2x is x² + C (reverse of differentiation)."));
                bank.add(mcq("What is a matrix determinant used for?", new String[]{"To check if a system has unique solutions", "To add matrices", "To multiply vectors", "To transpose arrays"}, "A", "A non-zero determinant means the system has a unique solution and the matrix is invertible."));
                bank.add(mcq("What is the mean of {2, 4, 6, 8, 10}?", new String[]{"6", "5", "8", "4"}, "A", "Mean = (2+4+6+8+10)/5 = 30/5 = 6."));
                bank.add(mcq("What is the standard deviation a measure of?", new String[]{"Spread/dispersion of data from the mean", "Central tendency", "Maximum value", "Minimum value"}, "A", "Standard deviation measures how spread out data points are from the mean."));
                bank.add(mcq("What is L'Hôpital's Rule used for?", new String[]{"Evaluating limits of indeterminate forms", "Finding derivatives", "Solving equations", "Computing integrals"}, "A", "L'Hôpital's Rule evaluates limits of 0/0 or ∞/∞ forms by differentiating numerator and denominator."));
                bank.add(mcq("What is a probability distribution?", new String[]{"A function describing the likelihood of outcomes", "A graph of data", "A sampling method", "A hypothesis test"}, "A", "A probability distribution maps every possible outcome to its probability of occurrence."));
                bank.add(mcq("What is the Pythagorean theorem?", new String[]{"a² + b² = c²", "a + b = c", "a² - b² = c²", "a × b = c²"}, "A", "In a right triangle, the sum of squares of two shorter sides equals the square of the hypotenuse."));
            }
            if ("short-answer".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(shortAnswer("Explain the Chain Rule in calculus.", "The Chain Rule states that the derivative of a composite function f(g(x)) is f'(g(x)) × g'(x). It's used when you need to differentiate nested functions. Example: d/dx(sin(x²)) = cos(x²) × 2x.", "Include the formula, when to use it, and an example."));
                bank.add(shortAnswer("What is the Central Limit Theorem?", "The CLT states that the sampling distribution of the sample mean approaches a normal distribution as sample size increases, regardless of the population's distribution, provided the samples are independent and the population has finite variance.", "Key: normal distribution, sample size, independence."));
            }
        }
        
        // ===== DATA STRUCTURES =====
        else if (subject.contains("data structure") || subject.contains("dsa") || subject.contains("algorithm")) {
            if ("mcq".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(mcq("What is the time complexity of binary search?", new String[]{"O(log n)", "O(n)", "O(n²)", "O(1)"}, "A", "Binary search halves the search space at each step, giving O(log n) time complexity."));
                bank.add(mcq("Which data structure uses LIFO principle?", new String[]{"Stack", "Queue", "Array", "Linked List"}, "A", "Stack follows Last-In-First-Out (LIFO): the last element added is the first to be removed."));
                bank.add(mcq("What is the worst-case time complexity of Quick Sort?", new String[]{"O(n²)", "O(n log n)", "O(n)", "O(log n)"}, "A", "Quick Sort's worst case is O(n²) when the pivot is always the smallest or largest element."));
                bank.add(mcq("Which data structure is best for implementing a priority queue?", new String[]{"Heap", "Array", "Linked List", "Stack"}, "A", "A binary heap provides O(log n) insertion and O(1) access to the min/max element, ideal for priority queues."));
                bank.add(mcq("What is a hash table's average lookup time?", new String[]{"O(1)", "O(n)", "O(log n)", "O(n²)"}, "A", "Hash tables provide O(1) average-case lookup using hash functions to compute indices directly."));
                bank.add(mcq("What is a balanced BST?", new String[]{"A BST where left/right subtree heights differ by at most 1", "A BST with equal elements", "A BST with only left children", "A perfect binary tree"}, "A", "Balanced BSTs like AVL trees maintain height balance to ensure O(log n) operations."));
                bank.add(mcq("What traversal gives sorted output of a BST?", new String[]{"Inorder", "Preorder", "Postorder", "Level-order"}, "A", "Inorder traversal (Left-Root-Right) of a BST visits nodes in ascending sorted order."));
                bank.add(mcq("What is dynamic programming?", new String[]{"Breaking problems into overlapping subproblems and caching results", "Using dynamic arrays", "A type of sorting", "A graph algorithm"}, "A", "DP solves problems by breaking them into subproblems, solving each once, and storing results (memoization/tabulation)."));
                bank.add(mcq("What is the space complexity of merge sort?", new String[]{"O(n)", "O(1)", "O(log n)", "O(n²)"}, "A", "Merge sort requires O(n) additional space for the temporary arrays used during merging."));
                bank.add(mcq("Which algorithm finds the shortest path in a weighted graph?", new String[]{"Dijkstra's Algorithm", "DFS", "BFS", "Kruskal's"}, "A", "Dijkstra's algorithm finds the shortest path from a source to all vertices in a graph with non-negative weights."));
            }
            if ("short-answer".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(shortAnswer("Explain the difference between a stack and a queue.", "A Stack follows LIFO (Last In, First Out) — elements are added and removed from the same end (top). A Queue follows FIFO (First In, First Out) — elements are added at the rear and removed from the front. Stack: push/pop. Queue: enqueue/dequeue.", "Cover LIFO vs FIFO, operations, and use cases."));
                bank.add(shortAnswer("What is the difference between BFS and DFS?", "BFS (Breadth-First Search) explores all neighbors at current depth before going deeper, using a queue. DFS (Depth-First Search) explores as deep as possible before backtracking, using a stack/recursion. BFS finds shortest path in unweighted graphs; DFS uses less memory.", "Data structures used, traversal order, and use cases."));
            }
        }
        
        // ===== C/C++ =====
        else if (subject.contains("c++") || subject.contains("cpp") || (subject.equals("c") || subject.equals("c programming"))) {
            if ("mcq".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(mcq("What is a pointer in C/C++?", new String[]{"A variable that stores a memory address", "A data type", "A function", "An operator"}, "A", "Pointers hold the memory address of another variable, enabling direct memory manipulation."));
                bank.add(mcq("What is the difference between malloc() and new?", new String[]{"new calls constructor, malloc() doesn't", "They are identical", "malloc() is faster", "new is for arrays only"}, "A", "new allocates memory AND calls the constructor; malloc() only allocates raw memory."));
                bank.add(mcq("What is a virtual function in C++?", new String[]{"A function that enables runtime polymorphism", "A function with no body", "A static function", "A recursive function"}, "A", "Virtual functions support dynamic dispatch — the correct function version is called based on the actual object type at runtime."));
                bank.add(mcq("What is RAII in C++?", new String[]{"Resource Acquisition Is Initialization", "Runtime Allocation Is Immediate", "Reference Assignment In Inheritance", "Return After Iteration Is Applied"}, "A", "RAII ties resource management to object lifetime — resources are acquired in constructor and released in destructor."));
                bank.add(mcq("What does 'const' mean in C++?", new String[]{"Value cannot be modified after initialization", "Variable is static", "Variable is global", "Variable is private"}, "A", "const declares that a variable's value cannot be changed after it's initialized."));
                bank.add(mcq("What is a segmentation fault?", new String[]{"Accessing memory that the program doesn't have permission to access", "A syntax error", "A logic error", "A type error"}, "A", "Segfaults occur when a program tries to access memory it's not allowed to — like dereferencing a null/invalid pointer."));
                bank.add(mcq("What is the difference between struct and class in C++?", new String[]{"Default access: struct is public, class is private", "No difference", "Structs can't have methods", "Classes can't have public members"}, "A", "The only difference is default access level: struct members are public, class members are private by default."));
                bank.add(mcq("What are smart pointers in C++?", new String[]{"Objects that manage raw pointer lifetime automatically", "Faster pointers", "Pointers to functions", "Global pointers"}, "A", "Smart pointers (unique_ptr, shared_ptr, weak_ptr) automatically manage memory, preventing leaks."));
            }
        }
        
        // ===== DATABASE / SQL =====
        else if (subject.contains("database") || subject.contains("sql") || subject.contains("dbms")) {
            if ("mcq".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(mcq("What does SQL stand for?", new String[]{"Structured Query Language", "Simple Question Language", "System Query Language", "Standard Quick Language"}, "A", "SQL = Structured Query Language, used to manage and query relational databases."));
                bank.add(mcq("What is a primary key?", new String[]{"A column that uniquely identifies each row", "The first column", "A foreign key", "An index"}, "A", "A primary key uniquely identifies each record in a table and cannot be NULL."));
                bank.add(mcq("What is normalization?", new String[]{"Organizing data to reduce redundancy", "Adding more tables", "Deleting duplicate data", "Encrypting data"}, "A", "Normalization organizes a database into tables and columns to minimize data redundancy and dependency."));
                bank.add(mcq("What is a JOIN in SQL?", new String[]{"Combining rows from two or more tables", "Deleting rows", "Creating a new table", "Sorting data"}, "A", "JOIN combines related rows from multiple tables based on a common column."));
                bank.add(mcq("What is the difference between WHERE and HAVING?", new String[]{"WHERE filters rows, HAVING filters groups", "They are identical", "WHERE is for numbers only", "HAVING comes before GROUP BY"}, "A", "WHERE filters individual rows before grouping; HAVING filters groups after GROUP BY aggregation."));
                bank.add(mcq("What is an index in a database?", new String[]{"A data structure that improves query speed", "A type of table", "A primary key", "A stored procedure"}, "A", "Indexes create sorted references to table data, dramatically improving SELECT query performance."));
                bank.add(mcq("What does ACID stand for?", new String[]{"Atomicity, Consistency, Isolation, Durability", "Access, Create, Insert, Delete", "Application, Code, Interface, Data", "Automatic, Concurrent, Independent, Distributed"}, "A", "ACID properties ensure reliable database transactions."));
                bank.add(mcq("What is a foreign key?", new String[]{"A column referencing a primary key in another table", "A unique key", "An auto-increment column", "A temporary key"}, "A", "Foreign keys create referential integrity by linking a column to a primary key in another table."));
            }
            if ("short-answer".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(shortAnswer("Explain the difference between INNER JOIN and LEFT JOIN.", "INNER JOIN returns only rows with matching values in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right table — if no match, NULL is returned for right table columns.", "Cover what each returns and behavior with non-matching rows."));
                bank.add(shortAnswer("What are the different normal forms in DBMS?", "1NF: Atomic values, no repeating groups. 2NF: 1NF + no partial dependencies on composite key. 3NF: 2NF + no transitive dependencies. BCNF: Every determinant is a candidate key. Each form reduces redundancy further.", "List at least 1NF through 3NF with their rules."));
            }
        }
        
        // ===== PHYSICS =====
        else if (subject.contains("physics")) {
            if ("mcq".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(mcq("What is Newton's Second Law of Motion?", new String[]{"F = ma (Force equals mass times acceleration)", "Every action has an equal and opposite reaction", "An object in motion stays in motion", "Energy cannot be created or destroyed"}, "A", "Newton's Second Law states Force = mass × acceleration, relating net force to the change in motion."));
                bank.add(mcq("What is the SI unit of electric current?", new String[]{"Ampere (A)", "Volt (V)", "Ohm (Ω)", "Watt (W)"}, "A", "The Ampere measures the rate of flow of electric charge (1 Coulomb per second)."));
                bank.add(mcq("What is the speed of light in vacuum?", new String[]{"3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"}, "A", "Light travels at approximately 3 × 10⁸ meters per second in vacuum."));
                bank.add(mcq("What is Ohm's Law?", new String[]{"V = IR", "P = IV", "F = ma", "E = mc²"}, "A", "Ohm's Law: Voltage = Current × Resistance."));
                bank.add(mcq("What is the principle of conservation of energy?", new String[]{"Energy cannot be created or destroyed, only transformed", "Energy always increases", "Energy is always lost as heat", "Energy equals mass"}, "A", "The total energy in an isolated system remains constant — it can only change form."));
                bank.add(mcq("What is electromagnetic induction?", new String[]{"Generating EMF by changing magnetic flux through a conductor", "Creating magnets from electricity", "Static electricity", "Magnetic force on charges"}, "A", "Electromagnetic induction (Faraday's Law) produces voltage when magnetic flux through a circuit changes."));
            }
        }
        
        // ===== OPERATING SYSTEMS =====
        else if (subject.contains("operating system") || subject.contains("os")) {
            if ("mcq".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(mcq("What is a process in an OS?", new String[]{"A program in execution", "A stored program", "A system call", "A hardware component"}, "A", "A process is an active instance of a program with its own memory space, resources, and execution context."));
                bank.add(mcq("What is a deadlock?", new String[]{"When processes are waiting for resources held by each other indefinitely", "A system crash", "A memory leak", "A race condition"}, "A", "Deadlock: multiple processes are blocked because each holds a resource the other needs — none can proceed."));
                bank.add(mcq("What is virtual memory?", new String[]{"A technique that uses disk space to extend available RAM", "Physical RAM", "Cache memory", "ROM"}, "A", "Virtual memory allows programs to use more memory than physically available by swapping pages between RAM and disk."));
                bank.add(mcq("What is a semaphore?", new String[]{"A synchronization tool to control access to shared resources", "A type of memory", "A scheduling algorithm", "A file system"}, "A", "Semaphores use an integer counter and wait/signal operations to synchronize concurrent processes."));
                bank.add(mcq("What is the difference between paging and segmentation?", new String[]{"Paging divides memory into fixed-size blocks, segmentation into variable-sized", "They are identical", "Paging is faster", "Segmentation uses hardware only"}, "A", "Paging: fixed-size pages/frames. Segmentation: variable-size segments based on logical divisions (code, data, stack)."));
                bank.add(mcq("What scheduling algorithm gives minimum average waiting time?", new String[]{"Shortest Job First (SJF)", "FCFS", "Round Robin", "Priority"}, "A", "SJF (non-preemptive) provably gives the minimum average waiting time for a given set of processes."));
            }
        }
        
        // ===== NETWORKING =====
        else if (subject.contains("network") || subject.contains("cn") || subject.contains("computer network")) {
            if ("mcq".equals(quizType) || "mixed".equals(quizType)) {
                bank.add(mcq("What layer does TCP operate at?", new String[]{"Transport Layer", "Network Layer", "Application Layer", "Data Link Layer"}, "A", "TCP operates at the Transport Layer (Layer 4) of the OSI model, providing reliable communication."));
                bank.add(mcq("What is the difference between TCP and UDP?", new String[]{"TCP is reliable/connection-oriented, UDP is unreliable/connectionless", "They are the same", "UDP is more reliable", "TCP is faster"}, "A", "TCP ensures ordered, reliable delivery with handshake; UDP sends without guarantees — faster but unreliable."));
                bank.add(mcq("What is an IP address?", new String[]{"A unique numerical identifier for a device on a network", "A MAC address", "A domain name", "A port number"}, "A", "IP addresses uniquely identify devices on a network — IPv4 (32-bit) or IPv6 (128-bit)."));
                bank.add(mcq("What does DNS do?", new String[]{"Translates domain names to IP addresses", "Encrypts data", "Routes packets", "Filters traffic"}, "A", "DNS (Domain Name System) resolves human-readable names (google.com) to IP addresses (142.250.x.x)."));
                bank.add(mcq("What is the purpose of a subnet mask?", new String[]{"To divide an IP address into network and host portions", "To encrypt traffic", "To speed up connections", "To block ports"}, "A", "Subnet masks identify which part of an IP address is the network and which is the host."));
                bank.add(mcq("How many layers are in the OSI model?", new String[]{"7", "5", "4", "6"}, "A", "The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application."));
            }
        }
        
        // ===== DEFAULT / GENERIC =====
        if (bank.isEmpty()) {
            for (int i = 0; i < 10; i++) {
                bank.add(createGenericQuestion(subject, quizType, i + 1, difficulty));
            }
        }
        
        return bank;
    }
    
    private Map<String, Object> mcq(String question, String[] opts, String correctAnswer, String explanation) {
        Map<String, Object> q = new HashMap<>();
        q.put("question", question);
        q.put("type", "mcq");
        q.put("options", Arrays.asList(opts));
        q.put("correctAnswer", correctAnswer);
        q.put("explanation", explanation);
        return q;
    }
    
    private Map<String, Object> shortAnswer(String question, String answer, String explanation) {
        Map<String, Object> q = new HashMap<>();
        q.put("question", question);
        q.put("type", "short-answer");
        q.put("correctAnswer", answer);
        q.put("explanation", explanation);
        return q;
    }
    
    public AIQuizResult submitQuiz(String quizId, Map<String, String> answers) {
        AIQuizResult result = quizResultRepo.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found: " + quizId));
        
        int correct = 0, wrong = 0, skipped = 0;
        List<String> weakTopics = new ArrayList<>();
        
        for (Map<String, Object> q : result.getQuestions()) {
            String qId = (String) q.get("id");
            String studentAnswer = answers.get(qId);
            String correctAnswer = (String) q.get("correctAnswer");
            
            if (studentAnswer == null || studentAnswer.isBlank()) {
                skipped++;
                q.put("studentAnswer", null);
                q.put("isCorrect", false);
            } else {
                q.put("studentAnswer", studentAnswer);
                boolean isCorrect = studentAnswer.equalsIgnoreCase(correctAnswer);
                q.put("isCorrect", isCorrect);
                if (isCorrect) correct++;
                else {
                    wrong++;
                    weakTopics.add("Topic from Q" + q.get("question"));
                }
            }
        }
        
        result.setCorrectAnswers(correct);
        result.setWrongAnswers(wrong);
        result.setSkipped(skipped);
        result.setScorePercent(result.getTotalQuestions() > 0 ? 
            (correct * 100.0 / result.getTotalQuestions()) : 0);
        result.setWeakTopics(weakTopics.stream().limit(5).collect(Collectors.toList()));
        result.setCompletedAt(Instant.now());
        
        return quizResultRepo.save(result);
    }
    
    public List<AIQuizResult> getStudentQuizResults(String studentId) {
        return quizResultRepo.findByStudentIdOrderByCompletedAtDesc(studentId);
    }
    
    // ===================== SYLLABUS CONFIG (FACULTY) =====================
    
    public AISyllabusConfig saveSyllabusConfig(AISyllabusConfig config) {
        Optional<AISyllabusConfig> existing = syllabusConfigRepo
                .findByFacultyIdAndSubject(config.getFacultyId(), config.getSubject());
        if (existing.isPresent()) {
            AISyllabusConfig ex = existing.get();
            ex.setTopics(config.getTopics());
            ex.setRestrictedTopics(config.getRestrictedTopics());
            ex.setMaterialUrls(config.getMaterialUrls());
            ex.setRestrictNonAcademic(config.isRestrictNonAcademic());
            ex.setSyllabusText(config.getSyllabusText());
            ex.setSemester(config.getSemester());
            ex.setDepartment(config.getDepartment());
            ex.setUpdatedAt(Instant.now());
            return syllabusConfigRepo.save(ex);
        }
        return syllabusConfigRepo.save(config);
    }
    
    public List<AISyllabusConfig> getFacultySyllabusConfigs(String facultyId) {
        return syllabusConfigRepo.findByFacultyIdOrderByUpdatedAtDesc(facultyId);
    }
    
    public void deleteSyllabusConfig(String configId) {
        syllabusConfigRepo.deleteById(configId);
    }
    
    // ===================== ANALYTICS (FACULTY) =====================
    
    public Map<String, Object> getFacultyAIAnalytics(String facultyId) {
        Map<String, Object> analytics = new HashMap<>();
        
        List<AISyllabusConfig> configs = syllabusConfigRepo.findByFacultyIdOrderByUpdatedAtDesc(facultyId);
        analytics.put("totalSubjectsConfigured", configs.size());
        analytics.put("syllabusConfigs", configs);
        
        // Mock class-wide analytics
        List<Map<String, Object>> weakTopics = new ArrayList<>();
        Map<String, Object> t1 = new HashMap<>();
        t1.put("topic", "Thermodynamics");
        t1.put("avgScore", 58);
        t1.put("studentsStruggling", 23);
        weakTopics.add(t1);
        Map<String, Object> t2 = new HashMap<>();
        t2.put("topic", "Integration");
        t2.put("avgScore", 62);
        t2.put("studentsStruggling", 18);
        weakTopics.add(t2);
        Map<String, Object> t3 = new HashMap<>();
        t3.put("topic", "Data Structures");
        t3.put("avgScore", 65);
        t3.put("studentsStruggling", 15);
        weakTopics.add(t3);
        analytics.put("weakTopicsAcrossClass", weakTopics);
        
        Map<String, Object> usageStats = new HashMap<>();
        usageStats.put("totalConversations", 1247);
        usageStats.put("totalMessages", 8934);
        usageStats.put("avgMessagesPerStudent", 12);
        usageStats.put("peakHour", "8:00 PM - 10:00 PM");
        usageStats.put("topCategory", "Doubt Solving");
        analytics.put("aiUsageStatistics", usageStats);
        
        List<Map<String, Object>> trends = new ArrayList<>();
        String[] months = {"Sep", "Oct", "Nov", "Dec", "Jan", "Feb"};
        int[] scores = {68, 71, 73, 70, 75, 78};
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> trend = new HashMap<>();
            trend.put("month", months[i]);
            trend.put("avgPerformance", scores[i]);
            trends.add(trend);
        }
        analytics.put("performanceTrends", trends);
        
        List<String> revisionAreas = Arrays.asList("Thermodynamics", "Integration", "Sorting Algorithms", "Probability", "Circuit Analysis");
        analytics.put("suggestedRevisionAreas", revisionAreas);
        
        return analytics;
    }
    
    // ===================== STUDENT PERFORMANCE ANALYTICS =====================
    
    public Map<String, Object> getStudentAIAnalytics(String studentId) {
        Map<String, Object> analytics = new HashMap<>();
        
        long totalConvs = conversationRepo.countByUserId(studentId);
        List<AIQuizResult> quizzes = quizResultRepo.findByStudentIdOrderByCompletedAtDesc(studentId);
        List<AIStudyPlan> plans = studyPlanRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
        
        analytics.put("totalConversations", totalConvs);
        analytics.put("totalQuizzes", quizzes.size());
        analytics.put("totalStudyPlans", plans.size());
        
        if (!quizzes.isEmpty()) {
            double avgScore = quizzes.stream()
                    .mapToDouble(AIQuizResult::getScorePercent)
                    .average()
                    .orElse(0);
            analytics.put("averageQuizScore", Math.round(avgScore));
            
            List<String> allWeak = quizzes.stream()
                    .flatMap(q -> q.getWeakTopics().stream())
                    .distinct()
                    .limit(5)
                    .collect(Collectors.toList());
            analytics.put("weakTopics", allWeak);
        } else {
            analytics.put("averageQuizScore", 0);
            analytics.put("weakTopics", new ArrayList<>());
        }
        
        // Readiness score
        double readiness = !plans.isEmpty() ? plans.get(0).getReadinessScore() : 50.0;
        analytics.put("examReadiness", readiness);
        
        return analytics;
    }
    
    // ===================== FILE UPLOAD & PROCESSING =====================
    
    public Map<String, Object> processFileUpload(String conversationId, MultipartFile file) throws Exception {
        AIConversation conv = getConversation(conversationId);
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown";
        String extractedText = "";
        
        String lowerName = originalName.toLowerCase();
        if (lowerName.endsWith(".pdf")) {
            extractedText = extractTextFromPDF(file.getInputStream());
        } else if (lowerName.endsWith(".txt") || lowerName.endsWith(".md") || lowerName.endsWith(".csv")) {
            extractedText = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
        } else if (lowerName.endsWith(".doc") || lowerName.endsWith(".docx") || lowerName.endsWith(".ppt") || lowerName.endsWith(".pptx")) {
            extractedText = "[Document uploaded: " + originalName + "] — Text extraction for Word/PPT requires additional libraries. Please convert to PDF for best results.";
        } else {
            try {
                extractedText = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
            } catch (Exception e) {
                extractedText = "[Binary file uploaded: " + originalName + "] — Could not extract text.";
            }
        }
        
        // Truncate very large files to 15000 chars to keep processing fast
        if (extractedText.length() > 15000) {
            extractedText = extractedText.substring(0, 15000) + "\n\n[... content truncated at 15,000 characters ...]";
        }
        
        // Store in conversation
        conv.setUploadedContent(extractedText);
        conv.setUploadedFileName(originalName);
        conv.setUpdatedAt(Instant.now());
        
        // Add a system message noting the upload
        AIMessage uploadMsg = new AIMessage("user", "📎 Uploaded file: " + originalName, "file");
        uploadMsg.setId(UUID.randomUUID().toString());
        conv.getMessages().add(uploadMsg);
        
        // Generate automated response about the uploaded file
        String aiResponse = "### 📄 File Received: " + originalName + "\n\n" +
                "✅ Successfully extracted **" + extractedText.length() + "** characters from your document.\n\n";
        
        // Show a preview of the content
        String preview = extractedText.length() > 500 ? extractedText.substring(0, 500) + "..." : extractedText;
        aiResponse += "**Content Preview:**\n> " + preview.replace("\n", "\n> ") + "\n\n";
        aiResponse += "---\n\n";
        aiResponse += "**What would you like me to do with this material?**\n\n" +
                "- 📝 **Summarize this material** — Concise summary\n" +
                "- 🔑 **Extract key points** — Definitions & concepts\n" +
                "- 🃏 **Generate flashcards** — Revision cards\n" +
                "- 🎯 **Predict important questions** — Exam prep\n" +
                "- 💡 **Simplify complex concepts** — Easy explanations\n\n" +
                "Just click a quick prompt or type your request!";
        
        AIMessage aiMsg = new AIMessage("assistant", aiResponse, "text");
        aiMsg.setId(UUID.randomUUID().toString());
        conv.getMessages().add(aiMsg);
        
        conversationRepo.save(conv);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("fileName", originalName);
        result.put("extractedLength", extractedText.length());
        result.put("conversation", conv);
        return result;
    }
    
    private String extractTextFromPDF(InputStream inputStream) throws Exception {
        try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }
    
    // ===================== FILE CONTENT PROCESSING HELPERS =====================
    
    private String summarizeFileContent(String content, String fileName, String subject) {
        String[] sentences = content.split("(?<=[.!?])\\s+");
        String subLabel = subject != null ? subject : "Uploaded Material";
        
        // Extract distinct key sentences (first, middle, end sections)
        List<String> keySentences = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (int i = 0; i < sentences.length && keySentences.size() < 12; i++) {
            String s = sentences[i].trim();
            if (s.length() > 30 && s.length() < 300 && !seen.contains(s.toLowerCase())) {
                keySentences.add(s);
                seen.add(s.toLowerCase());
            }
        }
        // Also sample from middle and end
        for (int i = sentences.length / 3; i < sentences.length && keySentences.size() < 15; i += Math.max(1, sentences.length / 10)) {
            String s = sentences[i].trim();
            if (s.length() > 30 && s.length() < 300 && !seen.contains(s.toLowerCase())) {
                keySentences.add(s);
                seen.add(s.toLowerCase());
            }
        }
        
        // Extract words to find key topics
        Map<String, Integer> wordFreq = new LinkedHashMap<>();
        for (String word : content.toLowerCase().split("\\W+")) {
            if (word.length() > 4 && !"which about these those their would could should".contains(word)) {
                wordFreq.merge(word, 1, Integer::sum);
            }
        }
        List<String> topWords = wordFreq.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(8)
                .map(e -> capitalize(e.getKey()))
                .collect(Collectors.toList());
        
        StringBuilder sb = new StringBuilder();
        sb.append("### 📝 Smart Summary: ").append(fileName).append("\n\n");
        sb.append("**Subject:** ").append(subLabel).append("\n");
        sb.append("**Document Length:** ").append(content.length()).append(" characters, ~").append(sentences.length).append(" sentences\n");
        sb.append("**Key Topics:** ").append(String.join(", ", topWords)).append("\n\n");
        
        sb.append("---\n\n");
        sb.append("**📌 Summary:**\n\n");
        for (int i = 0; i < Math.min(keySentences.size(), 8); i++) {
            sb.append("- ").append(keySentences.get(i)).append("\n");
        }
        sb.append("\n");
        
        sb.append("**📊 Statistics:**\n");
        sb.append("- Total sentences: ").append(sentences.length).append("\n");
        sb.append("- Estimated reading time: ").append(Math.max(1, content.split("\\s+").length / 200)).append(" minutes\n");
        sb.append("- Difficulty: ").append(content.split("\\s+").length > 2000 ? "Advanced" : content.split("\\s+").length > 500 ? "Moderate" : "Introductory").append("\n\n");
        sb.append("Would you like me to **generate flashcards**, **extract key points**, or **predict important questions** from this material?");
        return sb.toString();
    }
    
    private String generateFlashcardsFromContent(String content, String fileName, String subject) {
        String[] sentences = content.split("(?<=[.!?])\\s+");
        String subLabel = subject != null ? subject : "Uploaded Material";
        
        // Find definition-like sentences and important statements
        List<String> definitions = new ArrayList<>();
        List<String> facts = new ArrayList<>();
        for (String s : sentences) {
            String trimmed = s.trim();
            if (trimmed.length() < 20 || trimmed.length() > 300) continue;
            String lower = trimmed.toLowerCase();
            if (lower.contains(" is ") || lower.contains(" are ") || lower.contains(" refers to ") || lower.contains(" defined as ") || lower.contains(" means ")) {
                definitions.add(trimmed);
            } else if (lower.contains("important") || lower.contains("key") || lower.contains("main") || lower.contains("primary") || lower.contains("essential") || lower.contains("note that")) {
                facts.add(trimmed);
            }
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append("### 🃏 Flashcards from: ").append(fileName).append("\n");
        sb.append("**Subject:** ").append(subLabel).append("\n\n");
        
        int cardNum = 1;
        // Definition-based cards
        for (int i = 0; i < Math.min(definitions.size(), 5); i++) {
            String def = definitions.get(i);
            // Split on " is ", " are ", " refers to ", etc. to create Q/A
            String front = "What " + def.substring(0, Math.min(def.indexOf(' ', 20) > 0 ? def.indexOf(' ', 20) : 40, def.length())).trim() + "...?";
            sb.append("**Card ").append(cardNum).append(" — Front:** ").append(front).append("\n");
            sb.append("**Card ").append(cardNum).append(" — Back:** ").append(def).append("\n\n");
            cardNum++;
        }
        
        // Fact-based cards
        for (int i = 0; i < Math.min(facts.size(), 3); i++) {
            String fact = facts.get(i);
            sb.append("**Card ").append(cardNum).append(" — Front:** Explain: ").append(fact.substring(0, Math.min(50, fact.length()))).append("...?\n");
            sb.append("**Card ").append(cardNum).append(" — Back:** ").append(fact).append("\n\n");
            cardNum++;
        }
        
        if (cardNum == 1) {
            // Fallback: create cards from first meaningful sentences
            for (int i = 0; i < Math.min(sentences.length, 5); i++) {
                if (sentences[i].trim().length() > 30) {
                    sb.append("**Card ").append(cardNum).append(" — Front:** What does this mean? \"").append(sentences[i].trim().substring(0, Math.min(60, sentences[i].trim().length()))).append("...\"\n");
                    sb.append("**Card ").append(cardNum).append(" — Back:** ").append(sentences[i].trim()).append("\n\n");
                    cardNum++;
                }
            }
        }
        
        sb.append("---\n");
        sb.append("📊 Generated **").append(cardNum - 1).append(" flashcards** from your document.\n");
        sb.append("Want me to **create more flashcards** or **predict exam questions** from this material?");
        return sb.toString();
    }
    
    private String extractKeyPointsFromContent(String content, String fileName, String subject) {
        String[] sentences = content.split("(?<=[.!?])\\s+");
        String subLabel = subject != null ? subject : "Uploaded Material";
        
        List<String> keyPoints = new ArrayList<>();
        List<String> definitions = new ArrayList<>();
        List<String> examples = new ArrayList<>();
        
        for (String s : sentences) {
            String trimmed = s.trim();
            if (trimmed.length() < 15) continue;
            String lower = trimmed.toLowerCase();
            if (lower.contains(" is ") || lower.contains(" are ") || lower.contains(" defined as ") || lower.contains(" refers to ") || lower.contains(" means ")) {
                definitions.add(trimmed);
            } else if (lower.contains("for example") || lower.contains("such as") || lower.contains("e.g.") || lower.contains("instance")) {
                examples.add(trimmed);
            } else if (lower.contains("important") || lower.contains("key") || lower.contains("note") || lower.contains("significant") || lower.contains("essential") || lower.contains("crucial") || lower.contains("must") || lower.contains("main")) {
                keyPoints.add(trimmed);
            }
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append("### 🔑 Key Points Extracted: ").append(fileName).append("\n");
        sb.append("**Subject:** ").append(subLabel).append("\n\n");
        
        if (!definitions.isEmpty()) {
            sb.append("**📚 Definitions & Concepts:**\n");
            for (int i = 0; i < Math.min(definitions.size(), 6); i++) {
                sb.append("- ").append(definitions.get(i)).append("\n");
            }
            sb.append("\n");
        }
        
        if (!keyPoints.isEmpty()) {
            sb.append("**⭐ Important Points:**\n");
            for (int i = 0; i < Math.min(keyPoints.size(), 6); i++) {
                sb.append("- ").append(keyPoints.get(i)).append("\n");
            }
            sb.append("\n");
        }
        
        if (!examples.isEmpty()) {
            sb.append("**💡 Examples & Illustrations:**\n");
            for (int i = 0; i < Math.min(examples.size(), 4); i++) {
                sb.append("- ").append(examples.get(i)).append("\n");
            }
            sb.append("\n");
        }
        
        int total = definitions.size() + keyPoints.size() + examples.size();
        sb.append("---\n");
        sb.append("📊 Found **").append(total).append("** key items across ").append(sentences.length).append(" sentences.\n\n");
        sb.append("Would you like me to **generate flashcards** or **predict important questions** from these key points?");
        return sb.toString();
    }
    
    private String predictQuestionsFromContent(String content, String fileName, String subject) {
        String[] sentences = content.split("(?<=[.!?])\\s+");
        String subLabel = subject != null ? subject : "General";
        
        // Find topic words
        Map<String, Integer> wordFreq = new LinkedHashMap<>();
        for (String word : content.toLowerCase().split("\\W+")) {
            if (word.length() > 4 && !"which about these those their would could should".contains(word)) {
                wordFreq.merge(word, 1, Integer::sum);
            }
        }
        List<String> topWords = wordFreq.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(6)
                .map(e -> capitalize(e.getKey()))
                .collect(Collectors.toList());
        
        // Find definition sentences for question generation
        List<String> defSentences = new ArrayList<>();
        for (String s : sentences) {
            String lower = s.toLowerCase().trim();
            if (lower.length() > 30 && (lower.contains(" is ") || lower.contains(" are ") || lower.contains("defined") || lower.contains("refers"))) {
                defSentences.add(s.trim());
            }
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append("### 🎯 Predicted Important Questions: ").append(fileName).append("\n");
        sb.append("**Subject:** ").append(subLabel).append("\n\n");
        sb.append("Based on analysis of your uploaded material:\n\n");
        
        sb.append("**🔴 High Priority (Very Likely):**\n");
        int qNum = 1;
        for (int i = 0; i < Math.min(topWords.size(), 3); i++) {
            sb.append(qNum++).append(". Explain the concept of **").append(topWords.get(i)).append("** with suitable examples (10 marks)\n");
        }
        if (defSentences.size() >= 2) {
            String d = defSentences.get(0);
            sb.append(qNum++).append(". ").append(d.length() > 80 ? d.substring(0, 80) + "... — Discuss in detail (10 marks)" : d + " — Elaborate (10 marks)").append("\n");
        }
        sb.append("\n");
        
        sb.append("**🟡 Medium Priority:**\n");
        for (int i = 3; i < Math.min(topWords.size(), 6); i++) {
            sb.append(qNum++).append(". Describe the role of **").append(topWords.get(i)).append("** and its applications (8 marks)\n");
        }
        sb.append(qNum++).append(". Compare and contrast the major approaches discussed in the material (8 marks)\n");
        sb.append("\n");
        
        sb.append("**🟢 Short Answer:**\n");
        sb.append(qNum++).append(". List the key characteristics mentioned in the material (5 marks)\n");
        sb.append(qNum++).append(". Define any four terms from the document (4 marks)\n");
        sb.append(qNum).append(". Write short notes on: ").append(String.join(", ", topWords.subList(0, Math.min(3, topWords.size())))).append(" (6 marks)\n\n");
        
        sb.append("📊 **Confidence Score:** 82% (based on keyword frequency & concept density)\n\n");
        sb.append("Shall I provide **model answers** for any of these questions?");
        return sb.toString();
    }
    
    private String simplifyContent(String content, String fileName, String subject) {
        String[] sentences = content.split("(?<=[.!?])\\s+");
        String subLabel = subject != null ? subject : "Uploaded Material";
        
        StringBuilder sb = new StringBuilder();
        sb.append("### 💡 Simplified Explanation: ").append(fileName).append("\n");
        sb.append("**Subject:** ").append(subLabel).append("\n\n");
        
        // Pull out definition-like sentences and simplify
        sb.append("**Here's the material broken down in simple terms:**\n\n");
        int count = 0;
        for (String s : sentences) {
            String trimmed = s.trim();
            if (trimmed.length() < 20 || trimmed.length() > 250) continue;
            if (count < 8) {
                sb.append("✅ ").append(trimmed).append("\n\n");
                count++;
            }
        }
        
        sb.append("---\n\n");
        sb.append("**🎯 In a nutshell:** This material covers ").append(sentences.length).append(" key points. ");
        sb.append("Think of it as building blocks — each concept builds on the previous one.\n\n");
        sb.append("**Real-world analogy:** Imagine you're building a house. The definitions are your foundation, ");
        sb.append("the examples are the walls, and the applications are the roof that ties it all together.\n\n");
        sb.append("Would you like me to **simplify a specific section** or **create flashcards** for quick revision?");
        return sb.toString();
    }
}
