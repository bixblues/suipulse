"use client";
import { motion } from "framer-motion";
import { Coffee, Github, Hourglass } from "lucide-react";

export function Community() {
  return (
    <section className="relative overflow-hidden py-24 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="absolute inset-0 bg-gradient-to-t from-background to-background/20" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container relative z-10 flex flex-col items-center justify-center"
      >
        <div className="mx-auto max-w-[58rem] text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
            From the Community
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore what developers are building with SuiPulse
          </p>
        </div>

        {/* Enhanced Coming Soon UI */}
        <div className="flex flex-col items-center justify-center w-full mt-12 mb-12 px-2">
          <div className="relative flex flex-col items-center w-full max-w-sm sm:max-w-xl mx-auto">
            {/* Animated Glow Background */}
            <motion.div
              className="absolute top-[-40px] left-1/2 -translate-x-1/2 z-0"
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 blur-3xl opacity-60" />
            </motion.div>
            {/* Glassmorphism Card */}
            <div className="relative z-10 w-full rounded-2xl bg-white/10 backdrop-blur-lg border border-purple-400/40 shadow-xl p-6 sm:p-10 flex flex-col items-center text-center">
              {/* Animated Icon */}
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="mb-6 flex justify-center"
              >
                <Hourglass className="w-16 h-16 text-purple-400 drop-shadow-lg" />
              </motion.div>
              {/* Animated Gradient Text */}
              <h3 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-move">
                Coming Soon!
              </h3>
              <p className="text-xs text-gray-200 max-w-xs sm:max-w-xl text-center">
                We're working with the community to showcase amazing projects
                built on SuiPulse.
                <br />
                Stay tuned for inspiring use-cases and real-world applications!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center w-full flex justify-center">
          <motion.a
            href="https://github.com/bixblues/suipulse/blob/main/cli/usage.md"
            target="_blank"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            whileHover={{ scale: 1.05 }}
          >
            Usage Examples <span aria-hidden="true">→</span>
          </motion.a>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mx-auto mt-24"
        >
          <div className="mb-16">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-4 md:flex-row flex-col">
              <motion.a
                href="https://github.com/bixblues/suipulse"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-medium text-foreground shadow-md transition-all hover:bg-card/80 hover:shadow-lg"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
                Contribute on GitHub
              </motion.a>
              <motion.a
                href="https://www.buymeacoffee.com/suipulse"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-[#FFDD00] px-6 py-3 text-sm font-medium text-[#000000] shadow-md transition-all hover:bg-[#FFDD00]/90 hover:shadow-lg"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <Coffee className="h-5 w-5 transition-transform group-hover:scale-110" />
                Buy me a coffee
              </motion.a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
