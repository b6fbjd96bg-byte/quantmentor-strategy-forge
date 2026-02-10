import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Clock, Calendar, Tag, Share2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type FullBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  reading_time_minutes: number;
  published_at: string;
  cover_image: string | null;
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<FullBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<{ id: string; title: string; slug: string; category: string }[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error || !data) {
        console.error(error);
        setLoading(false);
        return;
      }

      setPost(data as FullBlogPost);

      // Update page title for SEO
      document.title = data.meta_title || data.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", data.meta_description || data.excerpt);

      // Fetch related
      const { data: related } = await supabase
        .from("blog_posts")
        .select("id, title, slug, category")
        .eq("is_published", true)
        .eq("category", data.category)
        .neq("id", data.id)
        .order("published_at", { ascending: false })
        .limit(3);

      setRelatedPosts(related || []);
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 max-w-3xl">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-3/4 mb-8" />
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full mb-3" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">This article doesn't exist or has been removed.</p>
          <Link to="/blog">
            <Button className="bg-gradient-primary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge
              variant="outline"
              className="mb-4 border-primary/30 text-primary capitalize"
            >
              {post.category.replace(/-/g, " ")}
            </Badge>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border/50">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {formatDate(post.published_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {post.reading_time_minutes} min read
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> QuantMentor AI
              </span>
              <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                <Share2 className="w-4 h-4 mr-1" /> Share
              </Button>
            </div>
          </motion.header>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none mt-8
              prose-headings:font-display prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-strong:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-li:text-muted-foreground
              prose-blockquote:border-primary/50 prose-blockquote:text-muted-foreground
              prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
          >
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </motion.div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-8 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400/80">
            <strong>Disclaimer:</strong> This article is AI-generated for educational purposes only. It does not constitute financial advice. Always do your own research before making investment decisions.
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border/50">
              <h3 className="font-display text-xl font-semibold mb-4">Related Articles</h3>
              <div className="grid gap-3">
                {relatedPosts.map((rp) => (
                  <Link
                    key={rp.id}
                    to={`/blog/${rp.slug}`}
                    className="group flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-all"
                  >
                    <span className="font-medium group-hover:text-primary transition-colors">{rp.title}</span>
                    <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.meta_description || post.excerpt,
            datePublished: post.published_at,
            author: { "@type": "Organization", name: "QuantMentor" },
            publisher: { "@type": "Organization", name: "QuantMentor" },
          }),
        }}
      />

      <Footer />
    </div>
  );
};

export default BlogPost;
