"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Installation } from "./Installation";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent" />

      <div className="container relative z-10">
        <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 items-center gap-8 pb-20 pt-24 lg:grid-cols-2 lg:gap-12">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Real-time Data{" "}
              <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                Streams on Sui
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Build powerful decentralized applications with SuiPulse's
              real-time data streaming protocol.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/docs/quickstart"
                className="inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.a>
              <a
                href="/docs"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Documentation <span aria-hidden="true">→</span>
              </a>
            </div>
          </motion.div>

          {/* Installation Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <Installation />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
