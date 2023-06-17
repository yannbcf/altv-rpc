import type { Callback } from "./types.ts";

type Event = { cb: Callback; once: boolean };

export class EventsCluter {
    private _events = new Map<string, Set<Event>>();

    constructor() {
        this.on = this.on.bind(this);
        this.once = this.once.bind(this);
        this.off = this.off.bind(this);
        this.emit = this.emit.bind(this);
    }

    inspect(): void {
        console.log(this._events);
    }

    on(eventName: string, callback: Callback): void {
        const eventSet = this._events.get(eventName) ?? new Set();
        this._events.set(eventName, eventSet.add({ cb: callback, once: false }));
    }

    once(eventName: string, callback: Callback): void {
        const eventSet = this._events.get(eventName) ?? new Set();
        this._events.set(eventName, eventSet.add({ cb: callback, once: true }));
    }

    off(eventName: string, callback: Callback): void {
        const eventSet = this._events.get(eventName);
        if (!eventSet) return;

        for (const event of eventSet) {
            if (event.cb !== callback) continue;
            if (eventSet.size > 1) {
                eventSet.delete(event);
                return;
            }

            this._events.delete(eventName);
            eventSet.clear();
            return;
        }
    }

    emit(eventName: string, args: unknown): void {
        this._events.get(eventName)?.forEach((event) => {
            if (event.once) {
                this.off(eventName, event.cb);
            }

            event.cb(args);
        });
    }
}
