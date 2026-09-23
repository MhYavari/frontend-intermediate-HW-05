export function creatEmitter() {
  const listeners = {};

  return {
    on(event, handler) {
      (listeners[event] ??= []).push(handler);

      return function unsubscribe() {
        listeners[event] = listeners[event].filter((h) => h !== handler);
      };
    },

    emit(event, payload) {
      (listeners[event] ?? []).forEach((handler) => handler(payload));
    },
  };
}
