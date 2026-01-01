import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error);
    console.error("Error info:", errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Check if this is a notification callback error
    if (error.toString().includes("setNotificationCallback")) {
      console.warn(
        "⚠️ Notification callback error detected. This might be from an external service."
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              ❌ Có lỗi xảy ra
            </h2>
            <p className="text-gray-700 mb-4">
              Ứng dụng gặp lỗi. Vui lòng tải lại trang.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-red-100 p-4 rounded mb-4 text-sm font-mono overflow-auto max-h-40">
                <p className="text-red-700 font-bold">Chi tiết lỗi:</p>
                <p className="text-red-600">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <p className="text-red-600 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
