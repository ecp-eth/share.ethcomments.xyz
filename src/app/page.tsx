import { SimpleCommentForm } from "@/components/simple-comment-form";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <SimpleCommentForm />
        </div>
      </div>
    </div>
  );
}
