import { analyzePullRequest, PullRequestPayload } from './src/utils/codeAnalyzer';
import { generateFeedback } from './src/utils/feedbackGenerator';
import fs from 'fs';

// Create a sample PR payload with issues
const samplePR: PullRequestPayload = {
  id: 123,
  title: "Add user authentication",
  branch: "feature/auth",
  base: "main",
  repository: "test-repo",
  author: "developer",
  changes: [
    {
      filename: "src/auth/login.ts",
      status: "added",
      content: `
        function login(username, password) {
          // Security issue: SQL injection
          const query = "SELECT * FROM users WHERE username = '" + username + "'";
          
          // Hardcoded credentials
          const apiKey = "1234567890abcdef";
          
          // Nested loops
          for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < permissions.length; j++) {
              console.log(users[i], permissions[j]);
            }
          }
          
          // Long code with many lines
          let audit = '';
          audit += 'Line 1\n';
          audit += 'Line 2\n';
          audit += 'Line 3\n';
          audit += 'Line 4\n';
          audit += 'Line 5\n';
          // ... more lines
        }
      `
    },
    {
      filename: "src/controllers/userController.ts",
      status: "modified",
      content: `
        // Architectural issue: Controller with data access
        export class UserController {
          getUser(req, res) {
            // Direct data access in controller
            const user = new User();
            const result = user.findOne({ id: req.params.id });
            res.json(result);
          }
        }
      `
    }
  ]
};

// Run the analyzer
const analysisResult = analyzePullRequest(samplePR);

// Generate feedback
const feedback = generateFeedback(analysisResult);

// Create output directory if it doesn't exist
if (!fs.existsSync('./test-output')) {
  fs.mkdirSync('./test-output');
}

// Output the results
console.log("\n=== FEEDBACK GENERATOR TEST ===\n");

console.log("Inline Comments Count:", feedback.inlineComments.length);
console.log("Overall Score:", feedback.summaryReport.overallScore);
console.log("Issue Stats:", JSON.stringify(feedback.summaryReport.issueStats, null, 2));

// Optionally save to files for review
fs.writeFileSync('./test-output/comments.json', JSON.stringify(feedback.inlineComments, null, 2));
fs.writeFileSync('./test-output/report.json', JSON.stringify(feedback.summaryReport, null, 2));
fs.writeFileSync('./test-output/summary.md', feedback.markdownSummary);

console.log("\nResults saved to test-output directory");
console.log("- comments.json: Contains all inline comments");
console.log("- report.json: Contains the full summary report");
console.log("- summary.md: Contains the markdown summary (view in a markdown preview)");

console.log("\n=== TEST COMPLETE ===");