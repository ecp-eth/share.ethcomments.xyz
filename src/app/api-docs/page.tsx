import Link from "next/link";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="text-blue-600 hover:underline mb-4 inline-block"
            >
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Query Parameters API
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Prefill the comment form using URL query parameters
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Parameters
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    targetUri
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Target URL for the comment
                  </p>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    ?targetUri=https://example.com
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    channelId
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Channel ID to select
                  </p>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    ?channelId=123
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    content
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Comment content/text
                  </p>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    ?content=Great%20article!
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    metadata
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Comma-separated format: key:value:type
                  </p>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    ?metadata=category:review:string,rating:5:uint256
                  </code>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Types: string, uint256, int256, address, bool, bytes,
                    bytes32
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Examples
              </h2>

              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    Simple Comment
                  </h3>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all">
                    ?targetUri=https://example.com&content=Great%20article!
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    With Metadata
                  </h3>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all">
                    ?targetUri=https://example.com&metadata=category:review:string,rating:5:uint256
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    Complete Example
                  </h3>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all">
                    ?targetUri=https://example.com&channelId=123&content=Amazing%20content&metadata=category:review:string
                  </code>
                </div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                JavaScript
              </h2>

              <pre className="bg-gray-100 dark:bg-gray-700 rounded p-3 overflow-x-auto text-sm">
                <code className="text-gray-800 dark:text-gray-200">
                  {`const params = new URLSearchParams({
  targetUri: "https://example.com",
  content: "Great article!",
  metadata: "category:review:string,rating:5:uint256",
});

const url = \`https://share.ethcomments.xyz/?\${params.toString()}\`;`}
                </code>
              </pre>
            </section>

            <section>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Build Query Params
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Open the form in development mode to build and copy share
                    URLs
                  </p>
                </div>
                <Link
                  href="/?__dev=true"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Build Params
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
