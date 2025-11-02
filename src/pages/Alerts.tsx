import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Alerts() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();
  const [severityFilter, setSeverityFilter] = useState<string>("All");

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts", severityFilter],
    queryFn: async () => {
      let query = supabase
        .from("alerts")
        .select("*, farms(name)")
        .order("created_at", { ascending: false });

      if (severityFilter !== "All") {
        query = query.eq("severity", severityFilter as "Low" | "Medium" | "High");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("alerts")
        .update({ resolved: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alert marked as resolved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "destructive";
      case "Medium":
        return "warning";
      case "Low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const canResolve = userRole === "Officer" || userRole === "Admin";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Alerts Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage system alerts
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Alerts</CardTitle>
            <div className="w-48">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="All">All Severity</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Farm</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Severity</th>
                    <th className="text-left p-2">Message</th>
                    <th className="text-left p-2">Status</th>
                    {canResolve && <th className="text-left p-2">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert: any) => (
                    <tr key={alert.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{alert.id}</td>
                      <td className="p-2">{alert.farms?.name}</td>
                      <td className="p-2">{alert.type}</td>
                      <td className="p-2">
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity}
                        </Badge>
                      </td>
                      <td className="p-2 max-w-xs truncate">{alert.message}</td>
                      <td className="p-2">
                        <Badge variant={alert.resolved ? "secondary" : "destructive"}>
                          {alert.resolved ? "Resolved" : "Active"}
                        </Badge>
                      </td>
                      {canResolve && (
                        <td className="p-2">
                          {!alert.resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveAlertMutation.mutate(alert.id)}
                            >
                              Mark Resolved
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
