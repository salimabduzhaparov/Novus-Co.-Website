import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Solution } from "@/components/Solution";
import { Process } from "@/components/Process";
import { Industries } from "@/components/Industries";
import { CompetitiveEdge } from "@/components/CompetitiveEdge";
import { FinalCTA } from "@/components/FinalCTA";
import {
  DepthFade,
  SequenceReveal,
  WipeReveal,
  SoftBloom,
  ConvergeBuild,
} from "@/components/ui/SectionTransitions";

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <DepthFade />
      <Solution />
      <SequenceReveal />
      <Process />
      <WipeReveal />
      <Industries />
      <SoftBloom />
      <CompetitiveEdge />
      <ConvergeBuild />
      <FinalCTA />
    </>
  );
}
