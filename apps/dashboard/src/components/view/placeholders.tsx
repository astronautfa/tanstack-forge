import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@app/ui/components/card';
import { FileText, Book, HelpCircle, Folder as DefaultFolderIcon } from 'lucide-react';
import type { TabNode } from '@app/layout'; // Import TabNode type

interface PlaceholderProps {
    node: TabNode; // Receive the TabNode
}

const BasePlaceholder: React.FC<PlaceholderProps & { Icon: React.ElementType, typeLabel: string }> = ({ node, Icon, typeLabel }) => {
    const itemId = node.getConfig()?.itemId ?? node.getId(); // Get ID from config or node itself

    return (
        <div className="p-4 h-full w-full box-border overflow-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {node.getName()}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This is a placeholder for a <span className='font-semibold'>{typeLabel}</span>.</p>
                    <p className="mt-2 text-sm text-muted-foreground">Item ID: {itemId}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Component Type: {node.getComponent()}</p>
                    {/* Add more details or specific rendering later */}
                </CardContent>
            </Card>
        </div>
    );
};

export const DocumentPlaceholder: React.FC<PlaceholderProps> = (props) => (
    <BasePlaceholder {...props} Icon={FileText} typeLabel="Document" />
);

export const LibraryItemPlaceholder: React.FC<PlaceholderProps> = (props) => (
    <BasePlaceholder {...props} Icon={Book} typeLabel="Library Item" />
);

// Add more placeholders as needed (e.g., Dashboard, Settings)

export const UnknownPlaceholder: React.FC<PlaceholderProps> = (props) => (
    <BasePlaceholder {...props} Icon={HelpCircle} typeLabel={`Unknown (${props.node.getComponent()})`} />
);

export const FolderPlaceholder: React.FC<PlaceholderProps> = (props) => (
    <BasePlaceholder {...props} Icon={HelpCircle} typeLabel={`Unknown (${props.node.getComponent()})`} />
);
