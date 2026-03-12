import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Gathering Place",
  description:
    "A private membership club for creative professionals. A place for creatives who are done performing.",
};

export default function GatheringPlaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ backgroundColor: "#0c0a08", colorScheme: "dark" }}
      className="min-h-screen"
    >
      {children}
    </div>
  );
}
