import 'dotenv/config';
import fs from 'node:fs/promises';
import axios from 'axios';

// Interface for user data from the file
interface SlackUser {
  name: string;
  userId: string;
}

// Parse the CSV file (semicolon-separated format)
function parseUserFile(content: string): SlackUser[] {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  return lines.map(line => {
    const parts = line.split(';');
    if (parts.length >= 2) {
      return {
        name: parts[0].trim(),
        userId: parts[1].trim()
      };
    }
    throw new Error(`Invalid line format: ${line}`);
  });
}

// Send a direct message to a Slack user using Slack Web API
async function sendDirectMessage(userId: string, message: string, token: string): Promise<void> {
  try {
    const response = await axios.post('https://slack.com/api/chat.postMessage', {
      channel: userId, // For DMs, the channel is the user ID
      text: message,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.data.ok) {
      console.log(response.data);
      throw new Error(`Slack API error: ${response.data.error}`);
    }
    
    console.log(`✅ Message sent to ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to send message to ${userId}:`, error);
    throw error;
  }
}

// Add delay between messages to avoid rate limiting
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Check for required environment variables
  const slackToken = process.env.SLACK_USER_OAUTH_TOKEN;
  if (!slackToken) {
    throw new Error('SLACK_USER_OAUTH_TOKEN environment variable is required');
  }

  // Use people.csv as the default file, but allow override from command line
  const filePath = process.argv[2] || 'people.csv';

  try {
    // Read and parse the user file
    console.log(`📖 Reading user file: ${filePath}`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const users = parseUserFile(fileContent);
    
    console.log(`👥 Found ${users.length} users`);
    
    // Confirm before sending
    console.log('\n⚠️  This will send the message to ALL users listed in the file.');
    console.log('Press Ctrl+C to cancel, or any key to continue...');
    
    // Wait for user confirmation (in a real script, you might use readline)
    // For now, we'll add a 5-second delay
    console.log('Starting in 5 seconds...');
    await delay(5000);

    let successCount = 0;
    let failCount = 0;

    // Send messages with rate limiting
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      const message = `
      👋 Salut ${user.name},
        J’espère que tu vas bien ! Petite demande rapide : pour que mon bot d’anniversaire puisse envoyer des messages le jour J, j’ai besoin de compléter ma base de données.
        Est-ce que tu pourrais me partager ta date de naissance (jour/mois/année) ? 🎂
        Merci beaucoup 🙏
      `;
      try {
        console.log(`[${i + 1}/${users.length}] Sending to ${user.name} (${user.userId})`);
        await sendDirectMessage(user.userId, message, slackToken);
        successCount++;
        
        // Add delay to respect rate limits (Slack allows ~1 message per second for most methods)
        if (i < users.length - 1) {
          await delay(1100);
        }
      } catch (error) {
        console.error(`Failed to send to ${user.name}:`, error);
        failCount++;
        
        // Continue with next user even if one fails
        continue;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📱 Total: ${users.length}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
