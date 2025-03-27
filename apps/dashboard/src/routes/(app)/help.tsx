import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
    Search,
    ThumbsUp,
    MessageCircle,
    HelpCircle,
    Book,
    FileText,
    Video,
    Headphones,
    ArrowRight,
    ChevronRight,
    ChevronDown,
    Clock,
    Users,
    ShieldCheck,
    Settings,
    BarChart2,
    Link
} from 'lucide-react'

export const Route = createFileRoute('/(app)/help')({
    component: HelpCenterComponent,
})

function HelpCenterComponent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(0);
    const [activeTab, setActiveTab] = useState('all');

    // Sample help categories
    const categories = [
        { id: 'getting-started', name: 'Getting Started', icon: Book, count: 15 },
        { id: 'account', name: 'Account & Billing', icon: Users, count: 27 },
        { id: 'security', name: 'Privacy & Security', icon: ShieldCheck, count: 19 },
        { id: 'features', name: 'Features & Tools', icon: Settings, count: 34 },
        { id: 'integrations', name: 'Integrations', icon: Link, count: 22 },
        { id: 'analytics', name: 'Reporting & Analytics', icon: BarChart2, count: 18 }
    ];

    // Sample popular articles
    const popularArticles = [
        {
            id: 1,
            title: 'How to set up two-factor authentication',
            category: 'security',
            views: '2.5k',
            helpfulRating: 98,
            timeToRead: '3 min'
        },
        {
            id: 2,
            title: 'Importing data from external sources',
            category: 'features',
            views: '1.8k',
            helpfulRating: 92,
            timeToRead: '5 min'
        },
        {
            id: 3,
            title: 'Setting up your first project dashboard',
            category: 'getting-started',
            views: '3.9k',
            helpfulRating: 96,
            timeToRead: '4 min'
        },
        {
            id: 4,
            title: 'Connecting your Slack workspace',
            category: 'integrations',
            views: '1.2k',
            helpfulRating: 89,
            timeToRead: '2 min'
        }
    ];

    // Sample FAQs
    const faqs = [
        {
            id: 1,
            question: 'How do I change my subscription plan?',
            answer: 'You can change your subscription plan at any time by going to Account Settings > Billing > Subscription. There you\'ll see options to upgrade, downgrade, or cancel your plan. Changes to your subscription will take effect at the start of your next billing cycle.',
            category: 'account'
        },
        {
            id: 2,
            question: 'Can I invite external users to collaborate?',
            answer: 'Yes, you can invite external users to collaborate on specific projects without them needing a full account. Go to the project settings, select "External Collaborators" and enter their email addresses. External users will have limited access based on the permissions you set.',
            category: 'features'
        },
        {
            id: 3,
            question: 'How secure is my data?',
            answer: 'We take security very seriously. All data is encrypted both in transit and at rest using industry-standard AES-256 encryption. We maintain SOC 2 compliance, perform regular security audits, and offer features like SSO and 2FA to ensure your data remains secure.',
            category: 'security'
        },
        {
            id: 4,
            question: 'How do I export my data?',
            answer: 'You can export your data at any time through Settings > Data Management > Export. We support multiple formats including CSV, JSON, and Excel. For large datasets, the export will be processed in the background and you\'ll receive an email when it\'s ready to download.',
            category: 'features'
        },
        {
            id: 5,
            question: 'What happens when my trial ends?',
            answer: 'When your trial period ends, your account will automatically switch to the free plan with limited features. All your data will remain intact. You can upgrade to a paid plan at any time to regain access to premium features. We\'ll send reminder emails before your trial expires.',
            category: 'account'
        }
    ];

    // Sample recent community questions
    const communityQuestions = [
        {
            id: 1,
            title: 'Best practices for organizing large projects?',
            askedBy: 'Alex Johnson',
            category: 'getting-started',
            timeAgo: '2 hours ago',
            replies: 7
        },
        {
            id: 2,
            title: 'How to create custom report templates?',
            askedBy: 'Maria Garcia',
            category: 'analytics',
            timeAgo: '1 day ago',
            replies: 12
        },
        {
            id: 3,
            title: 'Trouble connecting to Google Analytics',
            askedBy: 'Ahmed Hassan',
            category: 'integrations',
            timeAgo: '3 days ago',
            replies: 5
        }
    ];

    // Filter articles based on search and active tab
    const filteredArticles = popularArticles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeTab === 'all' || article.category === activeTab;
        return matchesSearch && matchesCategory;
    });

    // Filter FAQs based on search and active tab
    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch =
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeTab === 'all' || faq.category === activeTab;
        return matchesSearch && matchesCategory;
    });

    // Filter community questions based on search and active tab
    const filteredQuestions = communityQuestions.filter(question => {
        const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeTab === 'all' || question.category === activeTab;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-8 p-4">
            {/* Hero section with search */}
            <div className="rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 p-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">How can we help you?</h1>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Find answers to your questions and learn how to get the most out of our platform
                </p>
                <div className="relative max-w-xl mx-auto">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for articles, topics, or questions..."
                        className="w-full rounded-full border border-input bg-background pl-12 pr-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Help categories */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Browse by Category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className={`flex flex-col items-center p-4 rounded-lg border text-center hover:border-primary/50 hover:bg-muted/50 transition-all ${activeTab === category.id ? 'border-primary bg-primary/5' : ''
                                }`}
                            onClick={() => setActiveTab(category.id)}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                                {<category.icon className="h-5 w-5" />}
                            </div>
                            <span className="font-medium">{category.name}</span>
                            <span className="text-xs text-muted-foreground mt-1">{category.count} articles</span>
                        </button>
                    ))}
                    <button
                        className={`flex flex-col items-center p-4 rounded-lg border text-center hover:border-primary/50 hover:bg-muted/50 transition-all ${activeTab === 'all' ? 'border-primary bg-primary/5' : ''
                            }`}
                        onClick={() => setActiveTab('all')}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <span className="font-medium">All Help</span>
                        <span className="text-xs text-muted-foreground mt-1">View all</span>
                    </button>
                </div>
            </div>

            {/* Tab buttons for different content types */}
            <div className="flex border-b">
                <button
                    className={`py-2 px-4 font-medium text-sm border-b-2 ${searchQuery ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    {searchQuery ? `Search Results (${filteredArticles.length + filteredFaqs.length + filteredQuestions.length})` : 'All Resources'}
                </button>
                <button
                    className="py-2 px-4 font-medium text-sm border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                >
                    Articles
                </button>
                <button
                    className="py-2 px-4 font-medium text-sm border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                >
                    Videos
                </button>
                <button
                    className="py-2 px-4 font-medium text-sm border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                >
                    Community
                </button>
            </div>

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                {/* Main content area - 2/3 width */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Popular articles */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {searchQuery ? 'Relevant Articles' : 'Popular Articles'}
                        </h2>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                            {filteredArticles.length > 0 ? (
                                filteredArticles.map(article => (
                                    <a
                                        key={article.id}
                                        href="#"
                                        className="flex flex-col h-full rounded-lg border bg-card p-5 shadow-sm hover:border-primary/50 hover:shadow transition-all"
                                    >
                                        <h3 className="font-medium mb-2">{article.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-3">
                                            <div className="flex items-center">
                                                <Clock className="h-3.5 w-3.5 mr-1" />
                                                {article.timeToRead}
                                            </div>
                                            <div className="flex items-center">
                                                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                                {article.helpfulRating}%
                                            </div>
                                            <div className="flex items-center ml-auto">
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-8 border rounded-lg bg-muted/10">
                                    <div className="flex justify-center mb-4">
                                        <FileText className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-medium text-lg mb-1">No articles found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search or browse all articles</p>
                                </div>
                            )}
                        </div>
                        {filteredArticles.length > 0 && (
                            <a href="#" className="flex items-center text-sm text-primary hover:underline">
                                <span>View all articles</span>
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                        )}
                    </div>

                    {/* FAQs accordion */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-3 rounded-lg border bg-card divide-y">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map(faq => (
                                    <div key={faq.id} className="overflow-hidden">
                                        <button
                                            className="flex w-full items-center justify-between p-4 text-left font-medium"
                                            onClick={() => setExpandedFaq(expandedFaq === faq.id ? 0 : faq.id)}
                                        >
                                            <span>{faq.question}</span>
                                            {expandedFaq === faq.id ? (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </button>
                                        {expandedFaq === faq.id && (
                                            <div className="px-4 pb-4 text-sm text-muted-foreground">
                                                {faq.answer}
                                                <div className="mt-3 flex items-center gap-2">
                                                    <button className="flex items-center gap-1 text-xs hover:text-primary">
                                                        <ThumbsUp className="h-3.5 w-3.5" />
                                                        Helpful
                                                    </button>
                                                    <button className="flex items-center gap-1 text-xs hover:text-primary">
                                                        <MessageCircle className="h-3.5 w-3.5" />
                                                        Discuss
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center">
                                    <div className="flex justify-center mb-4">
                                        <HelpCircle className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-medium text-lg mb-1">No FAQs found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search terms</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - 1/3 width */}
                <div className="space-y-8">
                    {/* Quick Resources */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Book className="h-5 w-5 text-primary" />
                            Quick Resources
                        </h2>
                        <div className="space-y-2 rounded-lg border bg-card p-4">
                            <a href="#" className="flex items-center gap-2 text-sm hover:text-primary">
                                <Video className="h-4 w-4" />
                                Video Tutorials
                            </a>
                            <a href="#" className="flex items-center gap-2 text-sm hover:text-primary">
                                <Book className="h-4 w-4" />
                                User Guides
                            </a>
                            <a href="#" className="flex items-center gap-2 text-sm hover:text-primary">
                                <Headphones className="h-4 w-4" />
                                Contact Support
                            </a>
                        </div>
                    </div>

                    {/* Community Questions */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            Recent Community Questions
                        </h2>
                        <div className="space-y-4">
                            {filteredQuestions.length > 0 ? (
                                filteredQuestions.map(question => (
                                    <a
                                        key={question.id}
                                        href="#"
                                        className="flex flex-col rounded-lg border bg-card p-4 hover:border-primary/50 transition-all"
                                    >
                                        <h3 className="text-sm font-medium mb-1">{question.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{question.askedBy}</span>
                                            <span>•</span>
                                            <span>{question.timeAgo}</span>
                                            <span className="ml-auto flex items-center gap-1">
                                                <MessageCircle className="h-3.5 w-3.5" />
                                                {question.replies}
                                            </span>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="text-center py-6 border rounded-lg bg-muted/10">
                                    <div className="flex justify-center mb-4">
                                        <MessageCircle className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-medium text-lg mb-1">No questions found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search</p>
                                </div>
                            )}
                        </div>
                        {filteredQuestions.length > 0 && (
                            <a href="#" className="flex items-center text-sm text-primary hover:underline">
                                <span>View community forums</span>
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                        )}
                    </div>

                    {/* Contact Support */}
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Headphones className="h-5 w-5 text-primary" />
                            Still Need Help?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Our support team is available 24/7 to assist you.
                        </p>
                        <button className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <div className="pt-8 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2">Product</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <a href="#" className="block hover:text-primary">Features</a>
                            <a href="#" className="block hover:text-primary">Pricing</a>
                            <a href="#" className="block hover:text-primary">Integrations</a>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Resources</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <a href="#" className="block hover:text-primary">Documentation</a>
                            <a href="#" className="block hover:text-primary">Blog</a>
                            <a href="#" className="block hover:text-primary">Webinars</a>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Support</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <a href="#" className="block hover:text-primary">Help Center</a>
                            <a href="#" className="block hover:text-primary">Status</a>
                            <a href="#" className="block hover:text-primary">Contact Us</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}