export type ProcessStep = {
  title: string;
  description: string;
  takeaway: string;
};

// The original Novus project sequence, restored with practical stage outcomes.
export const novusProcessSteps: readonly ProcessStep[] = [
  {
    title: "Discover",
    description:
      "We learn about your business, services, customers, and local competitors. A short conversation helps us understand what makes your work different and what your website needs to do.",
    takeaway: "A clear understanding of your business and goals.",
  },
  {
    title: "Design the Preview",
    description:
      "We create a website direction around your brand and services. You can see how the pages, content, and contact points could come together before we move into the full build.",
    takeaway: "A tangible preview of your website’s direction.",
  },
  {
    title: "Review Together",
    description:
      "We walk through the preview, explain the thinking, and hear your feedback. We refine the direction together and agree on the project scope and next steps before building.",
    takeaway: "A shared direction, with the important details agreed.",
  },
  {
    title: "Build",
    description:
      "We develop the pages, adapt them for mobile, and connect the agreed contact tools. Calls, forms, and booking flows are checked so customers have a clear way to reach you.",
    takeaway: "A working website ready for your final review.",
  },
  {
    title: "Launch",
    description:
      "With your approval, we publish the website and check the live experience. We go through access, hosting, and handover so you understand how the site will be managed.",
    takeaway: "Your website live, with a clear handover.",
  },
  {
    title: "Optional Improvements",
    description:
      "As your business changes, your website can change with it. New services, project pages, and other improvements can be discussed and scoped when you need them.",
    takeaway: "Room to grow, with any further work agreed separately.",
  },
];
