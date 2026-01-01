// Global error handler for uncaught errors
window.addEventListener("error", (event) => {
  if (event.message && event.message.includes("setNotificationCallback")) {
    console.warn("🚨 Caught notification callback error:", event);
    console.warn(
      "This usually means an external library is trying to call a callback that doesn't exist"
    );
    // Prevent the error from crashing the app
    event.preventDefault();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason &&
    event.reason.toString &&
    event.reason.toString().includes("setNotificationCallback")
  ) {
    console.warn(
      "🚨 Caught unhandled notification callback promise rejection:",
      event.reason
    );
    event.preventDefault();
  }
});

const ErrorHandler = {};

export default ErrorHandler;
