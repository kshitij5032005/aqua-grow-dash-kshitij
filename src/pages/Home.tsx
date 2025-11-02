import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Activity, Droplets, Bell, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Smart Fertigation Monitoring System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            An IoT-enabled system to optimize water and fertilizer usage for sustainable agriculture
          </p>
          <div className="flex gap-4 justify-center mt-8">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Farms</CardTitle>
              <Activity className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">4</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across multiple districts
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sensors Connected</CardTitle>
              <Droplets className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">12</div>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time monitoring
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Alerts</CardTitle>
              <Bell className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">2</div>
              <p className="text-xs text-muted-foreground mt-1">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Monitoring</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Track flow rates, pressure levels, and conductivity in real-time across all your farms
              with instant alerts for any anomalies.
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Get notified immediately when flow rates drop below threshold, pressure issues occur,
              or clogging is detected.
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Visualize trends, compare performance across farms, and make data-driven decisions
              to optimize resource usage.
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Resource Optimization</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Schedule fertigation operations, manage fertilizer amounts, and reduce water waste
              with intelligent automation.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
