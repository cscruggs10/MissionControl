#!/usr/bin/env node
/**
 * SKYFIRE - Twitter Engagement Agent
 * 
 * Responsibilities:
 * 1. Posts content to Twitter from Mission Control tasks
 * 2. Monitors engagement (mentions, replies)
 * 3. Suggests response options for approval via Mission Control
 * 
 * Integration: Mission Control task-based workflow
 */

const { TwitterApi } = require('twitter-api-v2');
const { execSync } = require('child_process');
require('dotenv').config({ path: '/root/clawd/.twitter-credentials' });

const SKYFIRE_AGENT_ID = 'j97176dftr3jkyst67qw1wz33d81fbpw';

class Skyfire {
  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY,
      appSecret: process.env.TWITTER_CONSUMER_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });
    this.me = null;
  }

  /**
   * Initialize - get authenticated user info
   */
  async init() {
    try {
      const response = await this.client.v2.me();
      this.me = response.data;
      console.log(`🔥 Skyfire online as @${this.me.username}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize Skyfire:', error.message);
      return false;
    }
  }

  /**
   * Get tasks assigned to Skyfire from Mission Control
   */
  getMyTasks(status = null) {
    try {
      const cmd = `cd /root/clawd/mission-control && npx convex run tasks:list '{}'`;
      const result = execSync(cmd, { encoding: 'utf8' });
      const allTasks = JSON.parse(result);
      
      // Filter for Skyfire's tasks
      let myTasks = allTasks.filter(task => 
        task.assigneeIds && task.assigneeIds.includes(SKYFIRE_AGENT_ID)
      );

      // Filter by status if specified
      if (status) {
        myTasks = myTasks.filter(task => task.status === status);
      }

      return myTasks;
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
      return [];
    }
  }

  /**
   * Post a tweet
   */
  async postTweet(text, options = {}) {
    try {
      const tweetData = { text };
      
      // Add reply_settings if specified
      if (options.replySettings) {
        tweetData.reply_settings = options.replySettings;
      }

      const response = await this.client.v2.tweet(tweetData);
      console.log(`✅ Posted tweet: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to post tweet:', error.message);
      throw error;
    }
  }

  /**
   * Post a comment to Mission Control task
   */
  postComment(taskId, message) {
    try {
      const cmd = `cd /root/clawd/mission-control && node scripts/post-comment.js "${taskId}" "${message.replace(/"/g, '\\"')}"`;
      execSync(cmd, { encoding: 'utf8' });
      console.log(`💬 Posted comment to task ${taskId}`);
    } catch (error) {
      console.error('Error posting comment:', error.message);
    }
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId, status) {
    try {
      const cmd = `cd /root/clawd/mission-control && npx convex run tasks:updateStatus '{"id": "${taskId}", "status": "${status}"}'`;
      execSync(cmd, { encoding: 'utf8' });
      console.log(`📝 Updated task ${taskId} to ${status}`);
    } catch (error) {
      console.error('Error updating task:', error.message);
    }
  }

  /**
   * Process assigned posting tasks
   */
  async processPostingTasks() {
    const assignedTasks = this.getMyTasks('assigned');
    
    if (assignedTasks.length === 0) {
      console.log('No assigned posting tasks');
      return;
    }

    console.log(`Found ${assignedTasks.length} assigned task(s)`);

    for (const task of assignedTasks) {
      try {
        console.log(`\n📋 Processing: ${task.title}`);
        
        // Move to in_progress
        this.updateTaskStatus(task._id, 'in_progress');
        
        // Extract tweet text from description
        // Expected format: "Post: [tweet text]" or just the tweet text
        let tweetText = task.description;
        if (tweetText.toLowerCase().startsWith('post:')) {
          tweetText = tweetText.substring(5).trim();
        }

        // Post the tweet
        const tweet = await this.postTweet(tweetText);
        
        // Comment with link to posted tweet
        const tweetUrl = `https://twitter.com/${this.me.username}/status/${tweet.id}`;
        this.postComment(task._id, `✅ Posted to X!\n\n${tweetUrl}`);
        
        // Mark task as done
        this.updateTaskStatus(task._id, 'done');
        
        console.log(`✅ Completed: ${task.title}`);
        
      } catch (error) {
        console.error(`❌ Failed task ${task._id}:`, error.message);
        this.postComment(task._id, `❌ Failed to post: ${error.message}`);
        this.updateTaskStatus(task._id, 'blocked');
      }
    }
  }

  /**
   * Monitor mentions and create engagement tasks
   */
  async monitorEngagement() {
    try {
      // Get recent mentions
      const mentions = await this.client.v2.userMentionTimeline(this.me.id, {
        max_results: 10,
        'tweet.fields': ['created_at', 'conversation_id', 'in_reply_to_user_id'],
        'user.fields': ['username', 'name']
      });

      if (!mentions.data || mentions.data.data.length === 0) {
        console.log('No new mentions to process');
        return;
      }

      console.log(`Found ${mentions.data.data.length} mention(s)`);

      // For now, just log them - engagement task creation can be added later
      for (const mention of mentions.data.data) {
        console.log(`  @${mention.author_id}: ${mention.text.substring(0, 50)}...`);
      }

    } catch (error) {
      console.error('Error monitoring engagement:', error.message);
    }
  }

  /**
   * Main heartbeat - check for work
   */
  async heartbeat() {
    console.log('\n🔥 Skyfire heartbeat');
    
    // Check for posting tasks
    await this.processPostingTasks();
    
    // Check for engagement (mentions/replies)
    await this.monitorEngagement();
    
    console.log('\n✅ Heartbeat complete\n');
  }
}

// CLI interface
async function main() {
  const skyfire = new Skyfire();
  
  const initialized = await skyfire.init();
  if (!initialized) {
    process.exit(1);
  }

  const command = process.argv[2] || 'heartbeat';

  switch (command) {
    case 'heartbeat':
      await skyfire.heartbeat();
      break;
    
    case 'post':
      const text = process.argv[3];
      if (!text) {
        console.error('Usage: node skyfire.js post "Your tweet text"');
        process.exit(1);
      }
      await skyfire.postTweet(text);
      break;
    
    case 'tasks':
      const tasks = skyfire.getMyTasks();
      console.log(JSON.stringify(tasks, null, 2));
      break;
    
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Available commands: heartbeat, post, tasks');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = Skyfire;
