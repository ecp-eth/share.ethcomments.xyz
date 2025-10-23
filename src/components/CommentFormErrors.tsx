import { InvalidCommentError } from "@/lib/errors";

interface CommentFormErrorsProps {
  error: Error;
}

interface FieldErrors {
  [field: string]: string[];
}

export function CommentFormErrors({ error }: CommentFormErrorsProps) {
  if (!(error instanceof InvalidCommentError)) {
    return (
      <div className="text-sm text-destructive">
        <p>An error occurred: {error.message}</p>
      </div>
    );
  }

  const fieldErrors =
    (error as InvalidCommentError & { fieldErrors?: FieldErrors })
      .fieldErrors || {};

  return (
    <div className="text-sm text-destructive space-y-1">
      {Object.entries(fieldErrors).map(
        ([field, errors]: [string, string[]]) => (
          <div key={field}>
            <p className="font-medium">{field}:</p>
            <ul className="list-disc list-inside ml-2">
              {Array.isArray(errors) &&
                errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
}
