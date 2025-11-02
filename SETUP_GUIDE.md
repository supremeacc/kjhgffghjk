# Discord Bot Setup Guide - Modern Introduction System

## 🎯 Overview

Your Discord bot now features a **modern setup wizard** and **button-based introduction system** with AI-powered profile generation!

---

## 🚀 Quick Start (First Time Setup)

### Step 1: Run the Setup Wizard

As an **administrator**, run this command in Discord:

```
/setup-bot
```

The bot will show you interactive dropdown menus to configure:

1. **📝 Intro Channel** - Where users will click to introduce themselves
2. **📋 Profile Channel** - Where formatted AI-generated profiles are posted
3. **👮 Moderator Role** _(Optional)_ - For project application verification
4. **✅ Verification Channel** _(Optional)_ - For project applications

Simply select the appropriate options from each dropdown. The bot will automatically save your configuration!

### Step 2: Post the Introduction Button

Once configured, post the introduction button in your intro channel:

```
/setup-intro-button
```

Or specify a different channel:

```
/setup-intro-button channel:#welcome
```

This creates a beautiful welcome message with a **"Introduce Yourself 🪪"** button!

---

## 👥 For Community Members

### How to Introduce Yourself

1. **Find the intro button** in the designated intro channel
2. **Click "Introduce Yourself 🪪"**
3. **Fill out the modal form** with your information:
   - **Name** - Your name
   - **Role/Study** - What you do (e.g., "CS Student", "ML Engineer")
   - **Institution** - Where you work/study (optional)
   - **Interests** - AI fields or tools you're interested in
   - **Skills, Experience & Goals** - Tell us about your skills, experience level, and what you want to build

4. **Submit** and wait for AI processing

### What Happens Next?

🤖 **AI Processing:**
- Gemini AI analyzes your introduction
- Detects if you wrote in English or Hinglish
- Refines your intro into a professional summary
- Determines your experience level (Beginner/Builder/Pro)
- Assigns you an appropriate role based on your interests

📋 **Profile Creation:**
- A beautiful profile embed is posted in the profiles channel
- Color-coded by experience:
  - 🟢 **Beginner** - Green
  - 🟡 **Builder** - Yellow
  - 🔴 **Pro** - Red
- Your profile includes your avatar, interests, skills, and goals

🎯 **Role Assignment:**
- The bot automatically assigns you a role from existing server roles
- Roles are matched based on your interests and skills

### Editing Your Profile

Want to update your introduction? Simple!

```
/edit-profile
```

The form will be **pre-filled** with your current information. Just edit what you want to change and submit!

---

## 🛠️ For Admins

### Available Admin Commands

#### Setup & Configuration

**`/setup-bot`**
- Interactive setup wizard
- Configure intro channel, profile channel, moderator role
- Requires Administrator permission

**`/setup-reset`**
- Reset bot configuration
- Requires confirmation before clearing
- Useful if you want to reconfigure from scratch

**`/setup-intro-button`**
- Post the introduction button in a channel
- Can specify a custom channel or use configured intro channel
- Requires Administrator permission

#### Other Admin Commands

**`/deleteintro user:@username`**
- Delete a user's profile (existing command)
- Requires Manage Messages permission

**`/setup-apply-button channel:#channel`**
- Post the project application button (existing command)
- For the Team Launch System

---

## 🎨 How AI Processing Works

### Language Detection
- The bot automatically detects **English**, **Hindi**, or **Hinglish**
- Responds in the same language/tone as your input
- Example: If you write in Hinglish, your summary will be in Hinglish!

### Experience Level Detection

The AI analyzes your skills and background to determine:

- **🟢 Beginner** - Just started learning, basic knowledge, student
- **🟡 Builder** - Intermediate skills, building projects, some experience  
- **🔴 Pro** - Advanced skills, professional experience, expert level

### Role Assignment

The AI looks at your interests and skills, then assigns **ONE role** from your server's existing roles that best matches your profile.

