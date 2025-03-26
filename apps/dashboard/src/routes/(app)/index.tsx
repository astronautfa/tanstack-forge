import { createFileRoute } from '@tanstack/react-router'
import { Calendar, PieChart, User } from 'lucide-react'

export const Route = createFileRoute('/(app)/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Card 1 */}
                <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-card-foreground">Total Revenue</h3>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-card-foreground">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </div>

                {/* Card 2 */}
                <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-card-foreground">Subscriptions</h3>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-card-foreground">+2,350</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </div>

                {/* Card 3 */}
                <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-card-foreground">Active Users</h3>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-card-foreground">+12,234</div>
                    <p className="text-xs text-muted-foreground">+19% from last month</p>
                </div>

                {/* Card 4 */}
                <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-card-foreground">Active Now</h3>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-card-foreground">+573</div>
                    <p className="text-xs text-muted-foreground">+201 since last hour</p>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Left Section - Recent Activity (Spans 4 columns) */}
                <div className="col-span-full rounded-lg border bg-card text-card-foreground p-6 shadow-sm lg:col-span-4">
                    <h3 className="mb-4 text-lg font-medium text-card-foreground">Recent Activity</h3>
                    <div className="space-y-4">
                        {/* Activity Items */}
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="h-8 w-8 rounded-full bg-muted" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-card-foreground">User updated their profile</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Section - Upcoming Events (Spans 3 columns) */}
                <div className="col-span-full rounded-lg border bg-card text-card-foreground p-6 shadow-sm lg:col-span-3">
                    <h3 className="mb-4 text-lg font-medium text-card-foreground">Upcoming Events</h3>
                    <div className="space-y-4">
                        {/* Event Items */}
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-card-foreground">Team Meeting</p>
                                    <p className="text-xs text-muted-foreground">Mar 20, 2025 • 10:00 AM</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
