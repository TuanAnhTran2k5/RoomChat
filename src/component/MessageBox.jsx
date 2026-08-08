import React from "react";
import { cn } from "../utils/cn";

export function MessageBox({ message, sentByCurrentUser, name, time, avatar }) {
  const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${name || "Anonymous"}`;

  return (
    <div
      className={cn(
        "w-full flex gap-3 mb-4 items-end",
        sentByCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <img
        src={avatar || defaultAvatar}
        alt={name}
        className="w-8 h-8 rounded-full border border-white/10 bg-zinc-800 object-cover"
      />

      {/* Message Bubble Container */}
      <div className={cn("flex flex-col max-w-[70%]", sentByCurrentUser ? "items-end" : "items-start")}>
        {/* Sender Name */}
        <span className="text-xs text-white/40 mb-1 px-1">{name}</span>

        {/* Bubble */}
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm break-words shadow-md leading-relaxed",
            sentByCurrentUser
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-none shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
              : "bg-[#1e2230] text-white/90 rounded-bl-none border border-white/5 shadow-sm"
          )}
        >
          <p>{message}</p>
        </div>

        {/* Time */}
        <span className="text-[10px] text-white/30 mt-1 px-1">{time}</span>
      </div>
    </div>
  );
}

export default MessageBox;
