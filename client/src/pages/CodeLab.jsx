import { useState, useMemo } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Boxes,
  Braces,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  Gauge,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  Trophy,
  XCircle,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

const CHALLENGES = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hash Maps",
    pattern: "Hash Map / Complement Lookup",
    companies: ["Google", "Amazon", "Meta", "Apple"],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.`,
    starterCode: `function twoSum(nums, target) {
  // Optimal O(N) Time and O(N) Space approach using Hash Map
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    tests: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] }
    ],
    hints: [
      "Brute force with nested loops takes O(N^2) time. Can we do better using auxiliary memory?",
      "As you iterate, calculate complement = target - nums[i]. Check if complement is in your Map.",
      "Store numbers as keys and their array indices as values."
    ],
    solution: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`,
    optimalComplexity: { time: "O(N)", space: "O(N)" }
  },
  {
    id: "longest-unique-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    pattern: "Dynamic Sliding Window with Set/Map",
    companies: ["Amazon", "Microsoft", "Bloomberg", "Google"],
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.

Example: For \`"abcabcbb"\`, the answer is 3 (\`"abc"\`). For \`"pwwkew"\`, the answer is 3 (\`"wke"\`).`,
    starterCode: `function lengthOfLongestSubstring(s) {
  // Implement optimal O(N) Sliding Window
  let maxLength = 0;
  let left = 0;
  const charSet = new Set();

  for (let right = 0; right < s.length; right++) {
    while (charSet.has(s[right])) {
      charSet.delete(s[left]);
      left++;
    }
    charSet.add(s[right]);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}`,
    tests: [
      { input: ["abcabcbb"], expected: 3 },
      { input: ["bbbbb"], expected: 1 },
      { input: ["pwwkew"], expected: 3 },
      { input: [""], expected: 0 },
      { input: ["au"], expected: 2 }
    ],
    hints: [
      "Maintain a window [left, right] of characters without duplicates.",
      "If the incoming character at 'right' is already in your Set, shrink the window from 'left' until the duplicate is evicted.",
      "Track the maximum window size (right - left + 1) at each expansion."
    ],
    solution: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let max = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right])) {
      left = Math.max(left, map.get(s[right]) + 1);
    }
    map.set(s[right], right);
    max = Math.max(max, right - left + 1);
  }
  return max;
}`,
    optimalComplexity: { time: "O(N)", space: "O(min(N, M))" }
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stacks & Queues",
    pattern: "Monotonic Stack / Bracket Matching",
    companies: ["Meta", "LinkedIn", "Uber", "Apple"],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    starterCode: `function isValid(s) {
  // Use a LIFO stack to verify bracket closures
  const stack = [];
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };

  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (map[char]) {
      if (stack.pop() !== map[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}`,
    tests: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([)]"], expected: false },
      { input: ["{[]}"], expected: true },
      { input: [""], expected: true }
    ],
    hints: [
      "Push opening brackets onto a stack.",
      "When encountering a closing bracket, pop the top of the stack and ensure it matches the corresponding opening bracket.",
      "At the end, ensure the stack is completely empty."
    ],
    solution: `function isValid(s) {
  const stack = [];
  const pairs = { '(': ')', '{': '}', '[': ']' };
  for (const c of s) {
    if (pairs[c]) stack.push(pairs[c]);
    else if (stack.pop() !== c) return false;
  }
  return stack.length === 0;
}`,
    optimalComplexity: { time: "O(N)", space: "O(N)" }
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    category: "Divide & Conquer",
    pattern: "Logarithmic Search Space Halving",
    companies: ["Microsoft", "Google", "Adobe"],
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`.

If \`target\` exists, return its index. Otherwise, return \`-1\`. You must write an algorithm with \`O(log n)\` runtime complexity.`,
    starterCode: `function search(nums, target) {
  // Binary search in O(log N)
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`,
    tests: [
      { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { input: [[5], 5], expected: 0 },
      { input: [[2, 5], 5], expected: 1 }
    ],
    hints: [
      "Maintain search pointers 'left' and 'right'.",
      "Calculate mid = Math.floor((left + right) / 2). Avoid integer overflow in typed languages with left + Math.floor((right - left) / 2).",
      "Cut the search range in half on each step."
    ],
    solution: `function search(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const mid = (l + r) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) l = mid + 1;
    else r = mid - 1;
  }
  return -1;
}`,
    optimalComplexity: { time: "O(log N)", space: "O(1)" }
  },
  {
    id: "debounce",
    title: "Implement Debounce with Immediate Execution",
    difficulty: "Medium",
    category: "JavaScript Core & Closures",
    pattern: "Higher-Order Functions & Async Timers",
    companies: ["Meta", "Netflix", "Atlassian", "Stripe"],
    description: `Create a \`debounce\` function that delays invoking the passed function until after \`delay\` milliseconds have elapsed since the last time it was invoked.

Debouncing is a crucial frontend optimization for search-as-you-type inputs, window resize handlers, and auto-save events.`,
    starterCode: `function debounce(fn, delay) {
  // Return the debounced wrapper using closures
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}`,
    tests: [
      {
        customRunner: true,
        run: async (fn) => {
          let count = 0;
          const increment = fn(() => { count++; }, 50);
          increment();
          increment();
          increment();
          await new Promise((r) => setTimeout(r, 90));
          return { pass: count === 1, actual: count, expected: 1 };
        }
      }
    ],
    hints: [
      "Use lexical closure scope to hold a reference to the active timer ID.",
      "Clear any pending timeout via clearTimeout(timer) whenever the function is invoked anew.",
      "Ensure 'this' context and variable arguments are properly forwarded via fn.apply(this, args)."
    ],
    solution: `function debounce(fn, delay) {
  let timerId;
  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}`,
    optimalComplexity: { time: "O(1) invocation", space: "O(1) closure" }
  },
  {
    id: "deep-clone",
    title: "Deep Clone with Circular Reference Support",
    difficulty: "Medium",
    category: "Object Manipulation & Recursion",
    pattern: "Recursive Traversal & WeakMap Cache",
    companies: ["Airbnb", "Uber", "Shopify"],
    description: `Implement a \`deepClone\` function that creates an exact deep copy of a nested JavaScript structure (objects and arrays) without retaining shared references.`,
    starterCode: `function deepClone(obj) {
  // Implement deep clone handling primitives, arrays, and objects
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  
  const copy = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepClone(obj[key]);
    }
  }
  return copy;
}`,
    tests: [
      {
        input: [{ a: 1, b: { c: 2, d: [3, 4] } }],
        verify: (res, original) => {
          return (
            JSON.stringify(res) === JSON.stringify(original[0]) &&
            res !== original[0] &&
            res.b !== original[0].b &&
            res.b.d !== original[0].b.d
          );
        }
      },
      {
        input: [{ list: [10, 20, [30, 40]] }],
        verify: (res, original) => {
          return (
            JSON.stringify(res) === JSON.stringify(original[0]) &&
            res.list !== original[0].list &&
            res.list[2] !== original[0].list[2]
          );
        }
      }
    ],
    hints: [
      "Check for null and primitive types first; return them directly.",
      "If the input is an array, recursively clone each item via .map().",
      "For regular objects, create a new object and clone every own property."
    ],
    solution: `function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (hash.has(obj)) return hash.get(obj);
  const copy = Array.isArray(obj) ? [] : {};
  hash.set(obj, copy);
  for (const key of Object.keys(obj)) {
    copy[key] = deepClone(obj[key], hash);
  }
  return copy;
}`,
    optimalComplexity: { time: "O(N) nodes", space: "O(D) call depth" }
  },
  {
    id: "flatten-array",
    title: "Flatten Arbitrarily Nested Array",
    difficulty: "Easy",
    category: "Recursion & Arrays",
    pattern: "Recursive Accumulation / Reduce",
    companies: ["Amazon", "Twitter", "Goldman Sachs"],
    description: `Write a function \`flatten\` that takes a multi-dimensional array of arbitrary depth and returns a completely flat one-dimensional array.`,
    starterCode: `function flatten(arr) {
  // Flatten array of arbitrary depth
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}`,
    tests: [
      { input: [[[1, [2, [3, [4]], 5]]]], expected: [1, 2, 3, 4, 5] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[[]]], expected: [] },
      { input: [[1, [2, 3], [[4]], 5]], expected: [1, 2, 3, 4, 5] }
    ],
    hints: [
      "Iterate through the array. Check Array.isArray(item) for each element.",
      "If it's an array, recursively call flatten(item) and concatenate/spread the result into your accumulator.",
      "Alternatively, implement using Array.prototype.reduce()."
    ],
    solution: `function flatten(arr) {
  return arr.reduce((acc, val) => 
    Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []
  );
}`,
    optimalComplexity: { time: "O(N) elements", space: "O(D) recursion depth" }
  },
  {
    id: "lru-cache",
    title: "LRU Cache (Least Recently Used)",
    difficulty: "Hard",
    category: "Design Data Structure",
    pattern: "Hash Map + Doubly Linked List",
    companies: ["Google", "Amazon", "Apple", "Microsoft"],
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\`: Initialize with positive capacity.
- \`int get(int key)\`: Return the value if key exists, otherwise return -1.
- \`void put(int key, int value)\`: Update or insert value. When capacity is exceeded, evict the least recently used key.

Both \`get\` and \`put\` must run in average \`O(1)\` time complexity.`,
    starterCode: `function createLRUCache(capacity) {
  // Using JS Map which preserves insertion order
  const map = new Map();

  return {
    get(key) {
      if (!map.has(key)) return -1;
      const val = map.get(key);
      map.delete(key);
      map.set(key, val); // Move to recent
      return val;
    },
    put(key, value) {
      if (map.has(key)) {
        map.delete(key);
      } else if (map.size >= capacity) {
        // Evict oldest (first key in map)
        const oldestKey = map.keys().next().value;
        map.delete(oldestKey);
      }
      map.set(key, value);
    }
  };
}`,
    tests: [
      {
        customRunner: true,
        run: async (fn) => {
          const cache = fn(2);
          cache.put(1, 1);
          cache.put(2, 2);
          const r1 = cache.get(1); // returns 1, key 1 is now most recent
          cache.put(3, 3); // evicts key 2
          const r2 = cache.get(2); // returns -1 (evicted)
          cache.put(4, 4); // evicts key 1
          const r3 = cache.get(1); // returns -1
          const r4 = cache.get(3); // returns 3
          const r5 = cache.get(4); // returns 4
          const pass = r1 === 1 && r2 === -1 && r3 === -1 && r4 === 3 && r5 === 4;
          return {
            pass,
            expected: "1, -1, -1, 3, 4",
            actual: `${r1}, ${r2}, ${r3}, ${r4}, ${r5}`
          };
        }
      }
    ],
    hints: [
      "In standard lower-level implementations, a Hash Map paired with a Doubly Linked List gives O(1) node detachment and insertion.",
      "In JavaScript, Map keys are ordered by insertion time. Calling map.delete(key) followed by map.set(key, val) shifts it to the most recent position!",
      "To evict the oldest entry, get the first key via map.keys().next().value."
    ],
    solution: `function createLRUCache(capacity) {
  const map = new Map();
  return {
    get(key) {
      if (!map.has(key)) return -1;
      const v = map.get(key);
      map.delete(key);
      map.set(key, v);
      return v;
    },
    put(key, value) {
      if (map.has(key)) map.delete(key);
      else if (map.size >= capacity) {
        map.delete(map.keys().next().value);
      }
      map.set(key, value);
    }
  };
}`,
    optimalComplexity: { time: "O(1) all ops", space: "O(Capacity)" }
  }
];

