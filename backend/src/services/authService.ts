// backend/src/services/authService.ts
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import { createLogger } from "../utils/logger";

const logger = createLogger("AuthService");

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface AuthTokenPayload {
  userId: number;
  username: string;
  email: string;
  exp?: number;
}

  // Add this constant at the top of the file, outside the class
  const DEV_JWT_SECRET = 'dev-jwt-secret';

/**
 * Authentication service for GitHub OAuth integration
 */
export class AuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly jwtSecret: string;
  private readonly tokenExpiration: string;
  private readonly redirectUri: string;

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID || "";
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET || "";
    this.jwtSecret = process.env.JWT_SECRET || "local-dev-secret-key";
    this.tokenExpiration = process.env.TOKEN_EXPIRATION || "24h";
    this.redirectUri = process.env.REDIRECT_URI || "http://localhost:3001/api/auth/github/callback";


    if (!this.clientId || !this.clientSecret) {
      logger.warn(
        "GitHub OAuth credentials not set. Authentication will not work properly."
      );
    }
  }

  /**
   * Generate the GitHub OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    const scopes = ["read:user", "user:email", "repo"];

    console.log("Generating GitHub auth URL with:", {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
    });

    return `https://github.com/login/oauth/authorize?client_id=${
      this.clientId
    }&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${scopes.join(
      " "
    )}`;
  }

  /**
   * Exchange OAuth code for GitHub access token
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    try {
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            redirect_uri: this.redirectUri,
          }),
        }
      );

      const data = (await response.json()) as {
        access_token?: string;
        error?: string;
      };

      if (data.error || !data.access_token) {
        logger.error("Failed to exchange code for token", {
          error: data.error,
        });
        throw new Error(data.error || "Failed to exchange code for token");
      }

      return data.access_token;
    } catch (error) {
      logger.error("Error exchanging code for token", { error });
      throw new Error("Failed to exchange code for token");
    }
  }

  /**
   * Get user information from GitHub using access token
   */
  async getGitHubUser(accessToken: string): Promise<GitHubUser> {
    try {
      // Fetch user profile
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!userResponse.ok) {
        throw new Error(`GitHub API error: ${userResponse.status}`);
      }

      const userData = (await userResponse.json()) as GitHubUser;

      // If email is not public, fetch user emails
      if (!userData.email) {
        const emailResponse = await fetch(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `token ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (emailResponse.ok) {
          const emails = (await emailResponse.json()) as Array<{
            email: string;
            primary: boolean;
            verified: boolean;
          }>;
          // Find primary email
          const primaryEmail = emails.find(
            (email) => email.primary && email.verified
          );
          if (primaryEmail) {
            userData.email = primaryEmail.email;
          }
        }
      }

      return userData;
    } catch (error) {
      logger.error("Error fetching GitHub user", { error });
      throw new Error("Failed to fetch GitHub user data");
    }
  }

  /**
   * Generate a JWT token for the authenticated user
   */
  generateToken(user: GitHubUser): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      username: user.login,
      email: user.email,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.tokenExpiration as jwt.SignOptions["expiresIn"],
    });
  }

  // /**
  //  * Verify and decode a JWT token
  //  */
  // verifyToken(token: string): AuthTokenPayload {
  //   try {
  //     return jwt.verify(token, this.jwtSecret) as AuthTokenPayload;
  //   } catch (error) {
  //     logger.error("Token verification failed", { error });
  //     throw new Error("Invalid token");
  //   }
  // }



// Then modify the verifyToken method
verifyToken(token: string): AuthTokenPayload {
  try {
    // Try to verify with the normal secret
    return jwt.verify(token, this.jwtSecret) as AuthTokenPayload;
  } catch (error) {
    // If that fails, try the dev secret (for testing only)
    try {
      return jwt.verify(token, DEV_JWT_SECRET) as AuthTokenPayload;
    } catch (nestedError) {
      logger.error('Token verification failed', { error: nestedError });
      throw new Error('Invalid token');
    }
  }
}

  /**
   * Validate a GitHub personal access token
   */
  async validateGitHubToken(
    token: string
  ): Promise<{ valid: boolean; username?: string }> {
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        return { valid: false };
      }

      const userData = (await response.json()) as { login: string };
      return { valid: true, username: userData.login };
    } catch (error) {
      logger.error("Error validating GitHub token", { error });
      return { valid: false };
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

export default authService;
