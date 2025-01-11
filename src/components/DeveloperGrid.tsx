import { DeveloperCard } from "./DeveloperCard";

const SAMPLE_DEVELOPERS = [
  {
    name: "Sarah Chen",
    title: "Full Stack Developer",
    rate: 150,
    rating: 4.9,
    skills: ["React", "Node.js", "TypeScript"],
    available: true,
    imageUrl: "https://i.pravatar.cc/150?img=1",
  },
  {
    name: "Michael Rodriguez",
    title: "Backend Architect",
    rate: 200,
    rating: 4.8,
    skills: ["Python", "AWS", "Microservices"],
    available: false,
    imageUrl: "https://i.pravatar.cc/150?img=2",
  },
  {
    name: "Emma Wilson",
    title: "Frontend Specialist",
    rate: 125,
    rating: 4.7,
    skills: ["React", "Vue", "UI/UX"],
    available: true,
    imageUrl: "https://i.pravatar.cc/150?img=3",
  },
  {
    name: "James Lee",
    title: "DevOps Engineer",
    rate: 175,
    rating: 4.9,
    skills: ["Docker", "Kubernetes", "CI/CD"],
    available: true,
    imageUrl: "https://i.pravatar.cc/150?img=4",
  },
];

export const DeveloperGrid = () => {
  return (
    <div className="container py-12">
      <h2 className="mb-8 text-center text-3xl font-bold">Featured Developers</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {SAMPLE_DEVELOPERS.map((dev) => (
          <DeveloperCard key={dev.name} {...dev} />
        ))}
      </div>
    </div>
  );
};