import * as TelegramBot from 'node-telegram-bot-api';
import {Manage} from '../../manage';

const EMPTY: string[] = [];
const EMPTY_REGEXP: RegExpExecArray = EMPTY as RegExpExecArray;

export abstract class Command {

  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly pattern: string;
  public authRequired = true;

  constructor(protected readonly bot: TelegramBot,
              protected readonly manage: Manage) {
    this.addHandler();
  }

  public abstract handle(msg: TelegramBot.Message, match: RegExpExecArray): void;

  private addHandler() {
    const regExp = new RegExp(this.pattern, `i`);
    const handle = this.handle.bind(this);
    const commandHandle = this.authRequired ? this.manage.auth(handle) : handle;
    this.bot.onText(regExp, (msg, match) => commandHandle(msg, match || EMPTY_REGEXP));
  }
}