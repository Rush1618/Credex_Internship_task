// Footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 h-12 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} SpendLens · Built as a free tool by{' '}
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Credex
          </a>
        </p>
      </div>
    </footer>
  );
}
