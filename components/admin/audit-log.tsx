import { Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AuditLogEntry {
  id: string;
  timestamp: string;
  projectId: string;
  projectName: string;
  action: string;
  notes?: string;
}

interface AuditLogProps {
  logEntries: AuditLogEntry[];
}

export function AuditLog({ logEntries }: AuditLogProps) {
  // Format date for display
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString();
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>History of admin actions on projects</CardDescription>
      </CardHeader>
      <CardContent>
        {logEntries.length > 0 ? (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {logEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className={`p-4 rounded-md border ${
                    entry.action === "approved" 
                      ? "bg-green-900/20 border-green-700" 
                      : entry.action === "rejected"
                      ? "bg-red-900/20 border-red-700"
                      : "bg-amber-900/20 border-amber-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-lg font-medium">
                      {entry.projectName}
                    </div>
                    <Badge 
                      className={
                        entry.action === "approved" 
                          ? "bg-green-600" 
                          : entry.action === "rejected"
                          ? "bg-red-600"
                          : "bg-amber-600"
                      }
                    >
                      {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-400 mb-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(entry.timestamp)}
                  </div>
                  {entry.notes && (
                    <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700 text-gray-300">
                      <p className="text-sm font-medium mb-1">Feedback Notes:</p>
                      <p className="text-sm">{entry.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-gray-400">No admin actions recorded yet</div>
        )}
      </CardContent>
    </Card>
  )
}
