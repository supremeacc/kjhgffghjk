/**
 * Safe interaction reply utility
 * Handles all edge cases when replying to Discord interactions
 */

const { MessageFlags } = require('discord.js');

/**
 * Safely reply to an interaction, handling all possible states
 * @param {Interaction} interaction - The Discord interaction
 * @param {Object|String} options - Reply options or string content
 * @returns {Promise<boolean>} - Success status
 */
async function safeReply(interaction, options) {
  try {
    // Normalize options - convert ephemeral to flags for Discord.js v14
    let replyOptions;
    if (typeof options === 'string') {
      replyOptions = { content: options, flags: MessageFlags.Ephemeral };
    } else {
      replyOptions = { ...options };
      // Convert deprecated ephemeral to flags
      if (replyOptions.ephemeral === true && !replyOptions.flags) {
        replyOptions.flags = MessageFlags.Ephemeral;
        delete replyOptions.ephemeral;
      } else if (replyOptions.ephemeral === false) {
        delete replyOptions.ephemeral;
      }
    }

    if (interaction.replied) {
      // Already replied, use followUp
      await interaction.followUp(replyOptions);
      return true;
    } else if (interaction.deferred) {
      // Deferred, use editReply
      await interaction.editReply(replyOptions);
      return true;
    } else {
      // Not replied yet, use reply
      await interaction.reply(replyOptions);
      return true;
    }
  } catch (error) {
    // Silently log errors - interaction may have timed out
    console.error('[SafeReply] Failed to send interaction response:', error.message);
    return false;
  }
}

/**
 * Safely send an error message to the user
 * @param {Interaction} interaction - The Discord interaction
 * @param {String} message - Error message to display
 * @param {Error} error - The actual error object (for logging)
 * @returns {Promise<boolean>} - Success status
 */
async function safeError(interaction, message = '❌ An error occurred', error = null) {
  if (error) {
    console.error(`[Error] ${message}:`, error);
  }
  
  return await safeReply(interaction, {
    content: message,
    flags: MessageFlags.Ephemeral
  });
}

/**
 * Safely defer a reply, with built-in error handling
 * @param {Interaction} interaction - The Discord interaction
 * @param {Object} options - Defer options
 * @returns {Promise<boolean>} - Success status
 */
async function safeDefer(interaction, options = {}) {
  try {
    if (interaction.deferred || interaction.replied) {
      return true; // Already handled
    }
    
    // Convert ephemeral to flags for Discord.js v14
    const deferOptions = { ...options };
    if (deferOptions.ephemeral === true && !deferOptions.flags) {
      deferOptions.flags = MessageFlags.Ephemeral;
      delete deferOptions.ephemeral;
    } else if (deferOptions.ephemeral === false) {
      delete deferOptions.ephemeral;
    }
    // Default to ephemeral if no flags specified
    if (!deferOptions.flags) {
      deferOptions.flags = MessageFlags.Ephemeral;
    }
    
    await interaction.deferReply(deferOptions);
    return true;
  } catch (error) {
    console.error('[SafeDefer] Failed to defer interaction:', error.message);
    return false;
  }
}

module.exports = {
  safeReply,
  safeError,
  safeDefer
};
