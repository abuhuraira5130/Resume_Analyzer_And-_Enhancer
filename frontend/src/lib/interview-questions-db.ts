/**
 * Seed interview questions DB. Used as fallback / context for the AI agent.
 * Organized by topic + difficulty. AI also generates contextual follow-ups.
 */

export type Difficulty = "easy" | "medium" | "hard";
export type Category = "technical" | "behavioral" | "situational" | "system_design";

export type SeedQuestion = {
  text: string;
  category: Category;
  topic: string;
  difficulty: Difficulty;
};

const tech = (topic: string, difficulty: Difficulty, items: string[]): SeedQuestion[] =>
  items.map((text) => ({ text, category: "technical", topic, difficulty }));

const beh = (items: string[]): SeedQuestion[] =>
  items.map((text) => ({ text, category: "behavioral", topic: "behavioral", difficulty: "medium" as const }));

const sit = (items: string[]): SeedQuestion[] =>
  items.map((text) => ({ text, category: "situational", topic: "situational", difficulty: "medium" as const }));

const sys = (items: string[]): SeedQuestion[] =>
  items.map((text) => ({ text, category: "system_design", topic: "system_design", difficulty: "hard" as const }));

export const QUESTIONS_DB: SeedQuestion[] = [
  // ---------------- JavaScript ----------------
  ...tech("javascript", "easy", [
    "What is the difference between let, const, and var in JavaScript?",
    "Explain event bubbling and event capturing.",
    "What are JavaScript promises and how do they work?",
    "What is the difference between == and ===?",
    "Explain closures in JavaScript with an example.",
    "What is hoisting in JavaScript?",
    "How does the 'this' keyword work in JavaScript?",
    "What is the difference between null and undefined?",
    "Explain the difference between map, filter, and reduce.",
  ]),
  ...tech("javascript", "medium", [
    "Explain the event loop and how JavaScript handles asynchronous operations.",
    "What is the difference between call(), apply(), and bind()?",
    "Explain prototype chain and inheritance in JavaScript.",
    "How does async/await work under the hood?",
    "What are WeakMaps and WeakSets and when would you use them?",
    "Explain memoization and walk through implementing it.",
    "What is the difference between shallow and deep copy?",
    "Explain the module system: ESM vs CommonJS.",
    "What's the temporal dead zone and why does it exist?",
  ]),
  ...tech("javascript", "hard", [
    "Design a rate limiter that allows N requests per second.",
    "Implement a Promise from scratch.",
    "Implement debounce and throttle from scratch and explain the difference.",
    "Explain V8 hidden classes and inline caching.",
    "How does garbage collection work in V8 (mark and sweep, generational)?",
    "Design a pub/sub system with namespacing and once-only listeners.",
    "Walk through how you would profile and fix a memory leak in a long-running Node service.",
  ]),

  // ---------------- TypeScript ----------------
  ...tech("typescript", "easy", [
    "What is the difference between interface and type alias?",
    "Explain unknown vs any vs never.",
    "What are union and intersection types?",
  ]),
  ...tech("typescript", "medium", [
    "Explain conditional types with an example.",
    "What are mapped types and when would you use them?",
    "How does TypeScript's type narrowing work?",
    "Explain generics with a real-world example.",
  ]),
  ...tech("typescript", "hard", [
    "Implement a deep Readonly<T> utility type.",
    "Walk through how you'd type a fully type-safe event emitter.",
    "Explain variance: covariance, contravariance, bivariance in TS.",
  ]),

  // ---------------- React ----------------
  ...tech("react", "easy", [
    "What is the virtual DOM and why does React use it?",
    "Explain the difference between props and state.",
    "What are React keys and why are they important?",
    "Explain useEffect and its dependency array.",
    "Difference between controlled and uncontrolled components.",
  ]),
  ...tech("react", "medium", [
    "Explain useMemo and useCallback. When are they actually useful?",
    "How does React reconciliation work?",
    "What's the difference between useEffect and useLayoutEffect?",
    "Explain React Context and when you'd reach for it vs a state library.",
    "How do you handle data fetching in React (libraries, patterns)?",
    "Explain Suspense and Server Components at a high level.",
  ]),
  ...tech("react", "hard", [
    "How would you optimize a React table rendering 10,000 rows?",
    "Implement a useDebouncedValue hook from scratch.",
    "Explain React's Fiber architecture.",
    "Walk through designing a global undo/redo for a complex form.",
    "How would you implement code-splitting and route-level prefetching?",
  ]),

  // ---------------- Node.js ----------------
  ...tech("nodejs", "easy", [
    "Explain the Node.js event loop phases.",
    "What is the difference between process.nextTick and setImmediate?",
    "How do streams work in Node.js?",
  ]),
  ...tech("nodejs", "medium", [
    "How would you handle uncaught exceptions in production?",
    "Explain clustering and the worker threads module.",
    "How do you secure an Express API?",
    "Walk through implementing graceful shutdown.",
  ]),
  ...tech("nodejs", "hard", [
    "Design a file upload service that handles 1GB files reliably.",
    "How would you build a job queue from scratch on top of Redis?",
    "Profile and fix a CPU-bound bottleneck in a Node service.",
  ]),

  // ---------------- Python ----------------
  ...tech("python", "easy", [
    "Explain Python decorators with an example.",
    "What are list, dict, and set comprehensions?",
    "Difference between a list and a tuple.",
    "What is the GIL and how does it affect threading?",
  ]),
  ...tech("python", "medium", [
    "Explain context managers and the with statement.",
    "How does Python's MRO (Method Resolution Order) work?",
    "Walk through generators and the yield keyword.",
    "What's the difference between deepcopy and copy?",
  ]),
  ...tech("python", "hard", [
    "Implement an LRU cache without functools.lru_cache.",
    "Explain asyncio's event loop and the difference vs threading.",
    "How would you optimize a Python data pipeline processing 10M rows?",
  ]),

  // ---------------- Django / FastAPI ----------------
  ...tech("django", "easy", [
    "Explain the Django request/response cycle.",
    "What is Django's ORM and how do migrations work?",
    "What are Django signals?",
  ]),
  ...tech("django", "medium", [
    "How do you handle N+1 queries in Django?",
    "Explain class-based views vs function-based views.",
    "How would you implement JWT auth in Django REST Framework?",
  ]),
  ...tech("django", "hard", [
    "Design a multi-tenant SaaS schema in Django.",
    "Walk through caching strategies for a high-traffic Django app.",
  ]),

  // ---------------- SQL / Databases ----------------
  ...tech("sql", "easy", [
    "Difference between INNER JOIN and LEFT JOIN.",
    "What is an index and when would you add one?",
    "Explain primary key vs foreign key vs unique constraint.",
  ]),
  ...tech("sql", "medium", [
    "Explain normalization (1NF, 2NF, 3NF) with an example.",
    "What are window functions? Give a real use case.",
    "How do transactions and isolation levels work?",
    "Explain CTE vs subquery vs temp table.",
  ]),
  ...tech("sql", "hard", [
    "Diagnose a slow query: walk through your process from EXPLAIN to fix.",
    "Design a schema for a job board with applications, employers, candidates.",
    "Explain ACID vs BASE and when each model fits.",
  ]),

  // ---------------- DevOps / Cloud ----------------
  ...tech("docker", "easy", [
    "What's the difference between an image and a container?",
    "Explain Dockerfile layers and caching.",
  ]),
  ...tech("docker", "medium", [
    "How would you reduce the size of a Node.js Docker image?",
    "Explain multi-stage builds.",
  ]),
  ...tech("kubernetes", "medium", [
    "Explain Pods, Deployments, and Services.",
    "What is a Helm chart and when would you use one?",
  ]),
  ...tech("kubernetes", "hard", [
    "Design rolling deploys with zero downtime.",
    "How do you debug a CrashLoopBackOff pod?",
  ]),
  ...tech("aws", "medium", [
    "Difference between EC2, ECS, EKS, and Lambda.",
    "Explain VPC, subnets, and security groups.",
    "When would you use SQS vs SNS vs Kinesis?",
  ]),
  ...tech("aws", "hard", [
    "Design a globally distributed file storage system on AWS.",
    "Walk through an incident response: an API is 5xx-ing in one region.",
  ]),

  // ---------------- General CS ----------------
  ...tech("general", "easy", [
    "What is Big-O notation? Give an example of O(n), O(log n), O(n^2).",
    "Explain the difference between a stack and a queue.",
    "What is recursion? When would you avoid it?",
  ]),
  ...tech("general", "medium", [
    "Explain hash tables: how they work and worst-case complexity.",
    "What is the difference between depth-first and breadth-first search?",
    "Explain dynamic programming with an example.",
  ]),
  ...tech("general", "hard", [
    "Find the kth largest element in an unsorted array — discuss approaches and tradeoffs.",
    "Implement an LRU cache with O(1) get and put.",
    "Detect a cycle in a directed graph.",
  ]),

  // ---------------- Behavioral ----------------
  ...beh([
    "Tell me about yourself and your background.",
    "Walk me through a project you're most proud of.",
    "Describe a time you disagreed with a teammate. How did you resolve it?",
    "Tell me about a time you failed. What did you learn?",
    "Describe a time you went above and beyond.",
    "How do you prioritize when everything feels urgent?",
    "Tell me about a time you received tough feedback.",
    "Describe a project that didn't go as planned and what you did.",
    "Tell me about a time you had to learn something new quickly.",
    "What's your biggest weakness and how are you working on it?",
    "Why are you leaving your current role?",
    "Where do you see yourself in three years?",
    "Tell me about a time you mentored someone.",
    "Describe a situation where you had to influence without authority.",
    "Tell me about a time you led a project from start to finish.",
  ]),

  // ---------------- Situational ----------------
  ...sit([
    "You're shipping a feature on Friday and find a bug an hour before deploy. What do you do?",
    "A junior engineer pushes code that breaks production. How do you handle it?",
    "Your manager asks you to estimate a project you've never done. Walk me through your approach.",
    "You inherit a legacy codebase with no tests. How do you start improving it?",
    "A teammate consistently misses deadlines. What's your move?",
    "Two stakeholders give you conflicting requirements. What do you do?",
  ]),

  // ---------------- System Design ----------------
  ...sys([
    "Design a URL shortener like bit.ly. Walk me through architecture and tradeoffs.",
    "Design a real-time chat application like WhatsApp.",
    "Design a rate limiter for a public API.",
    "Design a caching layer for a read-heavy product.",
    "Design a notification service that fans out to millions of users.",
    "How would you build search autocomplete?",
    "Design Twitter's home feed.",
    "How would you scale an e-commerce checkout under flash-sale traffic?",
  ]),
];

