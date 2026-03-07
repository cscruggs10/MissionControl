/**
 * Loop Creator Conversation Handler
 * Manages the conversational flow for creating loops
 */

export type ConversationState =
  | "idle"
  | "awaiting_channel"
  | "awaiting_title"
  | "awaiting_description"
  | "awaiting_files"
  | "awaiting_assignees"
  | "confirming";

export interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface LoopCreatorSession {
  state: ConversationState;
  userName?: string;
  channelId?: string;
  channelName?: string;
  title?: string;
  description?: string;
  files?: UploadedFile[];
  assigneeIds?: string[];
  assigneeNames?: string[];
}

export interface ConversationResponse {
  message: string;
  state: ConversationState;
  session: LoopCreatorSession;
  options?: string[];
}

export class LoopCreatorAgent {
  private session: LoopCreatorSession;
  private channels: any[] = [];
  private agents: any[] = [];

  constructor(
    initialSession?: LoopCreatorSession,
    channels?: any[],
    agents?: any[]
  ) {
    this.session = initialSession || { state: "idle" };
    this.channels = channels || [];
    this.agents = agents || [];
  }

  async processMessage(message: string): Promise<ConversationResponse> {
    const msg = message.trim().toLowerCase();

    // Handle global commands
    if (msg === "cancel" || msg === "reset") {
      return this.reset();
    }

    if (msg === "skip" && this.canSkip()) {
      return this.skip();
    }

    // State machine
    switch (this.session.state) {
      case "idle":
        return this.handleIdle(message);
      
      case "awaiting_channel":
        return this.handleChannel(message);
      
      case "awaiting_title":
        return this.handleTitle(message);
      
      case "awaiting_description":
        return this.handleDescription(message);
      
      case "awaiting_files":
        return this.handleFiles(message);
      
      case "awaiting_assignees":
        return this.handleAssignees(message);
      
      case "confirming":
        return this.handleConfirm(message);
      
      default:
        return this.reset();
    }
  }

  private handleIdle(message: string): ConversationResponse {
    const msg = message.trim().toLowerCase();
    
    // Check for "Post [this/video/photo] to [channel]" pattern
    const postMatch = message.match(/post\s+(?:this|video|photo|image)?\s*(?:to|in)\s+(.+)/i);
    if (postMatch) {
      const channelName = postMatch[1].trim();
      const channel = this.findChannel(channelName);
      
      if (channel) {
        this.session.channelId = channel._id;
        this.session.channelName = channel.name;
        this.session.state = "awaiting_title";
        
        return {
          message: `Perfect! Posting to ${channel.emoji || "📂"} ${channel.name}\n\nWhat's the title?`,
          state: "awaiting_title",
          session: this.session,
        };
      } else {
        // Channel not found, show available channels
        const channelList = this.channels
          .map((ch) => `• ${ch.emoji || "📂"} ${ch.name}`)
          .join("\n");
        
        return {
          message: `I don't see a channel called "${channelName}". Here are the available channels:\n\n${channelList}\n\nWhich one?`,
          state: "idle",
          session: this.session,
          options: this.channels.map((ch) => ch.name),
        };
      }
    }
    
    // Check for quick create pattern: "Create loop in [channel]: [title]"
    const quickMatch = message.match(/create loop in (.+?):\s*(.+)/i);
    if (quickMatch) {
      const channelName = quickMatch[1].trim();
      const title = quickMatch[2].trim();
      
      const channel = this.findChannel(channelName);
      if (channel) {
        this.session.channelId = channel._id;
        this.session.channelName = channel.name;
        this.session.title = title;
        this.session.state = "awaiting_description";
        
        return {
          message: `Got it! Creating "${title}" in ${channel.name}.\n\nAny description to add? (or say "skip")`,
          state: "awaiting_description",
          session: this.session,
        };
      }
    }

    // Regular flow
    if (
      msg.includes("create") ||
      msg.includes("yes") ||
      msg.includes("yeah") ||
      msg.includes("sure")
    ) {
      this.session.state = "awaiting_channel";
      
      const channelList = this.channels
        .map((ch) => `• ${ch.emoji || "📂"} ${ch.name}`)
        .join("\n");

      return {
        message: `Sure! Which channel?\n\n${channelList}\n\nJust type the channel name.`,
        state: "awaiting_channel",
        session: this.session,
        options: this.channels.map((ch) => ch.name),
      };
    }

    return {
      message: "Hey! Want to create a loop? Just say 'yes' or 'create loop'.",
      state: "idle",
      session: this.session,
    };
  }

