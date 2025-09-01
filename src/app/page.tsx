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

      <footer className="">
        <div className="text-center mx-auto px-4 py-6 text-gray-600">
          <Link href="/api-docs" className="text-sm transition-colors">
            Embed a Share to ECP button on your website
          </Link>
        </div>
      </footer>
    </div>
  );
}
