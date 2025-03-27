import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useRef } from 'react'

import {
    Layout,
    Model,
    TabNode,
    Actions,
} from '@app/layout'

import { Button } from '@app/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@app/ui/components/card'
import { Input } from '@app/ui/components/input'

import { LayoutDashboard, Settings, MessageSquare } from 'lucide-react'

export const Route = createFileRoute('/(app)/layout')({
    component: LayoutDemoComponent,
})

const initialJson = {
    global: {},
    borders: [],
    layout: {
        type: 'row',
        weight: 100,
        children: [
            {
                type: 'tabset',
                id: 'ts1',
                weight: 50,
                selected: 0,
                children: [
                    {
                        type: 'tab',
                        id: 'tab1',
                        name: 'Dashboard',
                        component: 'dashboard',
                        icon: 'LayoutDashboard',
                    },
                    {
                        type: 'tab',
                        id: 'tab3',
                        name: 'Messages',
                        component: 'messages',
                        icon: 'MessageSquare',
                    },
                ],
            },
            {
                type: 'tabset',
                id: 'ts2',
                weight: 50,
                selected: 0,
                children: [
                    {
                        type: 'tab',
                        id: 'tab2',
                        name: 'Settings',
                        component: 'settings',
                        icon: 'Settings',
                    },
                ],
            },
        ],
    },
}

function factory(node: TabNode): React.ReactNode {
    const component = node.getComponent()
    const tabId = node.getId()

    const IconComponent = ({ name }: { name?: string }) => {
        if (name === 'LayoutDashboard') return <LayoutDashboard className="h-4 w-4 mr-2" />
        if (name === 'Settings') return <Settings className="h-4 w-4 mr-2" />
        if (name === 'MessageSquare') return <MessageSquare className="h-4 w-4 mr-2" />
        return null
    }

    if (component === 'dashboard') {
        return (
            <div className="p-4 h-full w-full box-border overflow-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <IconComponent name={node.getIcon()} />
                            {node.getName()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Welcome to the dashboard content area!</p>
                        <p className="mt-2 text-sm text-muted-foreground">Tab ID: {tabId}</p>
                        <Button className="mt-4">Dashboard Action</Button>
                    </CardContent>
                </Card>
            </div>
        )
    } else if (component === 'settings') {
        return (
            <div className="p-4 h-full w-full box-border overflow-auto space-y-4">
                <h2 className="text-xl font-semibold flex items-center">
                    <IconComponent name={node.getIcon()} />
                    {node.getName()}
                </h2>
                <p className="text-sm text-muted-foreground">Configure your settings here.</p>
                <div className="space-y-2">
                    <label htmlFor="setting1" className="text-sm font-medium">Setting 1</label>
                    <Input id="setting1" placeholder="Enter value for setting 1" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="setting2" className="text-sm font-medium">Setting 2</label>
                    <Input id="setting2" placeholder="Enter value for setting 2" />
                </div>
                <Button variant="secondary">Save Settings</Button>
            </div>
        )
    } else if (component === 'messages') {
        return (
            <div className="p-4 h-full w-full box-border overflow-auto">
                <h2 className="text-xl font-semibold flex items-center mb-4">
                    <IconComponent name={node.getIcon()} />
                    {node.getName()}
                </h2>
                {[1, 2, 3, 4, 5].map(i => (
                    <Card key={i} className="mb-3">
                        <CardContent className="p-3">
                            <p className="text-sm">Message {i}: Lorem ipsum dolor sit amet...</p>
                            <p className="text-xs text-muted-foreground mt-1">Received: Just now</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="p-4">
            <p>Unknown component type: {component}</p>
            <p>Tab ID: {tabId}</p>
        </div>
    )
}

function LayoutDemoComponent() {
    const initialModel = useMemo(() => Model.fromJson(initialJson), [])
    const [model] = useState<Model>(initialModel)
    const layoutRef = useRef<Layout>(null)

    return (
        <div className="flex flex-col h-full w-full p-1">
            <div className="flex-grow relative rounded-md overflow-hidden bg-card h-screen">
                <Layout
                    ref={layoutRef}
                    model={model}
                    factory={factory}
                />
            </div>
        </div>
    )
}