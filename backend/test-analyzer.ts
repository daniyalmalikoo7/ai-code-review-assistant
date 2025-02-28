import { analyzePullRequest, PullRequestPayload } from './src/utils/codeAnalyzer';

// Create a sample PR payload with common issues
const samplePR: PullRequestPayload = {
  id: 123,
  title: "Add user authentication feature",
  branch: "feature/auth",
  base: "main",
  repository: "example-repo",
  author: "developer",
  changes: [
    {
      filename: "src/auth/login.ts",
      status: "added",
      content: `
        // Login handler with multiple issues
        function loginUser(username, password) {
          // Security issue: SQL injection vulnerability
          const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
          
          // Security issue: Hardcoded credentials
          const adminPassword = "admin123";
          const apiKey = "1234567890abcdef";
          
          // Security issue: XSS vulnerability
          document.innerHTML = "<div>Welcome, " + username + "</div>";
          
          // Performance issue: Nested loops
          for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < permissions.length; j++) {
              console.log(users[i], permissions[j]);
            }
          }
          
          // Performance issue: Chained array methods
          const result = users
            .filter(user => user.active)
            .map(user => user.permissions)
            .filter(permissions => permissions.includes('admin'))
            .map(permissions => permissions.join(','));
          
          // Code style issue: Console log
          console.log('User logged in', username);
          
          // Code style issue: Magic numbers
          setTimeout(() => {
            refreshToken();
          }, 3600000);
          
          // Deep nesting for maintainability issue
          if (user) {
            if (user.isActive) {
              if (user.hasPermission) {
                if (user.groups) {
                  if (user.groups.includes('admin')) {
                    // Admin logic
                  }
                }
              }
            }
          }
          
          // Long function (more lines to trigger detection)
          let auditLog = '';
          auditLog += 'Login attempt\\n';
          auditLog += 'Username: ' + username + '\\n';
          auditLog += 'Time: ' + new Date().toISOString() + '\\n';
          auditLog += 'IP: ' + request.ip + '\\n';
          auditLog += 'User Agent: ' + request.headers['user-agent'] + '\\n';
          auditLog += 'Success: ' + (user != null) + '\\n';
          auditLog += 'Session ID: ' + session.id + '\\n';
          auditLog += 'Session Expiry: ' + session.expiry + '\\n';
          auditLog += 'Permissions: ' + user?.permissions.join(',') + '\\n';
          auditLog += 'Groups: ' + user?.groups.join(',') + '\\n';
          auditLog += 'Last Login: ' + user?.lastLogin + '\\n';
          auditLog += 'Account Created: ' + user?.createdAt + '\\n';
          auditLog += 'Account Updated: ' + user?.updatedAt + '\\n';
          auditLog += 'Failed Attempts: ' + user?.failedAttempts + '\\n';
          auditLog += 'Status: ' + user?.status + '\\n';
          auditLog += 'Notes: ' + user?.notes + '\\n';
          auditLog += 'End of log\\n';
          
          // TODO: Refactor this function
          // FIXME: Add proper error handling
          
          return user;
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
          
          createUser(req, res) {
            // More direct data access
            const newUser = new User(req.body);
            newUser.save();
            res.status(201).json(newUser);
          }
        }
      `
    }
  ]
};

// Run the analyzer
const result = analyzePullRequest(samplePR);

// Print the results in a structured way
console.log('========================================');
console.log('Code Analysis Results');
console.log('========================================');
console.log('PR ID:', result.prId);
console.log('Total Issues:', result.summary.totalIssues);
console.log(`Issues by Severity: Critical: ${result.summary.criticalCount}, Warnings: ${result.summary.warningCount}, Suggestions: ${result.summary.suggestionCount}`);
console.log('\nIssues by Category:');
Object.entries(result.summary.issuesByCategory).forEach(([category, count]) => {
  console.log(`- ${category}: ${count}`);
});

console.log('\n========================================');
console.log('Detailed Issues');
console.log('========================================');

// Group issues by file for better readability
const issuesByFile: Record<string, typeof result.issues> = {};
result.issues.forEach(issue => {
  const file = issue.location.file;
  if (!issuesByFile[file]) {
    issuesByFile[file] = [];
  }
  issuesByFile[file].push(issue);
});

// Print issues by file
Object.entries(issuesByFile).forEach(([file, issues]) => {
  console.log(`\nFile: ${file}`);
  console.log('-'.repeat(file.length + 6));
  
  // Group by severity
  const criticalIssues = issues.filter(i => i.severity === 'Critical');
  const warningIssues = issues.filter(i => i.severity === 'Warning');
  const suggestionIssues = issues.filter(i => i.severity === 'Suggestion');
  
  if (criticalIssues.length > 0) {
    console.log('\n🔴 CRITICAL ISSUES:');
    criticalIssues.forEach(issue => {
      console.log(`  - [${issue.category}] ${issue.title}`);
      console.log(`    Line: ${issue.location.line || 'N/A'}`);
      console.log(`    Description: ${issue.description}`);
      console.log(`    Remediation: ${issue.remediation}`);
    });
  }
  
  if (warningIssues.length > 0) {
    console.log('\n🟠 WARNINGS:');
    warningIssues.forEach(issue => {
      console.log(`  - [${issue.category}] ${issue.title}`);
      console.log(`    Line: ${issue.location.line || 'N/A'}`);
      console.log(`    Description: ${issue.description}`);
      console.log(`    Remediation: ${issue.remediation}`);
    });
  }
  
  if (suggestionIssues.length > 0) {
    console.log('\n🟢 SUGGESTIONS:');
    suggestionIssues.forEach(issue => {
      console.log(`  - [${issue.category}] ${issue.title}`);
      console.log(`    Line: ${issue.location.line || 'N/A'}`);
      console.log(`    Description: ${issue.description}`);
      console.log(`    Remediation: ${issue.remediation}`);
    });
  }
});

console.log('\n========================================');
console.log('Analysis completed in', result.metadata.duration, 'ms');
console.log('========================================');