import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookOpen, Code, Brain, MessageCircle, Target, TrendingUp, Play, CheckCircle,
  Clock, Star, BarChart3, Award, ChevronRight, Loader2, Sparkles, ArrowLeft, X,
  RefreshCw, ChevronDown, ChevronUp, FileText, Video, Download, Calendar, Users
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const StudentTrainingTab = ({ studentId, email }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [practiceState, setPracticeState] = useState(null); // { topicIdx, type, qIdx, selected, answered, score, total, questions }
  const [expandedGuide, setExpandedGuide] = useState(null);
  const [trainingMaterials, setTrainingMaterials] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);

  useEffect(() => {
    fetchTrainingResources();
  }, []);

  const fetchTrainingResources = async () => {
    setLoadingResources(true);
    try {
      const [matRes, sesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/placements/training/materials`),
        axios.get(`${API_BASE}/api/placements/training/sessions`),
      ]);
      setTrainingMaterials(matRes.data || []);
      setTrainingSessions(sesRes.data || []);
    } catch (e) { console.error('Failed to load training resources:', e); }
    setLoadingResources(false);
  };

  const handleDownload = async (mat) => {
    try {
      await axios.put(`${API_BASE}/api/placements/training/materials/${mat.id}/download`);
      if (mat.fileUrl) window.open(`${API_BASE}${mat.fileUrl}`, '_blank');
    } catch (e) { console.error(e); }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'materials', label: 'Study Materials', icon: FileText },
    { id: 'workshops', label: 'Workshops', icon: Calendar },
    { id: 'aptitude', label: 'Aptitude Tests', icon: Brain },
    { id: 'coding', label: 'Coding Challenges', icon: Code },
    { id: 'interview', label: 'Interview Q&A', icon: MessageCircle },
    { id: 'hr', label: 'HR Preparation', icon: Target },
    { id: 'mock', label: 'Mock Interviews', icon: Play },
  ];

  const aptitudeTopics = [
    { name: 'Quantitative Aptitude', problems: 120, completed: 45, difficulty: 'Medium' },
    { name: 'Logical Reasoning', problems: 80, completed: 30, difficulty: 'Medium' },
    { name: 'Verbal Ability', problems: 60, completed: 20, difficulty: 'Easy' },
    { name: 'Data Interpretation', problems: 40, completed: 10, difficulty: 'Hard' },
  ];

  const codingChallenges = [
    { name: 'Arrays & Strings', problems: 50, completed: 15, difficulty: 'Easy-Medium' },
    { name: 'Linked Lists', problems: 30, completed: 8, difficulty: 'Medium' },
    { name: 'Trees & Graphs', problems: 40, completed: 5, difficulty: 'Hard' },
    { name: 'Dynamic Programming', problems: 35, completed: 3, difficulty: 'Hard' },
    { name: 'Sorting & Searching', problems: 25, completed: 12, difficulty: 'Easy' },
    { name: 'SQL Queries', problems: 20, completed: 7, difficulty: 'Medium' },
  ];

  const interviewQuestions = [
    { q: 'Tell me about yourself.', category: 'HR', difficulty: 'Easy', tip: 'Follow: Present → Past → Future format. Keep it 2 minutes.' },
    { q: 'What is OOP? Explain the four pillars.', category: 'Technical', difficulty: 'Medium', tip: 'Encapsulation, Abstraction, Inheritance, Polymorphism — use real-world examples.' },
    { q: 'Explain the difference between stack and heap memory.', category: 'Technical', difficulty: 'Medium', tip: 'Stack: fast, LIFO, automatic. Heap: dynamic, manual (GC), flexible.' },
    { q: 'What is your greatest weakness?', category: 'HR', difficulty: 'Easy', tip: 'Pick a real weakness and show how you are improving.' },
    { q: 'Design a URL shortener like bit.ly.', category: 'System Design', difficulty: 'Hard', tip: 'Cover: hashing, database schema, scaling, caching, analytics.' },
    { q: 'What is normalization in databases?', category: 'Technical', difficulty: 'Medium', tip: '1NF → 2NF → 3NF → BCNF. Explain each with table examples.' },
    { q: 'Where do you see yourself in 5 years?', category: 'HR', difficulty: 'Easy', tip: 'Show ambition aligned with the company growth.' },
    { q: 'Explain REST API principles.', category: 'Technical', difficulty: 'Medium', tip: 'Stateless, resource-based, HTTP methods, status codes, HATEOAS.' },
  ];

  const hrGuides = [
    { title: 'Self Introduction Template', description: 'Structured format for introducing yourself confidently', sections: ['Opening', 'Education', 'Skills', 'Projects', 'Goals'] },
    { title: 'Behavioral Questions (STAR Method)', description: 'Situation, Task, Action, Result framework', sections: ['Leadership', 'Teamwork', 'Conflict', 'Initiative'] },
    { title: 'Company Research Checklist', description: 'What to research before every interview', sections: ['Mission & Values', 'Products', 'Recent News', 'Competitors', 'Culture'] },
    { title: 'Salary Negotiation Guide', description: 'How to discuss compensation professionally', sections: ['Research', 'Timing', 'Strategy', 'Counteroffers'] },
  ];

  // ===== APTITUDE QUESTION BANKS =====
  const aptitudeQuestionBanks = {
    'Quantitative Aptitude': [
      { q: 'If a train travels 360 km in 4 hours, what is its speed in m/s?', options: ['25 m/s', '20 m/s', '30 m/s', '15 m/s'], answer: 0, explanation: 'Speed = 360/4 = 90 km/h = 90 × (5/18) = 25 m/s' },
      { q: 'A shopkeeper sells an item at 20% profit. If cost price is Rs.500, what is the selling price?', options: ['Rs.600', 'Rs.550', 'Rs.650', 'Rs.700'], answer: 0, explanation: 'SP = CP × 1.20 = 500 × 1.20 = Rs.600' },
      { q: 'The average of 5 numbers is 30. If one number is excluded, the average becomes 28. What is the excluded number?', options: ['38', '30', '40', '35'], answer: 0, explanation: 'Sum of 5 = 150, Sum of 4 = 112. Excluded = 150 − 112 = 38' },
      { q: 'If x + 1/x = 5, find x² + 1/x²', options: ['23', '25', '27', '21'], answer: 0, explanation: '(x + 1/x)² = x² + 2 + 1/x² = 25, so x² + 1/x² = 23' },
      { q: 'A pipe can fill a tank in 6 hours. Another pipe can empty it in 8 hours. How long to fill if both are open?', options: ['24 hours', '12 hours', '18 hours', '20 hours'], answer: 0, explanation: 'Net rate = 1/6 − 1/8 = 1/24. Time = 24 hours' },
    ],
    'Logical Reasoning': [
      { q: 'Complete the series: 2, 6, 18, 54, ?', options: ['162', '108', '148', '216'], answer: 0, explanation: 'Each term is multiplied by 3: 54 × 3 = 162' },
      { q: 'If A is the brother of B, B is the sister of C, and C is the father of D, how is A related to D?', options: ['Uncle', 'Father', 'Grandfather', 'Brother'], answer: 0, explanation: 'C is D\'s father. B is C\'s sister (so B is D\'s aunt). A is B\'s brother = C\'s sibling = D\'s uncle.' },
      { q: 'In a certain code, "COMPUTER" is written as "DPNQVUFS". How is "SCIENCE" written?', options: ['TDJFODF', 'TDOFGDF', 'TCJFODF', 'TDJFMDF'], answer: 0, explanation: 'Each letter is shifted by +1: S→T, C→D, I→J, E→F, N→O, C→D, E→F = TDJFODF' },
      { q: 'Statement: All dogs are animals. All animals are living beings. Conclusion: All dogs are living beings.', options: ['True', 'False', 'Cannot be determined', 'Partially true'], answer: 0, explanation: 'Both premises form a valid syllogism: Dogs ⊂ Animals ⊂ Living Beings' },
      { q: 'If "+" means "−", "−" means "×", "×" means "÷", "÷" means "+", then 8 + 6 − 2 × 4 ÷ 3 = ?', options: ['8', '5', '6', '11'], answer: 1, explanation: 'Replace: 8 − 6 × 2 ÷ 4 + 3 = 8 − (6×2÷4) + 3 = 8 − 3 + 3 = 5' },
    ],
    'Verbal Ability': [
      { q: 'Choose the synonym of "ELOQUENT":', options: ['Articulate', 'Silent', 'Reserved', 'Loud'], answer: 0, explanation: 'Eloquent means fluent or persuasive in speaking = articulate' },
      { q: 'Find the antonym of "BENEVOLENT":', options: ['Malevolent', 'Kind', 'Generous', 'Caring'], answer: 0, explanation: 'Benevolent means well-meaning. Antonym is malevolent (ill-wishing).' },
      { q: 'Choose the correctly spelled word:', options: ['Accommodate', 'Accomodate', 'Acommodate', 'Acomodate'], answer: 0, explanation: 'Accommodate has double "c" and double "m".' },
      { q: 'Fill in the blank: The manager insisted _____ strict discipline.', options: ['on', 'in', 'at', 'for'], answer: 0, explanation: '"Insisted on" is the correct prepositional usage.' },
      { q: '"A stitch in time" means:', options: ['Timely action prevents bigger problems', 'Sewing is important', 'Time heals everything', 'Be patient'], answer: 0, explanation: 'This proverb means acting early prevents worse problems later.' },
    ],
    'Data Interpretation': [
      { q: 'Company revenue: Q1=200cr, Q2=250cr, Q3=300cr, Q4=350cr. What is the average quarterly revenue?', options: ['275 cr', '250 cr', '300 cr', '280 cr'], answer: 0, explanation: 'Average = (200+250+300+350)/4 = 1100/4 = 275 cr' },
      { q: 'If production in 2023 was 5000 units and 2024 was 6500 units, what is the percentage increase?', options: ['30%', '25%', '35%', '20%'], answer: 0, explanation: 'Increase = (6500−5000)/5000 × 100 = 30%' },
      { q: 'In a pie chart, if sector A = 90°, what percentage does A represent?', options: ['25%', '30%', '20%', '35%'], answer: 0, explanation: '90/360 × 100 = 25%' },
      { q: 'If ratio of boys to girls is 3:2 and total students is 500, how many girls are there?', options: ['200', '250', '300', '150'], answer: 0, explanation: 'Girls = (2/5) × 500 = 200' },
      { q: 'Sales grew at 10% each year. If Year 1 = 1000, what is Year 3 sales?', options: ['1210', '1200', '1300', '1100'], answer: 0, explanation: 'Year 2 = 1100, Year 3 = 1100 × 1.1 = 1210' },
    ],
  };

  // ===== CODING QUESTION BANKS =====
  const codingQuestionBanks = {
    'Arrays & Strings': [
      { q: 'What is the time complexity of finding an element in an unsorted array?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], answer: 0, explanation: 'Linear search through unsorted array takes O(n) in worst case.' },
      { q: 'Which method reverses a string in Java?', options: ['new StringBuilder(s).reverse().toString()', 's.reverse()', 'String.reverse(s)', 'Collections.reverse(s)'], answer: 0, explanation: 'StringBuilder has a reverse() method. Strings in Java are immutable.' },
      { q: 'What does the two-pointer technique help solve efficiently?', options: ['Finding pairs with a target sum in sorted array', 'Sorting an array', 'Binary search', 'Hash collision'], answer: 0, explanation: 'Two pointers from both ends move toward center to find pairs summing to target in O(n).' },
      { q: 'How do you find duplicates in an array of size n with values 0 to n-1 in O(n) time and O(1) space?', options: ['Use array elements as indices and mark visited', 'Sort and scan', 'Use HashSet', 'Use two nested loops'], answer: 0, explanation: 'Mark visited by negating value at index = arr[i]. If already negative, it\'s a duplicate.' },
      { q: 'What is the Kadane\'s algorithm used for?', options: ['Maximum subarray sum', 'Sorting', 'Searching', 'String matching'], answer: 0, explanation: 'Kadane\'s finds the maximum sum contiguous subarray in O(n) time.' },
    ],
    'Linked Lists': [
      { q: 'How do you detect a cycle in a linked list?', options: ['Floyd\'s tortoise and hare algorithm', 'DFS', 'BFS', 'Binary search'], answer: 0, explanation: 'Use slow (1 step) and fast (2 steps) pointers. If they meet, there\'s a cycle.' },
      { q: 'Time complexity of inserting at the beginning of a singly linked list?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], answer: 0, explanation: 'Just update head pointer — constant time operation.' },
      { q: 'How do you find the middle element of a linked list in one pass?', options: ['Slow and fast pointer', 'Count then traverse', 'Use stack', 'Recursion'], answer: 0, explanation: 'Fast pointer moves 2x. When fast reaches end, slow is at middle.' },
      { q: 'What is the advantage of a doubly linked list over a singly linked list?', options: ['Can traverse in both directions', 'Uses less memory', 'Faster insertion at head', 'Simpler implementation'], answer: 0, explanation: 'Doubly linked list has prev and next pointers, enabling bidirectional traversal.' },
      { q: 'How do you reverse a singly linked list iteratively?', options: ['Use three pointers: prev, current, next', 'Use a stack', 'Copy to array and reverse', 'Use recursion only'], answer: 0, explanation: 'Track prev, current, next. For each node: current.next = prev, then advance all three.' },
    ],
    'Trees & Graphs': [
      { q: 'What is the time complexity of BFS on a graph with V vertices and E edges?', options: ['O(V + E)', 'O(V²)', 'O(V × E)', 'O(E²)'], answer: 0, explanation: 'BFS visits each vertex once and each edge once → O(V + E).' },
      { q: 'In a Binary Search Tree, what traversal gives sorted order?', options: ['Inorder', 'Preorder', 'Postorder', 'Level order'], answer: 0, explanation: 'Inorder (Left → Root → Right) on BST produces sorted elements.' },
      { q: 'What is the maximum number of nodes in a binary tree of height h?', options: ['2^(h+1) − 1', '2^h', 'h²', '2h + 1'], answer: 0, explanation: 'A complete binary tree of height h has at most 2^(h+1) − 1 nodes.' },
      { q: 'Which algorithm finds the shortest path in a weighted graph with no negative edges?', options: ['Dijkstra\'s algorithm', 'DFS', 'BFS', 'Prim\'s algorithm'], answer: 0, explanation: 'Dijkstra uses a priority queue and greedy approach for shortest paths with non-negative weights.' },
      { q: 'What data structure is used for BFS?', options: ['Queue', 'Stack', 'Priority Queue', 'Array'], answer: 0, explanation: 'BFS uses a queue (FIFO) to explore nodes level by level.' },
    ],
    'Dynamic Programming': [
      { q: 'What are the two main properties of Dynamic Programming problems?', options: ['Optimal substructure & overlapping subproblems', 'Greedy choice & optimal substructure', 'Divide & conquer', 'Recursion & iteration'], answer: 0, explanation: 'DP requires optimal substructure (solution built from sub-solutions) and overlapping subproblems (sub-problems repeat).' },
      { q: 'What is the time complexity of the 0/1 Knapsack problem using DP?', options: ['O(nW)', 'O(n²)', 'O(2^n)', 'O(n log n)'], answer: 0, explanation: 'DP table is n items × W capacity → O(nW) pseudo-polynomial.' },
      { q: 'What is memoization?', options: ['Storing results of expensive function calls to reuse', 'Using memory-efficient algorithms', 'A type of sorting', 'Recursive backtracking'], answer: 0, explanation: 'Memoization caches computed results so repeated calls return stored values instead of recomputing.' },
      { q: 'The Fibonacci sequence using DP has what time complexity?', options: ['O(n)', 'O(2^n)', 'O(n²)', 'O(n log n)'], answer: 0, explanation: 'With DP (tabulation or memoization), each Fibonacci number is computed once → O(n).' },
      { q: 'Which problem is NOT typically solved with DP?', options: ['Finding shortest path in unweighted graph', 'Longest Common Subsequence', 'Matrix Chain Multiplication', 'Edit Distance'], answer: 0, explanation: 'Unweighted shortest path uses BFS. LCS, MCM, and Edit Distance are classic DP problems.' },
    ],
    'Sorting & Searching': [
      { q: 'What is the best-case time complexity of Quick Sort?', options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], answer: 0, explanation: 'Best case: balanced partitions → recurrence T(n) = 2T(n/2) + O(n) → O(n log n).' },
      { q: 'Which sorting algorithm is stable with O(n log n) worst case?', options: ['Merge Sort', 'Quick Sort', 'Heap Sort', 'Selection Sort'], answer: 0, explanation: 'Merge Sort is stable and always O(n log n). Quick Sort is O(n²) worst case. Heap Sort is not stable.' },
      { q: 'Binary search requires the array to be:', options: ['Sorted', 'Unsorted', 'Of equal elements', 'Of unique elements'], answer: 0, explanation: 'Binary search uses the sorted property to eliminate half the search space each step.' },
      { q: 'What is the space complexity of Merge Sort?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], answer: 0, explanation: 'Merge Sort needs O(n) extra space for the temporary arrays during merging.' },
      { q: 'Which search has O(√n) complexity?', options: ['Jump Search', 'Binary Search', 'Linear Search', 'Interpolation Search'], answer: 0, explanation: 'Jump Search jumps √n elements at a time, then does linear search in the block → O(√n).' },
    ],
    'SQL Queries': [
      { q: 'Which SQL clause is used to filter groups?', options: ['HAVING', 'WHERE', 'GROUP BY', 'ORDER BY'], answer: 0, explanation: 'HAVING filters after GROUP BY. WHERE filters before grouping.' },
      { q: 'What is the difference between INNER JOIN and LEFT JOIN?', options: ['LEFT JOIN includes all left table rows even without matches', 'There is no difference', 'INNER JOIN is faster', 'LEFT JOIN only works with 2 tables'], answer: 0, explanation: 'INNER JOIN: only matching rows. LEFT JOIN: all left table rows + matched right rows (NULL if no match).' },
      { q: 'Which SQL function returns the number of rows?', options: ['COUNT()', 'SUM()', 'AVG()', 'NUM()'], answer: 0, explanation: 'COUNT() returns the number of rows. COUNT(*) counts all, COUNT(col) counts non-null.' },
      { q: 'What does DISTINCT do in a SELECT query?', options: ['Removes duplicate rows from results', 'Sorts the results', 'Limits the results', 'Joins tables'], answer: 0, explanation: 'SELECT DISTINCT returns only unique rows, removing duplicates.' },
      { q: 'Which is faster for existence check: IN or EXISTS?', options: ['EXISTS (for large subqueries)', 'IN is always faster', 'They are identical', 'Neither is faster'], answer: 0, explanation: 'EXISTS short-circuits (stops after first match) making it faster with large subqueries.' },
    ],
  };

  // ===== HR GUIDE FULL CONTENT =====
  const hrGuideContent = {
    'Self Introduction Template': {
      content: [
        { heading: 'Opening', text: '"Good morning/afternoon. Thank you for this opportunity. My name is [Full Name], and I\'m currently pursuing [Degree] from [University], expected to graduate in [Year]."' },
        { heading: 'Education', text: 'Briefly mention your degree, university, and CGPA/percentage. Highlight any academic awards. Example: "I maintain a CGPA of 8.5 and was on the Dean\'s list for 3 semesters."' },
        { heading: 'Skills', text: 'Mention 3-4 key technical skills relevant to the role. Example: "My core technical skills include Java, Spring Boot, React, and SQL. I\'m also proficient in Git and Agile methodologies."' },
        { heading: 'Projects', text: 'Highlight 1-2 impactful projects. Use format: "I built [project] using [tech] which [impact]." Example: "I developed a Student Event Management System using Java and React that serves 500+ users."' },
        { heading: 'Goals', text: 'Conclude with career aspirations aligned with the company. Example: "I\'m looking for a role where I can apply my skills to solve real-world problems and grow as a software engineer. Your company\'s focus on [specific area] really excites me."' },
      ],
      tips: ['Keep it under 2 minutes', 'Practice until it sounds natural, not rehearsed', 'Make eye contact and smile', 'Tailor the intro to each company']
    },
    'Behavioral Questions (STAR Method)': {
      content: [
        { heading: 'Leadership', text: 'Question: "Tell me about a time you led a team."\n\nSITUATION: "In my 5th semester, our team of 4 had a major project deadline approaching with unclear requirements."\nTASK: "As team lead, I needed to clarify scope, delegate tasks, and ensure timely delivery."\nACTION: "I organized daily 15-min standups, broke the project into sprints, and set up a shared Kanban board."\nRESULT: "We delivered 2 days early with all features working. Our team scored the highest in the batch."' },
        { heading: 'Teamwork', text: 'Question: "Describe a successful team collaboration."\n\nSITUATION: "During a hackathon, our team had members with different skill levels."\nTASK: "We needed to build a working prototype in 24 hours."\nACTION: "I paired experienced members with beginners for knowledge sharing and assigned tasks based on strengths."\nRESULT: "We built a functional app and won 2nd place. The beginners learned React basics during the process."' },
        { heading: 'Conflict', text: 'Question: "Tell me about a conflict with a teammate and how you resolved it."\n\nSITUATION: "A teammate disagreed with my choice of database technology for our project."\nTASK: "We needed to reach a consensus without delaying the project."\nACTION: "I scheduled a meeting where we both presented pros and cons objectively. We did a small proof of concept for each approach."\nRESULT: "We went with their choice of MongoDB, which turned out to be better for our use case. I learned the value of data-driven decisions."' },
        { heading: 'Initiative', text: 'Question: "Give an example of when you went above and beyond."\n\nSITUATION: "Our college placement portal was outdated and hard for students to navigate."\nTASK: "No one was assigned to fix it, but students were struggling."\nACTION: "I volunteered to redesign the UI on weekends, gathered feedback from 50+ students, and built a modern interface with React."\nRESULT: "The new portal increased student engagement by 40% and was adopted officially by the training & placement cell."' },
      ],
      tips: ['Always quantify results when possible', 'Pick examples from college projects, internships, or extracurriculars', 'Keep each STAR response under 2 minutes', 'Practice at least one story for each category']
    },
    'Company Research Checklist': {
      content: [
        { heading: 'Mission & Values', text: 'Before every interview, visit the company\'s "About Us" page.\n\n✅ What is their mission statement?\n✅ What are their core values?\n✅ How do these align with your own goals?\n\nExample: "I noticed [Company] values innovation and collaboration. In my project work, I\'ve always prioritized teamwork and trying new approaches."' },
        { heading: 'Products', text: '✅ What products/services does the company offer?\n✅ Who are their target customers?\n✅ What technology stack do they use?\n✅ Have you used any of their products?\n\nTip: If you\'ve used their product, mention it. "I\'ve been a user of [Product] for 2 years and appreciate how [specific feature] works."' },
        { heading: 'Recent News', text: '✅ Check their blog, press releases, and LinkedIn page\n✅ Any recent product launches or acquisitions?\n✅ Are they expanding to new markets?\n✅ Did they win any awards?\n\nMentioning recent news shows genuine interest. "I read about your recent expansion into [market]—it\'s exciting to see that growth."' },
        { heading: 'Competitors', text: '✅ Who are their main competitors?\n✅ What makes this company different?\n✅ What is their competitive advantage?\n\nThis helps you answer "Why this company?" convincingly. Never badmouth competitors—focus on what makes this company special.' },
        { heading: 'Culture', text: '✅ Check Glassdoor reviews (take with a grain of salt)\n✅ Look at their social media for team events and culture\n✅ Check if they have engineering blogs or tech talks\n✅ What is their work environment like?\n\nAsking culture questions in the interview shows maturity: "I noticed your team does monthly hackathons—that really appeals to me."' },
      ],
      tips: ['Spend 30-60 minutes researching each company', 'Take notes you can reference before the interview', 'Prepare 2-3 company-specific questions to ask', 'Follow the company on LinkedIn for latest updates']
    },
    'Salary Negotiation Guide': {
      content: [
        { heading: 'Research', text: 'Know market rates before any discussion:\n\n✅ Check Glassdoor, Levels.fyi, AmbitionBox for salary data\n✅ Consider: role, experience, location, company size\n✅ Know the typical range for freshers in your field\n✅ Understand components: base pay, bonuses, stocks, benefits\n\nFor freshers: The typical range for SDE-1 in India is ₹4-15 LPA depending on company tier.' },
        { heading: 'Timing', text: 'NEVER discuss salary first. Let the company bring it up.\n\n✅ Wait until you have an offer or they ask your expectations\n✅ If asked early: "I\'m flexible and more interested in the role and growth opportunities"\n✅ Best time to negotiate: after receiving a written offer\n✅ Don\'t reveal your current/previous salary if possible' },
        { heading: 'Strategy', text: 'When it\'s time to negotiate:\n\n1. Express enthusiasm: "I\'m excited about this opportunity"\n2. Present your case: "Based on my research and skills, I believe [X] would be fair"\n3. Back it up: mention competing offers, relevant skills, project achievements\n4. Be specific: give a range, with your target in the lower middle\n5. Be professional: never use ultimatums or get emotional' },
        { heading: 'Counteroffers', text: 'If the initial offer is lower than expected:\n\n✅ Don\'t accept or reject on the spot—ask for time\n✅ "Thank you for the offer. Can I have 2-3 days to consider?"\n✅ Come back with data-driven counter\n✅ If salary can\'t move, negotiate: signing bonus, remote work, learning budget\n✅ Know your walk-away point before negotiating\n\nRemember: negotiating is expected and professional. Companies respect candidates who know their worth.' },
      ],
      tips: ['Never accept the first offer immediately', 'Always be polite and professional', 'Negotiate total compensation, not just base salary', 'Get the final offer in writing before accepting']
    },
  };

  // ===== PRACTICE FUNCTIONS =====
  const startPractice = (topicName, type) => {
    const bank = type === 'aptitude' ? aptitudeQuestionBanks[topicName] : codingQuestionBanks[topicName];
    if (!bank || bank.length === 0) return;
    // Shuffle and pick 5 questions
    const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, 5);
    setPracticeState({
      topicName,
      type,
      qIdx: 0,
      selected: null,
      answered: false,
      score: 0,
      total: shuffled.length,
      questions: shuffled,
      finished: false,
    });
  };

  const handleAnswer = (optIdx) => {
    if (practiceState.answered) return;
    const correct = practiceState.questions[practiceState.qIdx].answer === optIdx;
    setPracticeState(prev => ({
      ...prev,
      selected: optIdx,
      answered: true,
      score: correct ? prev.score + 1 : prev.score,
    }));
  };

  const nextQuestion = () => {
    if (practiceState.qIdx + 1 >= practiceState.total) {
      setPracticeState(prev => ({ ...prev, finished: true }));
    } else {
      setPracticeState(prev => ({ ...prev, qIdx: prev.qIdx + 1, selected: null, answered: false }));
    }
  };

  const closePractice = () => setPracticeState(null);

  const progress = {
    aptitudeScore: 68,
    codingScore: 52,
    interviewReadiness: 45,
    overallProgress: 55,
    streak: 7,
    totalPracticed: 156,
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Progress Card */}
      <div className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Your Preparation Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Overall Progress', value: `${progress.overallProgress}%`, icon: TrendingUp },
            { label: 'Aptitude Score', value: `${progress.aptitudeScore}%`, icon: Brain },
            { label: 'Coding Score', value: `${progress.codingScore}%`, icon: Code },
            { label: 'Interview Ready', value: `${progress.interviewReadiness}%`, icon: Target },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="rounded-lg bg-white/10 p-3 text-center">
                <Icon size={20} className="mx-auto mb-1 opacity-80" />
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-xs opacity-80">{stat.label}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1"><Star size={14} /> {progress.streak} day streak</span>
          <span className="flex items-center gap-1"><CheckCircle size={14} /> {progress.totalPracticed} problems solved</span>
        </div>
      </div>

      {/* Quick Start */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Daily Aptitude Quiz', desc: '10 questions, 15 min', color: 'bg-amber-50 border-amber-200 text-amber-700', section: 'aptitude' },
          { title: 'Coding Challenge', desc: 'Random problem from DSA', color: 'bg-green-50 border-green-200 text-green-700', section: 'coding' },
          { title: 'Mock Interview', desc: 'Practice with AI interviewer', color: 'bg-purple-50 border-purple-200 text-purple-700', section: 'mock' },
        ].map((item, i) => (
          <button key={i} onClick={() => setActiveSection(item.section)}
            className={`rounded-xl border p-5 text-left hover:shadow-md transition ${item.color}`}>
            <h4 className="font-bold text-slate-800">{item.title}</h4>
            <p className="text-sm mt-1 opacity-70">{item.desc}</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium">
              Start Now <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </div>

      {/* AI Recommended Study Plan */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800">AI-Recommended Study Plan for Placements</h3>
        </div>
        <div className="space-y-2">
          {[
            { day: 'Mon & Wed', focus: 'Aptitude — Quantitative & Logical Reasoning', time: '1.5 hours' },
            { day: 'Tue & Thu', focus: 'Coding — Arrays, Strings, and DP', time: '2 hours' },
            { day: 'Fri', focus: 'Mock Interview Practice + HR Prep', time: '1 hour' },
            { day: 'Sat', focus: 'System Design & Previous Year Questions', time: '2 hours' },
            { day: 'Sun', focus: 'Review Weak Areas & Take Practice Test', time: '1.5 hours' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg bg-slate-50 p-3 text-sm">
              <span className="font-bold text-slate-700 w-24">{item.day}</span>
              <span className="flex-1 text-slate-600">{item.focus}</span>
              <span className="text-slate-400 flex items-center gap-1"><Clock size={12} /> {item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTopicList = (topics, type) => (
    <div className="space-y-3">
      {/* Practice Quiz Modal */}
      {practiceState && practiceState.type === type && (
        <div className="rounded-xl border-2 border-sky-300 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">{practiceState.topicName}</h3>
              <span className="text-xs text-slate-500">Question {practiceState.qIdx + 1} of {practiceState.total} &nbsp;|&nbsp; Score: {practiceState.score}/{practiceState.answered ? practiceState.qIdx + 1 : practiceState.qIdx}</span>
            </div>
            <button onClick={closePractice} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>

          {practiceState.finished ? (
            <div className="text-center py-8">
              <Award size={48} className="mx-auto mb-3 text-amber-500" />
              <h4 className="text-xl font-bold text-slate-800">Practice Complete!</h4>
              <p className="text-3xl font-black text-sky-600 mt-2">{practiceState.score}/{practiceState.total}</p>
              <p className="text-sm text-slate-500 mt-1">
                {practiceState.score === practiceState.total ? 'Perfect score! Excellent work!' :
                 practiceState.score >= practiceState.total * 0.6 ? 'Good job! Keep practicing to improve.' :
                 'Keep practicing! Review the explanations to improve.'}
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <button onClick={() => startPractice(practiceState.topicName, practiceState.type)}
                  className="flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-700">
                  <RefreshCw size={14} /> Try Again
                </button>
                <button onClick={closePractice}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-4">
                  <div className="h-full bg-sky-500 transition-all" style={{ width: `${((practiceState.qIdx + 1) / practiceState.total) * 100}%` }} />
                </div>
                <p className="text-base font-semibold text-slate-800">{practiceState.questions[practiceState.qIdx].q}</p>
              </div>
              <div className="space-y-2 mb-4">
                {practiceState.questions[practiceState.qIdx].options.map((opt, oi) => {
                  const isCorrect = practiceState.questions[practiceState.qIdx].answer === oi;
                  const isSelected = practiceState.selected === oi;
                  let cls = 'border-slate-200 bg-white text-slate-700 hover:bg-sky-50 hover:border-sky-300 cursor-pointer';
                  if (practiceState.answered) {
                    if (isCorrect) cls = 'border-green-400 bg-green-50 text-green-800';
                    else if (isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-800';
                    else cls = 'border-slate-200 bg-slate-50 text-slate-400';
                  }
                  return (
                    <button key={oi} onClick={() => handleAnswer(oi)} disabled={practiceState.answered}
                      className={`w-full text-left rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${cls}`}>
                      <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                      {practiceState.answered && isCorrect && <CheckCircle size={16} className="inline ml-2 text-green-600" />}
                      {practiceState.answered && isSelected && !isCorrect && <X size={16} className="inline ml-2 text-red-500" />}
                    </button>
                  );
                })}
              </div>
              {practiceState.answered && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-4">
                  <p className="text-sm text-blue-800"><strong>Explanation:</strong> {practiceState.questions[practiceState.qIdx].explanation}</p>
                </div>
              )}
              {practiceState.answered && (
                <button onClick={nextQuestion}
                  className="flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-700">
                  {practiceState.qIdx + 1 >= practiceState.total ? 'View Results' : 'Next Question'} <ChevronRight size={14} />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {topics.map((topic, i) => {
        const pct = Math.round((topic.completed / topic.problems) * 100);
        return (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800">{topic.name}</h4>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                topic.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                topic.difficulty === 'Medium' || topic.difficulty === 'Easy-Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'}`}>{topic.difficulty}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
              <span>{topic.completed}/{topic.problems} completed</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <button onClick={() => startPractice(topic.name, type)}
              className="mt-3 text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1">
              <Play size={12} /> Practice Now
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderInterviewQA = () => (
    <div className="space-y-3">
      <div className="flex gap-2 mb-4">
        {['All', 'Technical', 'HR', 'System Design'].map(cat => (
          <button key={cat} className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition">
            {cat}
          </button>
        ))}
      </div>
      {interviewQuestions.map((item, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  item.category === 'Technical' ? 'bg-blue-100 text-blue-700' :
                  item.category === 'HR' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'}`}>{item.category}</span>
                <span className={`text-[10px] font-bold ${
                  item.difficulty === 'Easy' ? 'text-green-600' :
                  item.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>{item.difficulty}</span>
              </div>
              <h4 className="font-bold text-slate-800">{item.q}</h4>
            </div>
          </div>
          <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            <strong>Tip:</strong> {item.tip}
          </div>
        </div>
      ))}
    </div>
  );

  const renderHRGuides = () => (
    <div className="space-y-4">
      {hrGuides.map((guide, i) => {
        const isExpanded = expandedGuide === i;
        const content = hrGuideContent[guide.title];
        return (
          <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-5">
              <h4 className="font-bold text-slate-800">{guide.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{guide.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {guide.sections.map((s, j) => (
                  <span key={j} className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-xs font-medium">{s}</span>
                ))}
              </div>
              <button onClick={() => setExpandedGuide(isExpanded ? null : i)}
                className="mt-3 text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1">
                {isExpanded ? <><ChevronUp size={14} /> Close Guide</> : <><ChevronRight size={14} /> Read Guide</>}
              </button>
            </div>

            {isExpanded && content && (
              <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-4">
                {content.content.map((section, si) => (
                  <div key={si} className="rounded-lg bg-white border border-slate-200 p-4">
                    <h5 className="font-bold text-sky-700 mb-2">{section.heading}</h5>
                    <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{section.text}</div>
                  </div>
                ))}
                {content.tips && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-2"><Star size={14} /> Pro Tips</h5>
                    <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                      {content.tips.map((tip, ti) => <li key={ti}>{tip}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderMock = () => (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white text-center">
        <Play size={48} className="mx-auto mb-3 opacity-90" />
        <h3 className="text-xl font-bold">Mock Interview Sessions</h3>
        <p className="text-sm opacity-80 mt-1 mb-4">Practice with simulated interview scenarios</p>
        <button className="rounded-lg bg-white text-purple-700 px-6 py-2.5 text-sm font-bold hover:bg-purple-50 transition">
          Start Mock Interview
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { type: 'Technical Round', desc: 'DSA + CS fundamentals', duration: '30 mins', questions: 5 },
          { type: 'HR Round', desc: 'Behavioral & situational', duration: '20 mins', questions: 8 },
          { type: 'System Design', desc: 'Architecture & scaling', duration: '45 mins', questions: 2 },
          { type: 'Full Interview', desc: 'Complete simulation', duration: '60 mins', questions: 12 },
        ].map((mock, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-sm transition">
            <h4 className="font-bold text-slate-800">{mock.type}</h4>
            <p className="text-sm text-slate-500 mt-1">{mock.desc}</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
              <span><Clock size={12} className="inline mr-1" />{mock.duration}</span>
              <span>{mock.questions} questions</span>
            </div>
            <button className="mt-3 rounded-lg bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition">
              Begin Session
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // ===== STUDENT MATERIALS VIEW =====
  const renderStudentMaterials = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-800">Study Materials</h3>
      {loadingResources ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-sky-600" size={24} /><span className="ml-2 text-sm text-slate-500">Loading materials...</span></div>
      ) : trainingMaterials.length === 0 ? (
        <div className="text-center py-12 text-slate-400"><FileText size={48} className="mx-auto mb-2 opacity-40" /><p>No study materials available yet.</p><p className="text-xs mt-1">Materials uploaded by faculty will appear here.</p></div>
      ) : (
        <div className="space-y-3">
          {trainingMaterials.map(mat => (
            <div key={mat.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${mat.type === 'Video' ? 'bg-red-50' : 'bg-blue-50'}`}>
                  {mat.type === 'Video' ? <Video size={16} className="text-red-500" /> : <FileText size={16} className="text-blue-500" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{mat.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><BookOpen size={10} /> {mat.category}</span>
                    <span>{mat.type}</span>
                    <span>by {mat.uploadedBy}</span>
                    <span>{mat.createdAt ? new Date(mat.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                  {mat.description && <p className="text-xs text-slate-400 mt-0.5">{mat.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{mat.downloads} downloads</span>
                {mat.fileUrl ? (
                  <button onClick={() => handleDownload(mat)} className="flex items-center gap-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1.5 text-xs font-medium hover:bg-sky-100 transition">
                    <Download size={12} /> Download
                  </button>
                ) : (
                  <span className="text-xs text-slate-300">No file</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ===== STUDENT SESSIONS/WORKSHOPS VIEW =====
  const renderStudentSessions = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-800">Workshops & Sessions</h3>
      {loadingResources ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-sky-600" size={24} /><span className="ml-2 text-sm text-slate-500">Loading sessions...</span></div>
      ) : trainingSessions.length === 0 ? (
        <div className="text-center py-12 text-slate-400"><Calendar size={48} className="mx-auto mb-2 opacity-40" /><p>No workshops or sessions scheduled yet.</p><p className="text-xs mt-1">Sessions scheduled by faculty will appear here.</p></div>
      ) : (
        <div className="space-y-3">
          {trainingSessions.map(session => (
            <div key={session.id} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    session.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    {session.type === 'Mock Interview' ? <Play size={16} /> :
                     session.type === 'Pre-Placement Talk' ? <Award size={16} /> :
                     <Calendar size={16} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{session.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {session.date}</span>
                      {session.time && <span className="flex items-center gap-1"><Clock size={10} /> {session.time}</span>}
                      {session.duration && <span>{session.duration}</span>}
                      {session.speaker && <span>by {session.speaker}</span>}
                    </div>
                    {session.description && <p className="text-xs text-slate-400 mt-0.5">{session.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    session.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    session.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'}`}>
                    {session.status || 'Upcoming'}
                  </span>
                  {session.enrolled > 0 && <span className="text-xs text-slate-400 flex items-center gap-1"><Users size={10} /> {session.enrolled}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                activeSection === s.id ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Icon size={16} /> {s.label}
            </button>
          );
        })}
      </div>

      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'materials' && renderStudentMaterials()}
      {activeSection === 'workshops' && renderStudentSessions()}
      {activeSection === 'aptitude' && renderTopicList(aptitudeTopics, 'aptitude')}
      {activeSection === 'coding' && renderTopicList(codingChallenges, 'coding')}
      {activeSection === 'interview' && renderInterviewQA()}
      {activeSection === 'hr' && renderHRGuides()}
      {activeSection === 'mock' && renderMock()}
    </div>
  );
};

export default StudentTrainingTab;
