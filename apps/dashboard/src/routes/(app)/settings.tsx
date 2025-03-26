import { createFileRoute } from '@tanstack/react-router'
import { Bell, Lock, User, Shield, CreditCard, Globe, Moon, Save } from 'lucide-react'

export const Route = createFileRoute('/(app)/settings')({
    component: SettingsComponent,
})

function SettingsComponent() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
                    <Save className="h-4 w-4" />
                    Save Changes
                </button>
            </div>

            {/* Settings Navigation */}
            <div className="flex flex-wrap gap-2 border-b pb-4">
                {[
                    { icon: User, label: 'Account' },
                    { icon: Lock, label: 'Password' },
                    { icon: Bell, label: 'Notifications' },
                    { icon: Shield, label: 'Security' },
                    { icon: CreditCard, label: 'Billing' },
                    { icon: Globe, label: 'Preferences' },
                ].map(({ icon: Icon, label }) => (
                    <button
                        key={label}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${label === 'Account'
                                ? 'bg-muted text-foreground'
                                : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Account Settings Section */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-card-foreground mb-4">Account Information</h3>

                    <div className="space-y-4">
                        {/* Profile Information */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium leading-none text-muted-foreground mb-2 block">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="John Doe"
                                    defaultValue="John Doe"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none text-muted-foreground mb-2 block">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="john@example.com"
                                    defaultValue="john@example.com"
                                />
                            </div>
                        </div>

                        {/* Profile Picture */}
                        <div>
                            <label className="text-sm font-medium leading-none text-muted-foreground mb-2 block">
                                Profile Picture
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <button className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground hover:bg-muted/80">
                                    Change
                                </button>
                                <button className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive hover:bg-destructive/20">
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appearance Settings */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-card-foreground mb-4">Appearance</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-2">
                                <Moon className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Dark Mode</p>
                                    <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                                </div>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input type="checkbox" className="peer sr-only" defaultChecked />
                                <div className="h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Language Settings */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-card-foreground mb-4">Language & Region</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium leading-none text-muted-foreground mb-2 block">
                                Language
                            </label>
                            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="en">English (US)</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="ja">Japanese</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium leading-none text-muted-foreground mb-2 block">
                                Time Zone
                            </label>
                            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="et">Eastern Time (ET)</option>
                                <option value="pt">Pacific Time (PT)</option>
                                <option value="utc">Coordinated Universal Time (UTC)</option>
                                <option value="gmt">Greenwich Mean Time (GMT)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}