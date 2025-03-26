import { createFileRoute } from '@tanstack/react-router'
import {
    Search,
    Plus,
    Library,
    BookOpen,
    Clock,
    Star,
    Calendar,
    Users,
    FileText,
    FolderOpen,
    Settings,
    TrendingUp,
    Bookmark,
    Tag,
    ChevronRight
} from 'lucide-react'

export const Route = createFileRoute('/(app)/')({
    component: DashboardComponent,
})

function DashboardComponent() {
    // Sample data for recently edited documents
    const recentDocuments = [
        {
            id: 1,
            title: "Research Methodology Notes",
            updatedAt: "2 hours ago",
            tags: ["Research", "Academia"],
            starred: true,
            preview: "The methodology section describes the rationale for the application of specific procedures or techniques used to identify, select, and analyze information..."
        },
        {
            id: 2,
            title: "Literature Review: Machine Learning in Healthcare",
            updatedAt: "Yesterday",
            tags: ["ML", "Healthcare", "Research"],
            starred: false,
            preview: "This review aims to explore the current landscape of machine learning applications in healthcare settings, with a focus on diagnostic tools..."
        },
        {
            id: 3,
            title: "Study Notes: Quantum Computing",
            updatedAt: "3 days ago",
            tags: ["Physics", "Computing"],
            starred: true,
            preview: "Quantum computing is an emerging field that uses quantum mechanical phenomena to perform operations on data..."
        },
        {
            id: 4,
            title: "Thesis Outline",
            updatedAt: "1 week ago",
            tags: ["Thesis", "Planning"],
            starred: false,
            preview: "Introduction, Literature Review, Methodology, Results, Discussion, Conclusion..."
        },
    ];

    // Sample data for collections
    const collections = [
        {
            id: 1,
            name: "Research Papers",
            count: 24,
            icon: Library,
            color: "bg-blue-500/10 text-blue-500"
        },
        {
            id: 2,
            name: "Study Notes",
            count: 42,
            icon: BookOpen,
            color: "bg-green-500/10 text-green-500"
        },
        {
            id: 3,
            name: "Project Materials",
            count: 15,
            icon: FolderOpen,
            color: "bg-purple-500/10 text-purple-500"
        },
        {
            id: 4,
            name: "Personal Journal",
            count: 28,
            icon: FileText,
            color: "bg-yellow-500/10 text-yellow-500"
        },
    ];

    // Sample suggested actions
    const suggestedActions = [
        {
            id: 1,
            title: "Continue writing your thesis outline",
            subtitle: "Last edited yesterday",
            icon: FileText,
            color: "bg-indigo-500/10 text-indigo-500"
        },
        {
            id: 2,
            title: "Upcoming literature review deadline",
            subtitle: "Due in 3 days",
            icon: Calendar,
            color: "bg-red-500/10 text-red-500"
        },
        {
            id: 3,
            title: "Collaborate on Chemistry notes",
            subtitle: "Shared with 3 peers",
            icon: Users,
            color: "bg-emerald-500/10 text-emerald-500"
        },
    ];

    // Sample statistics
    const statistics = [
        {
            title: "Total Documents",
            value: "164",
            change: "+12",
            icon: FileText,
            trend: "up"
        },
        {
            title: "Words Written",
            value: "53,842",
            change: "+2,451",
            icon: TrendingUp,
            trend: "up"
        },
        {
            title: "Research Sources",
            value: "87",
            change: "+5",
            icon: Bookmark,
            trend: "up"
        },
        {
            title: "Citations",
            value: "132",
            change: "+8",
            icon: Tag,
            trend: "up"
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header with search and quick actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
                        <Plus className="h-4 w-4" />
                        New Document
                    </button>
                </div>
            </div>

            {/* Statistics cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statistics.map((stat, index) => (
                    <div key={index} className="rounded-lg border bg-card p-4">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.trend === 'up' ? 'bg-green-500/10' : 'bg-red-500/10'
                                }`}>
                                <stat.icon className={`h-5 w-5 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                                    }`} />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                                {stat.change}
                            </span>
                            <span className="ml-1 text-muted-foreground">this week</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two column layout for main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Recent documents */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent documents */}
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-medium flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                Recent Documents
                            </h2>
                            <button className="text-sm text-primary hover:underline">
                                View all
                            </button>
                        </div>
                        <div className="divide-y">
                            {recentDocuments.map((doc) => (
                                <div key={doc.id} className="p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="font-medium">{doc.title}</h3>
                                                {doc.starred && (
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                                {doc.preview}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    Updated {doc.updatedAt}
                                                </span>
                                                <div className="flex gap-1">
                                                    {doc.tags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-1 hover:bg-muted rounded-full">
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Collections grid */}
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-medium flex items-center">
                                <Library className="h-4 w-4 mr-2 text-muted-foreground" />
                                Collections
                            </h2>
                            <button className="text-sm text-primary hover:underline">
                                Manage collections
                            </button>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {collections.map((collection) => {
                                const IconComponent = collection.icon;
                                return (
                                    <div
                                        key={collection.id}
                                        className="rounded-lg border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${collection.color}`}>
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{collection.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {collection.count} documents
                                                </p>
                                            </div>
                                            <button className="ml-auto p-1 hover:bg-muted rounded-full">
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right column - Suggestions and quick access */}
                <div className="space-y-6">
                    {/* Suggested actions */}
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="p-4 border-b">
                            <h2 className="font-medium">Suggested Actions</h2>
                        </div>
                        <div className="divide-y">
                            {suggestedActions.map((action) => {
                                const IconComponent = action.icon;
                                return (
                                    <div key={action.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${action.color}`}>
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{action.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {action.subtitle}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick access */}
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="p-4 border-b">
                            <h2 className="font-medium">Quick Access</h2>
                        </div>
                        <div className="p-4 space-y-2">
                            <button className="w-full flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                                <Star className="h-5 w-5 text-yellow-500" />
                                <span>Starred Documents</span>
                            </button>
                            <button className="w-full flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <span>Recent Activity</span>
                            </button>
                            <button className="w-full flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                                <Users className="h-5 w-5 text-green-500" />
                                <span>Shared With Me</span>
                            </button>
                            <button className="w-full flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                                <Calendar className="h-5 w-5 text-purple-500" />
                                <span>Research Calendar</span>
                            </button>
                            <button className="w-full flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                                <Settings className="h-5 w-5 text-gray-500" />
                                <span>Preferences</span>
                            </button>
                        </div>
                    </div>

                    {/* Help & resources card */}
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <h3 className="font-medium mb-2">Resources</h3>
                        <div className="space-y-2 text-sm">
                            <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                                <BookOpen className="h-4 w-4" />
                                <span>Citation Guide</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                                <Library className="h-4 w-4" />
                                <span>Research Database Access</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                                <FileText className="h-4 w-4" />
                                <span>Academic Writing Templates</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                                <Users className="h-4 w-4" />
                                <span>Research Collaboration Tools</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly progress section */}
            <div className="rounded-lg border bg-card shadow-sm">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                        Weekly Progress
                    </h2>
                    <div className="flex items-center gap-2">
                        <select className="rounded-md border bg-background px-3 py-1 text-sm">
                            <option>This Week</option>
                            <option>Last Week</option>
                            <option>Last Month</option>
                        </select>
                    </div>
                </div>
                <div className="p-4">
                    <div className="h-64 w-full bg-muted/20 rounded flex items-center justify-center">
                        <div className="text-center">
                            <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">Writing activity analytics would display here</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Documents Created</p>
                        <p className="text-xl font-bold">7</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Study Hours</p>
                        <p className="text-xl font-bold">24.5</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Notes Taken</p>
                        <p className="text-xl font-bold">42</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Research Sources</p>
                        <p className="text-xl font-bold">15</p>
                    </div>
                </div>
            </div>

            {/* Research projects section */}
            <div className="rounded-lg border bg-card shadow-sm">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-medium flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                        Active Research Projects
                    </h2>
                    <button className="text-sm text-primary hover:underline">
                        View all projects
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Deadline</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Collaborators</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr className="hover:bg-muted/50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Neural Network Analysis</p>
                                            <p className="text-xs text-muted-foreground">AI & Machine Learning</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                        In Progress
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">May 15, 2025</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex -space-x-2">
                                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">JD</div>
                                        <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">MK</div>
                                        <div className="h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs text-white">+1</div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: "65%" }}></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">65% Complete</p>
                                </td>
                            </tr>
                            <tr className="hover:bg-muted/50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Climate Change Literature Review</p>
                                            <p className="text-xs text-muted-foreground">Environmental Science</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                        Pending Review
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">April 3, 2025</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex -space-x-2">
                                        <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">AR</div>
                                        <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white">SL</div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500" style={{ width: "80%" }}></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">80% Complete</p>
                                </td>
                            </tr>
                            <tr className="hover:bg-muted/50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Vaccine Efficacy Study</p>
                                            <p className="text-xs text-muted-foreground">Medical Sciences</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                        Data Collection
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">June 22, 2025</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex -space-x-2">
                                        <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white">BT</div>
                                        <div className="h-6 w-6 rounded-full bg-teal-500 flex items-center justify-center text-xs text-white">MC</div>
                                        <div className="h-6 w-6 rounded-full bg-pink-500 flex items-center justify-center text-xs text-white">+3</div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: "35%" }}></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">35% Complete</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer with app information */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                <div className="flex gap-4">
                    <a href="#" className="hover:text-primary">Help</a>
                    <a href="#" className="hover:text-primary">Privacy</a>
                    <a href="#" className="hover:text-primary">Terms</a>
                </div>
                <div className="mt-2 sm:mt-0">
                    <p>ScholarNotes • Academic Document Editor • v1.0.2</p>
                </div>
            </div>
        </div>
    )
}

export default DashboardComponent;