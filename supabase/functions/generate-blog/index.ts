import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FINANCIAL_SOURCES = [
  { url: "https://www.tickertape.in/market-mood-index", topic: "Indian Market Mood & Sentiment" },
  { url: "https://www.tickertape.in/screener/equity/prebuilt/top-gainers-today-BSE-652", topic: "Top Gainers Today" },
  { url: "https://www.moneycontrol.com/stocksmarketsindia/", topic: "Indian Stock Market Overview" },
  { url: "https://economictimes.indiatimes.com/markets", topic: "Market News & Analysis" },
  { url: "https://www.investopedia.com/markets-news-4427704", topic: "Global Market News" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { topic: customTopic } = await req.json().catch(() => ({}));

    // Pick a random source or use custom topic
    const source = customTopic 
      ? { url: "https://www.tickertape.in/market-mood-index", topic: customTopic }
      : FINANCIAL_SOURCES[Math.floor(Math.random() * FINANCIAL_SOURCES.length)];

    console.log("Scraping:", source.url, "Topic:", source.topic);

    // Fetch financial data using Firecrawl
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: source.url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    const scrapeData = await scrapeResponse.json();
    
    if (!scrapeResponse.ok) {
      console.error("Firecrawl error:", scrapeData);
      throw new Error("Failed to scrape financial data");
    }

    const scrapedContent = scrapeData.data?.markdown || scrapeData.markdown || "";
    const pageTitle = scrapeData.data?.metadata?.title || scrapeData.metadata?.title || source.topic;
    
    console.log("Scraped content length:", scrapedContent.length);

    // Generate blog post using AI
    const today = new Date().toISOString().split("T")[0];
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert financial journalist and SEO content writer for QuantMentor, a professional trading platform. Write engaging, data-driven blog posts about stock markets, trading strategies, and financial analysis.

Your articles must:
- Be between 800-1500 words
- Include specific data points, numbers, and statistics from the source material
- Have clear actionable insights for traders
- Use professional yet accessible language
- Include relevant keywords naturally for SEO
- NOT give direct buy/sell recommendations (add disclaimers)

Return ONLY valid JSON with this exact structure:
{
  "title": "SEO-optimized title under 60 chars",
  "slug": "url-friendly-slug-with-date",
  "excerpt": "Compelling 150-char summary for meta description",
  "content": "Full markdown article with ## headings, bullet points, bold text",
  "category": "one of: market-analysis, trading-strategies, stock-picks, crypto, global-markets, education",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "meta_title": "SEO title under 60 chars",
  "meta_description": "Meta description under 160 chars",
  "reading_time_minutes": 5
}`
          },
          {
            role: "user",
            content: `Today is ${today}. Topic: "${source.topic}". Source page title: "${pageTitle}".

Here is the latest financial data scraped from ${source.url}:

${scrapedContent.substring(0, 6000)}

Write a comprehensive, SEO-optimized blog article based on this data. Make it timely, data-driven, and valuable for traders.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    let blogContent = aiData.choices?.[0]?.message?.content || "";
    
    // Clean markdown code fences if present
    blogContent = blogContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    console.log("AI response length:", blogContent.length);

    let blog;
    try {
      blog = JSON.parse(blogContent);
    } catch (e) {
      console.error("JSON parse error:", e, "Content:", blogContent.substring(0, 500));
      throw new Error("Failed to parse AI response as JSON");
    }

    // Ensure unique slug with date
    const dateSlug = today.replace(/-/g, "");
    const finalSlug = blog.slug.includes(dateSlug) ? blog.slug : `${blog.slug}-${dateSlug}`;

    // Save to database using service role (bypasses RLS)
    const { data: savedPost, error: dbError } = await supabase
      .from("blog_posts")
      .insert({
        title: blog.title,
        slug: finalSlug,
        excerpt: blog.excerpt,
        content: blog.content,
        category: blog.category || "market-analysis",
        tags: blog.tags || [],
        meta_title: blog.meta_title || blog.title,
        meta_description: blog.meta_description || blog.excerpt,
        reading_time_minutes: blog.reading_time_minutes || 5,
        source_urls: [source.url],
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      // If slug conflict, add random suffix
      if (dbError.code === "23505") {
        const retrySlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
        const { data: retryPost, error: retryError } = await supabase
          .from("blog_posts")
          .insert({
            title: blog.title,
            slug: retrySlug,
            excerpt: blog.excerpt,
            content: blog.content,
            category: blog.category || "market-analysis",
            tags: blog.tags || [],
            meta_title: blog.meta_title || blog.title,
            meta_description: blog.meta_description || blog.excerpt,
            reading_time_minutes: blog.reading_time_minutes || 5,
            source_urls: [source.url],
            is_published: true,
            published_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (retryError) throw new Error(`DB insert failed: ${retryError.message}`);
        
        return new Response(JSON.stringify({ success: true, post: retryPost }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`DB insert failed: ${dbError.message}`);
    }

    return new Response(JSON.stringify({ success: true, post: savedPost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-blog error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
