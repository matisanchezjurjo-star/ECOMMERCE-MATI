import { Video } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export default function CreativeStudioPage() {
  return (
    <ComingSoon
      icon={Video}
      title="Creative Studio"
      phase="Phase 4"
      description="A dedicated workspace for generating TikTok/Reels/UGC video scripts and engine-specific prompts (Sora, Veo, Runway, Kling, Pika, CapCut) across multiple durations."
      plannedFeatures={[
        "Script generation for 15s / 30s / 45s / 60s formats",
        "Scene-by-scene hook, voiceover, on-screen text, and shot direction",
        "Engine-adapted video generation prompts, not one generic prompt",
        "Creative testing matrix builder (angles × hooks × formats)",
      ]}
    />
  );
}
