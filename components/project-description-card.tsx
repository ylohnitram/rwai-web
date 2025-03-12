import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectDescriptionCardProps {
  description: string;
}

export default function ProjectDescriptionCard({ description }: ProjectDescriptionCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-300 break-words whitespace-pre-wrap max-w-full">
          {description}
        </div>
      </CardContent>
    </Card>
  );
}
