import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Forms() {
  const [sensorReading, setSensorReading] = useState({ sensor_id: "", flow_rate: "", pressure: "", conductivity: "" });
  const [farm, setFarm] = useState({ name: "", location: "", crop_type: "" });
  const [clogging, setClogging] = useState({ farm_id: "", description: "", severity: "Medium" });
  const [schedule, setSchedule] = useState({ farm_id: "", start_time: "", duration: "", fertilizer_amount: "" });
  const [report, setReport] = useState({ title: "", description: "" });

  const handleSensorReading = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("readings").insert({
      sensor_id: sensorReading.sensor_id,
      flow_rate: Number(sensorReading.flow_rate),
      pressure: Number(sensorReading.pressure),
      conductivity: Number(sensorReading.conductivity),
      status: Number(sensorReading.flow_rate) < 10 ? "⚠️ Low Flow" : "Normal",
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Sensor reading added!");
      setSensorReading({ sensor_id: "", flow_rate: "", pressure: "", conductivity: "" });
    }
  };

  const handleFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("farms").insert(farm);
    if (error) toast.error(error.message);
    else {
      toast.success("Farm added!");
      setFarm({ name: "", location: "", crop_type: "" });
    }
  };

  const handleClogging = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("alerts").insert({
      farm_id: Number(clogging.farm_id),
      type: "Clogging",
      severity: clogging.severity as any,
      message: clogging.description,
      resolved: false,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Clogging report submitted!");
      setClogging({ farm_id: "", description: "", severity: "Medium" });
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("schedules").insert({
      farm_id: Number(schedule.farm_id),
      start_time: schedule.start_time,
      duration: Number(schedule.duration),
      fertilizer_amount: Number(schedule.fertilizer_amount),
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Schedule added!");
      setSchedule({ farm_id: "", start_time: "", duration: "", fertilizer_amount: "" });
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.from("reports").insert({
      user_id: user.id,
      title: report.title,
      description: report.description,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Research report submitted!");
      setReport({ title: "", description: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Forms</h1>
          <p className="text-muted-foreground">
            Submit data and manage farm operations
          </p>
        </div>

        <Tabs defaultValue="reading" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="reading">Sensor Reading</TabsTrigger>
            <TabsTrigger value="farm">Add Farm</TabsTrigger>
            <TabsTrigger value="clogging">Report Clogging</TabsTrigger>
            <TabsTrigger value="schedule">Add Schedule</TabsTrigger>
            <TabsTrigger value="report">Research Report</TabsTrigger>
          </TabsList>

          <TabsContent value="reading">
            <Card>
              <CardHeader>
                <CardTitle>Add Sensor Reading</CardTitle>
                <CardDescription>Record new sensor measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSensorReading} className="space-y-4">
                  <div>
                    <Label>Sensor ID</Label>
                    <Select value={sensorReading.sensor_id} onValueChange={(v) => setSensorReading({ ...sensorReading, sensor_id: v })}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select sensor" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {["S001", "S002", "S003", "S004", "S005", "S006", "S007", "S008"].map(id => (
                          <SelectItem key={id} value={id}>{id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Flow Rate (L/min)</Label>
                    <Input type="number" step="0.1" value={sensorReading.flow_rate} onChange={(e) => setSensorReading({ ...sensorReading, flow_rate: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Pressure (bar)</Label>
                    <Input type="number" step="0.1" value={sensorReading.pressure} onChange={(e) => setSensorReading({ ...sensorReading, pressure: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Conductivity (mS/cm)</Label>
                    <Input type="number" step="0.1" value={sensorReading.conductivity} onChange={(e) => setSensorReading({ ...sensorReading, conductivity: e.target.value })} required />
                  </div>
                  <Button type="submit">Submit Reading</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="farm">
            <Card>
              <CardHeader>
                <CardTitle>Add New Farm</CardTitle>
                <CardDescription>Register a new farm in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFarm} className="space-y-4">
                  <div>
                    <Label>Farm Name</Label>
                    <Input value={farm.name} onChange={(e) => setFarm({ ...farm, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value={farm.location} onChange={(e) => setFarm({ ...farm, location: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Crop Type</Label>
                    <Input value={farm.crop_type} onChange={(e) => setFarm({ ...farm, crop_type: e.target.value })} required />
                  </div>
                  <Button type="submit">Add Farm</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clogging">
            <Card>
              <CardHeader>
                <CardTitle>Report Clogging</CardTitle>
                <CardDescription>Submit a clogging incident report</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClogging} className="space-y-4">
                  <div>
                    <Label>Farm</Label>
                    <Select value={clogging.farm_id} onValueChange={(v) => setClogging({ ...clogging, farm_id: v })}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select farm" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {[1, 2, 3, 4].map(id => (
                          <SelectItem key={id} value={id.toString()}>Farm {String.fromCharCode(64 + id)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={clogging.description} onChange={(e) => setClogging({ ...clogging, description: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <Select value={clogging.severity} onValueChange={(v) => setClogging({ ...clogging, severity: v })}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit">Submit Report</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Add Schedule</CardTitle>
                <CardDescription>Schedule a fertigation operation</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSchedule} className="space-y-4">
                  <div>
                    <Label>Farm</Label>
                    <Select value={schedule.farm_id} onValueChange={(v) => setSchedule({ ...schedule, farm_id: v })}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select farm" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {[1, 2, 3, 4].map(id => (
                          <SelectItem key={id} value={id.toString()}>Farm {String.fromCharCode(64 + id)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Start Time</Label>
                    <Input type="datetime-local" value={schedule.start_time} onChange={(e) => setSchedule({ ...schedule, start_time: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input type="number" value={schedule.duration} onChange={(e) => setSchedule({ ...schedule, duration: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Fertilizer Amount (kg)</Label>
                    <Input type="number" step="0.1" value={schedule.fertilizer_amount} onChange={(e) => setSchedule({ ...schedule, fertilizer_amount: e.target.value })} required />
                  </div>
                  <Button type="submit">Add Schedule</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle>Submit Research Report</CardTitle>
                <CardDescription>Submit your research findings</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReport} className="space-y-4">
                  <div>
                    <Label>Report Title</Label>
                    <Input value={report.title} onChange={(e) => setReport({ ...report, title: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={report.description} onChange={(e) => setReport({ ...report, description: e.target.value })} required />
                  </div>
                  <Button type="submit">Submit Report</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
