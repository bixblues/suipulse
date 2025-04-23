"use client";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function Installation() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("npm install @suipulse/sdk");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border bg-card/50 p-6 backdrop-blur lg:p-8"
    >
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Get Started</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Install the SuiPulse SDK and start building
          </p>
        </div>

        <div className="relative">
          <pre className="overflow-x-auto rounded-md border bg-muted p-4">
            <code className="text-sm text-muted-foreground">
              $ npm install @suipulse/sdk
            </code>
          </pre>
          <button
            onClick={copyToClipboard}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-3">
            <h3 className="text-sm font-medium">Quick Setup</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Simple installation with minimal configuration
            </p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <h3 className="text-sm font-medium">Comprehensive SDK</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Complete toolkit for data stream management
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
