import { Hero } from "@/components/landing/Hero";
import { DemoVideo } from "@/components/landing/DemoVideo";
import { Community } from "@/components/landing/Community";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <div className="container relative z-10">
        <DemoVideo />
      </div>
      <div className="container relative z-10">
        <Community />
      </div>
    </main>
  );
}