/**
 * Pick N seed questions tailored to detected resume skills + difficulty.
 * Mix: 2 behavioral warm-ups, then technical from skills, then a situational/system design.
 */
export function pickSeedQuestions(opts: {
  resumeSkills: string[];
  difficulty: Difficulty;
  count: number;
}): SeedQuestion[] {
  const { difficulty, count } = opts;
  const skills = opts.resumeSkills.map((s) => s.toLowerCase());

  const pool = QUESTIONS_DB;
  const behavioral = pool.filter((q) => q.category === "behavioral");
  const situational = pool.filter((q) => q.category === "situational");
  const sysd = pool.filter((q) => q.category === "system_design");

  const matchedTech = pool.filter(
    (q) =>
      q.category === "technical" &&
      q.difficulty === difficulty &&
      skills.some((s) => q.topic === s || s.includes(q.topic) || q.topic.includes(s)),
  );
  const generalTech = pool.filter(
    (q) => q.category === "technical" && q.difficulty === difficulty && q.topic === "general",
  );

  const pickedBeh = sample(behavioral, 2);
  const techCount = Math.max(0, count - 4);
  const techPool = matchedTech.length >= techCount ? matchedTech : [...matchedTech, ...generalTech];
  const pickedTech = sample(techPool, techCount);
  const pickedSit = sample(situational, 1);
  const pickedSys = difficulty === "hard" ? sample(sysd, 1) : sample(generalTech, 1);

  const ordered: SeedQuestion[] = [
    pickedBeh[0],
    ...pickedTech.slice(0, Math.ceil(techCount / 2)),
    pickedSit[0],
    ...pickedTech.slice(Math.ceil(techCount / 2)),
    pickedBeh[1],
    pickedSys[0],
  ].filter(Boolean) as SeedQuestion[];

  return ordered.slice(0, count);
}

function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}
