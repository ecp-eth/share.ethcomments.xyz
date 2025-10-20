import { ReactNode } from "react";

export class CommentFormSubmitError extends Error {
  constructor(private error: ReactNode) {
    super();
  }

  render() {
    return this.error;
  }
}

export class InvalidCommentError extends CommentFormSubmitError {
  constructor(errors: Record<string, string[]>) {
    const errorMessages = Object.entries(errors).map(function ([
      field,
      messages,
    ]) {
      return (
        <span className="inline-flex gap-1" key={field}>
          <strong>{field}: </strong>
          {messages.map((message) => (
            <span key={message}>{message}</span>
          ))}
        </span>
      );
    });

    super(errorMessages);
  }
}
