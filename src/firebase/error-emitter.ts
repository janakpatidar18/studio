import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

// This is a simple event emitter that will be used to notify the UI
// when a Firestore permission error occurs.
// This is a client-side only module.

type ErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

class ErrorEventEmitter extends EventEmitter {
  constructor() {
    super();
  }

  emit<E extends keyof ErrorEvents>(event: E, ...args: Parameters<ErrorEvents[E]>) {
    return super.emit(event, ...args);
  }

  on<E extends keyof ErrorEvents>(event: E, listener: ErrorEvents[E]) {
    return super.on(event, listener);
  }

  off<E extends keyof ErrorEvents>(event: E, listener: ErrorEvents[E]) {
    return super.off(event, listener);
  }
}

export const errorEmitter = new ErrorEventEmitter();
