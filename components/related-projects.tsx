import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Project } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RelatedProjectsProps {
  projects: Project[];
  assetType: string;
}

export default function RelatedProjects({ projects, assetType }: RelatedProjectsProps) {
  // Generate slug from project name
  function generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Similar {assetType} Projects</h2>
        <Button asChild variant="link" size="sm" className="text-amber-500">
          <Link href={`/directory?assetType=${encodeURIComponent(assetType)}`}>
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link 
            key={project.id} 
            href={`/projects/${generateSlug(project.name)}`}
            className="block"
          >
            <Card className="bg-gray-900 border-gray-800 h-full hover:border-amber-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base truncate">{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{project.blockchain}</Badge>
                  <span className="text-green-500 font-bold">{project.roi}%</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
