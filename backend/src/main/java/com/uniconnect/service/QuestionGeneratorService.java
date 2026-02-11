package com.uniconnect.service;

import com.uniconnect.model.ExamQuestion;
import com.uniconnect.repository.ExamQuestionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;

/**
 * AI-style question generator that creates exam questions from a syllabus/description.
 * Extracts key topics, concepts, and terms, then generates MCQ, DESCRIPTIVE, or CODING
 * questions using intelligent templates.
 */
@Service
public class QuestionGeneratorService {

    private final ExamQuestionRepository questionRepository;
    private final Random random = new Random();

    public QuestionGeneratorService(ExamQuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    /**
     * Generate questions from syllabus content.
     *
     * @param syllabus        The syllabus or description text
     * @param subject         The subject name
     * @param questionType    MCQ, DESCRIPTIVE, or MIXED
     * @param count           Number of questions to generate
     * @param difficulty      EASY, MEDIUM, HARD, or MIXED
     * @param marksPerQuestion Marks per question
     * @param facultyId       Faculty who is generating
     * @return List of generated and saved ExamQuestion objects
     */
    public List<ExamQuestion> generateQuestions(String syllabus, String subject, String questionType,
                                                 int count, String difficulty, int marksPerQuestion,
                                                 String facultyId) {
        // 1. Extract topics, concepts, and key terms from syllabus
        List<Topic> topics = extractTopics(syllabus);

        if (topics.isEmpty()) {
            // Fallback: treat entire syllabus as a single topic
            topics.add(new Topic(subject != null ? subject : "General", syllabus, List.of()));
        }

        // 2. Generate questions round-robin across topics
        List<ExamQuestion> generated = new ArrayList<>();
        int topicIdx = 0;

        for (int i = 0; i < count; i++) {
            Topic topic = topics.get(topicIdx % topics.size());
            topicIdx++;

            String diff = "MIXED".equals(difficulty)
                    ? List.of("EASY", "MEDIUM", "HARD").get(random.nextInt(3))
                    : difficulty;

            String qType = "MIXED".equals(questionType)
                    ? (random.nextBoolean() ? "MCQ" : "DESCRIPTIVE")
                    : questionType;

            ExamQuestion q = "MCQ".equals(qType)
                    ? generateMCQ(topic, diff, subject, marksPerQuestion, facultyId)
                    : generateDescriptive(topic, diff, subject, marksPerQuestion, facultyId);

            // Save to DB
            ExamQuestion saved = questionRepository.save(q);
            generated.add(saved);
        }

        return generated;
    }

    // ─── TOPIC EXTRACTION ─────────────────────────────────────

    private List<Topic> extractTopics(String syllabus) {
        List<Topic> topics = new ArrayList<>();
        if (syllabus == null || syllabus.isBlank()) return topics;

        // Split by common delimiters: newlines, semicolons, numbered lists, bullet points
        String[] segments = syllabus.split("(?m)(\\r?\\n|;|\\d+[.)\\s]|•|\\*|\\-\\s)");

        for (String segment : segments) {
            String trimmed = segment.trim();
            if (trimmed.length() < 3) continue;

            // Extract key terms (capitalize words, technical terms)
            List<String> keyTerms = extractKeyTerms(trimmed);

            if (!keyTerms.isEmpty() || trimmed.length() > 10) {
                topics.add(new Topic(trimmed, trimmed, keyTerms));
            }
        }

        // If too few topics from splitting, also mine for compound concepts
        if (topics.size() < 3) {
            List<String> allTerms = extractKeyTerms(syllabus);
            // Group related terms into synthetic topics
            for (int i = 0; i < allTerms.size(); i += 2) {
                String name = allTerms.get(i);
                if (i + 1 < allTerms.size()) name += " and " + allTerms.get(i + 1);
                List<String> subTerms = new ArrayList<>();
                subTerms.add(allTerms.get(i));
                if (i + 1 < allTerms.size()) subTerms.add(allTerms.get(i + 1));
                topics.add(new Topic(name, syllabus, subTerms));
            }
        }

        return topics;
    }

    private List<String> extractKeyTerms(String text) {
        Set<String> terms = new LinkedHashSet<>();

        // Match multi-word capitalized phrases (e.g., "Binary Search Tree")
        Matcher capMatcher = Pattern.compile("\\b([A-Z][a-zA-Z]+(?:\\s+[A-Z][a-zA-Z]+)+)\\b").matcher(text);
        while (capMatcher.find()) {
            terms.add(capMatcher.group(1));
        }

        // Match technical terms (words with special patterns)
        Matcher techMatcher = Pattern.compile("\\b([A-Z][a-z]{2,}(?:[A-Z][a-z]+)*)\\b").matcher(text);
        while (techMatcher.find()) {
            String term = techMatcher.group(1);
            if (!STOP_WORDS.contains(term.toLowerCase())) {
                terms.add(term);
            }
        }

        // Match quoted terms
        Matcher quoteMatcher = Pattern.compile("[\"'`]([^\"'`]+)[\"'`]").matcher(text);
        while (quoteMatcher.find()) {
            terms.add(quoteMatcher.group(1));
        }

        // Also grab longer lowercase technical words
        for (String word : text.split("\\s+")) {
            String clean = word.replaceAll("[^a-zA-Z]", "");
            if (clean.length() >= 5 && !STOP_WORDS.contains(clean.toLowerCase())) {
                terms.add(clean);
            }
        }

        return new ArrayList<>(terms);
    }

    // ─── MCQ GENERATION ───────────────────────────────────────

    private ExamQuestion generateMCQ(Topic topic, String difficulty, String subject,
                                      int marks, String facultyId) {
        ExamQuestion q = new ExamQuestion();
        q.setQuestionType("MCQ");
        q.setSubject(subject);
        q.setDifficulty(difficulty);
        q.setMarks(marks);
        q.setCreatedBy(facultyId);
        q.setCreatedAt(Instant.now());
        q.setUpdatedAt(Instant.now());
        q.setActive(true);

        // Pick a question template based on difficulty and topic
        MCQData mcqData = createMCQFromTopic(topic, difficulty);
        q.setQuestionText(mcqData.question);
        q.setOptions(mcqData.options);
        q.setCorrectAnswer(mcqData.correctAnswer);
        q.setExplanation(mcqData.explanation);
        q.setOptionCount(mcqData.options.size());
        q.setUnit(topic.name.length() > 50 ? topic.name.substring(0, 50) : topic.name);

        return q;
    }

    private MCQData createMCQFromTopic(Topic topic, String difficulty) {
        List<String> terms = topic.keyTerms;
        String topicName = topic.name;

        // Select from multiple template strategies
        int strategy = random.nextInt(10);

        if (!terms.isEmpty()) {
            String mainTerm = terms.get(random.nextInt(terms.size()));

            switch (strategy) {
                case 0: return definitionQuestion(mainTerm, topicName, terms, difficulty);
                case 1: return purposeQuestion(mainTerm, topicName, terms);
                case 2: return characteristicQuestion(mainTerm, topicName, terms);
                case 3: return notRelatedQuestion(mainTerm, topicName, terms);
                case 4: return bestDescribesQuestion(mainTerm, topicName, terms, difficulty);
                case 5: return applicationQuestion(mainTerm, topicName, terms);
                case 6: return trueStatementQuestion(mainTerm, topicName, terms);
                case 7: return comparisonQuestion(mainTerm, topicName, terms);
                case 8: return componentQuestion(mainTerm, topicName, terms);
                default: return conceptQuestion(mainTerm, topicName, terms, difficulty);
            }
        }

        // Fallback for topics without extracted terms
        return fallbackMCQ(topicName, difficulty);
    }

    private MCQData definitionQuestion(String term, String topic, List<String> terms, String diff) {
        String q = "What is the primary definition or meaning of '" + term + "' in the context of " + topic + "?";
        String correct = "A concept related to " + topic + " that involves " + term.toLowerCase() + " principles";
        List<String> options = new ArrayList<>();
        options.add(correct);
        options.add("A general-purpose method unrelated to " + topic);
        options.add("An outdated approach no longer used in " + topic);
        String other = terms.size() > 1 ? terms.get((terms.indexOf(term) + 1) % terms.size()) : "external systems";
        options.add("A subset of " + other + " with no connection to " + term);
        Collections.shuffle(options, random);
        String ans = String.valueOf((char) ('A' + options.indexOf(correct)));
        return new MCQData(q, options, ans,
                term + " is fundamentally associated with " + topic + " as a core concept.");
    }

    private MCQData purposeQuestion(String term, String topic, List<String> terms) {
        String q = "What is the main purpose of " + term + " in " + topic + "?";
        String correct = "To provide essential functionality for " + topic.toLowerCase() + " operations involving " + term.toLowerCase();
        List<String> options = new ArrayList<>();
        options.add(correct);
        options.add("To replace all other components in " + topic);
        options.add("To serve only as a backup mechanism");
        options.add("To handle unrelated external processes");
        Collections.shuffle(options, random);
        return new MCQData(q, options, String.valueOf((char) ('A' + options.indexOf(correct))),
                term + " is primarily used for core operations in " + topic + ".");
    }

    private MCQData characteristicQuestion(String term, String topic, List<String> terms) {
        String q = "Which of the following is a key characteristic of " + term + "?";
        String correct = "It is integral to " + topic.toLowerCase() + " and supports related processes";
        List<String> options = new ArrayList<>();
        options.add(correct);
        options.add("It operates independently without any dependencies");
        options.add("It is only applicable in theoretical scenarios");
        options.add("It requires manual intervention for every operation");
        Collections.shuffle(options, random);
        return new MCQData(q, options, String.valueOf((char) ('A' + options.indexOf(correct))),
                "A key characteristic of " + term + " is its integral role in " + topic + ".");
    }

    private MCQData notRelatedQuestion(String term, String topic, List<String> terms) {
        String q = "Which of the following is NOT directly related to " + term + " in " + topic + "?";
        String correct = "Unrelated external process management";
        List<String> options = new ArrayList<>();
        options.add("Core " + topic.toLowerCase() + " operations");
        String termRelated = terms.size() > 1 ? terms.get((terms.indexOf(term) + 1) % terms.size()) : topic;
        options.add("Integration with " + termRelated);
        options.add("Fundamental principles of " + term);
        options.add(correct);
        Collections.shuffle(options, random);
        return new MCQData(q, options, String.valueOf((char) ('A' + options.indexOf(correct))),
                "External process management is not directly related to " + term + " in the context of " + topic + ".");
    }

    private MCQData bestDescribesQuestion(String term, String topic, List<String> terms, String diff) {
        String q = "Which statement best describes " + term + " as used in " + topic + "?";
        String correct = term + " is a fundamental concept in " + topic + " that enables key operations and processes";
        List<String> options = new ArrayList<>();
        options.add(correct);
        options.add(term + " is used exclusively for error handling");
        options.add(term + " was deprecated and is no longer in use");
        options.add(term + " only works with legacy systems");
        Collections.shuffle(options, random);
        return new MCQData(q, options, String.valueOf((char) ('A' + options.indexOf(correct))),
                term + " is correctly described as a fundamental concept in " + topic + ".");
    }

    private MCQData applicationQuestion(String term, String topic, List<String> terms) {
        String q = "In which scenario would " + term + " be most applicable within " + topic + "?";
        String correct = "When implementing core " + topic.toLowerCase() + " functionality that requires " + term.toLowerCase();
        List<String> options = new ArrayList<>();
        options.add(correct);
        options.add("When performing tasks unrelated to " + topic);
        options.add("Only during system initialization");
        options.add("Never, as it has been replaced by newer approaches");
        Collections.shuffle(options, random);
        return new MCQData(q, options, String.valueOf((char) ('A' + options.indexOf(correct))),
                term + " is most applicable when implementing core functionality in " + topic + ".");
    }

    private MCQData trueStatementQuestion(String term, String topic, List<String> terms) {
        String q = "Which of the following statements about " + term + " in " + topic + " is TRUE?";
        String correct = term + " plays a significant role in the overall " + topic.toLowerCase() + " system";
        List<String> options = new ArrayList<>();
        options.add(correct);
        options.add(term + " has no practical applications");
        options.add(term + " can only be used in isolation");
        options.add(term + " contradicts the principles of " + topic);
        Collections.shuffle(options, random);
        return new MCQData(q, options, String.valueOf((char) ('A' + options.indexOf(correct))),
                "The true statement is that " + term + " plays a significant role in " + topic + ".");
    }

    private MCQData comparisonQuestion(String term, String topic, List<String> terms) {
        String other = terms.size() > 1 ? terms.get((terms.indexOf(term) + 1) % terms.size()) : "traditional methods";
        String q = "How does " + term + " differ from " + other + " in " + topic + "?";
        String correct = term + " and " + other + " serve different but complementary roles in " + topic;
        List<String> options = new ArrayList<>();
        options.add(correct);
        options.add("They are exactly the same concept");
        options.add(term + " completely replaces " + other);
        options.add("Neither has any relevance to " + topic);
        Collections.shuffle(options, random);
        return new MCQData(q, options, String.valueOf((char) ('A' + options.indexOf(correct))),
                term + " and " + other + " serve complementary but distinct roles.");
    }

    private MCQData componentQuestion(String term, String topic, List<String> terms) {
        String q = "Which component or concept is most closely associated with " + term + " in " + topic + "?";
        String related = terms.size() > 1 ? terms.get((terms.indexOf(term) + 1) % terms.size()) : topic;
        String correct = related + " — as it works in conjunction with " + term;
        List<String> options = new ArrayList<>();
        options.add(correct);
        options.add("Random unrelated modules");
        options.add("Deprecated system components");
        options.add("External third-party services only");
        Collections.shuffle(options, random);
        return new MCQData(q, options, String.valueOf((char) ('A' + options.indexOf(correct))),
                related + " is closely associated with " + term + " in " + topic + ".");
    }

    private MCQData conceptQuestion(String term, String topic, List<String> terms, String diff) {
        String q;
        if ("HARD".equals(diff)) {
            q = "Analyze the relationship between " + term + " and the broader " + topic + " ecosystem. Which statement is most accurate?";
        } else if ("EASY".equals(diff)) {
            q = "What is " + term + " in " + topic + "?";
        } else {
            q = "Explain the significance of " + term + " in the context of " + topic + ".";
        }
        String correct = term + " is a critical element of " + topic + " that provides essential capabilities";
        List<String> options = new ArrayList<>();
        options.add(correct);
        options.add(term + " is an optional feature with no impact on " + topic);
        options.add(term + " is only relevant in historical contexts");
        options.add(term + " is an alternative name for " + topic + " itself");
        Collections.shuffle(options, random);
        return new MCQData(q, options, String.valueOf((char) ('A' + options.indexOf(correct))),
                term + " is a critical element that provides essential capabilities in " + topic + ".");
    }

    private MCQData fallbackMCQ(String topicName, String difficulty) {
        String q = "Which of the following best relates to " + topicName + "?";
        String correct = "It is a key concept that is directly involved in the subject area";
        List<String> options = new ArrayList<>();
        options.add(correct);
        options.add("It is completely unrelated to the subject");
        options.add("It was only relevant in outdated contexts");
        options.add("It has no practical applications");
        Collections.shuffle(options, random);
        return new MCQData(q, options, String.valueOf((char) ('A' + options.indexOf(correct))),
                topicName + " is a key concept directly involved in the subject area.");
    }

    // ─── DESCRIPTIVE GENERATION ───────────────────────────────

    private ExamQuestion generateDescriptive(Topic topic, String difficulty, String subject,
                                              int marks, String facultyId) {
        ExamQuestion q = new ExamQuestion();
        q.setQuestionType("DESCRIPTIVE");
        q.setSubject(subject);
        q.setDifficulty(difficulty);
        q.setMarks(marks);
        q.setCreatedBy(facultyId);
        q.setCreatedAt(Instant.now());
        q.setUpdatedAt(Instant.now());
        q.setActive(true);
        q.setUnit(topic.name.length() > 50 ? topic.name.substring(0, 50) : topic.name);

        String mainTerm = topic.keyTerms.isEmpty() ? topic.name
                : topic.keyTerms.get(random.nextInt(topic.keyTerms.size()));

        String[] easyTemplates = {
                "Define " + mainTerm + " in the context of " + topic.name + ".",
                "List the key features of " + mainTerm + ".",
                "What is " + mainTerm + "? Give a brief explanation.",
                "State the importance of " + mainTerm + " in " + subject + "."
        };

        String[] mediumTemplates = {
                "Explain the concept of " + mainTerm + " and its role in " + topic.name + ".",
                "Describe the working mechanism of " + mainTerm + " with suitable examples.",
                "Compare and contrast " + mainTerm + " with related concepts in " + subject + ".",
                "Discuss the advantages and disadvantages of " + mainTerm + "."
        };

        String[] hardTemplates = {
                "Critically analyze the role of " + mainTerm + " in " + topic.name +
                        ". Discuss its impact on the overall " + subject + " domain with real-world examples.",
                "Design a solution using " + mainTerm + " for a complex problem in " + topic.name +
                        ". Explain your approach step by step.",
                "Evaluate the effectiveness of " + mainTerm +
                        " compared to alternative approaches in " + subject + ". Support your answer with examples.",
                "How would you implement " + mainTerm + " in a real-world " + subject +
                        " project? Discuss challenges and mitigation strategies."
        };

        String[] templates = switch (difficulty) {
            case "EASY" -> easyTemplates;
            case "HARD" -> hardTemplates;
            default -> mediumTemplates;
        };

        q.setQuestionText(templates[random.nextInt(templates.length)]);

        // Provide a model answer as the explanation
        q.setExplanation("Expected answer should cover the key aspects of " + mainTerm +
                " as it relates to " + topic.name + " in the " + subject + " domain.");
        q.setCorrectAnswer("Refer to explanation for model answer guidelines.");

        return q;
    }

    // ─── HELPER CLASSES ───────────────────────────────────────

    private static class Topic {
        String name;
        String fullText;
        List<String> keyTerms;

        Topic(String name, String fullText, List<String> keyTerms) {
            this.name = name;
            this.fullText = fullText;
            this.keyTerms = keyTerms;
        }
    }

    private static class MCQData {
        String question;
        List<String> options;
        String correctAnswer;
        String explanation;

        MCQData(String question, List<String> options, String correctAnswer, String explanation) {
            this.question = question;
            this.options = options;
            this.correctAnswer = correctAnswer;
            this.explanation = explanation;
        }
    }

    private static final Set<String> STOP_WORDS = Set.of(
            "the", "and", "for", "are", "but", "not", "you", "all", "can", "has", "her",
            "was", "one", "our", "out", "with", "this", "that", "from", "they", "been",
            "have", "will", "each", "make", "like", "long", "look", "many", "some",
            "these", "than", "them", "then", "what", "when", "who", "which", "their",
            "about", "would", "there", "could", "other", "into", "more", "such",
            "also", "back", "after", "should", "where", "much", "every", "between",
            "based", "using", "well", "just", "only", "come", "made", "find",
            "here", "thing", "both", "does", "else", "most", "over", "still",
            "through", "being", "while", "under", "include", "including", "provide",
            "during", "without", "before", "those", "since", "first", "given", "brief",
            "description", "enter", "input", "system", "option", "following", "related"
    );
}
