# Discord Intro Manager Bot

## Overview
This Discord bot for the AI Learners India community streamlines member onboarding, facilitates collaboration, and enhances meeting productivity. Its core capabilities include AI-powered member introductions, a system for launching and managing team projects, an AI-driven VC summarizer and meeting assistant, and an AI-powered teammate matching feature. The project aims to foster a more organized, collaborative, and AI-augmented community experience.

## Recent Changes (November 1, 2025)
- ✅ **Complete Intro System Rebuild** - Rebuilt from scratch with modern, stable implementation
- ✅ **New AI Summary Engine** (`utils/aiIntroSummary.js`) - Clean Gemini SDK usage with robust error handling
- ✅ **Interactive Update/Delete Buttons** - Users can now update or delete their intros with button clicks
- ✅ **One Intro Per User** - Automatically deletes old intros before posting new ones
- ✅ **Comprehensive Fallback System** - Never crashes, always provides a usable intro even if AI fails
- ✅ **Hinglish Support** - AI naturally detects and responds in English or Hinglish
- ✅ **Fixed critical bugs** - Proper fallback handling and removed divergent legacy code
- ✅ **Replit Environment Setup Complete** - Bot is fully configured and running in Replit
- ✅ **Added .gitignore** - Protects sensitive data files and configuration from version control
- ✅ **Environment secrets configured** - DISCORD_TOKEN, GEMINI_API_KEY, INTRO_CHANNEL_ID, PROFILE_CHANNEL_ID

## User Preferences
I prefer iterative development, where features are developed and integrated in stages. Before making major changes or architectural decisions, please ask for my approval. I appreciate clear, concise explanations and prefer working with modular and well-documented code. Please do not make changes to the existing file structure without prior discussion.

## System Architecture

### UI/UX Decisions
- **Dynamic Embeds:** Utilizes Discord embeds with dynamic, color-coded designs based on AI-detected skill levels (Green, Yellow, Red) for introductions, and project types for team launches.
- **Emoji Integration:** Employs relevant emojis to enhance readability and visual cues.
- **Clean Layout:** Focuses on an organized presentation of information within Discord messages.

### Technical Implementations
- **Modular Design:** Built with a modular architecture, separating concerns for maintainability and scalability.
- **Persistent Storage:** Uses JSON files (`profiles.json`, `projectData.json`, `vcSessions.json`, `userPreferences.json`, `botConfig.json`) for persistent data storage.
- **AI-Powered Processing:** Integrates Google Gemini AI for natural language understanding, text generation, and audio transcription.
- **Voice Capabilities:** Leverages `@discordjs/voice` for robust voice channel interaction, recording, and transcription.
- **PDF Generation:** Employs `pdfkit` for generating professional PDF meeting minutes.
- **Error Handling:** Includes comprehensive error handling for graceful fallbacks and user feedback.
- **Automated Actions:** Implements features like auto-deletion of intro messages and scheduled project cleanup.

### Feature Specifications
- **Member Introduction System:** Supports flexible intro formats, AI-powered semantic extraction, spelling/grammar correction, role/experience level assignment, and `updateintro`/`deleteintro` commands.
- **Team Launch System:** Manages project applications, approvals, and automated private workspace creation; includes `addTeammate`, `projectStatus`, and `projectShowcase` commands.
- **VC Summarizer & Meeting Assistant:** Records voice channel audio, transcribes using Gemini, provides multilingual summaries (English, Hindi, Hinglish) with dynamic color coding based on productivity, generates PDF meeting minutes, and offers `/stop-summary`, `/summarize-vc`, `/summary-mode`, and `/minutes` commands.
- **Teammate Matching:** AI analyzes profiles to suggest top 3 matches based on skills, interests, and goals via `/find_teammate`, providing compatibility scores.

### System Design Choices
- **Node.js with discord.js v14:** Chosen for asynchronous capabilities and Discord API wrapper.
- **Slash Commands:** Primary interaction method for users.
- **Environment Variables:** Configuration managed through Replit Secrets for security.
- **Discord Intents:** Explicitly configured for necessary bot permissions.

## External Dependencies

- **Discord API:** Core platform for bot interactions.
- **Google Gemini AI:** Used for text analysis, natural language understanding and generation, and audio transcription.
- **npm packages:**
    - `discord.js`: Discord API interaction.
    - `@google/genai`: Google Gemini API SDK.
    - `dotenv`: Environment variable management.
    - `@discordjs/voice`, `opusscript`, `prism-media`, `ffmpeg-static`, `libsodium-wrappers`: Voice channel functionality.
    - `pdfkit`: PDF document generation.

## Recent Changes

### November 1, 2025 - Replit Setup & Error Handling Improvements
- **Replit Environment Setup:** Successfully configured the bot to run in Replit with proper workflow configuration.
- **Environment Secrets:** Configured DISCORD_TOKEN, GEMINI_API_KEY, INTRO_CHANNEL_ID, and PROFILE_CHANNEL_ID as secure environment variables.
- **Fixed Null Value Crashes:** Updated `handlers/introInteractions.js` to prevent crashes from missing intro fields:
  - Added fallback values ("Not provided") for all embed fields to prevent `CombinedPropertyError`.
  - Improved null checking for optional fields (goal, portfolio) to handle both `null` and string `"null"`.
  - Enhanced error resilience in both `handleIntroModal` and `handleEditProfileModal` functions.
- **Git Configuration:** Added comprehensive `.gitignore` file to exclude sensitive data, node_modules, and auto-generated files.
- **Bot Status:** ✅ Bot is running successfully with all features enabled (16 slash commands loaded, Gemini AI enabled, Voice Summarizer active).

## Replit Configuration

### Workflow
- **Name:** discord-bot
- **Command:** `npm start`
- **Output Type:** Console
- **Status:** Running

### Required Environment Variables
All configured as Replit Secrets:
- `DISCORD_TOKEN` - Discord bot authentication token
- `GEMINI_API_KEY` - Google Gemini API key for AI processing
- `INTRO_CHANNEL_ID` - Channel ID for user introductions
- `PROFILE_CHANNEL_ID` - Channel ID for formatted profiles

### Bot Capabilities
✅ All 16 commands loaded and registered:
- Member Introduction System (setup-intro-button, edit-profile, update_intro, deleteintro)
- Team Launch System (setup-apply-button, add-teammate, project-status, project-showcase)
- VC Summarizer (join-vc-summary, stop-summary, summarize-vc, summary-mode, minutes)
- Teammate Matching (find_teammate)
- Bot Configuration (setup-bot, setup-reset)