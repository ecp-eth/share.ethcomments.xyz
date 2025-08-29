import { SimpleCommentForm } from "@/components/simple-comment-form";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <SimpleCommentForm />
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <a
                href="https://ethcomments.xyz"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/logo-light.svg"
                  alt="ECP Logo"
                  className="inline-block h-6 align-middle mr-2"
                />
              </a>
            </div>
            <div className="flex space-x-4">
              <Link href="/api-docs" className="text-sm transition-colors">
                Embed a Share to ECP button on your website
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
