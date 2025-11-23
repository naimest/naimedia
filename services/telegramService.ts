import { TelegramConfig } from '../types';

export const sendTelegramMessage = async (config: TelegramConfig, text: string): Promise<boolean> => {
  if (!config.botToken || !config.chatId) return false;

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: text,
        parse_mode: 'Markdown'
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to send Telegram message", error);
    return false;
  }
};
