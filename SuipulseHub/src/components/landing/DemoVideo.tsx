import React from "react";

export const DemoVideo = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Watch Our Demo</h2>
        <p className="text-gray-300">
          Real-time, secure data streaming on Sui—see SuiPulse in action.
        </p>
      </div>
      <div className="relative w-full p-[5px] rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-2xl">
        <div
          className="relative w-full bg-[#0A0A0A] rounded-2xl"
          style={{ paddingBottom: "56.25%" }}
        >
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-2xl"
            src="https://www.youtube.com/embed/lj1dAAL8NR4"
            title="Suipulse Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
