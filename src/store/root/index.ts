// src/store/root.ts
import { makeAutoObservable } from 'mobx';
import { AuthStore } from '../slices/auth';
import { AthleteStore } from '../slices/athlete';
import { ScoutStore } from '../slices/scout';
import { ChatStore } from '../slices/chat';
import { NotificationStore } from '../slices/notifications';
import { EventsStore } from '../slices/event';

export class RootStore {
  auth: AuthStore;
  events: EventsStore;
  athlete: AthleteStore;
  scout: ScoutStore;
  chat: ChatStore;
  notifications: NotificationStore;

  constructor() {
    makeAutoObservable(this);
    
    this.auth = new AuthStore(this);
    this.events = new EventsStore(this);
    this.athlete = new AthleteStore(this);
    this.scout = new ScoutStore(this);
    this.chat = new ChatStore(this);
    this.notifications = new NotificationStore(this);
  }
}

export const store = new RootStore();