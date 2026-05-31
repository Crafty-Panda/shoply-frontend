import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center bg-background px-8 text-center">
      <h1 className="text-lg font-bold text-logo">shoply</h1>
      <p className="mt-6 text-2xl font-bold text-foreground">404</p>
      <p className="mt-2 text-sm text-muted-foreground">Page not found</p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Back to browse
      </Link>
    </main>
  );
};

export default NotFound;
