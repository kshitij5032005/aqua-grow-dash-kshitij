import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function Analytics() {
  const { data: readings = [] } = useQuery({
    queryKey: ["analytics-readings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("readings")
        .select("*, sensors(*, farms(name))")
        .order("timestamp", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Prepare data for flow rate trend (last 7 days)
  const flowRateData = readings.slice(0, 7).reverse().map((r, i) => ({
    day: `Day ${i + 1}`,
    flow: Number(r.flow_rate),
  }));

  // Prepare data for average pressure by farm
  const farmData = readings.reduce((acc: any, r: any) => {
    const farmName = r.sensors?.farms?.name || "Unknown";
    if (!acc[farmName]) {
      acc[farmName] = { farm: farmName, pressure: 0, count: 0 };
    }
    acc[farmName].pressure += Number(r.pressure);
    acc[farmName].count += 1;
    return acc;
  }, {});

  const pressureByFarm = Object.values(farmData).map((f: any) => ({
    farm: f.farm,
    avgPressure: (f.pressure / f.count).toFixed(2),
  }));

  const exportToCSV = () => {
    const headers = ["Sensor ID", "Farm", "Flow Rate", "Pressure", "Conductivity", "Status", "Timestamp"];
    const rows = readings.map((r: any) => [
      r.sensor_id,
      r.sensors?.farms?.name,
      r.flow_rate,
      r.pressure,
      r.conductivity,
      r.status,
      new Date(r.timestamp).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor-readings-${new Date().toISOString()}.csv`;
    a.click();
    toast.success("CSV exported successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive data visualization and insights
            </p>
          </div>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid gap-8">
          {/* Flow Rate Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Flow Rate Trend (Last 7 Readings)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={flowRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="flow" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Flow Rate (L/min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Average Pressure by Farm */}
          <Card>
            <CardHeader>
              <CardTitle>Average Pressure by Farm</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pressureByFarm}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="farm" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="avgPressure" 
                    fill="hsl(var(--secondary))" 
                    name="Avg Pressure (bar)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Readings</p>
                  <p className="text-2xl font-bold">{readings.length}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Avg Flow Rate</p>
                  <p className="text-2xl font-bold">
                    {(readings.reduce((sum: number, r: any) => sum + Number(r.flow_rate), 0) / readings.length || 0).toFixed(2)} L/min
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Avg Pressure</p>
                  <p className="text-2xl font-bold">
                    {(readings.reduce((sum: number, r: any) => sum + Number(r.pressure), 0) / readings.length || 0).toFixed(2)} bar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
