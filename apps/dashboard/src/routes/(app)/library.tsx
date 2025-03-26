import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useMemo, useCallback } from 'react';
import {
    Book, List, Grid, Search, Filter, Plus, FileText, Globe, Code, Star,
    Clock, MoreHorizontal, Download, Share2, CheckCircle2,
    X, Tag, Library as ShelfIcon, Pencil, Highlighter, Trash2, Info, Eye, ArrowUpDown,
    Folder as FolderIcon
} from 'lucide-react';

import { Button } from "@app/ui/components/button";
import { Input } from "@app/ui/components/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@app/ui/components/select";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@app/ui/components/card";
import { Badge } from "@app/ui/components/badge";
import { Progress } from "@app/ui/components/progress";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@app/ui/components/table";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@app/ui/components/popover";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger,
    DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuCheckboxItem
} from "@app/ui/components/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@app/ui/components/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@app/ui/components/alert-dialog";
import { Checkbox } from "@app/ui/components/checkbox";
import { ScrollArea } from "@app/ui/components/scroll-area";
import { Separator } from "@app/ui/components/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@app/ui/components/tooltip";

// --- Data Types ---
type ResourceType = 'pdf' | 'epub' | 'web' | 'snippet';

interface LibraryItem {
    id: string;
    title: string;
    author: string;
    type: ResourceType;
    tags: string[];
    dateAdded: string; // ISO Date string ideally, e.g., "2024-03-27T10:00:00Z"
    lastOpened: string; // ISO Date string ideally
    progress: number; // 0-100
    favorite: boolean;
    category?: string;
    cover?: string; // URL for pdf/epub cover
    url?: string; // URL for web type
    shelf: string; // Represents the primary folder/shelf
    annotations: number;
    highlights: number;
    notes: number;
    description?: string; // Added for more detail
    publisher?: string; // Added for more detail
    year?: number; // Added for more detail
}

// --- Sample Data (Use your actual data fetching logic) ---
const SAMPLE_LIBRARY_ITEMS: LibraryItem[] = [
    // ... (Keep your existing sample data, ensuring it matches the LibraryItem interface)
    // Example update for one item:
    {
        id: '1',
        title: 'Machine Learning: A Probabilistic Perspective',
        author: 'Kevin P. Murphy',
        type: 'pdf',
        tags: ['Machine Learning', 'Statistics', 'Computer Science', 'AI'],
        dateAdded: '2024-02-15T10:00:00Z',
        lastOpened: '2024-03-20T14:30:00Z',
        progress: 67,
        favorite: true,
        category: 'Textbook',
        // cover: 'https://via.placeholder.com/150x220/3498db/FFFFFF?text=ML',
        annotations: 24,
        highlights: 36,
        notes: 8,
        shelf: 'Computer Science',
        description: 'A comprehensive introduction to machine learning from a probabilistic perspective.',
        publisher: 'MIT Press',
        year: 2012
    },
    {
        id: '2',
        title: 'The Design of Everyday Things',
        author: 'Don Norman',
        type: 'epub',
        tags: ['Design', 'UX', 'Psychology', 'Usability'],
        dateAdded: '2024-01-10T09:00:00Z',
        lastOpened: '2024-03-25T11:00:00Z',
        progress: 91,
        favorite: false,
        category: 'Design',
        // cover: 'https://via.placeholder.com/150x220/e74c3c/FFFFFF?text=Design',
        annotations: 15,
        highlights: 22,
        notes: 5,
        shelf: 'Design Resources',
        description: 'Explores the principles of human-centered design and usability.',
        publisher: 'Basic Books',
        year: 2013 // Revised edition year
    },
    {
        id: '3',
        title: 'Research Methods in Education',
        author: 'Louis Cohen, Lawrence Manion, Keith Morrison',
        type: 'pdf',
        tags: ['Education', 'Research', 'Methodology'],
        dateAdded: '2024-03-01T12:00:00Z',
        lastOpened: '2024-03-25T09:15:00Z',
        progress: 23,
        favorite: true,
        category: 'Reference',
        // cover: 'https://via.placeholder.com/150x220/2ecc71/FFFFFF?text=Research',
        annotations: 8,
        highlights: 14,
        notes: 3,
        shelf: 'Education Studies',
        description: 'A standard text for students and researchers in education.',
        publisher: 'Routledge',
        year: 2017 // 8th Edition
    },
    {
        id: '5',
        title: 'Deep Learning Trends in 2024',
        author: 'AI Research Blog',
        type: 'web',
        url: 'https://example.com/ai-trends-2024',
        tags: ['AI', 'Deep Learning', 'Trends', 'Blog Post'],
        dateAdded: '2024-03-15T16:00:00Z',
        lastOpened: '2024-03-26T10:00:00Z',
        progress: 100, // Assume read if it's a blog post? Or track scroll?
        favorite: false,
        category: 'Article',
        // No cover for web, icon will be used
        annotations: 3,
        highlights: 7,
        notes: 1,
        shelf: 'AI Articles',
        description: 'An overview of the latest trends and advancements in deep learning.'
    },
    {
        id: '8',
        title: 'Python List Comprehensions',
        author: 'Code Snippets',
        type: 'snippet',
        tags: ['Python', 'Code', 'List Comprehension'],
        dateAdded: '2024-03-12T08:30:00Z',
        lastOpened: '2024-03-24T17:00:00Z',
        progress: 100, // Snippets are usually small
        favorite: true,
        category: 'Code Snippets',
        // No cover for snippet, icon will be used
        annotations: 1,
        highlights: 0, // Might not highlight code snippets often
        notes: 2,
        shelf: 'Python Cheatsheets',
        description: 'Quick examples of using list comprehensions in Python.'
    }
    // ... Add more diverse items
];

