import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Clock, Calendar, Tag, ArrowRight, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  reading_time_minutes: number;
  published_at: string;
  cover_image: string | null;
};

const CATEGORIES = [
  { id: "all", label: "All Posts" },
  { id: "market-analysis", label: "Market Analysis" },
  { id: "trading-strategies", label: "Trading Strategies" },
  { id: "stock-picks", label: "Stock Picks" },
  { id: "crypto", label: "Crypto" },
  { id: "global-markets", label: "Global Markets" },
  { id: "education", label: "Education" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "market-analysis": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "trading-strategies": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "stock-picks": "bg-green-500/20 text-green-400 border-green-500/30",
  crypto: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "global-markets": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  education: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, category, tags, reading_time_minutes, published_at, cover_image")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (activeCategory !== "all") {
      query = query.eq("category", activeCategory);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load blog posts");
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const generateNewPost = async () => {
    setGenerating(true);
    toast.info("Generating new article from latest market data...");
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog");
      if (error) throw error;
      if (data?.success) {
        toast.success("New article published!");
        fetchPosts();
      } else {
        toast.error(data?.error || "Generation failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate article");
    } finally {
      setGenerating(false);
    }
  };

  const filteredPosts = searchQuery
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              <TrendingUp className="w-3 h-3 mr-1" /> AI-Powered Financial Insights
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              QuantMentor <span className="text-gradient-primary">Market Blog</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              AI-generated market analysis, trading strategies, and financial insights updated daily from real market data.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border/50"
                />
              </div>
              <Button
                onClick={generateNewPost}
                disabled={generating}
                className="bg-gradient-primary shadow-glow whitespace-nowrap"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${generating ? "animate-spin" : ""}`} />
                {generating ? "Generating..." : "Generate New Article"}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className={activeCategory === cat.id ? "bg-gradient-primary" : "border-border/50"}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <TrendingUp className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Articles Yet</h3>
            <p className="text-muted-foreground mb-6">
              Click "Generate New Article" to create your first AI-powered market analysis.
            </p>
            <Button onClick={generateNewPost} disabled={generating} className="bg-gradient-primary shadow-glow">
              <RefreshCw className={`w-4 h-4 mr-2 ${generating ? "animate-spin" : ""}`} />
              Generate First Article
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="group rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 h-full flex flex-col overflow-hidden hover:shadow-glow/10">
                    {/* Category bar */}
                    <div className="h-1 bg-gradient-primary" />
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                            CATEGORY_COLORS[post.category] || "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {post.category.replace(/-/g, " ")}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {post.reading_time_minutes} min
                        </div>
                      </div>

                      <h2 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{post.excerpt}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.published_at)}
                        </div>
                        <span className="text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "QuantMentor Market Blog",
            description: "AI-generated market analysis, trading strategies and financial insights",
            url: "https://quantmentor-strategy-forge.lovable.app/blog",
            publisher: {
              "@type": "Organization",
              name: "QuantMentor",
            },
          }),
        }}
      />

      <Footer />
    </div>
  );
};

export default Blog;
