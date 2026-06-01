export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
          <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground">You&apos;ve been unsubscribed</h1>
        <p className="text-sm text-muted-foreground">
          You won&apos;t receive any more emails from this campaign. This may take up to 24 hours to take effect.
        </p>
      </div>
    </div>
  );
}
