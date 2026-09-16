import CommunityPost from "../models/CommunityPost.js";
import CommunityComment from "../models/CommunityComment.js";

const DEFAULT_POSTS = [
  {
    _id: "demo-post-1",
    authorName: "Sarah Chen",
    authorGoal: "Senior Frontend Architect",
    title: "How to properly optimize React 18 re-renders when using Context with high-frequency updates?",
    content: "When state changes rapidly (e.g. cursor coordinates, animations, or streaming analytics), placing that state in a top-level Context causes all consuming children to re-render. What patterns do you use to isolate renders without switching entirely to external libraries?",
    category: "Technical Q&A",
    tags: ["React", "Performance", "State Management"],
    upvotes: 24,
    commentsCount: 3,
    hasAcceptedAnswer: true,
    views: 182,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2)
  },
  {
    _id: "demo-post-2",
    authorName: "Alex Rivera",
    authorGoal: "Fullstack MERN Engineer",
    title: "Project Showcase: Built an event-driven task queue with Redis and Node.js worker threads",
    content: "Just shipped my capstone project! It handles background email notifications, image resizing, and PDF generation with automatic retry backoff and concurrency control. Check out the architecture diagram in the post.",
    category: "Project Showcase",
    tags: ["Node.js", "Redis", "Architecture", "Microservices"],
    upvotes: 42,
    commentsCount: 6,
    hasAcceptedAnswer: false,
    views: 310,
    createdAt: new Date(Date.now() - 3600000 * 24 * 4)
  },
  {
    _id: "demo-post-3",
    authorName: "David Kim",
    authorGoal: "Cloud & DevOps Specialist",
    title: "System Design Interview Experience: Cracking the Distributed Rate Limiter question",
    content: "Had a 60-minute technical interview recently where the prompt was designing a multi-region rate limiter for 500k QPS. Here are the 4 key trade-offs the interviewer pressed me on, from token bucket sync to Redis sliding windows.",
    category: "Interview Advice",
    tags: ["System Design", "Interview Prep", "Redis", "Security"],
    upvotes: 56,
    commentsCount: 8,
    hasAcceptedAnswer: false,
    views: 520,
    createdAt: new Date(Date.now() - 3600000 * 24 * 6)
  }
];

export const getPosts = async (req, res, next) => {
  try {
    const { category, search, tag, sort = "recent" } = req.query;
    const filter = {};

    if (category && category !== "All") filter.category = category;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "trending") sortOption = { upvotes: -1, commentsCount: -1 };
    if (sort === "views") sortOption = { views: -1 };

    let posts = await CommunityPost.find(filter).sort(sortOption).limit(40);

    // If no posts in database yet, seed with defaults or return demo list
    if (posts.length === 0 && !search && !category) {
      return res.json({ success: true, posts: DEFAULT_POSTS });
    }

    res.json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id.startsWith("demo-post-")) {
      const demo = DEFAULT_POSTS.find((p) => p._id === id);
      return res.json({
        success: true,
        post: demo || DEFAULT_POSTS[0],
        comments: [
          {
            _id: "demo-c-1",
            authorName: "Elena Rostova",
            authorGoal: "Principal Engineer",
            content: "Split the Context into two: one for state value that consumers read, and a separate immutable Dispatch Context for dispatch callbacks. Alternatively, use a selector subscription pattern (useSyncExternalStore) to subscribe only to specific state slices.",
            upvotes: 18,
            isAccepted: true,
            createdAt: new Date(Date.now() - 3600000 * 30)
          }
        ]
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Increment views
    post.views += 1;
    await post.save();

    const comments = await CommunityComment.find({ post: id }).sort({ isAccepted: -1, upvotes: -1, createdAt: 1 });
    res.json({ success: true, post, comments });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required" });
    }

    const cleanTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const post = await CommunityPost.create({
      author: req.user._id,
      authorName: req.user.name,
      authorGoal: req.user.careerGoal || "Fullstack Engineer",
      title: title.trim(),
      content: content.trim(),
      category: category || "Technical Q&A",
      tags: cleanTags
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

export const toggleVote = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id.startsWith("demo-post-")) {
      return res.json({ success: true, upvotes: 25, upvoted: true });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userId = req.user._id;
    const hasUpvoted = post.upvotedBy.some((uid) => uid.toString() === userId.toString());

    if (hasUpvoted) {
      post.upvotedBy = post.upvotedBy.filter((uid) => uid.toString() !== userId.toString());
      post.upvotes = Math.max(0, post.upvotes - 1);
    } else {
      post.upvotedBy.push(userId);
      post.upvotes += 1;
    }

    await post.save();
    res.json({ success: true, upvotes: post.upvotes, upvoted: !hasUpvoted });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    if (id.startsWith("demo-post-")) {
      return res.status(201).json({
        success: true,
        comment: {
          _id: "demo-new-" + Date.now(),
          post: id,
          authorName: req.user.name,
          authorGoal: req.user.careerGoal || "Developer",
          content: content.trim(),
          upvotes: 0,
          createdAt: new Date()
        }
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = await CommunityComment.create({
      post: id,
      author: req.user._id,
      authorName: req.user.name,
      authorGoal: req.user.careerGoal || "Fullstack Engineer",
      content: content.trim()
    });

    post.commentsCount += 1;
    await post.save();

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

export const acceptAnswer = async (req, res, next) => {
  try {
    const { postId, commentId } = req.body;
    const post = await CommunityPost.findOne({ _id: postId, author: req.user._id });
    if (!post) {
      return res.status(403).json({ success: false, message: "Only the post author can accept an answer" });
    }

    // Reset any previous accepted answer for this post
    await CommunityComment.updateMany({ post: postId }, { isAccepted: false });
    const comment = await CommunityComment.findByIdAndUpdate(commentId, { isAccepted: true }, { new: true });

    post.hasAcceptedAnswer = true;
    await post.save();

    res.json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};
