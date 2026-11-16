/**
 * Realistic seed data for EchoNote's standalone mock mode:
 * - 3 subject folders (CS101: Systems, Psychology, World History)
 * - 7 lectures covering done, processing, and failed pipeline states
 */

const now = Date.now();
const minsAgo = (m) => new Date(now - m * 60 * 1000).toISOString();
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

export const INITIAL_FOLDERS = [
  {
    id: 'cs101',
    name: 'CS101: Systems',
    description: 'Data structures, algorithms, operating systems, and memory architecture.',
    color: 'blue',
    icon: 'code',
    updatedAt: minsAgo(45),
  },
  {
    id: 'psychology',
    name: 'Psychology',
    description: 'Cognitive development, memory formation, and social behavior studies.',
    color: 'rose',
    icon: 'brain',
    updatedAt: hoursAgo(3),
  },
  {
    id: 'history',
    name: 'World History',
    description: 'Industrialization, modern European geopolitics, and primary source seminars.',
    color: 'amber',
    icon: 'landmark',
    updatedAt: daysAgo(1),
  },
];

export const INITIAL_RECORDINGS = [
  {
    id: 'rec-big-o',
    jobId: 'job-big-o',
    title: 'Algorithm Complexity & Big O Notation',
    folderId: 'cs101',
    subjectLabel: 'Computer Science',
    lecturer: 'Prof. Vikram Mehta',
    source: 'recorded',
    status: 'done',
    progress: 100,
    stage: 'done',
    durationSeconds: 2640,
    createdAt: minsAgo(48),
    updatedAt: minsAgo(45),
    suggestedQuestions: [
      'What is the difference between Big O, Big Omega, and Big Theta?',
      'Why does binary search run in O(log n) time?',
      'Which complexity class grows fastest as n increases?',
    ],
    transcript: [
      {
        id: 't1',
        speaker: 'Prof. Vikram Mehta',
        timestamp: '00:01:12',
        text: 'When comparing two algorithms that solve the same problem, wall-clock execution time depends heavily on hardware and compiler optimizations. Asymptotic analysis gives us a machine-independent way to measure growth.',
      },
      {
        id: 't2',
        speaker: 'Prof. Vikram Mehta',
        timestamp: '00:08:45',
        text: 'Big O notation describes the upper bound on growth rate—most commonly used for worst-case runtime. Big Omega gives the lower bound, and Big Theta represents a tight bound where upper and lower growth match.',
      },
      {
        id: 't3',
        speaker: 'Prof. Vikram Mehta',
        timestamp: '00:19:30',
        text: 'Notice how dropping constant factors and lower-order terms simplifies 3n^2 + 5n + 12 down to O(n^2). For binary search on a sorted array, each comparison halves the search space, yielding O(log n).',
      },
      {
        id: 't4',
        speaker: 'Prof. Vikram Mehta',
        timestamp: '00:34:10',
        text: 'Space complexity matters just as much in systems interviews. Merge sort guarantees O(n log n) time in all cases, but requires O(n) auxiliary space, whereas quicksort is in-place with O(log n) stack space on average.',
      },
    ],
    notes: {
      title: 'Algorithm Complexity & Big O Notation',
      summary:
        'Asymptotic analysis evaluates how an algorithm scales as input size n grows, abstracting away hardware differences by focusing on dominant growth terms.',
      keyPoints: [
        'Asymptotic notation measures input-size scaling independent of CPU speed or language.',
        'Drop constant multipliers and lower-order terms when expressing Big O complexity.',
        'Big O = upper bound (worst-case guarantee); Big Omega = lower bound; Big Theta = tight bound.',
        'Halving the problem space each step produces logarithmic O(log n) complexity.',
        'Time-space trade-offs determine algorithm choice: Merge Sort uses O(n) extra memory while Heap Sort runs in O(1) extra space.',
      ],
      definitions: [
        {
          term: 'Big O — O(f(n))',
          meaning: 'Asymptotic upper bound describing the worst-case growth rate of time or space.',
        },
        {
          term: 'Big Theta — Θ(f(n))',
          meaning: 'Tight asymptotic bound when an algorithm grows at the exact same rate from above and below.',
        },
        {
          term: 'Amortized Time',
          meaning: 'Average cost per operation over a worst-case sequence of operations (e.g., dynamic array resizing is O(1) amortized).',
        },
        {
          term: 'Auxiliary Space',
          meaning: 'Extra temporary memory allocated by an algorithm beyond the input data itself.',
        },
      ],
      examples: [
        'Array index lookup arr[i] → O(1) constant time regardless of array length.',
        'Binary search on 1,000,000 sorted items takes at most ~20 comparisons → O(log n).',
        'Nested loops comparing every pair in an array → O(n²) quadratic time.',
      ],
      revisionSheet: [
        'Growth order from fastest to slowest: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!).',
        'Always check loop bounds: if i doubles each iteration (i *= 2), the loop runs O(log n) times.',
        'Exam tip: Specify both time AND auxiliary space complexity for sorting questions (Merge Sort: O(n log n) time / O(n) space; Quicksort: O(n log n) avg / O(n²) worst).',
      ],
    },
    cheatsheet: {
      sections: [
        {
          heading: 'Complexity Hierarchy',
          bullets: [
            'O(1) — Hash table lookup, array access',
            'O(log n) — Binary search, balanced BST lookup',
            'O(n) — Linear scan, two-pointer pass',
            'O(n log n) — Merge sort, heap sort, FFT',
            'O(n²) — Insertion sort worst-case, pairwise comparison',
          ],
        },
        {
          heading: 'Simplification Rules',
          bullets: [
            'Sequential blocks add: O(A) + O(B) = O(max(A, B))',
            'Nested dependent loops multiply: O(n) inside O(log n) = O(n log n)',
            'Ignore constants: O(5n + 20) → O(n)',
          ],
        },
      ],
    },
    mindmap: {
      topic: 'Algorithm Complexity',
      children: [
        {
          topic: 'Asymptotic Bounds',
          children: [
            { topic: 'Big O (Upper Bound)' },
            { topic: 'Big Omega (Lower Bound)' },
            { topic: 'Big Theta (Tight Bound)' },
          ],
        },
        {
          topic: 'Common Classes',
          children: [
            { topic: 'O(1) Constant' },
            { topic: 'O(log n) Logarithmic' },
            { topic: 'O(n log n) Linearithmic' },
            { topic: 'O(n²) Quadratic' },
          ],
        },
        {
          topic: 'Space Complexity',
          children: [
            { topic: 'Auxiliary Memory' },
            { topic: 'Recursion Call Stack' },
          ],
        },
      ],
    },
  },
  {
    id: 'rec-os-memory',
    jobId: 'job-os-memory',
    title: 'Operating Systems: Memory Management & Paging',
    folderId: 'cs101',
    subjectLabel: 'Computer Science',
    lecturer: 'Prof. Vikram Mehta',
    source: 'recorded',
    status: 'done',
    progress: 100,
    stage: 'done',
    durationSeconds: 3120,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    suggestedQuestions: [
      'How does paging eliminate external fragmentation?',
      'What role does the TLB play during virtual-to-physical address translation?',
      'What happens when a page fault occurs?',
    ],
    transcript: [
      {
        id: 'm1',
        speaker: 'Prof. Vikram Mehta',
        timestamp: '00:02:05',
        text: 'Operating systems isolate each process using virtual memory. A process sees a contiguous address space even when its physical memory frames are scattered across RAM.',
      },
      {
        id: 'm2',
        speaker: 'Prof. Vikram Mehta',
        timestamp: '00:15:40',
        text: 'Paging divides virtual memory into fixed-size blocks called pages and physical memory into frames of the exact same size, typically 4 KB. This completely eliminates external fragmentation.',
      },
      {
        id: 'm3',
        speaker: 'Prof. Vikram Mehta',
        timestamp: '00:28:18',
        text: 'Because reading a page table in RAM on every instruction would double memory latency, CPUs use a fast hardware cache called the Translation Lookaside Buffer, or TLB.',
      },
    ],
    notes: {
      title: 'Operating Systems: Memory Management & Paging',
      summary:
        'Virtual memory decouples logical process addresses from physical RAM using fixed-size pages, page tables, and hardware TLB caching.',
      keyPoints: [
        'MMU (Memory Management Unit) translates virtual addresses to physical addresses at runtime.',
        'Paging splits virtual space into pages and RAM into equal-sized frames, removing external fragmentation.',
        'TLB caches recent virtual-to-physical page mappings to keep translation overhead near zero.',
        'Page faults trap to the OS kernel to load missing pages from swap/disk into a free frame.',
      ],
      definitions: [
        {
          term: 'Page vs. Frame',
          meaning: 'A page is a fixed-size block of virtual memory; a frame is the matching fixed-size slot in physical RAM.',
        },
        {
          term: 'TLB (Translation Lookaside Buffer)',
          meaning: 'High-speed associative hardware cache inside the MMU storing recent page-table entries.',
        },
        {
          term: 'Thrashing',
          meaning: 'Severe performance collapse when a system spends more time swapping pages to/from disk than executing instructions.',
        },
      ],
      examples: [
        'With 4 KB (2¹²) pages and a 32-bit address, the lower 12 bits form the offset and upper 20 bits index the page number.',
        'LRU (Least Recently Used) page replacement approximates optimal replacement without future knowledge.',
      ],
      revisionSheet: [
        'Effective Access Time (EAT) = HitRate × (TLB + RAM) + (1 - HitRate) × (TLB + 2 × RAM).',
        'Internal fragmentation occurs only inside the last allocated page; external fragmentation is zero in paging.',
        'Belady’s Anomaly affects FIFO replacement (more frames can cause more page faults), never LRU.',
      ],
    },
    cheatsheet: {
      sections: [
        {
          heading: 'Address Translation',
          bullets: [
            'Virtual Address = [Page Number (p) | Page Offset (d)]',
            'Physical Address = [Frame Number (f) | Page Offset (d)]',
            'Offset bits stay unchanged during translation',
          ],
        },
        {
          heading: 'Replacement Policies',
          bullets: [
            'FIFO — Simple queue; suffers from Belady’s Anomaly',
            'LRU — Evicts oldest referenced page; stack-based',
            'Clock (Second Chance) — Hardware-friendly LRU approximation using reference bit',
          ],
        },
      ],
    },
    mindmap: {
      topic: 'Memory Management',
      children: [
        {
          topic: 'Paging Architecture',
          children: [
            { topic: 'Virtual Pages & Physical Frames' },
            { topic: 'Page Table & Valid Bit' },
            { topic: 'Zero External Fragmentation' },
          ],
        },
        {
          topic: 'Hardware Acceleration',
          children: [
            { topic: 'MMU Translation' },
            { topic: 'TLB Cache Hits' },
          ],
        },
        {
          topic: 'Page Replacement',
          children: [
            { topic: 'Page Fault Handling' },
            { topic: 'LRU & Clock Algorithms' },
            { topic: 'Thrashing & Working Set' },
          ],
        },
      ],
    },
  },
  {
    id: 'rec-psych-cognitive',
    jobId: 'job-psych-cognitive',
    title: 'Cognitive Development in Early Childhood',
    folderId: 'psychology',
    subjectLabel: 'Psychology',
    lecturer: 'Dr. Ananya Nair',
    source: 'uploaded',
    status: 'done',
    progress: 100,
    stage: 'done',
    durationSeconds: 2280,
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(3),
    suggestedQuestions: [
      'What milestone marks the end of the sensorimotor stage?',
      'How does Vygotsky’s Zone of Proximal Development differ from Piaget?',
      'What is conservation in the preoperational vs concrete operational stage?',
    ],
    transcript: [
      {
        id: 'p1',
        speaker: 'Dr. Ananya Nair',
        timestamp: '00:03:18',
        text: 'Jean Piaget proposed that children construct mental schemas through assimilation—fitting new experiences into existing schemas—and accommodation—modifying schemas when new information doesn’t fit.',
      },
      {
        id: 'p2',
        speaker: 'Dr. Ananya Nair',
        timestamp: '00:14:22',
        text: 'During the sensorimotor stage from birth to age two, infants develop object permanence: understanding that objects continue to exist even when out of sight.',
      },
      {
        id: 'p3',
        speaker: 'Dr. Ananya Nair',
        timestamp: '00:26:50',
        text: 'In contrast to Piaget’s individual explorer model, Lev Vygotsky emphasized social scaffolding and the Zone of Proximal Development—skills a child can perform with guided support.',
      },
    ],
    notes: {
      title: 'Cognitive Development in Early Childhood',
      summary:
        'Compares Piaget’s stage theory of cognitive schemas with Vygotsky’s sociocultural scaffolding model across infancy and early childhood.',
      keyPoints: [
        'Schemas evolve through two complementary mechanisms: assimilation and accommodation.',
        'Sensorimotor stage (0–2 yrs) culminates in object permanence and early symbolic thought.',
        'Preoperational stage (2–7 yrs) features symbolic play alongside egocentrism and centration.',
        'Vygotsky argued language and guided social interaction drive higher cognitive functions.',
      ],
      definitions: [
        {
          term: 'Object Permanence',
          meaning: 'Awareness that physical objects continue to exist when hidden from immediate sensory perception.',
        },
        {
          term: 'Egocentrism (Piaget)',
          meaning: 'Difficulty perceiving a physical or social situation from another person’s viewpoint.',
        },
        {
          term: 'Zone of Proximal Development (ZPD)',
          meaning: 'Gap between what a learner can do independently and what they can achieve with skilled guidance.',
        },
      ],
      examples: [
        'A toddler calling a zebra a "horse" is assimilation; learning it is a separate animal is accommodation.',
        'Pouring water from a wide glass into a tall narrow glass tests conservation of volume.',
      ],
      revisionSheet: [
        'Piaget 4 stages: Sensorimotor (0–2) → Preoperational (2–7) → Concrete Operational (7–11) → Formal Operational (11+).',
        'Preoperational children struggle with conservation because of centration (focusing on one dimension like height).',
        'Scaffolding = temporary, adaptive adult support inside the child’s ZPD that fades as competence grows.',
      ],
    },
    cheatsheet: {
      sections: [
        {
          heading: 'Piaget vs. Vygotsky',
          bullets: [
            'Piaget: Universal stages driven by biological maturation & exploration',
            'Vygotsky: Continuous growth shaped by culture, language & mentoring',
            'Private speech: Piaget viewed as egocentric; Vygotsky viewed as self-regulation',
          ],
        },
      ],
    },
    mindmap: {
      topic: 'Cognitive Development',
      children: [
        {
          topic: 'Piaget Stage Theory',
          children: [
            { topic: 'Assimilation & Accommodation' },
            { topic: 'Sensorimotor (Object Permanence)' },
            { topic: 'Preoperational (Egocentrism)' },
            { topic: 'Concrete Operational (Conservation)' },
          ],
        },
        {
          topic: 'Vygotsky Sociocultural',
          children: [
            { topic: 'Zone of Proximal Development' },
            { topic: 'Scaffolding' },
            { topic: 'Inner Speech' },
          ],
        },
      ],
    },
  },
  {
    id: 'rec-psych-social',
    jobId: 'job-psych-social',
    title: 'Social Psychology & Group Conformity',
    folderId: 'psychology',
    subjectLabel: 'Psychology',
    lecturer: 'Dr. Ananya Nair',
    source: 'uploaded',
    status: 'done',
    progress: 100,
    stage: 'done',
    durationSeconds: 2450,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    suggestedQuestions: [
      'What did Solomon Asch’s line-judgment experiment demonstrate?',
      'What is the difference between normative and informational social influence?',
    ],
    transcript: [
      {
        id: 's1',
        speaker: 'Dr. Ananya Nair',
        timestamp: '00:05:10',
        text: 'In Solomon Asch’s 1951 conformity studies, participants matched line lengths aloud after hearing confederates give obviously wrong answers. Around 75% conformed at least once.',
      },
      {
        id: 's2',
        speaker: 'Dr. Ananya Nair',
        timestamp: '00:18:40',
        text: 'People conform either for normative reasons—to avoid rejection and fit in—or informational reasons—believing the group possesses better information in ambiguous situations.',
      },
    ],
    notes: {
      title: 'Social Psychology & Group Conformity',
      summary:
        'Examines how group consensus alters individual judgment through normative and informational social influence, illustrated by Asch and Milgram.',
      keyPoints: [
        'Normative influence drives compliance to gain social acceptance; informational influence drives private acceptance.',
        'Having just one dissenting ally in Asch’s experiment dropped conformity by nearly 80%.',
        'Groupthink occurs when desire for harmony overrides critical evaluation of alternatives.',
      ],
      definitions: [
        {
          term: 'Normative Social Influence',
          meaning: 'Conforming to group expectations in order to be liked or avoid social rejection.',
        },
        {
          term: 'Groupthink',
          meaning: 'Dysfunctional decision-making where cohesive groups suppress dissent to preserve consensus.',
        },
      ],
      examples: [
        'Asch line test: Clear objective answer, yet ~37% of total trials yielded to the incorrect majority.',
        'Emergency ambiguity: Bystander effect slows help when everyone looks to others to define the situation.',
      ],
      revisionSheet: [
        'Compliance = public agreement; Internalization = private + public belief change.',
        'Preventing groupthink: Assign a devil’s advocate, solicit anonymous ballots, bring outside reviewers.',
      ],
    },
    cheatsheet: {
      sections: [
        {
          heading: 'Classic Experiments',
          bullets: [
            'Asch (1951) — Visual line conformity under unanimous majority',
            'Milgram (1963) — Obedience to legitimate authority figures',
            'Darley & Latané — Diffusion of responsibility in bystander intervention',
          ],
        },
      ],
    },
    mindmap: {
      topic: 'Social Influence',
      children: [
        {
          topic: 'Conformity',
          children: [
            { topic: 'Normative Influence' },
            { topic: 'Informational Influence' },
            { topic: 'Asch Line Study' },
          ],
        },
        {
          topic: 'Group Dynamics',
          children: [
            { topic: 'Groupthink' },
            { topic: 'Bystander Effect' },
          ],
        },
      ],
    },
  },
  {
    id: 'rec-history-industrial',
    jobId: 'job-history-industrial',
    title: 'The Industrial Revolution: Part 2 — Steam & Railways',
    folderId: 'history',
    subjectLabel: 'World History',
    lecturer: 'Prof. Elena Rostova',
    source: 'uploaded',
    status: 'processing',
    progress: 72,
    stage: 'generating_notes',
    durationSeconds: 2890,
    createdAt: minsAgo(8),
    updatedAt: minsAgo(1),
    transcript: [],
    notes: null,
    cheatsheet: null,
    mindmap: null,
  },
  {
    id: 'rec-history-ww1',
    jobId: 'job-history-ww1',
    title: 'World War I: Alliances & July Crisis',
    folderId: 'history',
    subjectLabel: 'World History',
    lecturer: 'Prof. Elena Rostova',
    source: 'recorded',
    status: 'done',
    progress: 100,
    stage: 'done',
    durationSeconds: 2940,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    suggestedQuestions: [
      'What does the MAIN acronym stand for regarding WWI causes?',
      'How did mobilization timetables turn a regional crisis into a continental war?',
    ],
    transcript: [
      {
        id: 'w1',
        speaker: 'Prof. Elena Rostova',
        timestamp: '00:04:00',
        text: 'Historians summarize long-term structural causes using MAIN: Militarism, Alliances, Imperialism, and Nationalism. Rigid railway mobilization schedules left diplomats little room to pause.',
      },
      {
        id: 'w2',
        speaker: 'Prof. Elena Rostova',
        timestamp: '00:22:15',
        text: 'Following the assassination in Sarajevo on June 28, 1914, Austria-Hungary issued an ultimatum to Serbia backed by Germany’s blank check, triggering cascading alliance commitments.',
      },
    ],
    notes: {
      title: 'World War I: Alliances & July Crisis',
      summary:
        'Traces how long-term European rivalries (MAIN) interacted with rigid military mobilization timetables during the July Crisis of 1914.',
      keyPoints: [
        'Triple Entente (Britain, France, Russia) vs. Triple Alliance / Central Powers (Germany, Austria-Hungary, Italy initially).',
        'Schlieffen Plan required Germany to defeat France rapidly through neutral Belgium before Russia fully mobilized.',
        'Invasion of neutral Belgium brought Great Britain into the conflict on August 4, 1914.',
      ],
      definitions: [
        {
          term: 'July Crisis (1914)',
          meaning: 'Five-week diplomatic escalation between Sarajevo assassination and general European war.',
        },
        {
          term: 'Schlieffen Plan',
          meaning: 'German two-front war strategy prioritizing a rapid western sweep through Belgium.',
        },
      ],
      examples: [
        '1914 railway timetables meant partial mobilization was logistically impossible for Russia and Germany without exposing borders.',
      ],
      revisionSheet: [
        'MAIN = Militarism, Alliances, Imperialism, Nationalism.',
        'Trigger event: June 28, 1914 assassination of Archduke Franz Ferdinand in Sarajevo.',
        'Key shift: Belgian neutrality violation (Treaty of London 1839) triggered British declaration of war.',
      ],
    },
    cheatsheet: {
      sections: [
        {
          heading: '1914 Escalation Timeline',
          bullets: [
            'Jun 28 — Assassination in Sarajevo',
            'Jul 23 — Austro-Hungarian ultimatum to Serbia',
            'Jul 28 — Austria-Hungary declares war on Serbia',
            'Aug 1–4 — German & Russian mobilization; Belgium invaded; Britain enters war',
          ],
        },
      ],
    },
    mindmap: {
      topic: 'Origins of WWI',
      children: [
        {
          topic: 'Long-Term (MAIN)',
          children: [
            { topic: 'Militarism & Arms Race' },
            { topic: 'Entangling Alliances' },
            { topic: 'Imperial Rivalry' },
            { topic: 'Balkan Nationalism' },
          ],
        },
        {
          topic: 'July Crisis 1914',
          children: [
            { topic: 'Sarajevo Assassination' },
            { topic: 'Mobilization Timetables' },
            { topic: 'Schlieffen Plan & Belgium' },
          ],
        },
      ],
    },
  },
  {
    id: 'rec-cs-threads',
    jobId: 'job-cs-threads',
    title: 'Processes, Threads & CPU Scheduling (Corrupted Mic File)',
    folderId: 'cs101',
    subjectLabel: 'Computer Science',
    lecturer: 'Prof. Vikram Mehta',
    source: 'uploaded',
    status: 'failed',
    progress: 38,
    stage: 'failed',
    error: 'Noise reduction worker timed out on corrupted audio frame at 18:42. Retry processing to re-queue.',
    durationSeconds: 1520,
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(6),
    transcript: [],
    notes: null,
    cheatsheet: null,
    mindmap: null,
  },
];
