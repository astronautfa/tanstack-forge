import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
    Bell,
    Lock,
    User,
    Shield,
    CreditCard,
    Globe,
    Moon,
    Save,
    Book,
    Blocks,
    FileText,
    LineChart,
    Mail,
    PersonStanding,
    Key,
    Clipboard,
    AlertTriangle
} from 'lucide-react'

import { Button } from '@app/ui/components/button'
import { Input } from '@app/ui/components/input'
import { Label } from '@app/ui/components/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/ui/components/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@app/ui/components/card'
import { Switch } from '@app/ui/components/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@app/ui/components/avatar'
import { Separator } from '@app/ui/components/separator'
import { Badge } from '@app/ui/components/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@app/ui/components/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@app/ui/components/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@app/ui/components/command'
import { Checkbox } from '@app/ui/components/checkbox'
import { Textarea } from '@app/ui/components/textarea'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@app/ui/components/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@app/ui/components/alert'

export const Route = createFileRoute('/(app)/settings')({
    component: SettingsComponent,
})

// Mock data
const institutions = [
    { value: 'stanford', label: 'Stanford University' },
    { value: 'mit', label: 'Massachusetts Institute of Technology' },
    { value: 'harvard', label: 'Harvard University' },
    { value: 'oxford', label: 'University of Oxford' },
    { value: 'cambridge', label: 'University of Cambridge' },
    { value: 'berkeley', label: 'UC Berkeley' },
]

const researchFields = [
    { value: 'ai', label: 'Artificial Intelligence' },
    { value: 'biology', label: 'Biology' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'cs', label: 'Computer Science' },
    { value: 'physics', label: 'Physics' },
    { value: 'psychology', label: 'Psychology' },
]

