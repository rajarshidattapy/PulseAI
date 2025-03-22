"use client"

import { useEffect, useState } from "react"
import { Brain, ClipboardList, Database, FileWarning, Microscope, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface MetricData {
  diagnostics: number
  queries: number
  carePlans: number
  dataRecords: string
  alerts: number
  models: number
  loading: boolean
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<MetricData>({
    diagnostics: 0,
    queries: 0,
    carePlans: 0,
    dataRecords: "0",
    alerts: 0,
    models: 0,
    loading: true,
  })

  useEffect(() => {
    // Simulate API call to fetch dashboard metrics
    const fetchMetrics = async () => {
      try {
        // In a real app, this would be an API call
        // await fetch('/api/dashboard/metrics')

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setMetrics({
          diagnostics: 124,
          queries: 56,
          carePlans: 89,
          dataRecords: "1.2M",
          alerts: 12,
          models: 8,
          loading: false,
        })
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
        toast.error("Error", {
          description: "Failed to load dashboard metrics. Please try again.",
        })
        setMetrics((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the Unified AI Health Hub. View key metrics and system status.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="COMPOUNDER AI"
          icon={Microscope}
          value={metrics.diagnostics}
          label="Active Cases"
          color="bg-blue-500"
          loading={metrics.loading}
        />
        <MetricCard
          title="Patient Queries"
          icon={Stethoscope}
          value={metrics.queries}
          label="Pending Responses"
          color="bg-green-500"
          loading={metrics.loading}
        />
        <MetricCard
          title="Care Plans"
          icon={ClipboardList}
          value={metrics.carePlans}
          label="Active Plans"
          color="bg-purple-500"
          loading={metrics.loading}
        />
        <MetricCard
          title="Synthetic Data"
          icon={Database}
          value={metrics.dataRecords}
          label="Records Generated"
          color="bg-amber-500"
          loading={metrics.loading}
          isString={true}
        />
        <MetricCard
          title="Adverse Events"
          icon={FileWarning}
          value={metrics.alerts}
          label="High Priority Alerts"
          color="bg-red-500"
          loading={metrics.loading}
        />
        <MetricCard
          title="AI Models"
          icon={Brain}
          value={metrics.models}
          label="Active Models"
          color="bg-indigo-500"
          loading={metrics.loading}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Current status and health of the AI Health Hub platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">System Status</div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>All systems operational</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Last Updated</div>
                    <div>Today at 10:45 AM</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">API Status</div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Healthy (98.7% uptime)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Database Status</div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Connected</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button>View Detailed System Status</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and events across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="space-y-4">
                    <ActivityItem
                      title="New diagnostic result uploaded"
                      description="MRI scan analysis completed for patient #12458"
                      time="10 minutes ago"
                      icon={Microscope}
                      color="bg-blue-500"
                    />
                    <ActivityItem
                      title="Patient query answered"
                      description="Response sent to medication inquiry from John D."
                      time="25 minutes ago"
                      icon={Stethoscope}
                      color="bg-green-500"
                    />
                    <ActivityItem
                      title="Care plan updated"
                      description="Treatment adjustments for patient #8976"
                      time="1 hour ago"
                      icon={ClipboardList}
                      color="bg-purple-500"
                    />
                    <ActivityItem
                      title="Synthetic dataset generated"
                      description="10,000 records created for research project #45"
                      time="3 hours ago"
                      icon={Database}
                      color="bg-amber-500"
                    />
                    <ActivityItem
                      title="High priority alert triggered"
                      description="Potential adverse reaction detected for patient #3421"
                      time="Yesterday"
                      icon={FileWarning}
                      color="bg-red-500"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Performance metrics and resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm">42%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-[42%] rounded-full bg-blue-500"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm">68%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-[68%] rounded-full bg-purple-500"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-sm">23%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-[23%] rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network</span>
                    <span className="text-sm">12 Mbps</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-[35%] rounded-full bg-amber-500"></div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button>View Detailed Performance Metrics</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({
  title,
  icon: Icon,
  value,
  label,
  color,
  loading,
  isString = false,
}: {
  title: string
  icon: any
  value: number | string
  label: string
  color: string
  loading: boolean
  isString?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <div className={`rounded-full p-2 ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4">
          {loading ? (
            <>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </>
          ) : (
            <>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({
  title,
  description,
  time,
  icon: Icon,
  color,
}: {
  title: string
  description: string
  time: string
  icon: any
  color: string
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`rounded-full p-2 ${color} shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
        <div className="mt-1 text-xs text-muted-foreground">{time}</div>
      </div>
    </div>
  )
}