// --- Constants (Derived from data or predefined) ---
const ALL_TYPES: Array<'All' | ResourceType> = ['All', 'pdf', 'epub', 'web', 'snippet'];
type SortOption = 'title' | 'author' | 'dateAdded' | 'lastOpened' | 'progress';
type SortDirection = 'asc' | 'desc';

// --- Helper Functions ---
const getFileIcon = (type: ResourceType): React.ReactNode => {
    switch (type) {
        case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
        case 'epub': return <Book className="h-5 w-5 text-blue-500" />;
        case 'web': return <Globe className="h-5 w-5 text-green-500" />;
        case 'snippet': return <Code className="h-5 w-5 text-purple-500" />;
        default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
};

const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

// --- Reusable Components ---

interface ItemActionsProps {
    item: LibraryItem;
    onToggleFavorite: (id: string) => void;
    onDelete: (id: string) => void;
    availableShelves: string[];
    availableTags: string[];
    onAddToShelf: (itemId: string, shelf: string) => void; // Placeholder
    onAddToTag: (itemId: string, tag: string) => void; // Placeholder
    onRemoveTag: (itemId: string, tag: string) => void; // Placeholder
}

const ItemActions: React.FC<ItemActionsProps> = ({
    item, onToggleFavorite, onDelete, availableShelves, availableTags,
    onAddToShelf, onAddToTag, onRemoveTag
}) => {
    // Placeholder actions - replace with your actual logic
    const handleOpen = () => {
        console.log("Opening item:", item.id);
        // Example navigation: navigate({ to: `/library/${item.id}` });
    };
    const handleDownload = () => console.log("Download item:", item.id);
    const handleShare = () => console.log("Share item:", item.id);

    return (
        <Dialog>
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={handleOpen}>
                            <Eye className="mr-2 h-4 w-4" /> Open
                        </DropdownMenuItem>
                        <DialogTrigger asChild>
                            <DropdownMenuItem>
                                <Info className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem onClick={() => onToggleFavorite(item.id)}>
                            <Star className={`mr-2 h-4 w-4 ${item.favorite ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                            {item.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <ShelfIcon className="mr-2 h-4 w-4" /> Move to Shelf
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <ScrollArea className="h-[200px]">
                                        {availableShelves.map(shelf => (
                                            <DropdownMenuCheckboxItem
                                                key={shelf}
                                                checked={item.shelf === shelf}
                                                onCheckedChange={() => onAddToShelf(item.id, shelf)}
                                            >
                                                {shelf}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </ScrollArea>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Tag className="mr-2 h-4 w-4" /> Manage Tags
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <ScrollArea className="h-[200px]">
                                        {availableTags.map(tag => (
                                            <DropdownMenuCheckboxItem
                                                key={tag}
                                                checked={item.tags.includes(tag)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        onAddToTag(item.id, tag);
                                                    } else {
                                                        onRemoveTag(item.id, tag);
                                                    }
                                                }}
                                            >
                                                {tag}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </ScrollArea>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDownload} disabled={item.type === 'web' || item.type === 'snippet'}>
                            <Download className="mr-2 h-4 w-4" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShare}>
                            <Share2 className="mr-2 h-4 w-4" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem variant='destructive'>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Resource
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Item Details Dialog Content */}
                <ItemDetailsDialog item={item} />

                {/* Delete Confirmation Dialog Content */}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            "{item.title}" and all associated annotations and notes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => onDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Yes, delete it
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
};

interface ItemDetailsDialogProps {
    item: LibraryItem;
}
const ItemDetailsDialog: React.FC<ItemDetailsDialogProps> = ({ item }) => (
    <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                {getFileIcon(item.type)} {item.title}
            </DialogTitle>
            <DialogDescription>
                By {item.author} {item.year ? `(${item.year})` : ''}
                {item.publisher ? ` - ${item.publisher}` : ''}
            </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="font-medium text-muted-foreground">Category:</div>
                <div>{item.category || 'N/A'}</div>

                <div className="font-medium text-muted-foreground">Shelf:</div>
                <div>{item.shelf || 'Uncategorized'}</div>

                <div className="font-medium text-muted-foreground">Date Added:</div>
                <div>{formatDate(item.dateAdded)}</div>

                <div className="font-medium text-muted-foreground">Last Opened:</div>
                <div>{formatDate(item.lastOpened)}</div>

                <div className="font-medium text-muted-foreground">Progress:</div>
                <div className="flex items-center gap-2">
                    <Progress value={item.progress} className="h-2 w-24" />
                    <span>{item.progress}%</span>
                </div>

                <div className="font-medium text-muted-foreground">Annotations:</div>
                <div>{item.annotations}</div>

                <div className="font-medium text-muted-foreground">Highlights:</div>
                <div>{item.highlights}</div>

                <div className="font-medium text-muted-foreground">Notes:</div>
                <div>{item.notes}</div>
            </div>
            {item.tags.length > 0 && (
                <>
                    <Separator />
                    <div>
                        <div className="font-medium text-muted-foreground mb-2">Tags:</div>
                        <div className="flex flex-wrap gap-2">
                            {item.tags.map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                </>
            )}
            {item.url && item.type === 'web' && (
                <>
                    <Separator />
                    <div>
                        <div className="font-medium text-muted-foreground mb-1">URL:</div>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                            {item.url}
                        </a>
                    </div>
                </>
            )}
        </div>
        <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => { /* Add close logic if needed, Shadcn Dialog closes by default */ }}>
                Close
            </Button>
            {/* Could add an Edit button here */}
        </DialogFooter>
    </DialogContent>
);

interface LibraryCardProps extends ItemActionsProps {
    item: LibraryItem;
}

const LibraryCard: React.FC<LibraryCardProps> = ({ item, ...actionProps }) => (
    <Card className="flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-lg pt-0 pb-5">
        <CardHeader className="p-0 relative">
            {item.cover ? (
                <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-48 object-cover" // Increased height
                />
            ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <div className="scale-[2]">{getFileIcon(item.type)}</div> {/* Make icon larger */}
                </div>
            )}
            {/* Favorite button positioned top-right */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => actionProps.onToggleFavorite(item.id)}
                className="absolute top-2 left-2 h-8 w-8 bg-background/70 hover:bg-background rounded-full"
                aria-label={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                <Star className={`h-4 w-4 ${item.favorite ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground'}`} />
            </Button>
            <div
                className="absolute top-2 right-2 h-8 w-8 bg-background/70 hover:bg-background rounded-full"
            >
                <ItemActions item={item} {...actionProps} />
            </div>
        </CardHeader>
        <CardContent className="px-4 flex-grow flex flex-col justify-between">
            <div>
                <CardTitle className="text-base font-semibold leading-tight mb-1 line-clamp-2" title={item.title}>
                    {item.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mb-3 line-clamp-1" title={item.author}>
                    {item.author}
                </CardDescription>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">{tag}</Badge>
                    ))}
                    {item.tags.length > 3 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">+{item.tags.length - 3}</Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{item.tags.slice(3).join(', ')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {/* Annotations & Highlights */}
                <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground mb-3">
                    <div className='flex gap-2'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger className='flex items-center'>
                                    <Pencil className="h-3.5 w-3.5 mr-1" /> {item.annotations}
                                </TooltipTrigger>
                                <TooltipContent>{item.annotations} Annotations</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger className='flex items-center'>
                                    <Highlighter className="h-3.5 w-3.5 mr-1" /> {item.highlights}
                                </TooltipTrigger>
                                <TooltipContent>{item.highlights} Highlights</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className='flex items-center'>
                                <Clock className="h-3.5 w-3.5 mr-1" /> {formatDate(item.lastOpened)}
                            </TooltipTrigger>
                            <TooltipContent>Last Opened {formatDate(item.lastOpened)}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Progress */}
            <div className="">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-1.5" />
            </div>
        </CardContent>
    </Card >
);


interface LibraryListItemProps extends ItemActionsProps {
    item: LibraryItem;
    onSortChange: (option: SortOption) => void;
    currentSort: SortOption;
    sortDirection: SortDirection;
}

// Header Row Component (Optional but good for structure)
const LibraryListHeader: React.FC<Pick<LibraryListItemProps, 'onSortChange' | 'currentSort' | 'sortDirection'>> = ({ onSortChange, currentSort, sortDirection }) => {
    const SortableHeader: React.FC<{ children: React.ReactNode, sortKey: SortOption }> = ({ children, sortKey }) => (
        <TableHead className="px-4 py-3 whitespace-nowrap">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onSortChange(sortKey)}
                className="flex items-center gap-1 -ml-2 px-2"
            >
                {children}
                {currentSort === sortKey && (
                    <ArrowUpDown className={`h-3 w-3 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                )}
            </Button>
        </TableHead>
    );

    return (
        <TableHeader>
            <TableRow className="bg-muted/50">
                <SortableHeader sortKey="title">Title / Author</SortableHeader>
                <TableHead className="px-4 py-3">Type / Shelf</TableHead>
                <TableHead className="px-4 py-3">Tags</TableHead>
                <SortableHeader sortKey="progress">Progress</SortableHeader>
                <TableHead className="px-4 py-3 text-center">Ann. / High.</TableHead>
                <SortableHeader sortKey="lastOpened">Last Opened</SortableHeader>
                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
    );
};

const LibraryListItem: React.FC<Omit<LibraryListItemProps, 'onSortChange' | 'currentSort' | 'sortDirection'>> = ({ item, ...actionProps }) => (
    <TableRow key={item.id} className="hover:bg-muted/50 align-top">
        {/* Title / Author / Favorite */}
        <TableCell className="px-4 py-3 font-medium align-top">
            <div className="flex items-start gap-3 max-w-xs">
                {item.cover ? (
                    <img src={item.cover} alt={item.title} className="h-12 w-9 object-cover rounded flex-shrink-0 mt-0.5" />
                ) : (
                    <div className="h-12 w-9 flex items-center justify-center rounded bg-muted flex-shrink-0 mt-0.5">
                        <div className="scale-110">{getFileIcon(item.type)}</div>
                    </div>
                )}
                <div className="flex-grow">
                    <div className="flex items-start gap-1">
                        <span className="font-semibold text-sm line-clamp-2 leading-snug" title={item.title}>{item.title}</span>
                        {item.favorite && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    </TooltipTrigger>
                                    <TooltipContent>Favorite</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1" title={item.author}>{item.author}</p>
                </div>
            </div>
        </TableCell>

        {/* Type / Shelf */}
        <TableCell className="px-4 py-3 align-top text-xs">
            <div className="flex items-center gap-1.5 mb-1" title={`Type: ${item.type}`}>
                {getFileIcon(item.type)}
                <span className="uppercase">{item.type}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground" title={`Shelf: ${item.shelf}`}>
                <FolderIcon className="h-4 w-4" />
                <span>{item.shelf}</span>
            </div>
        </TableCell>

        {/* Tags */}
        <TableCell className="px-4 py-3 align-top max-w-[150px]">
            <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">{tag}</Badge>
                ))}
                {item.tags.length > 2 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">+{item.tags.length - 2}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{item.tags.slice(2).join(', ')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </TableCell>

        {/* Progress */}
        <TableCell className="px-4 py-3 align-top">
            <div className="flex items-center gap-2">
                <Progress value={item.progress} className="w-20 h-1.5" />
                <span className="text-xs text-muted-foreground">{item.progress}%</span>
            </div>
        </TableCell>

        {/* Annotations / Highlights */}
        <TableCell className="px-4 py-3 align-top text-center">
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-xs" title={`${item.annotations} Annotations`}>
                    <Pencil className="h-3 w-3 text-muted-foreground" /> {item.annotations}
                </div>
                <div className="flex items-center gap-1 text-xs mt-0.5" title={`${item.highlights} Highlights`}>
                    <Highlighter className="h-3 w-3 text-muted-foreground" /> {item.highlights}
                </div>
            </div>
        </TableCell>

        {/* Last Opened */}
        <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(item.lastOpened)}
        </TableCell>

        {/* Actions */}
        <TableCell className="px-4 py-3 text-right align-top">
            <ItemActions item={item} {...actionProps} />
        </TableCell>
    </TableRow>
);

// --- Main Library Page Component ---
const LibraryPage = () => {
    // State management
    const [items, setItems] = useState<LibraryItem[]>(SAMPLE_LIBRARY_ITEMS); // Use fetched data
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortOption, setSortOption] = useState<SortOption>('dateAdded');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedType, setSelectedType] = useState<string>('All');
    const [selectedShelf, setSelectedShelf] = useState<string>('All');
    const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState<boolean>(false);

    // Memoized derived constants
    const availableTags = useMemo(() => Array.from(new Set(items.flatMap(item => item.tags))).sort(), [items]);
    const availableShelves = useMemo(() => Array.from(new Set(items.map(item => item.shelf))).sort(), [items]);
    const availableCategories = useMemo(() => ['All', ...Array.from(new Set(items.map(item => item.category).filter(Boolean) as string[]))].sort(), [items]);


    // Filter and sort items
    const filteredItems = useMemo(() => {
        let result = [...items];

        // Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                item.author.toLowerCase().includes(lowerQuery) ||
                item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
                item.shelf.toLowerCase().includes(lowerQuery) ||
                (item.description && item.description.toLowerCase().includes(lowerQuery))
            );
        }

        // Filters
        if (selectedCategory !== 'All') result = result.filter(item => item.category === selectedCategory);
        if (selectedType !== 'All') result = result.filter(item => item.type === selectedType);
        if (selectedShelf !== 'All') result = result.filter(item => item.shelf === selectedShelf);
        if (selectedTags.length > 0) {
            result = result.filter(item => selectedTags.every(tag => item.tags.includes(tag)));
        }
        if (showOnlyFavorites) result = result.filter(item => item.favorite);

        // Sorting
        result.sort((a, b) => {
            let comparison = 0;
            const valA = a[sortOption];
            const valB = b[sortOption];

            if (sortOption === 'dateAdded' || sortOption === 'lastOpened') {
                // Handle potential invalid dates gracefully
                const dateA = new Date(valA as string).getTime();
                const dateB = new Date(valB as string).getTime();
                comparison = (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
            } else if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            }
            // Add more specific comparisons if needed (e.g., boolean)

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [items, searchQuery, sortOption, sortDirection, selectedTags, selectedCategory, selectedType, selectedShelf, showOnlyFavorites]);

    // --- Action Handlers ---

    const handleSortChange = useCallback((option: SortOption) => {
        if (option === sortOption) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortOption(option);
            setSortDirection('desc'); // Default to descending for new sort column
        }
    }, [sortOption]);

    const toggleTag = useCallback((tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    }, []);

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedTags([]);
        setSelectedCategory('All');
        setSelectedType('All');
        setSelectedShelf('All');
        setShowOnlyFavorites(false);
        // Optionally reset sort:
        // setSortOption('dateAdded');
        // setSortDirection('desc');
        setIsFilterPopoverOpen(false); // Close popover on clear
    }, []);

    const removeFilter = useCallback((type: 'tag' | 'category' | 'type' | 'shelf' | 'favorites', value?: string) => {
        switch (type) {
            case 'tag':
                if (value) setSelectedTags(prev => prev.filter(t => t !== value));
                break;
            case 'category':
                setSelectedCategory('All');
                break;
            case 'type':
                setSelectedType('All');
                break;
            case 'shelf':
                setSelectedShelf('All');
                break;
            case 'favorites':
                setShowOnlyFavorites(false);
                break;
        }
    }, []);

    const toggleFavorite = useCallback((id: string) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, favorite: !item.favorite } : item
            )
        );
        // TODO: Add API call to update favorite status on the backend
    }, []);

    const deleteItem = useCallback((id: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
        console.log("Deleted item:", id);
        // TODO: Add API call to delete the item on the backend
    }, []);

    // Placeholder functions for modifying items (replace with actual logic + API calls)
    const handleAddToShelf = useCallback((itemId: string, shelf: string) => {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, shelf: shelf } : item));
        console.log(`Moved item ${itemId} to shelf ${shelf}`);
        // API call here
    }, []);

    const handleAddToTag = useCallback((itemId: string, tag: string) => {
        setItems(prev => prev.map(item => item.id === itemId && !item.tags.includes(tag) ? { ...item, tags: [...item.tags, tag].sort() } : item));
        console.log(`Added tag ${tag} to item ${itemId}`);
        // API call here
    }, []);

    const handleRemoveTag = useCallback((itemId: string, tag: string) => {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, tags: item.tags.filter(t => t !== tag) } : item));
        console.log(`Removed tag ${tag} from item ${itemId}`);
        // API call here
    }, []);


    // --- Aggregate Stats ---
    const totalItems = items.length;
    const inProgressCount = useMemo(() => items.filter(item => item.progress > 0 && item.progress < 100).length, [items]);
    const completedCount = useMemo(() => items.filter(item => item.progress === 100).length, [items]);
    const favoriteCount = useMemo(() => items.filter(item => item.favorite).length, [items]);
    const activeFilterCount = useMemo(() =>
        selectedTags.length +
        (selectedCategory !== 'All' ? 1 : 0) +
        (selectedType !== 'All' ? 1 : 0) +
        (selectedShelf !== 'All' ? 1 : 0) +
        (showOnlyFavorites ? 1 : 0),
        [selectedTags, selectedCategory, selectedType, selectedShelf, showOnlyFavorites]
    );

    // --- Render Functions ---

    const renderActiveFilters = () => {
        const filters: Array<{ type: 'tag' | 'category' | 'type' | 'shelf' | 'favorites'; value: string; label: string }> = [];

        if (selectedCategory !== 'All') filters.push({ type: 'category', value: selectedCategory, label: `Category: ${selectedCategory}` });
        if (selectedType !== 'All') filters.push({ type: 'type', value: selectedType, label: `Type: ${selectedType}` });
        if (selectedShelf !== 'All') filters.push({ type: 'shelf', value: selectedShelf, label: `Shelf: ${selectedShelf}` });
        if (showOnlyFavorites) filters.push({ type: 'favorites', value: 'fav', label: 'Favorites Only' });
        selectedTags.forEach(tag => filters.push({ type: 'tag', value: tag, label: `Tag: ${tag}` }));

        if (filters.length === 0) return null;

        return (
            <div className="flex flex-wrap items-center gap-2 mb-4 px-1">
                <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
                {filters.map(filter => (
                    <Badge key={`${filter.type}-${filter.value}`} variant="secondary" className="flex items-center gap-1">
                        {filter.label}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 rounded-full ml-1"
                            onClick={() => removeFilter(filter.type, filter.value)}
                            aria-label={`Remove filter ${filter.label}`}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </Badge>
                ))}
                <Button variant="link" size="sm" onClick={clearFilters} className="px-1 h-auto text-xs">
                    Clear All
                </Button>
            </div>
        );
    };

    const renderFilterPopoverContent = () => (
        <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
                <h4 className="font-medium leading-none">Filters</h4>
            </div>
            <ScrollArea className="">
                <div className="p-2 space-y-4">
                    {/* Category Filter */}
                    <div className='flex gap-1'>
                        <div>
                            <label htmlFor="filter-category" className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger id="filter-category">
                                    <SelectValue placeholder="Select category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCategories.map(category => (
                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label htmlFor="filter-type" className="block text-sm font-medium text-muted-foreground mb-1">File Type</label>
                            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as 'All' | ResourceType)}>
                                <SelectTrigger id="filter-type">
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALL_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type === 'All' ? 'All Types' : type.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Shelf Filter */}
                        <div>
                            <label htmlFor="filter-shelf" className="block text-sm font-medium text-muted-foreground mb-1">Shelf</label>
                            <Select value={selectedShelf} onValueChange={setSelectedShelf}>
                                <SelectTrigger id="filter-shelf">
                                    <SelectValue placeholder="Select shelf..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Shelves</SelectItem>
                                    {availableShelves.map(shelf => (
                                        <SelectItem key={shelf} value={shelf}>{shelf}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tags Filter */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Tags</label>
                        <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                            {availableTags.map(tag => (
                                <div key={tag} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`tag-${tag}`}
                                        checked={selectedTags.includes(tag)}
                                        onCheckedChange={() => toggleTag(tag)}
                                    />
                                    <label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                                        {tag}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Favorites Filter */}
                    <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                            id="showFavorites"
                            checked={showOnlyFavorites}
                            onCheckedChange={(checked) => setShowOnlyFavorites(!!checked)}
                        />
                        <label htmlFor="showFavorites" className="text-sm text-muted-foreground cursor-pointer">
                            Show only favorites
                        </label>
                    </div>
                </div>
            </ScrollArea>
            <div className="p-4 border-t flex justify-between">
                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear Filters</Button>
                <Button size="sm" onClick={() => setIsFilterPopoverOpen(false)}>Apply</Button> {/* Apply is implicit, but good UX */}
            </div>
        </PopoverContent>
    );

    // --- Main Return ---
    return (
        <div className="space-y-6 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Library</h1>
                    <p className="text-muted-foreground mt-1">Your personal knowledge base.</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Resource
                    </Button>
                    {/* <Button variant="outline" className="flex items-center gap-2">
                        <FolderPlus className="h-4 w-4" /> New Shelf
                    </Button> */}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Resources</p>
                            <p className="text-2xl font-bold">{totalItems}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ShelfIcon className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">In Progress</p>
                            <p className="text-2xl font-bold">{inProgressCount}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600">
                            <Book className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold">{completedCount}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Favorites</p>
                            <p className="text-2xl font-bold">{favoriteCount}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                            <Star className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Controls Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                <div className="relative w-full md:flex-grow md:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search title, author, tag, shelf..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                    <Select value={sortOption} onValueChange={(value) => handleSortChange(value as SortOption)}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <span className="mr-1">Sort by:</span><SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="author">Author</SelectItem>
                            <SelectItem value="dateAdded">Date Added</SelectItem>
                            <SelectItem value="lastOpened">Last Opened</SelectItem>
                            <SelectItem value="progress">Progress</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* View Mode Toggle */}
                    <div className="flex items-center rounded-md border bg-background p-0.5">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        onClick={() => setViewMode('grid')}
                                        className="h-8 w-8"
                                        aria-label="Grid view"
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Grid View</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        onClick={() => setViewMode('list')}
                                        className="h-8 w-8"
                                        aria-label="List view"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>List View</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    {/* Filter Popover Trigger */}
                    <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant={activeFilterCount > 0 ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                                {activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="ml-1 rounded-full px-1.5">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        {renderFilterPopoverContent()}
                    </Popover>
                </div>
            </div>

            {/* Active Filters Display */}
            {renderActiveFilters()}

            {/* Main Content Area */}
            {filteredItems.length === 0 ? (
                <Card className="text-center py-16 bg-muted/30">
                    <CardContent>
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No resources found</h3>
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                            {searchQuery || activeFilterCount > 0
                                ? 'Try adjusting your search or filters.'
                                : 'Your library is empty. Add some resources to get started!'}
                        </p>
                        {(searchQuery || activeFilterCount > 0) && (
                            <Button variant="outline" onClick={clearFilters} className="mt-6">
                                Clear Search & Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                            {filteredItems.map((item) => (
                                <LibraryCard
                                    key={item.id}
                                    item={item}
                                    onToggleFavorite={toggleFavorite}
                                    onDelete={deleteItem}
                                    availableShelves={availableShelves}
                                    availableTags={availableTags}
                                    onAddToShelf={handleAddToShelf}
                                    onAddToTag={handleAddToTag}
                                    onRemoveTag={handleRemoveTag}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <LibraryListHeader
                                        onSortChange={handleSortChange}
                                        currentSort={sortOption}
                                        sortDirection={sortDirection}
                                    />
                                    <TableBody>
                                        {filteredItems.map((item) => (
                                            <LibraryListItem
                                                key={item.id}
                                                item={item}
                                                onToggleFavorite={toggleFavorite}
                                                onDelete={deleteItem}
                                                availableShelves={availableShelves}
                                                availableTags={availableTags}
                                                onAddToShelf={handleAddToShelf}
                                                onAddToTag={handleAddToTag}
                                                onRemoveTag={handleRemoveTag}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                    {/* Pagination and Count (Simplified) */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing <span className="font-medium">{filteredItems.length}</span> of{' '}
                            <span className="font-medium">{totalItems}</span> resources
                        </div>
                        {/* Add proper pagination controls if needed */}
                        {/* <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled>Previous</Button>
                            <span className="text-sm p-2">Page 1</span>
                            <Button variant="outline" size="sm">Next</Button>
                        </div> */}
                    </div>
                </>
            )}
        </div>
    );
};

// TanStack Router Route Definition
export const Route = createFileRoute('/(app)/library')({
    component: LibraryPage,
    // Add loaders here if fetching data
    // loader: async () => {
    //   const libraryData = await fetchLibraryData(); // Your API call
    //   return { items: libraryData };
    // }
});