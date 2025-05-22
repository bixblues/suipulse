"use client";
import { motion } from "framer-motion";
import { Coffee, Github } from "lucide-react";
import Image from "next/image";

interface Project {
  title: string;
  description: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    github: string;
  };
  forks: number;
  demoUrl: string;
}

const projects: Project[] = [
  {
    title: "DeFi Price Oracle",
    description:
      "Real-time price feeds for DeFi applications using SuiPulse streams",
    image: "/projects/defi-oracle.png",
    author: {
      name: "Sarah Chen",
      avatar: "/avatars/sarah.png",
      github: "https://github.com/sarahchen",
    },
    forks: 342,
    demoUrl: "/demos/defi-oracle",
  },
  {
    title: "IoT Data Network",
    description: "Decentralized IoT sensor data streaming network built on Sui",
    image: "/projects/iot-network.png",
    author: {
      name: "Alex Rivera",
      avatar: "/avatars/alex.png",
      github: "https://github.com/arivera",
    },
    forks: 286,
    demoUrl: "/demos/iot-network",
  },
  {
    title: "Social Feed",
    description: "Web3 social platform with real-time data streams",
    image: "/projects/social-feed.png",
    author: {
      name: "Maya Patel",
      avatar: "/avatars/maya.png",
      github: "https://github.com/mayap",
    },
    forks: 193,
    demoUrl: "/demos/social-feed",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export function Community() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-t from-background to-background/20" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container relative z-10"
      >
        <div className="mx-auto max-w-[58rem] text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
            From the Community
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore what developers are building with SuiPulse
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-lg border bg-card/50 backdrop-blur transition-all hover:bg-card/80 hover:shadow-lg"
            >
              <a href={project.demoUrl} className="block">
                <div className="aspect-[4/3] overflow-hidden">
                  <div className="relative h-full w-full transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image
                        src={project.author.avatar}
                        alt={project.author.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-sm text-muted-foreground">
                        {project.author.name}
                      </span>
                    </div>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(project.author.github, "_blank");
                      }}
                      className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Github className="h-4 w-4" />
                      <span>{project.forks}</span>
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <motion.a
            href="/projects"
            variants={itemVariants}
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Browse All Projects <span aria-hidden="true">→</span>
          </motion.a>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative mx-auto mt-32"
        >
          <div className="mb-16">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex flex-wrap items-center gap-4">
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
