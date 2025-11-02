import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const { user, userRole } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    sensor_id: "",
    flow_rate: "",
    pressure: "",
    conductivity: "",
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: readings = [] } = useQuery({
    queryKey: ["readings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("readings")
        .select("*, sensors(*, farms(name))")
        .order("timestamp", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const chartData = readings.slice(0, 7).reverse().map((r, i) => ({
    day: `Day ${i + 1}`,
    flow: Number(r.flow_rate),
  }));

  const addReadingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const status = Number(data.flow_rate) < 10 ? "⚠️ Low Flow" : "Normal";
      
      const { error: readingError } = await supabase.from("readings").insert({
        sensor_id: data.sensor_id,
        flow_rate: Number(data.flow_rate),
        pressure: Number(data.pressure),
        conductivity: Number(data.conductivity),
        status,
      });

      if (readingError) throw readingError;

      // Auto-create alert if flow is low
      if (Number(data.flow_rate) < 10) {
        const { data: sensor } = await supabase
          .from("sensors")
          .select("farm_id")
          .eq("id", data.sensor_id)
          .single();

        if (sensor) {
          await supabase.from("alerts").insert({
            farm_id: sensor.farm_id,
            type: "Low Flow",
            severity: "High",
            message: `Flow rate below threshold: ${data.flow_rate} L/min`,
            resolved: false,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readings"] });
      toast.success("Reading added successfully!");
      setOpen(false);
      setFormData({ sensor_id: "", flow_rate: "", pressure: "", conductivity: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.name} ({profile?.role})
          </p>
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Flow Rate Trend (Last 7 Readings)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="flow" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Readings Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Sensor Readings</CardTitle>
            {(userRole === "Farmer" || userRole === "Admin") && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>Add New Reading</Button>
                </DialogTrigger>
                <DialogContent className="bg-popover">
                  <DialogHeader>
                    <DialogTitle>Add Sensor Reading</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addReadingMutation.mutate(formData);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label>Sensor ID</Label>
                      <Select value={formData.sensor_id} onValueChange={(v) => setFormData({ ...formData, sensor_id: v })}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select sensor" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="S001">S001</SelectItem>
                          <SelectItem value="S002">S002</SelectItem>
                          <SelectItem value="S003">S003</SelectItem>
                          <SelectItem value="S004">S004</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Flow Rate (L/min)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.flow_rate}
                        onChange={(e) => setFormData({ ...formData, flow_rate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Pressure (bar)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.pressure}
                        onChange={(e) => setFormData({ ...formData, pressure: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Conductivity (mS/cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.conductivity}
                        onChange={(e) => setFormData({ ...formData, conductivity: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Submit</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Sensor ID</th>
                    <th className="text-left p-2">Farm</th>
                    <th className="text-left p-2">Flow Rate</th>
                    <th className="text-left p-2">Pressure</th>
                    <th className="text-left p-2">Conductivity</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((reading: any) => (
                    <tr key={reading.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{reading.sensor_id}</td>
                      <td className="p-2">{reading.sensors?.farms?.name}</td>
                      <td className="p-2">{reading.flow_rate} L/min</td>
                      <td className="p-2">{reading.pressure} bar</td>
                      <td className="p-2">{reading.conductivity} mS/cm</td>
                      <td className="p-2">{reading.status}</td>
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
