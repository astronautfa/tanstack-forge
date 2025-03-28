import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
    Search,
    Plus,
    Settings,
    Grid,
    List,
    Clock,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Info,
} from 'lucide-react'

export const Route = createFileRoute('/(app)/integration')({
    component: IntegrationsComponent,
})

function IntegrationsComponent() {
    const [viewMode, setViewMode] = useState('grid');
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Sample integration data
    const integrations = [
        {
            id: 1,
            name: "Slack",
            description: "Send notifications and updates to your Slack channels",
            category: "communication",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/slack-icon_dkkxeo.svg",
            connected: true,
            popular: true,
            lastSynced: "2 hours ago"
        },
        {
            id: 2,
            name: "Google Drive",
            description: "Sync and manage files directly with Google Drive",
            category: "file-storage",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/gdrive-icon_ftcbbw.svg",
            connected: true,
            popular: true,
            lastSynced: "1 day ago"
        },
        {
            id: 3,
            name: "Stripe",
            description: "Process payments and manage subscriptions",
            category: "payment",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/stripe-icon_iq1mgc.svg",
            connected: false,
            popular: true,
            lastSynced: null
        },
        {
            id: 4,
            name: "Zapier",
            description: "Connect with thousands of apps through automated workflows",
            category: "automation",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/zapier-icon_jjxb7t.svg",
            connected: true,
            popular: true,
            lastSynced: "3 hours ago"
        },
        {
            id: 5,
            name: "HubSpot",
            description: "Sync contacts and manage customer relationships",
            category: "crm",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/hubspot-icon_i9lkyk.svg",
            connected: false,
            popular: false,
            lastSynced: null
        },
        {
            id: 6,
            name: "Salesforce",
            description: "Enterprise-level CRM integration for customer data",
            category: "crm",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/salesforce-icon_u1mpmj.svg",
            connected: false,
            popular: true,
            lastSynced: null
        },
        {
            id: 7,
            name: "Mailchimp",
            description: "Create and manage email marketing campaigns",
            category: "marketing",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/mailchimp-icon_qbylut.svg",
            connected: true,
            popular: false,
            lastSynced: "5 days ago"
        },
        {
            id: 8,
            name: "GitHub",
            description: "Connect repositories and track development progress",
            category: "development",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/github-icon_r47wwq.svg",
            connected: true,
            popular: true,
            lastSynced: "1 hour ago"
        },
        {
            id: 9,
            name: "AWS",
            description: "Connect to Amazon Web Services for cloud resources",
            category: "cloud",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/aws-icon_rmzxvp.svg",
            connected: false,
            popular: false,
            lastSynced: null
        },
        {
            id: 10,
            name: "Dropbox",
            description: "Sync and share files with Dropbox cloud storage",
            category: "file-storage",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/dropbox-icon_pz9xgq.svg",
            connected: false,
            popular: false,
            lastSynced: null
        },
        {
            id: 11,
            name: "Asana",
            description: "Manage projects and tasks within your team",
            category: "productivity",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/asana-icon_gjsphv.svg",
            connected: false,
            popular: false,
            lastSynced: null
        },
        {
            id: 12,
            name: "Zendesk",
            description: "Customer support and ticketing system integration",
            category: "support",
            icon: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741346201/zendesk-icon_xk6vpo.svg",
            connected: false,
            popular: true,
            lastSynced: null
        }
    ];

    // Categories for filtering
    const categories = [
        { id: 'all', name: 'All Integrations' },
        { id: 'connected', name: 'Connected' },
        { id: 'communication', name: 'Communication' },
        { id: 'file-storage', name: 'File Storage' },
        { id: 'payment', name: 'Payment' },
        { id: 'automation', name: 'Automation' },
        { id: 'crm', name: 'CRM' },
        { id: 'marketing', name: 'Marketing' },
        { id: 'development', name: 'Development' },
        { id: 'productivity', name: 'Productivity' },
        { id: 'support', name: 'Support' }
    ];

    // Filter integrations based on category and search query
    const filteredIntegrations = integrations.filter(integration => {
        const matchesCategory =
            filterCategory === 'all' ||
            (filterCategory === 'connected' && integration.connected) ||
            integration.category === filterCategory;

        const matchesSearch =
            integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            integration.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
                    <p className="text-muted-foreground mt-1">Connect your workspace with your favorite tools and services</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 sm:w-auto w-full justify-center">
                    <Plus className="h-4 w-4" />
                    Add New Integration
                </button>
            </div>

            {/* Connected integrations summary */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
                <h2 className="font-medium mb-3">Connected Integrations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {integrations
                        .filter(integration => integration.connected)
                        .slice(0, 4)
                        .map(integration => (
                            <div key={integration.id} className="flex items-center gap-3 rounded-lg border p-3">
                                <img
                                    src={integration.icon}
                                    alt={integration.name}
                                    className="h-8 w-8"
                                />
                                <div>
                                    <div className="font-medium">{integration.name}</div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Synced {integration.lastSynced}
                                    </div>
                                </div>
                                <button className="ml-auto rounded-full p-1 hover:bg-muted">
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>
                        ))}
                </div>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search integrations..."
                        className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="hidden md:flex items-center rounded-md border bg-card">
                        <button
                            className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            className={`p-2 ${viewMode === 'list' ? 'bg-muted' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Popular integrations section */}
            {filterCategory === 'all' && searchQuery === '' && (
                <div className="space-y-3">
                    <h2 className="font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        Popular Integrations
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {integrations
                            .filter(integration => integration.popular)
                            .map(integration => (
                                <div
                                    key={integration.id}
                                    className="flex flex-col rounded-lg border bg-card overflow-hidden hover:border-primary/50 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-3 p-4 border-b">
                                        <img
                                            src={integration.icon}
                                            alt={integration.name}
                                            className="h-10 w-10"
                                        />
                                        <div>
                                            <div className="font-medium">{integration.name}</div>
                                            {integration.connected ? (
                                                <div className="flex items-center text-xs text-green-600">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Connected
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    Not connected
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1">
                                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                                    </div>
                                    <div className="p-4 pt-0">
                                        <button
                                            className={`w-full rounded-md px-4 py-2 text-sm font-medium ${integration.connected
                                                ? 'bg-muted hover:bg-muted/80 text-foreground'
                                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                                }`}
                                        >
                                            {integration.connected ? 'Manage Connection' : 'Connect'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* All integrations */}
            <div className="space-y-3">
                <h2 className="font-medium">
                    {filterCategory === 'all' && searchQuery === '' ? 'All Integrations' : 'Results'}
                    <span className="text-muted-foreground ml-2 text-sm">({filteredIntegrations.length})</span>
                </h2>

                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredIntegrations.map(integration => (
                            <div
                                key={integration.id}
                                className="flex flex-col rounded-lg border bg-card overflow-hidden hover:border-primary/50 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-3 p-4 border-b">
                                    <img
                                        src={integration.icon}
                                        alt={integration.name}
                                        className="h-10 w-10"
                                    />
                                    <div>
                                        <div className="font-medium">{integration.name}</div>
                                        {integration.connected ? (
                                            <div className="flex items-center text-xs text-green-600">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Connected
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                Not connected
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 flex-1">
                                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                                    {integration.connected && integration.lastSynced && (
                                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Last synced: {integration.lastSynced}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 pt-0 flex items-center gap-2">
                                    <button
                                        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${integration.connected
                                            ? 'bg-muted hover:bg-muted/80 text-foreground'
                                            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                            }`}
                                    >
                                        {integration.connected ? 'Manage' : 'Connect'}
                                    </button>
                                    <button className="p-2 hover:bg-muted rounded-full">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredIntegrations.map(integration => (
                            <div
                                key={integration.id}
                                className="flex items-center gap-4 rounded-lg border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-shadow duration-150"
                            >
                                <img
                                    src={integration.icon}
                                    alt={integration.name}
                                    className="h-12 w-12"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium">{integration.name}</div>
                                        {integration.popular && (
                                            <Sparkles className="h-4 w-4 text-yellow-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                                    {integration.connected && integration.lastSynced && (
                                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Last synced: {integration.lastSynced}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {integration.connected ? (
                                        <div className="flex items-center text-xs text-green-600">
                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                            Connected
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            Not connected
                                        </div>
                                    )}
                                    <button
                                        className={`rounded-md px-4 py-2 text-sm font-medium ${integration.connected
                                            ? 'bg-muted hover:bg-muted/80 text-foreground'
                                            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                            }`}
                                    >
                                        {integration.connected ? 'Manage' : 'Connect'}
                                    </button>
                                    <button className="p-2 hover:bg-muted rounded-full">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {filteredIntegrations.length === 0 && (
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No integrations found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria</p>
                </div>
            )}
        </div>
    );
}