import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
    Book,
    List,
    Grid,
    Search,
    Filter,
    Plus,
    FileText,
    Globe,
    Code,
    Star,
    Clock,
    MoreHorizontal,
    Download,
    Share2,
    CheckCircle2,
    FolderPlus,
    ChevronDown,
} from 'lucide-react';
import { Button } from "@app/ui/components/button";
import { Input } from "@app/ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@app/ui/components/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter
} from "@app/ui/components/card";
import { Badge } from "@app/ui/components/badge";
import { Progress } from "@app/ui/components/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@app/ui/components/table";

// Sample data - would come from your backend in a real app
const SAMPLE_LIBRARY_ITEMS = [
    {
        id: '1',
        title: 'Machine Learning: A Probabilistic Perspective',
        author: 'Kevin P. Murphy',
        type: 'pdf',
        tags: ['Machine Learning', 'Statistics', 'Computer Science'],
        dateAdded: '2024-02-15',
        lastOpened: '2024-03-20',
        progress: 67,
        favorite: true,
        category: 'Textbook',
        cover: 'https://via.placeholder.com/150x200/3498db/FFFFFF?text=ML',
        annotations: 24,
        highlights: 36,
        notes: 8,
        folder: 'Computer Science'
    },
    {
        id: '2',
        title: 'The Design of Everyday Things',
        author: 'Don Norman',
        type: 'epub',
        tags: ['Design', 'UX', 'Psychology'],
        dateAdded: '2024-01-10',
        lastOpened: '2024-03-15',
        progress: 91,
        favorite: false,
        category: 'Design',
        cover: 'https://via.placeholder.com/150x200/e74c3c/FFFFFF?text=Design',
        annotations: 15,
        highlights: 22,
        notes: 5,
        folder: 'Design Resources'
    },
    {
        id: '3',
        title: 'Research Methods in Education',
        author: 'Louis Cohen, Lawrence Manion, Keith Morrison',
        type: 'pdf',
        tags: ['Education', 'Research', 'Methodology'],
        dateAdded: '2024-03-01',
        lastOpened: '2024-03-25',
        progress: 23,
        favorite: true,
        category: 'Reference',
        cover: 'https://via.placeholder.com/150x200/2ecc71/FFFFFF?text=Research',
        annotations: 8,
        highlights: 14,
        notes: 3,
        folder: 'Education'
    },
    {
        id: '4',
        title: 'The Art of Computer Programming, Vol. 1',
        author: 'Donald E. Knuth',
        type: 'pdf',
        tags: ['Programming', 'Algorithms', 'Computer Science'],
        dateAdded: '2023-11-20',
        lastOpened: '2024-03-10',
        progress: 42,
        favorite: true,
        category: 'Textbook',
        cover: 'https://via.placeholder.com/150x200/9b59b6/FFFFFF?text=CS',
        annotations: 31,
        highlights: 47,
        notes: 15,
        folder: 'Computer Science'
    },
    {
        id: '5',
        title: 'Guide to Academic Research',
        author: 'Academic Resources Ltd',
        type: 'web',
        url: 'https://example.com/academic-research',
        tags: ['Research', 'Academic', 'Guides'],
        dateAdded: '2024-02-28',
        lastOpened: '2024-03-22',
        progress: 100,
        favorite: false,
        category: 'Guide',
        icon: 'Globe',
        annotations: 0,
        highlights: 5,
        notes: 2,
        folder: 'Research Guides'
    },
    {
        id: '6',
        title: 'Quantum Computing Fundamentals',
        author: 'Michael A. Nielsen, Isaac L. Chuang',
        type: 'epub',
        tags: ['Quantum Computing', 'Physics', 'Computer Science'],
        dateAdded: '2024-01-05',
        lastOpened: '2024-02-18',
        progress: 15,
        favorite: false,
        category: 'Textbook',
        cover: 'https://via.placeholder.com/150x200/f1c40f/FFFFFF?text=Quantum',
        annotations: 7,
        highlights: 12,
        notes: 4,
        folder: 'Physics'
    },
    {
        id: '7',
        title: 'Literary Analysis Techniques',
        author: 'Jane Miller',
        type: 'pdf',
        tags: ['Literature', 'Analysis', 'Humanities'],
        dateAdded: '2024-02-10',
        lastOpened: '2024-03-05',
        progress: 78,
        favorite: false,
        category: 'Guide',
        cover: 'https://via.placeholder.com/150x200/e67e22/FFFFFF?text=Literature',
        annotations: 19,
        highlights: 28,
        notes: 10,
        folder: 'Humanities'
    },
    {
        id: '8',
        title: 'Python Data Science Handbook Code Snippets',
        author: 'Jake VanderPlas',
        type: 'snippet',
        tags: ['Python', 'Data Science', 'Code'],
        dateAdded: '2024-03-12',
        lastOpened: '2024-03-24',
        progress: 85,
        favorite: true,
        category: 'Code Snippets',
        icon: 'Code',
        annotations: 5,
        highlights: 0,
        notes: 12,
        folder: 'Code Resources'
    }
];

