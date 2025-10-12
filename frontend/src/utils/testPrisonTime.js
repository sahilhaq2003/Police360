/**
 * Test file to demonstrate prison time calculation with different term formats
 * This can be imported and used for testing the prison time calculator
 */

import { parseTermToDays, calculateTotalPrisonTime, formatPrisonTime } from './prisonTimeCalculator';

// Test cases with different term formats
const testCases = [
  // Single terms
  { term: "2 years", expected: 730 },
  { term: "6 months", expected: 183 },
  { term: "30 days", expected: 30 },
  { term: "4 weeks", expected: 28 },
  
  // Combined terms
  { term: "1 year 6 months", expected: 548 },
  { term: "2 years 3 months 15 days", expected: 825 },
  { term: "6 months 2 weeks", expected: 197 },
  
  // Different formats
  { term: "2y", expected: 730 },
  { term: "6m", expected: 183 },
  { term: "30d", expected: 30 },
  { term: "4w", expected: 28 },
  
  // Complex formats
  { term: "1 year 3 months 2 weeks 5 days", expected: 492 },
  { term: "2yr 6mo 1wk", expected: 913 },
  
  // Edge cases
  { term: "", expected: 0 },
  { term: "invalid", expected: 0 },
  { term: "0 years", expected: 0 },
];

// Test arrest records
const testArrests = [
  {
    date: "2023-01-15",
    charge: "Theft",
    term: "2 years"
  },
  {
    date: "2023-06-10",
    charge: "Assault",
    term: "6 months"
  },
  {
    date: "2024-01-05",
    charge: "Fraud",
    term: "1 year 3 months"
  }
];

export const runPrisonTimeTests = () => {
  console.log("🧪 Testing Prison Time Calculator");
  console.log("=====================================");
  
  // Test individual term parsing
  console.log("\n📝 Testing Term Parsing:");
  testCases.forEach(({ term, expected }) => {
    const result = parseTermToDays(term);
    const status = result === expected ? "✅" : "❌";
    console.log(`${status} "${term}" → ${result} days (expected: ${expected})`);
  });
  
  // Test total calculation
  console.log("\n📊 Testing Total Calculation:");
  const totalResult = calculateTotalPrisonTime(testArrests);
  console.log("Arrest records:", testArrests);
  console.log("Total result:", totalResult);
  console.log("Formatted:", formatPrisonTime(totalResult.totalDays));
  
  // Test breakdown
  console.log("\n📋 Sentence Breakdown:");
  totalResult.breakdown.forEach((item, index) => {
    console.log(`${index + 1}. ${item.charge}: ${item.term} (${item.days} days)`);
  });
  
  console.log("\n✅ Tests completed!");
  return totalResult;
};

// Example usage for testing different scenarios
export const exampleUsage = () => {
  console.log("\n🔍 Example Usage Scenarios:");
  
  // Scenario 1: Multiple arrests with different terms
  const arrests1 = [
    { date: "2020-01-01", charge: "Burglary", term: "3 years" },
    { date: "2022-06-01", charge: "Drug Possession", term: "18 months" },
    { date: "2023-12-01", charge: "Assault", term: "6 months" }
  ];
  
  const result1 = calculateTotalPrisonTime(arrests1);
  console.log("\nScenario 1 - Multiple Arrests:");
  console.log(`Total: ${formatPrisonTime(result1.totalDays)} (${result1.totalDays} days)`);
  
  // Scenario 2: Complex terms
  const arrests2 = [
    { date: "2023-01-01", charge: "Fraud", term: "2 years 6 months 2 weeks" },
    { date: "2023-07-01", charge: "Theft", term: "1 year 3 months 15 days" }
  ];
  
  const result2 = calculateTotalPrisonTime(arrests2);
  console.log("\nScenario 2 - Complex Terms:");
  console.log(`Total: ${formatPrisonTime(result2.totalDays)} (${result2.totalDays} days)`);
  
  return { result1, result2 };
};
