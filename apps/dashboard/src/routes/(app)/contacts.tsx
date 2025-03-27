import { createFileRoute } from '@tanstack/react-router'
import {
    Users,
    Search,
    Plus,
    Filter,
    Mail,
    Phone,
    Star,
    MoreHorizontal,
    ChevronDown,
    Edit,
    Trash2
} from 'lucide-react'

export const Route = createFileRoute('/(app)/contacts')({
    component: ContactsComponent,
})

function ContactsComponent() {
    // Sample contact data
    const contacts = [
        {
            id: 1,
            name: 'Alex Johnson',
            email: 'alex.johnson@example.com',
            phone: '+1 (555) 123-4567',
            company: 'Acme Corp',
            position: 'Marketing Director',
            tags: ['Client', 'VIP'],
            starred: true,
            avatar: null
        },
        {
            id: 2,
            name: 'Samantha Williams',
            email: 'sam.williams@example.com',
            phone: '+1 (555) 987-6543',
            company: 'TechGiant Inc',
            position: 'Product Manager',
            tags: ['Prospect'],
            starred: false,
            avatar: null
        },
        {
            id: 3,
            name: 'Michael Chen',
            email: 'michael.chen@example.com',
            phone: '+1 (555) 456-7890',
            company: 'StartUp Labs',
            position: 'CEO',
            tags: ['Partner'],
            starred: true,
            avatar: null
        },
        {
            id: 4,
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@example.com',
            phone: '+1 (555) 234-5678',
            company: 'Global Solutions',
            position: 'Sales Manager',
            tags: ['Client'],
            starred: false,
            avatar: null
        },
        {
            id: 5,
            name: 'David Kim',
            email: 'david.kim@example.com',
            phone: '+1 (555) 876-5432',
            company: 'Innovate Design',
            position: 'Creative Director',
            tags: ['Vendor'],
            starred: false,
            avatar: null
        },
    ];

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
                        <Plus className="h-4 w-4" />
                        Add Contact
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">View:</span>
                    <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
                        <option value="all">All Contacts</option>
                        <option value="clients">Clients</option>
                        <option value="prospects">Prospects</option>
                        <option value="partners">Partners</option>
                        <option value="vendors">Vendors</option>
                    </select>
                </div>
            </div>

            {/* Contacts Table */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <div className="flex items-center gap-1">
                                        Name
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                                                {contact.avatar ? (
                                                    <img
                                                        src={contact.avatar}
                                                        alt={contact.name}
                                                        className="h-10 w-10 rounded-full"
                                                    />
                                                ) : (
                                                    <span>{contact.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <p className="font-medium">{contact.name}</p>
                                                    {contact.starred && (
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{contact.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{contact.phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <p className="text-sm">{contact.company}</p>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <p className="text-sm">{contact.position}</p>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex gap-1">
                                            {contact.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className={`
                                                        inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                                                        ${tag === 'Client' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : ''}
                                                        ${tag === 'VIP' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : ''}
                                                        ${tag === 'Prospect' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                                                        ${tag === 'Partner' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                                                        ${tag === 'Vendor' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : ''}
                                                    `}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button className="rounded-full p-1 hover:bg-muted">
                                                <Edit className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            <button className="rounded-full p-1 hover:bg-muted">
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            <button className="rounded-full p-1 hover:bg-muted">
                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">42</span> contacts
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                            disabled
                        >
                            Previous
                        </button>
                        <div className="flex items-center">
                            <button className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground">1</button>
                            <button className="px-3 py-1 text-sm">2</button>
                            <button className="px-3 py-1 text-sm">3</button>
                            <span className="px-2">...</span>
                            <button className="px-3 py-1 text-sm">9</button>
                        </div>
                        <button className="rounded-md border px-3 py-1 text-sm">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-card-foreground">Total Contacts</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-card-foreground">1,245</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-card-foreground">Clients</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-card-foreground">543</div>
                    <p className="text-xs text-muted-foreground">+5% from last month</p>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-card-foreground">Prospects</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-card-foreground">402</div>
                    <p className="text-xs text-muted-foreground">+18% from last month</p>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium tracking-tight text-card-foreground">VIP Contacts</h3>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-card-foreground">86</div>
                    <p className="text-xs text-muted-foreground">+2 since last week</p>
                </div>
            </div>
        </div>
    )
}