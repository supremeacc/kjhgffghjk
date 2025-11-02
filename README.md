# Discord Intro Manager Bot

A Discord bot for the AI Learners India community that automatically validates and formats member introductions with **AI-powered analysis** and provides a **Team Launch System** for collaborative project workspaces.

## Features

### Member Introduction System
- 🎯 **Accepts ANY Format** - No strict format required! Write your intro naturally
- 🤖 **AI-Powered Extraction** - Google Gemini semantically analyzes and structures your intro
- ✍️ **Automatic Correction** - AI fixes spelling and grammar errors automatically
- 📝 **Third-Person Summaries** - AI rewrites your intro in professional third-person format
- 🎨 **Smart Role Assignment** - Dynamic roles based on experience:
  - 🟢 Learner (Beginner) - Green embed (#00FF7F)
  - 🟡 Builder (Intermediate) - Yellow embed (#FFD700)  
  - 🔴 Expert (Advanced) - Red embed (#FF0000)
- 🖼️ **User Avatars & Mentions** - Tags you and displays your profile picture in the embed
- 📋 Posts beautifully formatted embeds to the profiles channel
- 🔄 Updates existing profiles when users resubmit
- 🗑️ **Auto-Delete** - Removes your intro message after 2 seconds to keep channel clean
- 🤝 **AI Teammate Matching** - Find perfect collaborators based on skills and interests
- ⚠️ Smart error handling for incomplete or off-topic messages

### Team Launch System 🚀
- 📝 **Project Applications** - Apply for private project workspaces with a simple button
- 🤖 **Modal Forms** - Easy-to-fill application forms with project details
- ✅ **Moderator Verification** - Review and approve/reject applications
- 🏗️ **Automated Workspace Creation** - Private categories with text and voice channels
- 👥 **Teammate Management** - Add collaborators to your project space
- 🎨 **Color-Coded Projects** - Dynamic embeds based on project type
- 📊 **Project Status Tracking** - View active projects and team information
- 🧹 **Auto-Cleanup** - Inactive projects get archived after 15+ days
- 📢 **Project Showcase** - Display approved projects in a showcase channel
- 💾 **Persistent Storage** - All project data saved in JSON format

## Setup Instructions

### 1. Get Your Channel IDs

You need two Discord channel IDs:

**To get a channel ID:**
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on the channel → Copy ID

You'll need:
- `INTRO_CHANNEL_ID` - The channel where users post their intros (e.g., #introductions)
- `PROFILE_CHANNEL_ID` - The channel where formatted profiles are posted (e.g., #profiles)

### 2. Get Your Discord Bot Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (or create a new one)
3. Go to the **Bot** tab
4. Click **Reset Token** or **Copy** to get your bot token
5. Keep this token secure - never share it publicly!

### 3. Get Your Google Gemini API Key (Optional but Recommended)

For AI-powered intro analysis:

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy your API key

**Note:** Gemini API is free with generous rate limits! The bot works without it but provides enhanced features with AI analysis.

### 4. Get Your Moderator Role ID (For Team Launch System)

To enable moderator verification for project applications:

1. Enable Developer Mode in Discord
2. Right-click on your moderator role → Copy ID
3. This will be used as `MOD_ROLE_ID`

### 5. Configure Environment Variables

In Replit, go to the **Secrets** panel (lock icon 🔒) and add these secrets:

| Key | Value | Description |
|-----|-------|-------------|
| `DISCORD_TOKEN` | Your bot token | Token from Discord Developer Portal |
| `INTRO_CHANNEL_ID` | Your channel ID | Channel where users post intros |
| `PROFILE_CHANNEL_ID` | Your channel ID | Channel for formatted profiles |
| `GEMINI_API_KEY` | Your Gemini API key | *(Optional)* For AI-enhanced features |
| `MOD_ROLE_ID` | Your moderator role ID | *(Optional)* For project application verification |
| `GUILD_ID` | Your server/guild ID | *(Optional)* For multi-server bot instances |

### 6. Bot Permissions

When inviting your bot to your Discord server, make sure it has these permissions:
- Read Messages/View Channels
- Send Messages
- Embed Links
- Read Message History
- Manage Channels (required for Team Launch System)
- Manage Permissions (required for private workspaces)
- Add Reactions
- Manage Messages (required to auto-delete user intros after processing)

### 6. Run the Bot

Click the **Run** button in Replit, or use:
```bash
npm start
```

## How It Works

### How to Post Your Introduction

**No Strict Format Required!** Just write naturally about yourself. The AI will extract and structure everything.

**Example 1 - Casual Format:**
```
Hey! I'm Ravi, working on automation using n8n and learning AI. 
I studied at IIT Delhi and want to build automation bots.
```

**Example 2 - Structured Format:**
```
Name: Amit Singh
Role / Study: Computer Science Student
Institution / Organization: IIT Delhi
Interests (AI Fields or Tools): Machine Learning, NLP, LLMs
Skills (Programming, Platforms, etc.): Python, TensorFlow, PyTorch
Experience Level (Beginner / Intermediate / Advanced): Intermediate
Goal or What You Want to Build: Build AI-powered chatbots for education
Portfolio / GitHub / LinkedIn (optional): github.com/amitsingh
```

**Example 3 - Conversational:**
```
Hi everyone! I'm Priya from Mumbai. I'm a data science student at 
BITS Pilani. I love working with Python and pandas. My goal is to 
become a machine learning engineer. Still learning the basics!
```

**All formats work!** The AI intelligently extracts:
- Name, Role/Study, Institution
- Interests, Skills, Experience Level
- Goals, Portfolio links (if mentioned)

### What Happens

**When you post an intro:**
1. 🤖 AI analyzes your message semantically (understands context, not just keywords)
2. ✍️ Fixes spelling mistakes and grammar errors
3. 📊 Assesses your experience level based on skills mentioned
4. 🎯 Assigns appropriate role:
   - **🟢 Learner** (Beginner) - Green embed (#00FF7F)
   - **🟡 Builder** (Intermediate) - Yellow embed (#FFD700)
   - **🔴 Expert** (Advanced) - Red embed (#FF0000)
5. 📋 Creates beautiful embed with all structured information
6. 👤 Tags you (mentions @username) so others can find you easily
7. ✅ Reacts with a checkmark to confirm
8. 🗑️ Automatically deletes your original message after 2 seconds to keep the channel clean

**Example Output Embed:**
```
🎓 Member Introduction

@Ravi

Ravi is an AI & Automation Developer working with n8n at IIT Delhi, 
passionate about building intelligent automation systems. With skills 
in n8n and AI automation, Ravi is focused on creating advanced automation bots.

🎓 Name: Ravi
💼 Role / Study: AI & Automation Developer
🏫 Institution: IIT Delhi
🤖 Interests: AI, Automation, n8n
🧠 Skills: n8n, AI Automation
🚀 Goal: Build AI automation bots

🧩 Verified by AI Learners India Bot 🤖
```

Note: The embed color still reflects experience level (Green for Learner, Yellow for Builder, Red for Expert)

**Error Handling:**
- ⚠️ **Too short?** Bot asks you to include more details about role, skills, and goals
- 🤐 **Off-topic?** Bot ignores silently (e.g., "hello", "thanks")
- 🔄 **Updating intro?** Bot automatically deletes old profile and posts the new one

## Team Launch System 🚀

The Team Launch System allows community members to apply for private project workspaces where they can collaborate on startups, AI projects, or study teams.

### How to Apply for a Project Space

1. **Find the Application Channel**
   - Admins will set up an application button using `/setup-apply-button`
   - Look for a channel like #project-apply with a green "Apply" button

2. **Click Apply**
   - Click the green "Apply 🚀" button
   - A modal form will appear

3. **Fill Out the Application**
   The form asks for:
   - 🏷️ **Project Name** - Name of your project
   - 💡 **Short Description** - Brief description (max 300 characters)
   - 🎯 **Project Type** - Choose from:
     - Startup (Purple)
     - AI Research (Blue)
     - Automation (Orange)
     - Study Group (Green)
     - Other (Gray)
   - 👥 **Initial Teammates** (Optional) - Mention users you want to collaborate with

4. **Wait for Verification**
   - A temporary verification channel is created
   - Moderators will review your application
   - You'll see your application details in the verification channel

5. **Approval Process**
   - Moderators can click ✅ **Approve** or ❌ **Reject**
   - If approved:
     - A new category is created: `🚀｜Project - YourProjectName`
     - Two channels are created: `#team-chat` and `🎙️ team-vc`
     - Only you, your teammates, and moderators can access it
   - If rejected:
     - You'll receive a DM explaining the decision
     - You can reapply with a revised proposal

### Managing Your Project

**Add Teammates:**
```
/add-teammate user1:@username
```
- Add up to 3 users at once
- They'll get full access to your project channels

**Check Project Status:**
```
/project-status
```
- View project information
- See team members
- Check days active and last activity date

**Stay Active:**
- Projects inactive for 15+ days will receive a warning
- If still inactive after 3 more days, they'll be archived
- Send messages in your project channel to stay active

### Admin Commands (Team Launch System)

**Setup Application Button:**
```
/setup-apply-button channel:#project-apply
```
- Posts the application button in the specified channel
- Requires Manage Channels permission

**Showcase a Project:**
```
/project-showcase owner:@username channel:#showcase
```
- Posts a project summary to a showcase channel
- Displays project details, type, and team members
- Requires Manage Channels permission

### Project Types & Colors

Each project type has a unique color scheme:
- 🧠 **AI Research** → Blue (#1E90FF)
- ⚙️ **Automation** → Orange (#FF8C00)
- 💼 **Startup** → Purple (#9B59B6)
- 🎓 **Study Group** → Green (#00FF7F)
- 📝 **Other** → Gray (#95A5A6)

## Slash Commands (Member Introduction System)

### `/find_teammate`
🆕 Find suitable teammates based on skills and interests using AI analysis!

**Usage:** `/find_teammate role_or_interest: [what you're looking for]`

- 🤖 AI analyzes all profiles in #profiles channel
- 🎯 Returns top 3 matches based on skills, interests, and goals
- 💯 Provides compatibility scores (1-10)
- 🏷️ Tags matched users automatically
- 🎨 Color-coded by compatibility (Green: 9+, Yellow: 7-8, Blue: <7)

**Examples:**
```
/find_teammate role_or_interest: UI designer
/find_teammate role_or_interest: automation developer
/find_teammate role_or_interest: data scientist with Python skills
/find_teammate role_or_interest: someone who knows React
```

### `/update_intro`
Update your introduction anytime - accepts ANY format!

**Usage:** `/update_intro intro: [your new intro in any format]`

- ✅ No strict format required - write naturally
- 🤖 AI extracts and structures your information
- 📋 Updates your profile in #profiles channel
- 🔄 Deletes old profile automatically

**Example:**
```
/update_intro intro: Hey! I'm now learning PyTorch and working 
at Google as an ML intern. Want to build computer vision models.
```

### `/deleteintro` (Admin Only)
Allows moderators to delete a user's profile.

**Usage:** `/deleteintro user: @username`

- Requires "Manage Messages" permission
- Deletes profile from #profiles channel
- Removes from database

## Project Structure

```
discord-intro-bot/
├── index.js                 # Main bot logic & command handler
├── package.json             # Dependencies
├── commands/
│   ├── findTeammate.js     # /find_teammate slash command (AI matching)
│   ├── updateIntro.js      # /update_intro slash command
│   └── deleteIntro.js      # /deleteintro slash command
├── utils/
│   ├── validateIntro.js    # Validates intro format
│   ├── geminiAnalyze.js    # AI analysis with Gemini
│   ├── formatEmbed.js      # Creates Discord embeds
│   └── updateProfile.js    # Manages user profiles
└── profiles.json           # Stores user profile data (auto-created)
```

## AI-Enhanced Features

When **GEMINI_API_KEY** is configured, the bot provides:

- 🤖 **Smart Role Detection** - AI analyzes skills and assigns appropriate roles
- 📊 **Experience Leveling** - Automatically categorizes as Beginner/Intermediate/Expert
- 🎨 **Intelligent Color Coding** - Dynamic colors based on skill level
- ✨ **Refined Summaries** - AI creates concise, professional intro descriptions
- 🧠 **Fallback Support** - Gracefully handles API failures

**Without Gemini:** Bot still works perfectly with standard embeds and random colors.

## Troubleshooting

### Bot doesn't respond
- Check that the channel IDs are correct
- Verify the bot has the required permissions
- Make sure the bot is online (check console logs)

### "Missing fields" error
- Ensure all 5 fields are included with the exact emojis
- Check for typos in field names (e.g., "Role / Study" not "Role/Study")

### Profile not updating
- Verify the PROFILE_CHANNEL_ID is correct
- Check bot has permission to delete messages in that channel

### Gemini AI not working
- Verify GEMINI_API_KEY is set in Replit Secrets
- Check console logs for API errors
- Bot will automatically fall back to standard embeds if Gemini fails

## Console Logs

The bot logs all important actions:
- ✅ Bot startup and login
- 📨 New messages received
- ✅ Valid intros detected
- ⚠️ Incomplete intros with missing fields
- ✨ Profiles posted successfully
- 🔄 Old profiles deleted
- ❌ Any errors that occur

## Support

Check the console logs for detailed information about what the bot is doing. All actions are logged for easy debugging.