  private handleChannel(message: string): ConversationResponse {
    const channel = this.findChannel(message);

    if (!channel) {
      const channelList = this.channels
        .map((ch) => `• ${ch.name}`)
        .join("\n");

      return {
        message: `Hmm, I don't see that channel. Try one of these:\n\n${channelList}`,
        state: "awaiting_channel",
        session: this.session,
        options: this.channels.map((ch) => ch.name),
      };
    }

    this.session.channelId = channel._id;
    this.session.channelName = channel.name;
    this.session.state = "awaiting_title";

    return {
      message: `Got it - ${channel.emoji || "📂"} ${channel.name}\n\nWhat should I call this loop?`,
      state: "awaiting_title",
      session: this.session,
    };
  }

  private handleTitle(message: string): ConversationResponse {
    this.session.title = message.trim();
    this.session.state = "awaiting_description";

    return {
      message: `Perfect! "${this.session.title}"\n\nAny description or details? (or say "skip")`,
      state: "awaiting_description",
      session: this.session,
    };
  }

  private handleDescription(message: string): ConversationResponse {
    const msg = message.trim().toLowerCase();

    if (msg !== "skip") {
      this.session.description = message.trim();
    }

    this.session.state = "awaiting_assignees";

    const agentList = this.agents
      .map((a) => `• ${a.emoji || "🤖"} ${a.name}`)
      .join("\n");

    return {
      message: `${
        msg === "skip" ? "No problem." : "✅ Noted."
      }\n\nWant to assign any agents?\n\n${agentList}\n\n(or say "skip")`,
      state: "awaiting_assignees",
      session: this.session,
      options: [...this.agents.map((a) => a.name), "skip"],
    };
  }

  private handleFiles(message: string): ConversationResponse {
    // Files handled separately via upload
    this.session.state = "awaiting_assignees";
    return this.handleDescription("skip");
  }

  private handleAssignees(message: string): ConversationResponse {
    const msg = message.trim().toLowerCase();

    if (msg !== "skip" && msg !== "no" && msg !== "none") {
      // Try to find agent(s) by name
      const agent = this.findAgent(message);
      if (agent) {
        this.session.assigneeIds = [agent._id];
        this.session.assigneeNames = [agent.name];
      }
    }

    this.session.state = "confirming";

    const summary = this.buildSummary();

    return {
      message: `${summary}\n\nLook good? Say "yes" to create it or "cancel" to start over.`,
      state: "confirming",
      session: this.session,
      options: ["yes", "cancel"],
    };
  }

  private handleConfirm(message: string): ConversationResponse {
    const msg = message.trim().toLowerCase();

    if (msg === "yes" || msg === "create" || msg === "confirm") {
      // Signal to create the loop
      return {
        message: "CREATE_LOOP", // Special signal for API to create
        state: "idle",
        session: this.session,
      };
    }

    return this.reset();
  }

  private buildSummary(): string {
    let summary = "Here's what I've got:\n\n";
    summary += `📋 **${this.session.title}**\n`;
    summary += `📂 Channel: ${this.session.channelName}\n`;

    if (this.session.description) {
      summary += `📝 Description: ${this.session.description}\n`;
    }

    if (this.session.assigneeNames && this.session.assigneeNames.length > 0) {
      summary += `👥 Assigned: ${this.session.assigneeNames.join(", ")}\n`;
    } else {
      summary += `👥 Unassigned\n`;
    }

    return summary;
  }

  private findChannel(query: string): any {
    const q = query.trim().toLowerCase();
    return this.channels.find(
      (ch) =>
        ch.name.toLowerCase() === q ||
        ch.name.toLowerCase().includes(q) ||
        q.includes(ch.name.toLowerCase())
    );
  }

  private findAgent(query: string): any {
    const q = query.trim().toLowerCase();
    return this.agents.find(
      (a) =>
        a.name.toLowerCase() === q ||
        a.name.toLowerCase().includes(q) ||
        q.includes(a.name.toLowerCase())
    );
  }

  private canSkip(): boolean {
    return (
      this.session.state === "awaiting_description" ||
      this.session.state === "awaiting_files" ||
      this.session.state === "awaiting_assignees"
    );
  }

  private skip(): ConversationResponse {
    // Advance to next state
    if (this.session.state === "awaiting_description") {
      return this.handleDescription("skip");
    }
    if (this.session.state === "awaiting_files") {
      return this.handleFiles("skip");
    }
    if (this.session.state === "awaiting_assignees") {
      return this.handleAssignees("skip");
    }

    return this.reset();
  }

  private reset(): ConversationResponse {
    this.session = { state: "idle" };

    return {
      message: "No problem! Starting fresh.\n\nWant to create a loop?",
      state: "idle",
      session: this.session,
    };
  }

  getSession(): LoopCreatorSession {
    return this.session;
  }
}