// Algorithmic Design Patterns Knowledge Base
const ALGORITHM_PATTERNS = [
  {
    id: "two-pointers",
    name: "Two Pointers",
    bestFor: "Sorted arrays, Palindrome checking, Pair summation, Container with most water",
    complexity: "Time: O(N) | Space: O(1) In-Place",
    companies: ["Meta", "Google", "Amazon"],
    intuition: "Instead of quadratic nested iterations, place one pointer at the start and another at the end (or both at start advancing at different conditions). Converge pointers based on conditions.",
    codeTemplate: `function twoPointersPattern(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}`
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    bestFor: "Subarrays, Substrings with constraints, Maximum sum of size K, Longest substring without duplicates",
    complexity: "Time: O(N) amortized | Space: O(K) hash map",
    companies: ["Amazon", "Uber", "Microsoft"],
    intuition: "Expand the right pointer to incorporate elements until constraint is broken; then contract the left pointer until validity is restored. Avoids recomputing sums/counts from scratch.",
    codeTemplate: `function slidingWindowPattern(s) {
  let left = 0, maxLen = 0;
  const map = new Map();
  for (let right = 0; right < s.length; right++) {
    // 1. Expand right
    map.set(s[right], (map.get(s[right]) || 0) + 1);
    // 2. Shrink left if constraint violated
    while (map.get(s[right]) > 1) {
      map.set(s[left], map.get(s[left]) - 1);
      left++;
    }
    // 3. Update result
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`
  },
  {
    id: "monotonic-stack",
    name: "Monotonic Stack",
    bestFor: "Next Greater Element, Daily Temperatures, Stock Span, Largest Rectangle in Histogram",
    complexity: "Time: O(N) | Space: O(N) Auxiliary",
    companies: ["Bloomberg", "Google", "ByteDance"],
    intuition: "Maintain a stack whose elements are strictly increasing or strictly decreasing. When a new element violates the monotonicity, pop elements to resolve answers for the popped items.",
    codeTemplate: `function nextGreaterElement(nums) {
  const result = new Array(nums.length).fill(-1);
  const stack = []; // Stores indices
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      const prevIdx = stack.pop();
      result[prevIdx] = nums[i];
    }
    stack.push(i);
  }
  return result;
}`
  },
  {
    id: "binary-search",
    name: "Binary Search & Pruning",
    bestFor: "Sorted collections, Monotonic answer spaces (e.g. Ship Packages, Painter Partition), Peak Element",
    complexity: "Time: O(log N) | Space: O(1) In-Place",
    companies: ["Microsoft", "Apple", "Adobe"],
    intuition: "If a decision function satisfies: false false false true true true (monotonicity), binary search can find the transition boundary in logarithmic steps by halving search space.",
    codeTemplate: `function binarySearchPattern(nums, target) {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`
  },
  {
    id: "fast-slow-pointers",
    name: "Fast & Slow Pointers (Tortoise & Hare)",
    bestFor: "Linked List cycles, Middle element of linked list, Happy Number, Circular Array",
    complexity: "Time: O(N) | Space: O(1) In-Place",
    companies: ["Meta", "Amazon", "Qualcomm"],
    intuition: "Advance slow pointer by 1 step and fast pointer by 2 steps. If a cycle exists, fast will inevitably lap slow inside the loop in O(N) steps without allocating extra memory.",
    codeTemplate: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // Cycle detected
  }
  return false;
}`
  },
  {
    id: "memoized-dp",
    name: "Dynamic Programming (Memoization)",
    bestFor: "Optimal substructure & Overlapping subproblems: Knapsack, Edit Distance, Coin Change, Path Finding",
    complexity: "Time: O(States) | Space: O(States) memo table",
    companies: ["Google", "Netflix", "Uber"],
    intuition: "Break complex optimization problems into smaller recursive subproblems and cache the answers in a hash map or table to prevent redundant exponential recalculation.",
    codeTemplate: `function fibMemo(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}`
  }
];

export default function CodeLab() {
  const [selectedChallenge, setSelectedChallenge] = useState(CHALLENGES[0]);
  const [code, setCode] = useState(CHALLENGES[0].starterCode);
  const [testResults, setTestResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [solvedMap, setSolvedMap] = useState({});
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // New Interactive Tabs & Features
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' | 'bigo' | 'patterns' | 'customTest'
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [customTestInput, setCustomTestInput] = useState("[2, 7, 11, 15], 9");
  const [customOutput, setCustomOutput] = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(ALGORITHM_PATTERNS[0]);

  // Static AST / Code Complexity Analyzer
  const complexityAnalysis = useMemo(() => {
    const codeClean = code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

    // Loop detection
    const forMatches = (codeClean.match(/\bfor\s*\(/g) || []).length;
    const whileMatches = (codeClean.match(/\bwhile\s*\(/g) || []).length;
    const arrayIterators = (codeClean.match(/\.(forEach|map|filter|reduce|every|some)\s*\(/g) || []).length;
    const totalLoops = forMatches + whileMatches + arrayIterators;

    // Nested loop heuristic: check for loop inside loop block
    const nestedLoopMatch = /(?:for|while)\s*\([^)]*\)\s*\{[^}]*(?:for|while|\.(?:forEach|map|filter|indexOf|includes))\s*\(/s.test(codeClean);

    // Recursion detection
    const fnNameMatch = selectedChallenge.starterCode.match(/function\s+([a-zA-Z0-9_]+)/);
    const fnName = fnNameMatch ? fnNameMatch[1] : null;
    const hasRecursion = fnName ? new RegExp(`\\b${fnName}\\s*\\(`).test(codeClean.replace(new RegExp(`function\\s+${fnName}`), "")) : false;

    // Logarithmic patterns
    const hasDivideAndConquer = /\/=\s*2|>>\s*1|Math\.floor\([^)]*\/\s*2\)/.test(codeClean);

    // Auxiliary memory detection
    const usesMapOrSet = /\bnew\s+(Map|Set|WeakMap|WeakSet)\b/.test(codeClean);
    const usesDynamicArray = /\[\]|\bnew\s+Array\b|\.slice\(|\.concat\(|\.split\(/.test(codeClean);

    let timeComp = "O(1)";
    let timeColor = "text-emerald-400 bg-emerald-950/40 border-emerald-500/30";
    let explanation = "Constant time operations. Minimal computational overhead.";
    let theoreticalOps = "1 to 10 operations";

    if (nestedLoopMatch || totalLoops >= 2 && !hasDivideAndConquer) {
      timeComp = "O(N²)";
      timeColor = "text-rose-400 bg-rose-950/40 border-rose-500/30";
      explanation = "Nested iteration detected. Operations scale quadratically. Risk of Time Limit Exceeded (TLE) at N > 10,000.";
      theoreticalOps = "10¹⁰ ops for N = 100,000 (Slow / TLE)";
    } else if (hasDivideAndConquer && totalLoops <= 1) {
      timeComp = "O(log N)";
      timeColor = "text-sky-400 bg-sky-950/40 border-sky-500/30";
      explanation = "Logarithmic pruning via binary search interval halving.";
      theoreticalOps = "~17 ops for N = 100,000 (Lightning Fast)";
    } else if (totalLoops === 1 || hasRecursion) {
      timeComp = "O(N)";
      timeColor = "text-amber-400 bg-amber-950/40 border-amber-500/30";
      explanation = "Single linear pass over input dataset.";
      theoreticalOps = "100,000 ops for N = 100,000 (~0.1ms)";
    }

    let spaceComp = "O(1)";
    let spaceExplanation = "In-place execution with constant auxiliary memory.";
    if (usesMapOrSet || usesDynamicArray || hasRecursion) {
      spaceComp = "O(N)";
      spaceExplanation = "Allocates auxiliary data structures (Hash Map, Set, or Call Stack frames) proportional to N.";
    }

    return {
      timeComp,
      timeColor,
      explanation,
      theoreticalOps,
      spaceComp,
      spaceExplanation,
      totalLoops,
      hasRecursion,
      usesMapOrSet,
      usesDynamicArray
    };
  }, [code, selectedChallenge]);

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    return CHALLENGES.filter((ch) => {
      const matchDiff = difficultyFilter === "All" || ch.difficulty === difficultyFilter;
      const matchSearch = ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ch.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ch.pattern.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDiff && matchSearch;
    });
  }, [difficultyFilter, searchQuery]);

  const selectChallenge = (ch) => {
    setSelectedChallenge(ch);
    setCode(ch.starterCode);
    setTestResults(null);
    setLogs([]);
    setShowHints(false);
    setShowSolution(false);
    setCustomOutput(null);
  };

  const runCode = async () => {
    setRunning(true);
    setLogs([]);
    const capturedLogs = [];
    const customConsole = {
      log: (...args) => capturedLogs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
      error: (...args) => capturedLogs.push("[error] " + args.join(" "))
    };

    const startTime = performance.now();

    try {
      const fnName = selectedChallenge.starterCode.match(/function\s+([a-zA-Z0-9_]+)/)?.[1] || "solution";
      const wrapped = new Function(
        "console",
        `"use strict";
        ${code}
        return typeof ${fnName} !== "undefined" ? ${fnName} : null;`
      );

      const userFn = wrapped(customConsole);
      if (typeof userFn !== "function") {
        throw new Error(`Could not find executable function '${fnName}' in code.`);
      }

      const results = [];
      for (let i = 0; i < selectedChallenge.tests.length; i++) {
        const test = selectedChallenge.tests[i];
        if (test.customRunner) {
          const res = await test.run(userFn);
          results.push({
            caseIndex: i + 1,
            passed: res.pass,
            expected: res.expected,
            actual: res.actual
          });
        } else {
          const inputCopy = JSON.parse(JSON.stringify(test.input));
          const caseStart = performance.now();
          const actual = userFn(...inputCopy);
          const caseDuration = (performance.now() - caseStart).toFixed(2);
          let passed = false;

          if (test.verify) {
            passed = Boolean(test.verify(actual, test.input));
          } else {
            passed = JSON.stringify(actual) === JSON.stringify(test.expected);
          }

          results.push({
            caseIndex: i + 1,
            passed,
            input: test.input,
            expected: test.expected,
            actual,
            latencyMs: caseDuration
          });
        }
      }

      const duration = (performance.now() - startTime).toFixed(2);
      const allPassed = results.every((r) => r.passed);

      setTestResults({
        passed: allPassed,
        results,
        duration
      });
      setLogs(capturedLogs);

      if (allPassed) {
        setSolvedMap((prev) => ({ ...prev, [selectedChallenge.id]: true }));
        toast.success(`All ${results.length} tests passed in ${duration}ms!`);
      } else {
        toast.error("Some test cases failed. Review diagnostics below.");
      }
    } catch (err) {
      setTestResults({
        error: err.message,
        results: []
      });
      toast.error(`Execution Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const runCustomTest = () => {
    try {
      const fnName = selectedChallenge.starterCode.match(/function\s+([a-zA-Z0-9_]+)/)?.[1] || "solution";
      const wrapped = new Function(
        `"use strict";
        ${code}
        return typeof ${fnName} !== "undefined" ? ${fnName} : null;`
      );
      const userFn = wrapped();
      if (typeof userFn !== "function") {
        throw new Error(`Executable function '${fnName}' not found.`);
      }

      // Parse custom inputs (evaluating safe array / primitives)
      const parsedArgs = new Function(`return [${customTestInput}];`)();
      const start = performance.now();
      const result = userFn(...parsedArgs);
      const elapsed = (performance.now() - start).toFixed(2);

      setCustomOutput({
        success: true,
        output: JSON.stringify(result, null, 2),
        elapsed
      });
      toast.success("Custom test executed!");
    } catch (e) {
      setCustomOutput({
        success: false,
        error: e.message
      });
      toast.error("Custom test failed: " + e.message);
    }
  };

  const resetCode = () => {
    setCode(selectedChallenge.starterCode);
    setTestResults(null);
    setLogs([]);
    setCustomOutput(null);
    toast("Code reset to starter template.", { icon: "🔄" });
  };

  const applyPatternTemplate = (template) => {
    setCode(template);
    setActiveTab("editor");
    toast.success("Pattern template loaded into editor!");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-2xl sm:p-8 border border-indigo-900/50">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-400">
              <Code2 size={20} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">SkillTrack Algorithmic Engine</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-white via-indigo-100 to-sky-200 bg-clip-text text-transparent">
              Algorithm & CodeLab Studio
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Master elite technical interview challenges with real-time Big-O static complexity analysis, automated memory profiling, LeetCode-style test suites, and dynamic Algorithmic Pattern Blueprints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur border border-white/10">
              <Trophy className="text-amber-400" size={24} />
              <div>
                <p className="text-[11px] font-medium text-slate-300">Solved Status</p>
                <p className="text-xl font-black text-white">
                  {Object.keys(solvedMap).length} / {CHALLENGES.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur border border-white/10">
              <Gauge className="text-emerald-400" size={24} />
              <div>
                <p className="text-[11px] font-medium text-slate-300">Analyzed Complexity</p>
                <p className="text-base font-bold text-emerald-300">{complexityAnalysis.timeComp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-indigo-900/60 pt-4">
          <button
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "editor"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Terminal size={14} /> Interactive IDE & Tests
          </button>

          <button
            onClick={() => setActiveTab("bigo")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "bigo"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Activity size={14} /> Big-O Complexity Radar
          </button>

          <button
            onClick={() => setActiveTab("patterns")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "patterns"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Sparkles size={14} /> Algorithm Pattern Mentor
          </button>

          <button
            onClick={() => setActiveTab("customTest")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "customTest"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Sliders size={14} /> Custom Param Playground
          </button>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left Column: Problem Browser & Filtering */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Problem Catalog ({filteredChallenges.length})
              </h2>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                {difficultyFilter}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search algorithms, patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
              />
            </div>

            {/* Difficulty Tabs */}
            <div className="mt-3 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {["All", "Easy", "Medium", "Hard"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`flex-1 rounded-lg py-1 text-[11px] font-bold transition ${
                    difficultyFilter === diff
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Challenges List */}
            <div className="mt-3 max-h-[380px] space-y-2 overflow-y-auto pr-1">
              {filteredChallenges.map((ch) => {
                const isSelected = selectedChallenge.id === ch.id;
                const isSolved = solvedMap[ch.id];
                return (
                  <button
                    key={ch.id}
                    onClick={() => selectChallenge(ch)}
                    className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-900 ring-1 ring-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-200 dark:ring-indigo-700"
                        : "hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate font-semibold text-xs">{ch.title}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${
                          ch.difficulty === "Easy"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : ch.difficulty === "Medium"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}>
                          {ch.difficulty}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                          {ch.category}
                        </span>
                      </div>
                    </div>
                    {isSolved ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guidance & Solution Accordion */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Interview Guidance
            </h3>
            
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="flex items-center gap-1.5"><HelpCircle size={14} className="text-amber-500" /> Socratic Hints</span>
              <span className="text-slate-400">{showHints ? "Hide" : "Show"}</span>
            </button>
            {showHints && (
              <div className="rounded-xl bg-amber-50/90 p-3 text-xs text-amber-900 space-y-2 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200/50">
                {selectedChallenge.hints.map((hint, i) => (
                  <p key={i}>• {hint}</p>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowSolution(!showSolution)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-indigo-500" /> Reference Code</span>
              <span className="text-slate-400">{showSolution ? "Hide" : "Reveal"}</span>
            </button>
            {showSolution && (
              <pre className="rounded-xl bg-slate-950 p-3 text-[11px] text-emerald-400 overflow-x-auto border border-slate-800 font-mono">
                <code>{selectedChallenge.solution}</code>
              </pre>
            )}
          </div>
        </aside>

        {/* Right Column: Dynamic Workspace Content */}
        <main className="space-y-4">
          {/* TAB 1: CODE EDITOR & REAL-TIME TEST RUNNER */}
          {activeTab === "editor" && (
            <div className="space-y-4">
              {/* Problem Briefing Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {selectedChallenge.title}
                      </h2>
                      <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                        selectedChallenge.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : selectedChallenge.difficulty === "Medium"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      }`}>
                        {selectedChallenge.difficulty}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedChallenge.category}</span> | Pattern: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedChallenge.pattern}</span>
                    </p>
                  </div>

                  {/* Company Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedChallenge.companies.map((c) => (
                      <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300 whitespace-pre-line">
                  {selectedChallenge.description}
                </div>
              </div>

              {/* Code Editor Frame */}
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
                {/* Editor Header Bar */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs text-slate-400">
                  <div className="flex items-center gap-3 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                      <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                      <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-slate-300">solution.js</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-indigo-400">
                      Live Syntax Sandbox
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetCode}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                      title="Reset code template"
                    >
                      <RotateCcw size={12} /> Reset
                    </button>

                    <button
                      onClick={runCode}
                      disabled={running}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <Play size={13} className={running ? "animate-spin" : ""} />
                      {running ? "Executing..." : "Run Test Suite"}
                    </button>
                  </div>
                </div>

                {/* Live Code Textarea */}
                <div className="p-4 font-mono text-xs leading-6">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    rows={15}
                    spellCheck={false}
                    className="w-full resize-y bg-transparent font-mono text-emerald-300 outline-none placeholder:text-slate-600 selection:bg-indigo-900/50"
                  />
                </div>

                {/* Inline Big-O Preview Strip */}
                <div className="flex flex-wrap items-center justify-between border-t border-slate-800/80 bg-slate-900/40 px-4 py-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-amber-400" />
                      Time: <strong className="text-slate-200 font-mono">{complexityAnalysis.timeComp}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Database size={12} className="text-sky-400" />
                      Space: <strong className="text-slate-200 font-mono">{complexityAnalysis.spaceComp}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("bigo")}
                    className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                  >
                    View Full Inspector <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              {/* Test Results Output Drawer */}
              {testResults && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      {testResults.passed ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={18} /> All Test Cases Passed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                          <XCircle size={18} /> Test Cases Failed
                        </span>
                      )}
                    </h3>
                    {testResults.duration && (
                      <span className="text-xs font-mono text-slate-500">
                        Total Execution Latency: {testResults.duration}ms
                      </span>
                    )}
                  </div>

                  {testResults.error ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-mono text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                      <p className="font-bold">Runtime Exception:</p>
                      <p className="mt-1">{testResults.error}</p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {testResults.results.map((r, i) => (
                        <div
                          key={i}
                          className={`flex flex-col gap-1.5 rounded-xl border p-3.5 text-xs ${
                            r.passed
                              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                              : "border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20"
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className={r.passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}>
                              Test Case {r.caseIndex}: {r.passed ? "PASSED" : "FAILED"}
                            </span>
                            {r.latencyMs && (
                              <span className="text-[11px] font-normal text-slate-400 font-mono">
                                {r.latencyMs}ms
                              </span>
                            )}
                          </div>
                          {r.input && (
                            <div className="font-mono text-slate-600 dark:text-slate-400">
                              Input: <span className="text-slate-800 dark:text-slate-200">{JSON.stringify(r.input)}</span>
                            </div>
                          )}
                          <div className="font-mono text-slate-600 dark:text-slate-400">
                            Expected: <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{JSON.stringify(r.expected)}</span> | 
                            Actual: <span className={r.passed ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}> {JSON.stringify(r.actual)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {logs.length > 0 && (
                    <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-300 border border-slate-800">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Standard Console Streams</p>
                      {logs.map((log, i) => (
                        <p key={i} className="text-emerald-400">{log}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BIG-O STATIC COMPLEXITY RADAR */}
          {activeTab === "bigo" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <Activity className="text-indigo-600 dark:text-indigo-400" size={20} />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Automated AST & Algorithmic Complexity Radar
                  </h2>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Static analysis parses loop nestings, recursive branch factors, call stack frames, and auxiliary heap allocations.
                </p>

                {/* Scorecards Grid */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className={`rounded-xl border p-4 ${complexityAnalysis.timeColor}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">Time Complexity</span>
                      <Clock size={16} />
                    </div>
                    <div className="mt-2 text-3xl font-black font-mono">
                      {complexityAnalysis.timeComp}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed opacity-90">
                      {complexityAnalysis.explanation}
                    </p>
                    <div className="mt-3 rounded-lg bg-black/20 p-2 text-[11px] font-mono">
                      Estimated Workload: {complexityAnalysis.theoreticalOps}
                    </div>
                  </div>

                  <div className="rounded-xl border border-sky-500/30 bg-sky-950/40 p-4 text-sky-400">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">Space Complexity</span>
                      <Database size={16} />
                    </div>
                    <div className="mt-2 text-3xl font-black font-mono">
                      {complexityAnalysis.spaceComp}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-sky-200">
                      {complexityAnalysis.spaceExplanation}
                    </p>
                    <div className="mt-3 rounded-lg bg-black/20 p-2 text-[11px] font-mono text-sky-300">
                      Auxiliary Collections: {complexityAnalysis.usesMapOrSet ? "Map/Set Present" : "In-Place / None"}
                    </div>
                  </div>
                </div>

                {/* Static Profiling Diagnostics */}
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Static AST Code Signals
                  </h4>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
                    <div className="rounded-lg bg-white p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-slate-400">Detected Loops</p>
                      <p className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
                        {complexityAnalysis.totalLoops} loop(s)
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-slate-400">Recursion Stack</p>
                      <p className={`text-base font-bold font-mono ${complexityAnalysis.hasRecursion ? "text-amber-500" : "text-emerald-500"}`}>
                        {complexityAnalysis.hasRecursion ? "Active (O(D) Depth)" : "None (Iterative)"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-slate-400">Optimal Target</p>
                      <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                        {selectedChallenge.optimalComplexity?.time || "O(N)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Big-O Comparison Reference Table */}
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <tr>
                        <th className="p-2.5 font-bold">Notation</th>
                        <th className="p-2.5 font-bold">Name</th>
                        <th className="p-2.5 font-bold">N = 10²</th>
                        <th className="p-2.5 font-bold">N = 10⁶</th>
                        <th className="p-2.5 font-bold">Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr className="bg-emerald-50/30 dark:bg-emerald-950/10">
                        <td className="p-2.5 font-mono font-bold text-emerald-600">O(1)</td>
                        <td className="p-2.5">Constant Time</td>
                        <td className="p-2.5 font-mono">1 op</td>
                        <td className="p-2.5 font-mono">1 op</td>
                        <td className="p-2.5 font-semibold text-emerald-600">Peak Performance</td>
                      </tr>
                      <tr className="bg-sky-50/30 dark:bg-sky-950/10">
                        <td className="p-2.5 font-mono font-bold text-sky-600">O(log N)</td>
                        <td className="p-2.5">Logarithmic</td>
                        <td className="p-2.5 font-mono">~7 ops</td>
                        <td className="p-2.5 font-mono">~20 ops</td>
                        <td className="p-2.5 font-semibold text-sky-600">Ultra-Scalable</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono font-bold text-amber-600">O(N)</td>
                        <td className="p-2.5">Linear Time</td>
                        <td className="p-2.5 font-mono">100 ops</td>
                        <td className="p-2.5 font-mono">1,000,000 ops</td>
                        <td className="p-2.5 font-semibold text-amber-600">Standard Optimal</td>
                      </tr>
                      <tr className="bg-rose-50/30 dark:bg-rose-950/10">
                        <td className="p-2.5 font-mono font-bold text-rose-600">O(N²)</td>
                        <td className="p-2.5">Quadratic Time</td>
                        <td className="p-2.5 font-mono">10,000 ops</td>
                        <td className="p-2.5 font-mono">10¹² ops (TLE)</td>
                        <td className="p-2.5 font-semibold text-rose-600">Interview Anti-Pattern</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALGORITHM PATTERN MENTOR */}
          {activeTab === "patterns" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      FAANG Algorithmic Pattern Blueprints
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    6 Core Interview Archetypes
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Select a pattern below to study intuition, target applications, and directly inject its boilerplate into the IDE.
                </p>

                {/* Pattern Selector Cards */}
                <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                  {ALGORITHM_PATTERNS.map((p) => {
                    const isSel = selectedPattern.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPattern(p)}
                        className={`rounded-xl p-3 text-left transition border ${
                          isSel
                            ? "border-indigo-500 bg-indigo-50/80 dark:border-indigo-500 dark:bg-indigo-950/60 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                        }`}
                      >
                        <p className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</p>
                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {p.complexity}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Active Pattern Deep-Dive */}
                <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5 dark:border-indigo-900 dark:bg-indigo-950/20 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-200">
                      {selectedPattern.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-indigo-100 px-2.5 py-0.5 text-[11px] font-mono font-bold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                        {selectedPattern.complexity}
                      </span>
                      <button
                        onClick={() => applyPatternTemplate(selectedPattern.codeTemplate)}
                        className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow hover:bg-indigo-500 transition flex items-center gap-1"
                      >
                        <Terminal size={12} /> Load into Editor
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 text-xs sm:grid-cols-2">
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">Algorithmic Intuition:</strong>
                      <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                        {selectedPattern.intuition}
                      </p>
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">Best For:</strong>
                      <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                        {selectedPattern.bestFor}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Production Boilerplate
                    </p>
                    <pre className="rounded-xl bg-slate-950 p-3 text-[11px] text-sky-300 overflow-x-auto font-mono border border-slate-800">
                      <code>{selectedPattern.codeTemplate}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM PARAMETER PLAYGROUND */}
          {activeTab === "customTest" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="text-indigo-600 dark:text-indigo-400" size={20} />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Arbitrary Custom Parameter Runner
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supply custom test fixtures in comma-separated JavaScript argument syntax to test edge cases, large arrays, and boundary states.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Input Arguments (JSON / JS Comma-Separated):
                  </label>
                  <textarea
                    value={customTestInput}
                    onChange={(e) => setCustomTestInput(e.target.value)}
                    rows={3}
                    placeholder="e.g. [2, 7, 11, 15], 9"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-emerald-300"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={runCustomTest}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition flex items-center gap-1.5"
                    >
                      <Play size={13} /> Run Custom Test
                    </button>
                  </div>
                </div>

                {customOutput && (
                  <div className={`rounded-xl border p-4 text-xs font-mono ${
                    customOutput.success
                      ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200"
                      : "border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200"
                  }`}>
                    {customOutput.success ? (
                      <div>
                        <div className="flex items-center justify-between font-bold mb-2">
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 size={16} /> Output Generated in {customOutput.elapsed}ms
                          </span>
                        </div>
                        <pre className="rounded bg-black/10 dark:bg-black/40 p-2 overflow-x-auto">
                          <code>{customOutput.output}</code>
                        </pre>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold flex items-center gap-1 text-rose-700 dark:text-rose-400">
                          <AlertCircle size={16} /> Execution Error:
                        </p>
                        <p className="mt-1">{customOutput.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
