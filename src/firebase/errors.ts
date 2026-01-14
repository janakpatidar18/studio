// Defines a custom error class for Firestore permission errors.
// This is used to provide more context to the user when a request is denied.
// For example, you can include the path and the operation that was denied.

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

// A custom error class that includes the security rule context.
// This is useful for debugging permission errors.
export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: Cannot ${context.operation} at ${context.path}.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is to make the error message more readable in the console.
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }

  toString() {
    return `${this.message}\n${JSON.stringify(
      { context: this.context },
      null,
      2
    )}`;
  }
}
