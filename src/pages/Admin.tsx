import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Admin() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  if (userRole !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: farms = [] } = useQuery({
    queryKey: ["admin-farms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("farms").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["admin-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alerts").select("*, farms(name)");
      if (error) throw error;
      return data;
    },
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reports").select("*, profiles(name)");
      if (error) throw error;
      return data;
    },
  });

  const deleteFarmMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("farms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-farms"] });
      toast.success("Farm deleted successfully");
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("alerts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-alerts"] });
      toast.success("Alert deleted successfully");
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, farms, alerts, and reports
          </p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="farms">Farms</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Role</th>
                        <th className="text-left p-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((profile: any) => (
                        <tr key={profile.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{profile.name}</td>
                          <td className="p-2">{profile.email}</td>
                          <td className="p-2">{profile.role}</td>
                          <td className="p-2">{new Date(profile.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="farms">
            <Card>
              <CardHeader>
                <CardTitle>All Farms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Location</th>
                        <th className="text-left p-2">Crop</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farms.map((farm: any) => (
                        <tr key={farm.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{farm.name}</td>
                          <td className="p-2">{farm.location}</td>
                          <td className="p-2">{farm.crop_type}</td>
                          <td className="p-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteFarmMutation.mutate(farm.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>All Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Farm</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Severity</th>
                        <th className="text-left p-2">Message</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((alert: any) => (
                        <tr key={alert.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{alert.farms?.name}</td>
                          <td className="p-2">{alert.type}</td>
                          <td className="p-2">{alert.severity}</td>
                          <td className="p-2 max-w-xs truncate">{alert.message}</td>
                          <td className="p-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteAlertMutation.mutate(alert.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>All Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Title</th>
                        <th className="text-left p-2">Submitted By</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report: any) => (
                        <tr key={report.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{report.title}</td>
                          <td className="p-2">{report.profiles?.name}</td>
                          <td className="p-2">{new Date(report.submitted_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
