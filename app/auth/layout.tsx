import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Tree Collection - Authentication",
  description: "Sign in to manage your family tree collection",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <div className="flex min-h-screen bg-background">
          {/* Left side - Auth form */}
          <div className="flex flex-col flex-1 lg:w-1/2 w-full items-center justify-center">
            {children}
          </div>
          
          {/* Right side - Image */}
          <div className="hidden lg:block lg:w-1/2 bg-muted">
            <div className="flex items-center justify-center h-full">
              <div className="max-w-md text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Welcome to Family Tree Collection
                </h2>
                <p className="text-muted-foreground">
                  Manage your family tree with ease. Keep track of your family members, their relationships, and important events.
                </p>
              </div>
            </div>
          </div>
        </div>
  );
} 