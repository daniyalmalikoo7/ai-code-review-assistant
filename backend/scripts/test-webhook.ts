import fetch from 'node-fetch';
import crypto from 'crypto';

// Make sure the webhook secret matches what's in your .env file or environment variables
const WEBHOOK_SECRET = 'test-webhook-secret';
const SERVER_URL = 'http://localhost:3001'; // Change if your server runs on a different port

async function testWebhook() {
  // Create a mock PR payload
  const payload = {
    action: 'opened',
    pull_request: {
      number: 123,
      title: 'Test PR from script',
      body: 'This is a test pull request created by the test script',
      head: { ref: 'feature-branch' },
      base: { ref: 'main' },
      user: { login: 'test-user' },
      url: 'https://api.github.com/repos/owner/repo/pulls/123'
    },
    repository: {
      full_name: 'owner/repo'
    }
  };

  // Convert the payload to a string for signature calculation
  const payloadString = JSON.stringify(payload);
  
  // Generate the signature using the webhook secret
  const signature = 'sha256=' + crypto.createHmac('sha256', WEBHOOK_SECRET)
    .update(payloadString)
    .digest('hex');

  console.log('Sending webhook test to:', `${SERVER_URL}/api/webhooks/github`);
  console.log('Payload:', payload);
  console.log('Generated signature:', signature);

  try {
    // Send the webhook request
    const response = await fetch(`${SERVER_URL}/api/webhooks/github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'pull_request',
        'X-GitHub-Delivery': Date.now().toString(),
        'X-Hub-Signature-256': signature,
      },
      body: payloadString
    });

    // Get and display the response
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Body:', responseData);
    
    if (response.ok) {
      console.log('✅ Webhook test SUCCESSFUL!');
    } else {
      console.log('❌ Webhook test FAILED!');
    }
  } catch (error) {
    console.error('Error sending webhook test:', error);
  }
}

// Run the test
testWebhook();