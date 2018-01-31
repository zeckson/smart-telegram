import * as TelegramBot from "node-telegram-bot-api";
import {shell} from "../util";
import {Command} from "../command";

/*
# Switch on
  echo "on 0" | cec-client -s
# Switch off
  echo "standby 0" | cec-client -s
# Switch HDMI port to 1
  echo "tx 4F:82:10:00" | cec-client -s
*/
const TvCommand: { [command: string]: string } = {
  'on': `on 0`,
  'off': `standby 0`,

  'chromecast': `tx 4F:82:10:00`,
  'raspberry': `tx 4F:82:20:00`,
  'xbox': `tx 4F:82:30:00`,
};

const keys = Object.keys(TvCommand).map((it) => it.toLowerCase());
const variants = keys.join(`|`);
const buttons = keys.map((it) => ({text: `/tv ${it}`}));

export default class TVCommand extends Command {
  readonly name = `tv`;
  readonly description = `Controls TV-set`;
  readonly pattern = `\/${this.name}.?(${variants})?`;


  handle(msg: TelegramBot.Message, match: RegExpExecArray): void {
    const chatId = msg.chat.id;
    console.log(match);
    const command = match[1];
    if (!command) {
      this.bot.sendMessage(chatId, `What should I do with TV?`, {
        reply_markup: {
          keyboard: [
            [
              buttons[0], buttons[1]
            ],
            [
              buttons[2], buttons[3], buttons[4]
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
      return;
    }
    const action = TvCommand[command];
    if (!action) {
      const message = `Unsupported command: ${command}`;
      console.error(message);
      this.bot.sendMessage(chatId, message);
      return;
    }

    shell(`echo "${action}" | cec-client -s -d 1`)
      .catch((errorMessage) => errorMessage)
      .then((message) => this.bot.sendMessage(chatId, message, {disable_notification: true}));
  }
}