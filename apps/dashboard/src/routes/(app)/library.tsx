import { createFileRoute } from '@tanstack/react-router'

import { useState, useEffect } from 'react';
import {
    Book,
    List,
    Grid,
    Search,
    Filter,
    Plus,
    File,
    FileText,
    Globe,
    Code,
    Star,
    Clock,
    SortAsc,
    SortDesc,
    BookOpen,
    Bookmark,
    Edit3,
    MoreHorizontal,
    Download,
    Share2,
    CheckCircle,
    ExternalLink,
    Layers,
    FolderPlus
} from 'lucide-react';

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

// Categories for filters
const CATEGORIES = [
    'All',
    'Textbook',
    'Reference',
    'Guide',
    'Article',
    'Paper',
    'Code Snippets',
    'Design'
];

// File types for filters
const FILE_TYPES = [
    'All',
    'pdf',
    'epub',
    'web',
    'snippet'
];

// Tags for filters
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
    'Code'
];

// Folders for filters
const FOLDERS = [
    'All',
    'Computer Science',
    'Design Resources',
    'Education',
    'Physics',
    'Humanities',
    'Research Guides',
    'Code Resources',
    'Uncategorized'
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
    const [selectedItem, setSelectedItem] = useState(null);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

    // Filter and sort items whenever filters or sort options change
    useEffect(() => {
        let result = [...items];

        // Apply search filter
        if (searchQuery) {
            result = result.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.author.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory !== 'All') {
            result = result.filter(item => item.category === selectedCategory);
        }

        // Apply type filter
        if (selectedType !== 'All') {
            result = result.filter(item => item.type === selectedType);
        }

        // Apply folder filter
        if (selectedFolder !== 'All') {
            result = result.filter(item => item.folder === selectedFolder);
        }

        // Apply tag filter
        if (selectedTags.length > 0) {
            result = result.filter(item =>
                selectedTags.every(tag => item.tags.includes(tag))
            );
        }

        // Apply favorites filter
        if (showOnlyFavorites) {
            result = result.filter(item => item.favorite);
        }

        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0;

            if (sortOption === 'title') {
                comparison = a.title.localeCompare(b.title);
            } else if (sortOption === 'author') {
                comparison = a.author.localeCompare(b.author);
            } else if (sortOption === 'dateAdded') {
                comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
            } else if (sortOption === 'lastOpened') {
                comparison = new Date(a.lastOpened).getTime() - new Date(b.lastOpened).getTime();
            } else if (sortOption === 'progress') {
                comparison = a.progress - b.progress;
            }

            return comparison;
        });

        setFilteredItems(result);
    }, [
        items,
        searchQuery,
        sortOption,
        sortDirection,
        selectedTags,
        selectedCategory,
        selectedType,
        selectedFolder,
        showOnlyFavorites
    ]);

    // Toggle sort direction
    const toggleSortDirection = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

    // Toggle tag selection
    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    // Clear all filters
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

    // Toggle favorite status
    const toggleFavorite = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, favorite: !item.favorite } : item
        ));
    };

    // Get icon based on file type
    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <FileText size={16} />;
            case 'epub':
                return <Book size={16} />;
            case 'web':
                return <Globe size={16} />;
            case 'snippet':
                return <Code size={16} />;
            default:
                return <File size={16} />;
        }
    };

    // Render progress bar
    const ProgressBar = ({ progress }: { progress: number }) => (
        <div className="w-full bg-gray-200 rounded h-2">
            <div
                className="bg-blue-500 h-2 rounded"
                style={{ width: `${progress}%` }}
            />
        </div>
    );

    // Render card view
    const renderCardView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map(item => (
                <div
                    key={item.id}
                    className="rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
                >
                    <div className="p-4 flex-1 flex flex-col">
                        {/* Top section with cover and basic info */}
                        <div className="flex mb-4">
                            <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded mr-3">
                                {item.cover ? (
                                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary">
                                        {item.type === 'web' ? (
                                            <Globe size={32} />
                                        ) : item.type === 'snippet' ? (
                                            <Code size={32} />
                                        ) : (
                                            <FileText size={32} />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-1">
                                        {getFileIcon(item.type)}
                                        <span className="uppercase">{item.type}</span>
                                    </div>
                                    <button
                                        onClick={() => toggleFavorite(item.id)}
                                        className="text-gray-400 hover:text-yellow-500 dark:text-gray-600 dark:hover:text-yellow-500"
                                    >
                                        {item.favorite ? (
                                            <Star size={16} className="fill-yellow-500 text-yellow-500" />
                                        ) : (
                                            <Star size={16} />
                                        )}
                                    </button>
                                </div>
                                <h3 className="font-medium text-primary line-clamp-2 mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 mb-2">{item.author}</p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock size={12} className="mr-1" />
                                    <span>Last opened: {item.lastOpened}</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress section */}
                        <div className="mt-auto">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{item.progress}%</span>
                            </div>
                            <ProgressBar progress={item.progress} />
                        </div>

                        {/* Annotations and highlights */}
                        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                            <div className="flex space-x-3">
                                <span className="flex items-center">
                                    <Bookmark size={12} className="mr-1" />
                                    {item.annotations}
                                </span>
                                <span className="flex items-center">
                                    <Edit3 size={12} className="mr-1" />
                                    {item.highlights}
                                </span>
                                <span className="flex items-center">
                                    <FileText size={12} className="mr-1" />
                                    {item.notes}
                                </span>
                            </div>
                            <div className="flex space-x-1">
                                <button className="hover:text-blue-500">
                                    <ExternalLink size={14} />
                                </button>
                                <button className="hover:text-blue-500">
                                    <MoreHorizontal size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom action bar */}
                    <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                        <button className="text-sm text-blue-500 hover:text-blue-700 font-medium">
                            Open
                        </button>
                        <div className="flex space-x-2">
                            <button className="text-muted-foreground hover:text-gray-700 dark:hover:text-gray-200">
                                <Download size={14} />
                            </button>
                            <button className="text-muted-foreground hover:text-gray-700 dark:hover:text-gray-200">
                                <Share2 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Render list view
    const renderListView = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center">
                                <span>Title</span>
                                <button
                                    onClick={() => {
                                        setSortOption('title');
                                        toggleSortDirection();
                                    }}
                                    className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {sortOption === 'title' && sortDirection === 'asc' ? (
                                        <SortAsc size={14} />
                                    ) : (
                                        <SortDesc size={14} />
                                    )}
                                </button>
                            </div>
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center">
                                <span>Author</span>
                                <button
                                    onClick={() => {
                                        setSortOption('author');
                                        toggleSortDirection();
                                    }}
                                    className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {sortOption === 'author' && sortDirection === 'asc' ? (
                                        <SortAsc size={14} />
                                    ) : (
                                        <SortDesc size={14} />
                                    )}
                                </button>
                            </div>
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center">
                                <span>Type</span>
                            </div>
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center">
                                <span>Progress</span>
                                <button
                                    onClick={() => {
                                        setSortOption('progress');
                                        toggleSortDirection();
                                    }}
                                    className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {sortOption === 'progress' && sortDirection === 'asc' ? (
                                        <SortAsc size={14} />
                                    ) : (
                                        <SortDesc size={14} />
                                    )}
                                </button>
                            </div>
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center">
                                <span>Last opened</span>
                                <button
                                    onClick={() => {
                                        setSortOption('lastOpened');
                                        toggleSortDirection();
                                    }}
                                    className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {sortOption === 'lastOpened' && sortDirection === 'asc' ? (
                                        <SortAsc size={14} />
                                    ) : (
                                        <SortDesc size={14} />
                                    )}
                                </button>
                            </div>
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center">
                                <span>Actions</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-3 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 mr-3">
                                        {item.cover ? (
                                            <img src={item.cover} alt={item.title} className="h-10 w-10 object-cover rounded" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full">
                                                {getFileIcon(item.type)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center">
                                            <p className="text-sm font-medium text-primary truncate mr-2">{item.title}</p>
                                            {item.favorite && <Star size={14} className="fill-yellow-500 text-yellow-500" />}
                                        </div>
                                        <div className="flex space-x-2 mt-1">
                                            {item.tags.slice(0, 2).map((tag, index) => (
                                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                    {tag}
                                                </span>
                                            ))}
                                            {item.tags.length > 2 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                                    +{item.tags.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                                <div className="text-sm text-primary">{item.author}</div>
                                <div className="text-xs text-muted-foreground">{item.folder}</div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    {getFileIcon(item.type)}
                                    <span className="ml-1 uppercase text-xs">{item.type}</span>
                                </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="w-24 mr-2">
                                        <ProgressBar progress={item.progress} />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{item.progress}%</span>
                                </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {item.lastOpened}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex space-x-2">
                                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                        Open
                                    </button>
                                    <button
                                        onClick={() => toggleFavorite(item.id)}
                                        className={`text-gray-400 hover:text-yellow-500 ${item.favorite ? 'text-yellow-500' : ''}`}
                                    >
                                        <Star size={16} className={item.favorite ? 'fill-yellow-500' : ''} />
                                    </button>
                                    <button className="text-gray-400 hover:text-gray-600 dark:text-muted-foreground dark:hover:text-gray-300">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Render the advanced filter panel
    const renderFilterPanel = () => (
        <div className={`${isFilterMenuOpen ? 'block' : 'hidden'} border rounded-lg bg-white dark:bg-gray-800 shadow-md p-4 mt-4 mb-6`}>
            <h3 className="text-lg font-medium mb-4 text-primary">Advanced Filters</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Categories filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-primary shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {CATEGORIES.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* File types filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File Type</label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-primary shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {FILE_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Folders filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Folder</label>
                    <select
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-primary shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {FOLDERS.map((folder) => (
                            <option key={folder} value={folder}>{folder}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tags section */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2">
                    {ALL_TAGS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${selectedTags.includes(tag)
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {tag}
                            {selectedTags.includes(tag) && (
                                <span className="ml-1">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Show only favorites */}
            <div className="mt-4 flex items-center">
                <input
                    type="checkbox"
                    id="showFavorites"
                    checked={showOnlyFavorites}
                    onChange={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="showFavorites" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Show only favorites
                </label>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={clearFilters}
                    className="mr-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                    Clear Filters
                </button>
                <button
                    onClick={() => setIsFilterMenuOpen(false)}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Library</h1>
                    <p className="text-gray-600 mt-1">
                        Manage all your books, articles, and resources in one place
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex">
                    <button className="mr-2 flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <Plus size={16} className="mr-1" />
                        Add Resource
                    </button>
                    <button className="flex items-center rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                        <FolderPlus size={16} className="mr-1" />
                        New Folder
                    </button>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Resources</p>
                            <p className="text-2xl font-semibold text-primary mt-1">{items.length}</p>
                        </div>
                        <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                            <Layers size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">In Progress</p>
                            <p className="text-2xl font-semibold text-primary mt-1">
                                {items.filter(item => item.progress > 0 && item.progress < 100).length}
                            </p>
                        </div>
                        <div className="rounded-full p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300">
                            <BookOpen size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-semibold text-primary mt-1">
                                {items.filter(item => item.progress === 100).length}
                            </p>
                        </div>
                        <div className="rounded-full p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Favorites</p>
                            <p className="text-2xl font-semibold text-primary mt-1">
                                {items.filter(item => item.favorite).length}
                            </p>
                        </div>
                        <div className="rounded-full p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300">
                            <Star size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and filters bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, author, or content..."
                            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                        />
                    </div>

                    {/* View toggle and sort */}
                    <div className="flex items-center space-x-2">
                        {/* View toggle */}
                        <div className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-2 text-sm ${viewMode === 'grid'
                                    ? 'bg-gray-100 dark:bg-gray-600 text-primary'
                                    : 'text-muted-foreground hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-2 text-sm ${viewMode === 'list'
                                    ? 'bg-gray-100 dark:bg-gray-600 text-primary'
                                    : 'text-muted-foreground hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        {/* Sort dropdown */}
                        <div className="relative inline-block">
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-8 text-sm text-primary shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="title">Sort by Title</option>
                                <option value="author">Sort by Author</option>
                                <option value="dateAdded">Sort by Date Added</option>
                                <option value="lastOpened">Sort by Last Opened</option>
                                <option value="progress">Sort by Progress</option>
                            </select>
                            <button
                                onClick={toggleSortDirection}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                {sortDirection === 'asc' ? (
                                    <SortAsc size={16} />
                                ) : (
                                    <SortDesc size={16} />
                                )}
                            </button>
                        </div>

                        {/* Filter button */}
                        <button
                            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                            className={`inline-flex items-center rounded-md border ${isFilterMenuOpen || selectedTags.length > 0 || selectedCategory !== 'All' || selectedType !== 'All' || selectedFolder !== 'All' || showOnlyFavorites
                                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
                                } px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600`}
                        >
                            <Filter size={16} className="mr-1" />
                            <span>Filter</span>
                            {(selectedTags.length > 0 || selectedCategory !== 'All' || selectedType !== 'All' || selectedFolder !== 'All' || showOnlyFavorites) && (
                                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white h-5 w-5 dark:bg-blue-500">
                                    {selectedTags.length +
                                        (selectedCategory !== 'All' ? 1 : 0) +
                                        (selectedType !== 'All' ? 1 : 0) +
                                        (selectedFolder !== 'All' ? 1 : 0) +
                                        (showOnlyFavorites ? 1 : 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Advanced filter panel */}
            {renderFilterPanel()}

            {/* Content - Empty state */}
            {filteredItems.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400 dark:text-muted-foreground mb-4">
                        <SearchIcon size={48} />
                    </div>
                    <h3 className="text-lg font-medium text-primary mb-1">No resources found</h3>
                    <p className="text-muted-foreground mb-4">
                        {searchQuery
                            ? `No results found for "${searchQuery}". Try adjusting your search or filters.`
                            : "There are no resources matching your current filters."}
                    </p>
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Content - Items */}
            {filteredItems.length > 0 && (
                <>
                    {/* View mode toggle */}
                    {viewMode === 'grid' ? renderCardView() : renderListView()}

                    {/* Pagination */}
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">{filteredItems.length}</span> of{' '}
                            <span className="font-medium">{items.length}</span> resources
                        </div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-600 dark:hover:bg-gray-700">
                                Previous
                            </button>
                            <button className="relative inline-flex items-center bg-blue-600 px-3 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                                1
                            </button>
                            <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-600 dark:hover:bg-gray-700">
                                Next
                            </button>
                        </nav>
                    </div>
                </>
            )}

            {/* Resource detail modal - would be implemented with React state */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 dark:bg-gray-800">
                            {/* Modal content would go here */}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute right-4 top-4 text-gray-400 hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-gray-400"
                            >
                                <span className="sr-only">Close</span>
                                <XIcon size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SearchIcon = Search;
const XIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);


export const Route = createFileRoute('/(app)/library')({
    component: LibraryPage,
})
