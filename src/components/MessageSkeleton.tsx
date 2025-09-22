import React from "react";

type Role = "user" | "assistant" | "both";

export default function MessageSkeleton({
  count = 3,
  role = "both",
}: {
  count?: number;
  role?: Role;
}) {
  const items = Array.from({ length: count });

  return (
    <div className="space-y-4 p-2">
      {items.map((_, i) => {
        const isUser =
          role === "user" ? true : role === "assistant" ? false : i % 2 === 0;

        return (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            {/* Avatar (always on left) */}
            <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse flex-shrink-0" />

            {/* Message bubble */}
            <div
              className={`max-w-[70%] flex flex-col ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`${
                  isUser ? "ml-auto" : ""
                }`}
              >
                <div className="h-3 w-40 rounded bg-gray-700 mb-2" />
                <div className="h-3 w-28 rounded bg-gray-700" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
