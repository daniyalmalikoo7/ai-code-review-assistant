export const samplePRPayload = {
    action: 'opened',
    pull_request: {
      number: 123,
      title: 'Add user authentication feature',
      body: 'This PR adds the user authentication feature with login and registration.',
      head: { ref: 'feature/auth' },
      base: { ref: 'main' },
      user: { login: 'testuser' },
      url: 'https://api.github.com/repos/owner/repo/pulls/123'
    },
    repository: {
      full_name: 'owner/repo'
    }
  };
  
  // Sample payload for code analyzer with actual code content
  export const samplePRWithCodeContent = {
    id: 123,
    title: "Add user authentication feature",
    description: "This PR adds user authentication functionality",
    branch: "feature/auth",
    base: "main",
    repository: "owner/repo",
    author: "testuser",
    changes: [
      {
        filename: "src/auth/login.ts",
        status: "added",
        content: `
          function login(username, password) {
            // Security issue: SQL injection vulnerability
            const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
            
            // Security issue: Hardcoded credentials
            const apiKey = "1234567890abcdef";
            
            // Performance issue: Nested loops
            for (let i = 0; i < users.length; i++) {
              for (let j = 0; j < permissions.length; j++) {
                console.log(users[i], permissions[j]);
              }
            }
            
            return { authenticated: true };
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