import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Skill from './models/Skill.js';
import Problem from './models/Problem.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_prep_db');
        console.log('MongoDB Connected for Seeding');

        // Clear existing to avoid dupes
        await Problem.deleteMany({});
        await Skill.deleteMany({});
        console.log('Cleared existing Problems and Skills.');

        // Seed Skills
        const skillsData = [
            { name: 'Arrays & Hashing', category: 'DSA', description: 'Fundamental array traversals and fast lookup tables' },
            { name: 'Two Pointers', category: 'DSA', description: 'Iterating arrays from two ends' },
            { name: 'Linked List', category: 'DSA', description: 'Node-based linear data structures' },
            { name: 'Trees', category: 'DSA', description: 'Binary trees, BSTs, and traversals' },
            { name: 'Dynamic Programming', category: 'DSA', description: 'Optimizing recursive structures' },
            { name: 'Javascript Fundamentals', category: 'LANGUAGE', description: 'Closures, Promises, and Hoisting' },
            { name: 'Java Core', category: 'LANGUAGE', description: 'JVM architecture, Multi-threading, and Collections framework' },
            { name: 'SQL Queries', category: 'CS_FUNDAMENTALS', description: 'Joins, Aggregates, Group By, Subqueries' },
            { name: 'Object Oriented Programming', category: 'CS_FUNDAMENTALS', description: 'Inheritance, Polymorphism, Encapsulation' },
        ];

        const insertedSkills = await Skill.insertMany(skillsData);
        console.log(`Seeded ${insertedSkills.length} Skills.`);

        // Map skill IDs
        const skillMap = {};
        insertedSkills.forEach(s => skillMap[s.name] = s._id);

        // Seed Problems
        const problemsData = [
            // Java & OOP
            {
                title: "Java Interface vs Abstract Class Concept",
                platform: "GeeksforGeeks",
                externalUrl: "https://www.geeksforgeeks.org/difference-between-abstract-class-and-interface-in-java/",
                difficulty: "Easy",
                topic: skillMap['Java Core'],
                patterns: ["OOP"],
                estimatedTime: 15
            },
            {
                title: "Singleton Design Pattern Implementation",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/discuss/interview-question/object-oriented-design/",
                difficulty: "Medium",
                topic: skillMap['Object Oriented Programming'],
                patterns: ["Design Patterns"],
                estimatedTime: 30
            },
            {
                title: "Java Multithreading Producer-Consumer",
                platform: "GeeksforGeeks",
                externalUrl: "https://www.geeksforgeeks.org/producer-consumer-solution-using-threads-in-java/",
                difficulty: "Hard",
                topic: skillMap['Java Core'],
                patterns: ["Concurrency"],
                estimatedTime: 45
            },

            // JavaScript
            {
                title: "Implement Array.prototype.map()",
                platform: "Other",
                externalUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map",
                difficulty: "Easy",
                topic: skillMap['Javascript Fundamentals'],
                patterns: ["Polyfills"],
                estimatedTime: 20
            },
            {
                title: "Implement a Promise from Scratch",
                platform: "Other",
                externalUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
                difficulty: "Medium",
                topic: skillMap['Javascript Fundamentals'],
                patterns: ["Async"],
                estimatedTime: 40
            },

            // SQL
            {
                title: "Combine Two Tables (Joins)",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/combine-two-tables/",
                difficulty: "Easy",
                topic: skillMap['SQL Queries'],
                patterns: ["Joins"],
                estimatedTime: 15
            },
            {
                title: "Nth Highest Salary",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/nth-highest-salary/",
                difficulty: "Medium",
                topic: skillMap['SQL Queries'],
                patterns: ["Subqueries"],
                estimatedTime: 30
            },
            {
                title: "Department Highest Salary",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/department-highest-salary/",
                difficulty: "Medium",
                topic: skillMap['SQL Queries'],
                patterns: ["Group By", "Joins"],
                estimatedTime: 30
            },

            // Arrays & Hashing
            {
                title: "Two Sum",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/two-sum/",
                difficulty: "Easy",
                topic: skillMap['Arrays & Hashing'],
                patterns: ["Hash Map"],
                estimatedTime: 15
            },
            {
                title: "Valid Anagram",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/valid-anagram/",
                difficulty: "Easy",
                topic: skillMap['Arrays & Hashing'],
                patterns: ["Hash Map"],
                estimatedTime: 15
            },
            {
                title: "Group Anagrams",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/group-anagrams/",
                difficulty: "Medium",
                topic: skillMap['Arrays & Hashing'],
                patterns: ["Hash Map"],
                estimatedTime: 30
            },
            {
                title: "Product of Array Except Self",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/product-of-array-except-self/",
                difficulty: "Medium",
                topic: skillMap['Arrays & Hashing'],
                patterns: ["Prefix Sum"],
                estimatedTime: 35
            },

            // Two Pointers
            {
                title: "Valid Palindrome",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/valid-palindrome/",
                difficulty: "Easy",
                topic: skillMap['Two Pointers'],
                patterns: ["Two Pointers"],
                estimatedTime: 15
            },
            {
                title: "3Sum",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/3sum/",
                difficulty: "Medium",
                topic: skillMap['Two Pointers'],
                patterns: ["Two Pointers"],
                estimatedTime: 40
            },
            {
                title: "Container With Most Water",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/container-with-most-water/",
                difficulty: "Medium",
                topic: skillMap['Two Pointers'],
                patterns: ["Two Pointers"],
                estimatedTime: 35
            },

            // Linked List
            {
                title: "Reverse Linked List",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/reverse-linked-list/",
                difficulty: "Easy",
                topic: skillMap['Linked List'],
                patterns: ["Linked List"],
                estimatedTime: 20
            },
            {
                title: "Merge Two Sorted Lists",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
                difficulty: "Easy",
                topic: skillMap['Linked List'],
                patterns: ["Linked List"],
                estimatedTime: 20
            },
            {
                title: "Linked List Cycle",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/linked-list-cycle/",
                difficulty: "Easy",
                topic: skillMap['Linked List'],
                patterns: ["Fast & Slow Pointers"],
                estimatedTime: 20
            },

            // Trees
            {
                title: "Invert Binary Tree",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/invert-binary-tree/",
                difficulty: "Easy",
                topic: skillMap['Trees'],
                patterns: ["DFS"],
                estimatedTime: 15
            },
            {
                title: "Maximum Depth of Binary Tree",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
                difficulty: "Easy",
                topic: skillMap['Trees'],
                patterns: ["DFS", "BFS"],
                estimatedTime: 15
            },
            {
                title: "Validate Binary Search Tree",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
                difficulty: "Medium",
                topic: skillMap['Trees'],
                patterns: ["DFS"],
                estimatedTime: 35
            },

            // Dynamic Programming
            {
                title: "Climbing Stairs",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/climbing-stairs/",
                difficulty: "Easy",
                topic: skillMap['Dynamic Programming'],
                patterns: ["1D DP"],
                estimatedTime: 20
            },
            {
                title: "Coin Change",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/coin-change/",
                difficulty: "Medium",
                topic: skillMap['Dynamic Programming'],
                patterns: ["1D DP"],
                estimatedTime: 40
            },
            {
                title: "Longest Increasing Subsequence",
                platform: "LeetCode",
                externalUrl: "https://leetcode.com/problems/longest-increasing-subsequence/",
                difficulty: "Medium",
                topic: skillMap['Dynamic Programming'],
                patterns: ["1D DP"],
                estimatedTime: 45
            }
        ];

        const insertedProblems = await Problem.insertMany(problemsData);
        console.log(`Seeded ${insertedProblems.length} Practice Problems.`);

        process.exit();
    } catch (error) {
        console.error('Error with seed data script:', error);
        process.exit(1);
    }
};

seedData();
