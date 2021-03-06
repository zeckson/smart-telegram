import * as TelegramBot from 'node-telegram-bot-api';
import {Command} from './base/command';
import {Manage} from '../manage';
import {Url} from 'url';
import {get} from 'http';

export default class CameraCommand extends Command {
  public name = `camera`;
  public description = `Sends camera picture`;
  public pattern = `\/${this.name}`;

  constructor(bot: TelegramBot,
              manage: Manage,
              private readonly url: Url) {
    super(bot, manage);
  }

  public handleMessage(msg: TelegramBot.Message): void {
    // 'msg' is the received Message from Telegram

    const chatId = msg.chat.id;

    get(this.url, (response) => {
      const statusCode = response.statusCode;
      if (statusCode !== 200) {
        this.bot.sendMessage(chatId, `Failed to fetch media. Response code: ${statusCode}`);
      } else {
        response.on('error', (e) => {
          this.bot.sendMessage(chatId, `Failed to fetch media. Error: ${e.message}`);
        });
        // @ts-ignore
        response.path = `camera.jpg`; // NB! Due to issue in library check set this always
        const root = this.manage.root;
        if (chatId === root) {
          this.bot.sendPhoto(root, response);
        } else {
          // TODO: allow only admin to see pictures, meanwhile it's accessible only by root
          // this.bot.sendPhoto(chatId, response);
          this.bot.sendMessage(chatId, `Failed to fetch media. Service unavailable.`);
          this.bot.sendPhoto(root, response, {caption: `Requested photo by ${chatId}`});
        }
      }
    }).on('error', (e) => {
      this.bot.sendMessage(chatId, `Failed to fetch media. Error: ${e.message}`);
    });
  }
}
