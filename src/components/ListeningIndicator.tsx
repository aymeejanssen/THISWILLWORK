
import React from "react";

// Brand colors—match your Tailwind config
const CLOUD_COLORS = [
  "from-[#A78AB0]", // wellness.purple
  "via-[#F5A89A]",  // wellness.pink
  "to-[#3B8C8A]",   // wellness.teal
];

interface ListeningIndicatorProps {
  isListening: boolean;
  size?: number; // px
}

const ListeningIndicator: React.FC<ListeningIndicatorProps> = ({
  isListening,
  size = 100,
}) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${isListening ? "animate-fade-in scale-100" : "opacity-40 scale-95"}
          transition-all duration-300
          ease-in-out
        `}
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Pulsating glowing layers */}
        <div
          className={`
            absolute
            inset-0
            flex
            items-center
            justify-center
            pointer-events-none
            z-0
            ${isListening ? "animate-pulse" : ""}
          `}
        >
          <div
            className="rounded-full blur-2xl opacity-30"
            style={{
              width: size * 1.5,
              height: size * 1.5,
              background: "radial-gradient(circle at 50% 50%, #A78AB0 40%, #F5A89A 70%, #3B8C8A 100%)",
              filter: isListening ? "blur(10px)" : "blur(14px)",
              transition: "all 0.3s",
            }}
          />
        </div>
        {/* Main cloud/circle */}
        <div
          className={`
            relative
            rounded-full
            bg-gradient-to-br
            ${CLOUD_COLORS.join(' ')}
            shadow-xl
            ${isListening ? "ring-4 ring-purple-300/60" : "ring-2 ring-gray-200/40"}
            border-0
            flex items-center justify-center
          `}
          style={{
            width: size,
            height: size,
            transition: "all 0.3s",
            boxShadow: isListening
              ? "0 0 30px 8px #A78AB0, 0 0 50px 14px #F5A89A, 0 0 70px 22px #3B8C8A"
              : "0 0 7px 1px #A78AB0",
          }}
        >
          <span
            className={`
              text-white font-semibold
              text-xl select-none pointer-events-none
              opacity-80
              ${isListening ? "animate-fade-in" : "opacity-50"}
            `}
            style={{
              textShadow: "0 2px 10px #fff6,0 -2px 8px #A78AB0AA",
            }}
          >
            {isListening ? "Listening..." : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListeningIndicator;
