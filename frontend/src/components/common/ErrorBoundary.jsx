// frontend/src/components/common/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         hasError: false,
         error: null,
         errorInfo: null
      };
   }

   static getDerivedStateFromError(error) {
      return { hasError: true, error };
   }

   componentDidCatch(error, errorInfo) {
      console.error('Error Boundary caught an error:', error, errorInfo);
      this.setState({
         error,
         errorInfo
      });
   }

   handleReset = () => {
      this.setState({
         hasError: false,
         error: null,
         errorInfo: null
      });
   };

   render() {
      if (this.state.hasError) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
               <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
                  {/* Error Icon */}
                  <div className="text-center mb-6">
                     <div className="inline-block p-4 bg-red-100 rounded-full">
                        <svg
                           className="w-16 h-16 text-red-600"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                           />
                        </svg>
                     </div>
                  </div>

                  {/* Error Message */}
                  <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
                     Oops! Something went wrong
                  </h2>

                  <p className="text-gray-600 mb-6 text-center">
                     {this.state.error?.message || 'An unexpected error occurred'}
                  </p>

                  {/* Error Details (Development) */}
                  {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                     <details className="mb-6 bg-gray-100 p-4 rounded overflow-auto max-h-64">
                        <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                           Error Details
                        </summary>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                           {this.state.error?.stack}
                           {'\n\n'}
                           {this.state.errorInfo.componentStack}
                        </pre>
                     </details>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                     <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                     >
                        Reload Page
                     </button>

                     <button
                        onClick={() => window.location.href = '/'}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
                     >
                        Go to Home
                     </button>

                     {this.props.onReset && (
                        <button
                           onClick={() => {
                              this.handleReset();
                              this.props.onReset();
                           }}
                           className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                        >
                           Try Again
                        </button>
                     )}
                  </div>

                  {/* Help Text */}
                  <p className="text-sm text-gray-500 text-center mt-6">
                     If this problem persists, please contact support or check the console for more details.
                  </p>
               </div>
            </div>
         );
      }

      return this.props.children;
   }
}

export default ErrorBoundary;