// Categories, file types, tags, and folders remain unchanged
const CATEGORIES = ['All', 'Textbook', 'Reference', 'Guide', 'Article', 'Paper', 'Code Snippets', 'Design'];
const FILE_TYPES = ['All', 'pdf', 'epub', 'web', 'snippet'];
const ALL_TAGS = [
    'Machine Learning',
    'Statistics',
    'Computer Science',
    'Design',
    'UX',
    'Psychology',
    'Education',
    'Research',
    'Methodology',
    'Programming',
    'Algorithms',
    'Academic',
    'Guides',
    'Quantum Computing',
    'Physics',
    'Literature',
    'Analysis',
    'Humanities',
    'Python',
    'Data Science',
    'Code',
];
const FOLDERS = [
    'All',
    'Computer Science',
    'Design Resources',
    'Education',
    'Physics',
    'Humanities',
    'Research Guides',
    'Code Resources',
    'Uncategorized',
];

const LibraryPage = () => {
    // State management
    const [items, setItems] = useState(SAMPLE_LIBRARY_ITEMS);
    const [filteredItems, setFilteredItems] = useState(SAMPLE_LIBRARY_ITEMS);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('dateAdded');
    const [sortDirection, setSortDirection] = useState('desc');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedFolder, setSelectedFolder] = useState('All');
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

    // Filter and sort items
    useEffect(() => {
        let result = [...items];

        if (searchQuery) {
            result = result.filter(
                (item) =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.author.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') result = result.filter((item) => item.category === selectedCategory);
        if (selectedType !== 'All') result = result.filter((item) => item.type === selectedType);
        if (selectedFolder !== 'All') result = result.filter((item) => item.folder === selectedFolder);
        if (selectedTags.length > 0) {
            result = result.filter((item) => selectedTags.every((tag) => item.tags.includes(tag)));
        }
        if (showOnlyFavorites) result = result.filter((item) => item.favorite);

        result.sort((a, b) => {
            let comparison = 0;
            if (sortOption === 'title') comparison = a.title.localeCompare(b.title);
            else if (sortOption === 'author') comparison = a.author.localeCompare(b.author);
            else if (sortOption === 'dateAdded') comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
            else if (sortOption === 'lastOpened')
                comparison = new Date(a.lastOpened).getTime() - new Date(b.lastOpened).getTime();
            else if (sortOption === 'progress') comparison = a.progress - b.progress;
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        setFilteredItems(result);
    }, [items, searchQuery, sortOption, sortDirection, selectedTags, selectedCategory, selectedType, selectedFolder, showOnlyFavorites]);

    const toggleSortDirection = () => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    const toggleTag = (tag: string) =>
        setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]);
    const clearFilters = () => {
        setSearchQuery('');
        setSortOption('dateAdded');
        setSortDirection('desc');
        setSelectedTags([]);
        setSelectedCategory('All');
        setSelectedType('All');
        setSelectedFolder('All');
        setShowOnlyFavorites(false);
    };
    const toggleFavorite = (id: string) =>
        setItems(items.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item)));

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <FileText className="h-4 w-4" />;
            case 'epub':
                return <Book className="h-4 w-4" />;
            case 'web':
                return <Globe className="h-4 w-4" />;
            case 'snippet':
                return <Code className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const renderCardView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
                <Card key={item.id} className="flex flex-col hover:border-primary/50 hover:shadow-md transition-all">
                    <CardHeader className="p-4 border-b">
                        <div className="flex items-center gap-3">
                            {item.cover ? (
                                <img src={item.cover} alt={item.title} className="h-12 w-12 object-cover rounded" />
                            ) : (
                                <div className="h-12 w-12 flex items-center justify-center rounded bg-muted">{getFileIcon(item.type)}</div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="uppercase text-xs">
                                        {item.type}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleFavorite(item.id)}
                                        className="h-6 w-6"
                                    >
                                        <Star
                                            className={`h-4 w-4 ${item.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                        />
                                    </Button>
                                </div>
                                <h3 className="font-medium text-sm truncate">{item.title}</h3>
                                <p className="text-xs text-muted-foreground">{item.author}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-1">
                        <div className="flex items-center text-xs text-muted-foreground mb-2">
                            <Clock className="h-3 w-3 mr-1" />
                            Last opened: {item.lastOpened}
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-2" />
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button variant="link" size="sm" className="p-0 h-auto">
                            Open
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                    Title
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setSortOption('title');
                                            toggleSortDirection();
                                        }}
                                        className="h-6 w-6"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableHead>
                            <TableHead className="px-4 py-3">Author</TableHead>
                            <TableHead className="px-4 py-3">Type</TableHead>
                            <TableHead className="px-4 py-3">Progress</TableHead>
                            <TableHead className="px-4 py-3">Last Opened</TableHead>
                            <TableHead className="px-4 py-3">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/50">
                                <TableCell className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        {item.cover ? (
                                            <img src={item.cover} alt={item.title} className="h-10 w-10 object-cover rounded" />
                                        ) : (
                                            <div className="h-10 w-10 flex items-center justify-center rounded bg-muted">
                                                {getFileIcon(item.type)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <p className="font-medium text-sm truncate">{item.title}</p>
                                                {item.favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                                            </div>
                                            <div className="flex gap-1 mt-1">
                                                {item.tags.slice(0, 2).map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {item.tags.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{item.tags.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-4">
                                    <p className="text-sm">{item.author}</p>
                                    <p className="text-xs text-muted-foreground">{item.folder}</p>
                                </TableCell>
                                <TableCell className="px-4 py-4">
                                    <div className="flex items-center gap-1 text-xs uppercase">
                                        {getFileIcon(item.type)}
                                        {item.type}
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <Progress value={item.progress} className="w-24 h-2" />
                                        <span className="text-xs text-muted-foreground">{item.progress}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-4 text-sm text-muted-foreground">{item.lastOpened}</TableCell>
                                <TableCell className="px-4 py-4">
                                    <div className="flex gap-2">
                                        <Button variant="link" size="sm" className="p-0 h-auto">
                                            Open
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleFavorite(item.id)}
                                            className="h-6 w-6"
                                        >
                                            <Star
                                                className={`h-4 w-4 ${item.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                            />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    const renderFilterPanel = () => (
        <Card className={`${isFilterMenuOpen ? 'block' : 'hidden'} mt-4 mb-6`}>
            <CardHeader>
                <h3 className="font-medium">Advanced Filters</h3>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">File Type</label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FILE_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Folder</label>
                        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FOLDERS.map((folder) => (
                                    <SelectItem key={folder} value={folder}>
                                        {folder}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {ALL_TAGS.map((tag) => (
                            <Badge
                                key={tag}
                                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => toggleTag(tag)}
                            >
                                {tag}
                                {selectedTags.includes(tag) && <CheckCircle2 className="h-3 w-3 ml-1" />}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="showFavorites"
                        checked={showOnlyFavorites}
                        onChange={() => setShowOnlyFavorites(!showOnlyFavorites)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="showFavorites" className="text-sm text-muted-foreground">
                        Show only favorites
                    </label>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                </Button>
                <Button onClick={() => setIsFilterMenuOpen(false)}>Apply Filters</Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Library</h1>
                    <p className="text-muted-foreground mt-1">Manage all your books, articles, and resources in one place</p>
                </div>
                <div className="flex gap-2">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Resource
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <FolderPlus className="h-4 w-4" />
                        New Folder
                    </Button>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Resources</p>
                                <p className="text-2xl font-bold">{items.length}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Book className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold">
                                    {items.filter((item) => item.progress > 0 && item.progress < 100).length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                                <Book className="h-5 w-5 text-yellow-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold">{items.filter((item) => item.progress === 100).length}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Favorites</p>
                                <p className="text-2xl font-bold">{items.filter((item) => item.favorite).length}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                                <Star className="h-5 w-5 text-red-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by title, author, or content..."
                        value={searchQuery}
                        onChange={(e: any) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="title">Sort by Title</SelectItem>
                            <SelectItem value="author">Sort by Author</SelectItem>
                            <SelectItem value="dateAdded">Sort by Date Added</SelectItem>
                            <SelectItem value="lastOpened">Sort by Last Opened</SelectItem>
                            <SelectItem value="progress">Sort by Progress</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center rounded-md border bg-card">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                            className="h-9 w-9"
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('list')}
                            className="h-9 w-9"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        variant={isFilterMenuOpen || selectedTags.length > 0 || selectedCategory !== 'All' || selectedType !== 'All' || selectedFolder !== 'All' || showOnlyFavorites ? 'default' : 'outline'}
                        onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filter
                        {(selectedTags.length > 0 || selectedCategory !== 'All' || selectedType !== 'All' || selectedFolder !== 'All' || showOnlyFavorites) && (
                            <Badge variant="secondary" className="ml-1">
                                {selectedTags.length +
                                    (selectedCategory !== 'All' ? 1 : 0) +
                                    (selectedType !== 'All' ? 1 : 0) +
                                    (selectedFolder !== 'All' ? 1 : 0) +
                                    (showOnlyFavorites ? 1 : 0)}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>

            {renderFilterPanel()}

            {filteredItems.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No resources found</h3>
                        <p className="text-muted-foreground mt-2">
                            {searchQuery ? `No results found for "${searchQuery}". Try adjusting your search or filters.` : 'There are no resources matching your current filters.'}
                        </p>
                        <Button variant="outline" onClick={clearFilters} className="mt-4">
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {viewMode === 'grid' ? renderCardView() : renderListView()}
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-muted-foreground">
                            Showing <span className="font-medium">{filteredItems.length}</span> of{' '}
                            <span className="font-medium">{items.length}</span> resources
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" disabled>
                                Previous
                            </Button>
                            <Button variant="default">1</Button>
                            <Button variant="outline">Next</Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export const Route = createFileRoute('/(app)/library')({
    component: LibraryPage,
});