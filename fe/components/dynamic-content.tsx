"use client"
import { usePathname } from "next/navigation"
import { Brain, ClipboardList, Database, FileWarning, Microscope, Stethoscope } from "lucide-react"

export function DynamicContent() {
  const pathname = usePathname()

  // Determine which content to show based on the current path
  const renderContent = () => {
    switch (pathname) {
      case "/diagnostics":
        return <DiagnosticsContent />
      case "/query-assistant":
        return <QueryAssistantContent />
      case "/care-plans":
        return <CarePlansContent />
      case "/data-generator":
        return <DataGeneratorContent />
      case "/event-predictor":
        return <EventPredictorContent />
      default:
        return <DashboardContent />
    }
  }

  return <main className="flex-1 p-6">{renderContent()}</main>
}

function DashboardContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Precision Diagnostics"
          icon={Microscope}
          value="124"
          label="Active Cases"
          color="bg-blue-500"
        />
        <DashboardCard
          title="Patient Queries"
          icon={Stethoscope}
          value="56"
          label="Pending Responses"
          color="bg-green-500"
        />
        <DashboardCard title="Care Plans" icon={ClipboardList} value="89" label="Active Plans" color="bg-purple-500" />
        <DashboardCard
          title="Synthetic Data"
          icon={Database}
          value="1.2M"
          label="Records Generated"
          color="bg-amber-500"
        />
        <DashboardCard
          title="Adverse Events"
          icon={FileWarning}
          value="12"
          label="High Priority Alerts"
          color="bg-red-500"
        />
        <DashboardCard title="AI Models" icon={Brain} value="8" label="Active Models" color="bg-indigo-500" />
      </div>
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-xl font-semibold">System Overview</h3>
        <p className="text-muted-foreground">
          Welcome to the Unified AI Health Hub. This platform integrates multiple AI-powered modules to enhance
          healthcare delivery, research, and patient outcomes. Navigate through the sidebar to access different modules.
        </p>
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  icon: Icon,
  value,
  label,
  color,
}: {
  title: string
  icon: any
  value: string
  label: string
  color: string
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <div className={`rounded-full p-2 ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

function DiagnosticsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Precision Diagnostics</h2>
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-4">
          <Microscope className="h-10 w-10 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">AI-Powered Diagnostic Tools</h3>
            <p className="text-muted-foreground">Leverage machine learning for accurate and early disease detection</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border bg-background p-4">
            <h4 className="font-medium">Image Analysis</h4>
            <p className="text-sm text-muted-foreground">Advanced algorithms for medical imaging interpretation</p>
          </div>
          <div className="rounded-md border bg-background p-4">
            <h4 className="font-medium">Biomarker Detection</h4>
            <p className="text-sm text-muted-foreground">Identify key biomarkers for early disease indicators</p>
          </div>
          <div className="rounded-md border bg-background p-4">
            <h4 className="font-medium">Genomic Profiling</h4>
            <p className="text-sm text-muted-foreground">Analyze genetic data for personalized diagnostics</p>
          </div>
          <div className="rounded-md border bg-background p-4">
            <h4 className="font-medium">Diagnostic Accuracy</h4>
            <p className="text-sm text-muted-foreground">Continuous learning models with 97% accuracy rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function QueryAssistantContent() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-4">
          <Stethoscope className="h-10 w-10 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">AI-Powered Patient Support</h3>
            <p className="text-muted-foreground">Natural language processing for patient inquiries and support</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="rounded-md border bg-background p-4">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-full bg-primary p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary-foreground"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <p className="font-medium">Patient</p>
            </div>
            <p className="rounded-lg bg-muted p-3 text-sm">What are the potential side effects of my new medication?</p>
          </div>
          <div className="mt-4 rounded-md border bg-background p-4">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-full bg-green-500 p-2">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <p className="font-medium">AI Assistant</p>
            </div>
            <p className="rounded-lg bg-muted p-3 text-sm">
              Based on your prescription for [Medication], common side effects may include drowsiness, dry mouth, and
              mild nausea. These typically resolve within 1-2 weeks. Please contact your healthcare provider if you
              experience severe dizziness, rash, or difficulty breathing, as these may require immediate attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CarePlansContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Personalized Care Plans</h2>
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-4">
          <ClipboardList className="h-10 w-10 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">AI-Generated Treatment Plans</h3>
            <p className="text-muted-foreground">Customized care recommendations based on patient data</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="rounded-md border bg-background p-4">
            <h4 className="mb-2 font-medium">Sample Care Plan: Diabetes Management</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
                <p className="text-sm">Daily glucose monitoring schedule</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                <p className="text-sm">Personalized nutrition plan</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-purple-500"></div>
                <p className="text-sm">Exercise regimen with heart rate targets</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-amber-500"></div>
                <p className="text-sm">Medication schedule with reminders</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-red-500"></div>
                <p className="text-sm">Regular check-up appointments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DataGeneratorContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Synthetic Data Generator</h2>
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-4">
          <Database className="h-10 w-10 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">AI-Generated Medical Datasets</h3>
            <p className="text-muted-foreground">Create realistic synthetic data for research and testing</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border bg-background p-4">
              <h4 className="mb-2 font-medium">Patient Demographics</h4>
              <div className="h-32 rounded-md bg-muted"></div>
              <p className="mt-2 text-xs text-muted-foreground">Generated 50,000 synthetic patient profiles</p>
            </div>
            <div className="rounded-md border bg-background p-4">
              <h4 className="mb-2 font-medium">Clinical Outcomes</h4>
              <div className="h-32 rounded-md bg-muted"></div>
              <p className="mt-2 text-xs text-muted-foreground">Simulated treatment outcomes across populations</p>
            </div>
          </div>
          <div className="mt-4 rounded-md border bg-background p-4">
            <h4 className="mb-2 font-medium">Data Generation Controls</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-medium">Dataset Size</label>
                <select className="mt-1 w-full rounded-md border p-2 text-sm">
                  <option>Small (1,000 records)</option>
                  <option>Medium (10,000 records)</option>
                  <option>Large (100,000 records)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Data Type</label>
                <select className="mt-1 w-full rounded-md border p-2 text-sm">
                  <option>Patient Records</option>
                  <option>Lab Results</option>
                  <option>Imaging Data</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Condition Focus</label>
                <select className="mt-1 w-full rounded-md border p-2 text-sm">
                  <option>Diabetes</option>
                  <option>Cardiovascular</option>
                  <option>Respiratory</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EventPredictorContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Adverse Event Predictor</h2>
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-4">
          <FileWarning className="h-10 w-10 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">AI Risk Assessment</h3>
            <p className="text-muted-foreground">Predictive analytics for potential adverse events</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="rounded-md border bg-background p-4">
            <h4 className="mb-4 font-medium">Current Risk Assessment</h4>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Medication Interaction</span>
                  <span className="text-sm text-amber-500 font-medium">Medium Risk</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 w-1/2 rounded-full bg-amber-500"></div>
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Readmission</span>
                  <span className="text-sm text-green-500 font-medium">Low Risk</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 w-1/4 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Treatment Complication</span>
                  <span className="text-sm text-red-500 font-medium">High Risk</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 w-3/4 rounded-full bg-red-500"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-md border bg-background p-4">
            <h4 className="mb-2 font-medium">Recommended Interventions</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 h-4 w-4 text-red-500"
                >
                  <path d="M12 9v4"></path>
                  <path d="M12 17h.01"></path>
                  <path d="M3.34 17a10 10 0 1 1 17.32 0"></path>
                </svg>
                <span>Adjust medication schedule to prevent potential interactions</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 h-4 w-4 text-amber-500"
                >
                  <path d="M12 9v4"></path>
                  <path d="M12 17h.01"></path>
                  <path d="M3.34 17a10 10 0 1 1 17.32 0"></path>
                </svg>
                <span>Schedule follow-up appointment within 2 weeks</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 h-4 w-4 text-green-500"
                >
                  <path d="m9 12 2 2 4-4"></path>
                  <path d="M12 3a9 9 0 1 0 9 9"></path>
                </svg>
                <span>Monitor vital signs daily and report significant changes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