function SettingsComponent() {
    const [activeTab, setActiveTab] = useState('account')
    const [institutionOpen, setInstitutionOpen] = useState(false)
    const [institution, setInstitution] = useState('stanford')
    const [researchFieldOpen, setResearchFieldOpen] = useState(false)
    const [researchField, setResearchField] = useState('ai')

    const tabs = [
        { id: 'account', icon: User, label: 'Account' },
        { id: 'password', icon: Lock, label: 'Password' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'security', icon: Shield, label: 'Security' },
        { id: 'billing', icon: CreditCard, label: 'Billing' },
        { id: 'research', icon: Book, label: 'Research' },
        { id: 'integrations', icon: Blocks, label: 'Integrations' },
        { id: 'preferences', icon: Globe, label: 'Preferences' },
    ]

    return (
        <div className="container mx-auto py-6 space-y-8 max-w-6xl p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="account" className="w-full" onValueChange={setActiveTab}>
                <div className="flex overflow-x-auto pb-2 mb-4">
                    <TabsList className="flex h-auto p-1 bg-muted/30">
                        {tabs.map(({ id, icon: Icon, label }) => (
                            <TabsTrigger
                                key={id}
                                value={id}
                                className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-background"
                            >
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* Account Tab */}
                <TabsContent value="account" className="space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and public profile information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Profile picture */}
                            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-2">
                                    <div className="flex space-x-2">
                                        <Button variant="secondary" size="sm">Change</Button>
                                        <Button variant="outline" size="sm">Remove</Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Recommended: Square JPG, PNG, or GIF, at least 400x400 pixels.
                                    </p>
                                </div>
                            </div>
                            <Separator />

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" defaultValue="John" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" defaultValue="Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" defaultValue="john.doe@research.edu" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Professional Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Write a short bio..."
                                    defaultValue="Researcher in AI with focus on natural language processing and computational linguistics. Passionate about educational technology and making research accessible."
                                    className="min-h-[120px]"
                                />
                                <p className="text-sm text-muted-foreground">This will be displayed on your public profile.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-5">
                            <Button variant="outline">Cancel</Button>
                            <Button>Save Profile</Button>
                        </CardFooter>
                    </Card>

                    {/* Academic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Information</CardTitle>
                            <CardDescription>Your university affiliation and research details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Institution</Label>
                                    <Popover open={institutionOpen} onOpenChange={setInstitutionOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={institutionOpen}
                                                className="w-full justify-between"
                                            >
                                                {institutions.find(i => i.value === institution)?.label || "Select institution..."}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                                >
                                                    <path d="m6 9 6 6 6-6" />
                                                </svg>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search institutions..." />
                                                <CommandEmpty>No institution found.</CommandEmpty>
                                                <CommandGroup>
                                                    {institutions.map((inst) => (
                                                        <CommandItem
                                                            key={inst.value}
                                                            value={inst.value}
                                                            onSelect={(currentValue: string) => {
                                                                setInstitution(currentValue)
                                                                setInstitutionOpen(false)
                                                            }}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className={`mr-2 h-4 w-4 ${institution === inst.value ? "opacity-100" : "opacity-0"
                                                                    }`}
                                                            >
                                                                <path d="M20 6 9 17l-5-5" />
                                                            </svg>
                                                            {inst.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>Research Field</Label>
                                    <Popover open={researchFieldOpen} onOpenChange={setResearchFieldOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={researchFieldOpen}
                                                className="w-full justify-between"
                                            >
                                                {researchFields.find(f => f.value === researchField)?.label || "Select field..."}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                                >
                                                    <path d="m6 9 6 6 6-6" />
                                                </svg>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search fields..." />
                                                <CommandEmpty>No field found.</CommandEmpty>
                                                <CommandGroup>
                                                    {researchFields.map((field) => (
                                                        <CommandItem
                                                            key={field.value}
                                                            value={field.value}
                                                            onSelect={(currentValue: string) => {
                                                                setResearchField(currentValue)
                                                                setResearchFieldOpen(false)
                                                            }}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className={`mr-2 h-4 w-4 ${researchField === field.value ? "opacity-100" : "opacity-0"
                                                                    }`}
                                                            >
                                                                <path d="M20 6 9 17l-5-5" />
                                                            </svg>
                                                            {field.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input id="department" defaultValue="Computer Science" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Academic Role</Label>
                                    <Select defaultValue="professor">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="phd">PhD Candidate</SelectItem>
                                            <SelectItem value="researcher">Researcher</SelectItem>
                                            <SelectItem value="professor">Professor</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-5 flex justify-between">
                            <Button variant="outline">Cancel</Button>
                            <Button>Save Academic Info</Button>
                        </CardFooter>
                    </Card>

                    {/* Social Profiles */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Social & Professional Profiles</CardTitle>
                            <CardDescription>Link your professional and social accounts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                        <div>
                                            <p className="text-sm font-medium">LinkedIn</p>
                                            <p className="text-xs text-muted-foreground">Connect your professional network</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Connect</Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                                        <div>
                                            <p className="text-sm font-medium">GitHub</p>
                                            <p className="text-xs text-muted-foreground">Link your GitHub account</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="text-green-600 bg-green-50">Connected</Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><circle cx="17.5" cy="6.5" r="1.5"></circle></svg>
                                        <div>
                                            <p className="text-sm font-medium">Instagram</p>
                                            <p className="text-xs text-muted-foreground">Share your research visually</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Connect</Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        <div>
                                            <p className="text-sm font-medium">Google Scholar</p>
                                            <p className="text-xs text-muted-foreground">Sync your publications</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Connect</Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                                        <div>
                                            <p className="text-sm font-medium">Twitter / X</p>
                                            <p className="text-xs text-muted-foreground">Connect for academic discussions</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Connect</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Password Tab */}
                <TabsContent value="password" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your account password securely</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" />
                            </div>

                            <div className="pt-2">
                                <p className="text-sm font-medium mb-2">Password Requirements:</p>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><path d="M20 6 9 17l-5-5" /></svg>
                                        At least 10 characters
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><path d="M20 6 9 17l-5-5" /></svg>
                                        At least one uppercase letter
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><path d="M20 6 9 17l-5-5" /></svg>
                                        At least one number
                                    </li>
                                    <li className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><path d="M20 6 9 17l-5-5" /></svg>
                                        At least one special character
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-5">
                            <Button>Update Password</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Two-Factor Authentication</CardTitle>
                            <CardDescription>Add an extra layer of security to your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Two-Factor Authentication</p>
                                    <p className="text-sm text-muted-foreground">Protect your account with 2FA security.</p>
                                </div>
                                <Switch defaultChecked={true} />
                            </div>
                            <Separator />
                            <div>
                                <p className="font-medium mb-2">Recovery Methods</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <p className="text-sm">Email to j*****e@research.edu</p>
                                        </div>
                                        <Button variant="ghost" size="sm">Change</Button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Key className="h-4 w-4" />
                                            <p className="text-sm">Recovery keys</p>
                                        </div>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-5">
                            <Button variant="outline">Update Recovery Methods</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Control how we communicate with you</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="text-sm font-medium mb-3">Email Notifications</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-research">Research Updates</Label>
                                            <p className="text-sm text-muted-foreground">Receive notifications about related research in your field</p>
                                        </div>
                                        <Switch id="email-research" defaultChecked={true} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-collab">Collaboration Requests</Label>
                                            <p className="text-sm text-muted-foreground">Get notified when someone invites you to collaborate</p>
                                        </div>
                                        <Switch id="email-collab" defaultChecked={true} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-mentions">Mentions & Comments</Label>
                                            <p className="text-sm text-muted-foreground">Receive notifications when you're mentioned or your work is commented on</p>
                                        </div>
                                        <Switch id="email-mentions" defaultChecked={true} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-newsletter">Newsletter & Updates</Label>
                                            <p className="text-sm text-muted-foreground">Receive our monthly newsletter and product updates</p>
                                        </div>
                                        <Switch id="email-newsletter" defaultChecked={false} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-3">Platform Notifications</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="push-all">Push Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                                        </div>
                                        <Switch id="push-all" defaultChecked={true} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="desktop">Desktop Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Show notifications in your browser</p>
                                        </div>
                                        <Switch id="desktop" defaultChecked={true} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-5">
                            <Button>Save Notification Settings</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>Manage your account security preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="text-sm font-medium mb-3">Login Security</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Session Timeout</Label>
                                            <p className="text-sm text-muted-foreground">Automatically log out after a period of inactivity</p>
                                        </div>
                                        <Select defaultValue="30">
                                            <SelectTrigger className="w-36">
                                                <SelectValue placeholder="Select timeout" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 minutes</SelectItem>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="60">1 hour</SelectItem>
                                                <SelectItem value="120">2 hours</SelectItem>
                                                <SelectItem value="never">Never</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="login-alert">Login Alerts</Label>
                                            <p className="text-sm text-muted-foreground">Get notified about new login attempts</p>
                                        </div>
                                        <Switch id="login-alert" defaultChecked={true} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="trusted-devices">Trusted Devices</Label>
                                            <p className="text-sm text-muted-foreground">Manage devices that can access your account</p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Manage
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m9 18 6-6-6-6" /></svg>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Important Security Notice</AlertTitle>
                                <AlertDescription>
                                    For your security, we recommend enabling two-factor authentication on your account.
                                </AlertDescription>
                            </Alert>

                            <div>
                                <h4 className="text-sm font-medium mb-3">Access Management</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>API Key Access</Label>
                                            <p className="text-sm text-muted-foreground">Manage API keys for programmatic access</p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Manage Keys
                                        </Button>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>App Authorizations</Label>
                                            <p className="text-sm text-muted-foreground">Manage third-party applications with access to your account</p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            View Apps
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Delete Account</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            and remove all your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive text-destructive-foreground">
                                            Delete Account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Plan</CardTitle>
                            <CardDescription>Manage your subscription and billing information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-lg border p-4 bg-muted/20">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Badge className="bg-primary/20 text-primary hover:bg-primary/20 mb-2">Current Plan</Badge>
                                        <h3 className="text-lg font-semibold">Research Pro</h3>
                                        <p className="text-muted-foreground text-sm mt-1">
                                            $29.99/month • Renews on April 15, 2025
                                        </p>
                                        <ul className="mt-3 space-y-1 text-sm">
                                            <li className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6 9 17l-5-5" /></svg>
                                                Unlimited projects and collaborators
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6 9 17l-5-5" /></svg>
                                                50GB storage for research data
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6 9 17l-5-5" /></svg>
                                                Advanced analytics and visualizations
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6 9 17l-5-5" /></svg>
                                                Publication-ready exports
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Button variant="outline" size="sm">Change Plan</Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                            Cancel Subscription
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-3">Payment Method</h4>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted rounded p-1 w-12 h-8 flex items-center justify-center">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">•••• •••• •••• 4242</p>
                                            <p className="text-sm text-muted-foreground">Expires 09/2026</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-3">Billing History</h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="grid grid-cols-4 gap-4 p-3 bg-muted/30 text-sm font-medium">
                                        <div>Date</div>
                                        <div>Description</div>
                                        <div>Amount</div>
                                        <div className="text-right">Invoice</div>
                                    </div>
                                    <div className="divide-y">
                                        <div className="grid grid-cols-4 gap-4 p-3 text-sm items-center">
                                            <div>Mar 15, 2025</div>
                                            <div>Research Pro - Monthly</div>
                                            <div>$29.99</div>
                                            <div className="text-right">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Clipboard className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 p-3 text-sm items-center">
                                            <div>Feb 15, 2025</div>
                                            <div>Research Pro - Monthly</div>
                                            <div>$29.99</div>
                                            <div className="text-right">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Clipboard className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 p-3 text-sm items-center">
                                            <div>Jan 15, 2025</div>
                                            <div>Research Pro - Monthly</div>
                                            <div>$29.99</div>
                                            <div className="text-right">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Clipboard className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Research Tab */}
                <TabsContent value="research" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Research Projects</CardTitle>
                            <CardDescription>Manage your ongoing and past research projects</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-lg border overflow-hidden">
                                <div className="p-4 bg-primary/5 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Active Research Projects</h4>
                                        <p className="text-sm text-muted-foreground">Projects you're currently working on</p>
                                    </div>
                                    <Button size="sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                        New Project
                                    </Button>
                                </div>
                                <div className="divide-y">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-medium">AI-Powered Educational Content Analysis</h5>
                                                <p className="text-sm text-muted-foreground mt-1">Analyzing educational materials using NLP to assess complexity and accessibility</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge>In Progress</Badge>
                                                    <p className="text-xs text-muted-foreground">Started: Jan 2025</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                Manage
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m9 18 6-6-6-6" /></svg>
                                            </Button>
                                        </div>
                                        <div className="mt-3 flex items-center gap-1">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs">JD</AvatarFallback>
                                            </Avatar>
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs">AS</AvatarFallback>
                                            </Avatar>
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs">RK</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-muted-foreground ml-1">+2 collaborators</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-medium">Student Performance Prediction Model</h5>
                                                <p className="text-sm text-muted-foreground mt-1">ML model to predict student outcomes based on engagement metrics</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge>In Progress</Badge>
                                                    <p className="text-xs text-muted-foreground">Started: Feb 2025</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                Manage
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m9 18 6-6-6-6" /></svg>
                                            </Button>
                                        </div>
                                        <div className="mt-3 flex items-center gap-1">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs">JD</AvatarFallback>
                                            </Avatar>
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs">LM</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-muted-foreground ml-1">+1 collaborator</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border overflow-hidden">
                                <div className="p-4 bg-muted/30 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Past Research Projects</h4>
                                        <p className="text-sm text-muted-foreground">Completed research projects</p>
                                    </div>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </div>
                                <div className="divide-y">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-medium">Personalized Learning Pathways</h5>
                                                <p className="text-sm text-muted-foreground mt-1">Study on adaptive learning systems for K-12 education</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline">Completed</Badge>
                                                    <p className="text-xs text-muted-foreground">Dec 2023 - Nov 2024</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                View
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m9 18 6-6-6-6" /></svg>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Research Data Storage</Label>
                                <div className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="font-medium">Storage Usage</p>
                                            <p className="text-sm text-muted-foreground">32.4 GB used of 50 GB</p>
                                        </div>
                                        <Button variant="outline" size="sm">Upgrade Storage</Button>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Research Tools & Integrations</CardTitle>
                            <CardDescription>Connect your favorite research and academic tools</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-lg border overflow-hidden">
                                <div className="p-4 bg-primary/5">
                                    <h4 className="font-medium">Connected Tools</h4>
                                    <p className="text-sm text-muted-foreground">Services you've already connected</p>
                                </div>
                                <div className="divide-y">
                                    <div className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M4 1h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4l-4 4-4-4H4c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-medium">Mendeley</p>
                                                <p className="text-sm text-muted-foreground">Reference management</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Disconnect</Button>
                                    </div>
                                    <div className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-medium">Overleaf</p>
                                                <p className="text-sm text-muted-foreground">LaTeX collaboration</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Disconnect</Button>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border overflow-hidden">
                                <div className="p-4 bg-muted/30">
                                    <h4 className="font-medium">Available Integrations</h4>
                                    <p className="text-sm text-muted-foreground">Tools you can connect to enhance your research workflow</p>
                                </div>
                                <div className="divide-y">
                                    <div className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                <Book className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Zotero</p>
                                                <p className="text-sm text-muted-foreground">Reference management and sharing</p>
                                            </div>
                                        </div>
                                        <Button size="sm">Connect</Button>
                                    </div>
                                    <div className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-medium">Trello</p>
                                                <p className="text-sm text-muted-foreground">Project management</p>
                                            </div>
                                        </div>
                                        <Button size="sm">Connect</Button>
                                    </div>
                                    <div className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-medium">Google Drive</p>
                                                <p className="text-sm text-muted-foreground">Cloud storage</p>
                                            </div>
                                        </div>
                                        <Button size="sm">Connect</Button>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border p-4">
                                <h4 className="font-medium mb-2">API Access</h4>
                                <p className="text-sm text-muted-foreground mb-3">Generate an API key to integrate our platform with your custom tools</p>
                                <div className="flex items-center gap-2">
                                    <Input readOnly value="sk_research_2f9a8b3c7d1e5f6..." className="font-mono" />
                                    <Button variant="outline" size="sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7"></path><path d="m9 15 3-3 3 3"></path><path d="M13 12V5"></path></svg>
                                        Generate New
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Clipboard className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Treat your API key like a password. Never share it or store it in client-side code.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interface Preferences</CardTitle>
                            <CardDescription>Customize your experience with the platform</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-2">
                                        <Moon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Dark Mode</p>
                                            <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-2">
                                        <PersonStanding className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Accessibility Mode</p>
                                            <p className="text-xs text-muted-foreground">Enable high contrast and screen reader optimizations</p>
                                        </div>
                                    </div>
                                    <Switch />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-2">
                                        <LineChart className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Auto-generate Data Visualizations</p>
                                            <p className="text-xs text-muted-foreground">Automatically visualize uploaded research data</p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>

                            <div>
                                <Label>Default Dashboard View</Label>
                                <Select defaultValue="research">
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select default view" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="overview">Overview</SelectItem>
                                        <SelectItem value="research">Research Projects</SelectItem>
                                        <SelectItem value="publications">Publications</SelectItem>
                                        <SelectItem value="analytics">Analytics</SelectItem>
                                        <SelectItem value="collaborations">Collaborations</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="citation-style">Default Citation Style</Label>
                                <Select defaultValue="apa">
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select citation style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="apa">APA (7th Edition)</SelectItem>
                                        <SelectItem value="mla">MLA (8th Edition)</SelectItem>
                                        <SelectItem value="chicago">Chicago</SelectItem>
                                        <SelectItem value="harvard">Harvard</SelectItem>
                                        <SelectItem value="ieee">IEEE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Data Display Preferences</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="charts" defaultChecked />
                                        <label
                                            htmlFor="charts"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Show interactive charts by default
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="tables" defaultChecked />
                                        <label
                                            htmlFor="tables"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Show data tables with charts
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="summaries" defaultChecked />
                                        <label
                                            htmlFor="summaries"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Auto-generate data summaries
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-5">
                            <Button>Save Preferences</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Collaboration Preferences</CardTitle>
                            <CardDescription>Set your default collaboration settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label>Default Sharing Permissions</Label>
                                <Select defaultValue="view">
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select permission" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="view">View Only</SelectItem>
                                        <SelectItem value="comment">Comment</SelectItem>
                                        <SelectItem value="edit">Edit</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-2">This will be the default permission when sharing research projects</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Collaboration Notifications</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="new-collaborator" defaultChecked />
                                        <label
                                            htmlFor="new-collaborator"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Notify when someone joins a project
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="project-edit" defaultChecked />
                                        <label
                                            htmlFor="project-edit"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Notify when a collaborator edits shared content
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="project-comment" defaultChecked />
                                        <label
                                            htmlFor="project-comment"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Notify on new comments
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-5">
                            <Button>Save Collaboration Settings</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >)
}

export default SettingsComponent;