**Example:**
- Interests: "Machine Learning, NLP, Python"
- Skills: "TensorFlow, PyTorch"
- Assigned Role: "ML Engineer" or "Developer"

---

## 📊 Data Stored

Profile data is stored in `profiles.json` and includes:

```json
{
  "userId": "123456789",
  "messageId": "987654321",
  "timestamp": 1730479200000,
  "introData": {
    "name": "Rahul",
    "role": "ML Engineer",
    "institution": "IIT Delhi",
    "interests": "Machine Learning, NLP",
    "details": "..."
  },
  "aiProcessed": {
    "summary": "AI-generated summary",
    "experienceLevel": "Builder",
    "assignedRole": "Developer"
  }
}
```

---

## 🔧 Configuration File

Bot settings are stored in `botConfig.json`:

```json
{
  "introChannelId": "1234567890",
  "profileChannelId": "0987654321",
  "moderatorRoleId": "1122334455",
  "verificationChannelId": "5544332211",
  "setupComplete": true,
  "setupBy": "admin_user_id",
  "setupTimestamp": 1730479200000,
  "guildId": "guild_id"
}
```

Both files are automatically created and managed by the bot. They are excluded from git tracking.

---

## ✨ Features Summary

### ✅ What's New

- **Interactive Setup Wizard** - Easy configuration with dropdowns
- **Button-Based Introductions** - Click a button instead of typing
- **Modal Forms** - Clean, structured input
- **AI Refinement** - Gemini AI processes and formats intros
- **Hinglish Support** - Automatically detects and preserves Hinglish tone
- **Auto Role Assignment** - Assigns roles based on AI analysis
- **Edit Profile** - Pre-filled form for easy updates
- **Experience-Based Colors** - Visual distinction by skill level
- **Enhanced Storage** - Full intro data and AI results saved

### 🎯 Benefits

- **User-Friendly** - No need to remember specific formats
- **Professional** - AI-generated summaries are clean and consistent
- **Multilingual** - Works with English and Hinglish naturally
- **Automated** - Roles assigned automatically
- **Flexible** - Easy to update profiles anytime
- **Organized** - All profiles in one channel with consistent formatting

---

## 🐛 Troubleshooting

### "Bot is not configured yet!"
**Solution:** Run `/setup-bot` as an administrator to configure the bot.

### "Could not find the profile channel"
**Solution:** Make sure you've configured the bot with `/setup-bot` and the selected channel still exists.

### "Something went wrong while processing your introduction"
**Solution:** 
1. Check that `GEMINI_API_KEY` is set in environment variables
2. Verify the bot has permissions to post in the profile channel
3. Try submitting again - it may be a temporary API issue

### Role not assigned
**Possible reasons:**
- The AI-suggested role doesn't exist in your server
- The role is managed (e.g., bot roles, integration roles)
- The bot doesn't have permission to assign roles

**Solution:** Ensure your server has appropriate roles (Developer, Designer, etc.) and the bot role is positioned above them.

---

## 💡 Best Practices

### For Admins

1. **Create roles before setup** - Have roles like "Developer", "Designer", "ML Engineer" ready
2. **Position bot role correctly** - Bot role must be above roles it needs to assign
3. **Test the flow** - Try introducing yourself to see how it works
4. **Pin the intro button** - Pin the introduction message for easy access

### For Users

1. **Be descriptive** - The more details you provide, the better AI can refine your intro
2. **Mention specific skills** - List tools, languages, frameworks you know
3. **State your goals** - What you want to build or learn
4. **Include experience** - Mention if you're a beginner, intermediate, or expert
5. **Add portfolio links** - GitHub, LinkedIn, personal website

---

## 📚 Related Commands

- **`/find_teammate`** - Find teammates based on skills (existing)
- **`/join-vc-summary`** - Record voice channel meetings (existing)
- **`/summarize-vc`** - Generate meeting summaries (existing)
- **`/minutes`** - Download PDF meeting minutes (existing)

---

**Last Updated:** November 1, 2025  
**Status:** Modern Introduction System Active ✅
