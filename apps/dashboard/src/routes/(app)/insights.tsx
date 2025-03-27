import { createFileRoute } from '@tanstack/react-router'
import { BarChart, LineChart, PieChart, TrendingUp, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export const Route = createFileRoute('/(app)/insights')({
  component: InsightsComponent,
})

function InsightsComponent() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border bg-card px-3 py-1">
            <span className="text-sm mr-2">Period:</span>
            <select className="bg-transparent text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last quarter</option>
              <option>This year</option>
            </select>
          </div>
          <button className="rounded-md border bg-card p-2">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">$24,835</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            <span className="text-green-500">12%</span>
            <span className="ml-1 text-muted-foreground">vs last period</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">New Customers</p>
              <p className="text-2xl font-bold">384</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            <span className="text-green-500">8.2%</span>
            <span className="ml-1 text-muted-foreground">vs last period</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">3.6%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <PieChart className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            <span className="text-red-500">0.8%</span>
            <span className="ml-1 text-muted-foreground">vs last period</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Order Value</p>
              <p className="text-2xl font-bold">$175</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <LineChart className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            <span className="text-green-500">5.3%</span>
            <span className="ml-1 text-muted-foreground">vs last period</span>
          </div>
        </div>
      </div>

      {/* Main chart placeholder */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Revenue Overview</h2>
          <div className="flex items-center gap-2">
            <button className="rounded-md border bg-muted p-1 text-xs">Daily</button>
            <button className="rounded-md p-1 text-xs">Weekly</button>
            <button className="rounded-md p-1 text-xs">Monthly</button>
          </div>
        </div>
        <div className="h-80 w-full bg-muted/20 rounded flex items-center justify-center">
          <div className="text-center">
            <BarChart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Revenue chart would display here</p>
          </div>
        </div>
      </div>

      {/* Quick insights */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium mb-2">Top Products</h3>
          <div className="space-y-2">
            {['Product A', 'Product B', 'Product C', 'Product D', 'Product E'].map((product, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b last:border-0">
                <span>{product}</span>
                <span className="font-medium">${(Math.random() * 1000).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium mb-2">Traffic Sources</h3>
          <div className="space-y-2">
            {['Direct', 'Organic Search', 'Referral', 'Social Media', 'Email'].map((source, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b last:border-0">
                <span>{source}</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm">{Math.floor(Math.random() * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}