# EXPLAINER

## The Tree: Nested Comments Architecture

### Database Model

We use an **adjacency list** pattern for storing threaded comments. Each comment has an optional `parent` foreign key pointing to another comment:

```python
class Comment(models.Model):
    post = models.ForeignKey(Post, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    parent = models.ForeignKey("self", null=True, blank=True, related_name="children", on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [models.Index(fields=['post']), models.Index(fields=['parent'])]
```

### Avoiding N+1 Queries

The key challenge is fetching a post with 50 nested comments without triggering 50+ SQL queries. Here's our solution:

**Step 1:** In the view, we fetch all comments for visible posts in **one query**:

```python
# Get all posts
posts = Post.objects.annotate(likes_count=Count("likes")).select_related("author").order_by("-created_at")
posts = list(posts)
post_ids = [p.id for p in posts]

# Fetch ALL comments for these posts in ONE query
comments = Comment.objects.filter(post_id__in=post_ids).select_related("author")

# Attach comments to their posts
comments_by_post = {}
for c in comments:
    comments_by_post.setdefault(c.post_id, []).append(c)

for p in posts:
    p._prefetched_comments = comments_by_post.get(p.id, [])
```

**Step 2:** In the serializer, we build the tree **in memory** (no additional queries):

```python
def get_comments(self, post):
    qs = getattr(post, "_prefetched_comments", None)
    if qs is None:
        qs = post.comments.select_related("author").all()

    # Build lookup table
    lookup = {}
    for c in qs:
        lookup[c.id] = c
        c.children_list = []

    # Build tree by linking children to parents
    roots = []
    for c in qs:
        if c.parent_id:
            parent = lookup.get(c.parent_id)
            if parent:
                parent.children_list.append(c)
            else:
                roots.append(c)  # Orphaned comment
        else:
            roots.append(c)  # Top-level comment

    return CommentTreeSerializer(roots, many=True).data
```

**Result:** Loading a post with 50 nested comments requires only **3 queries**:
1. Fetch posts
2. Fetch all comments for those posts
3. Fetch authors (via `select_related`)

---

## The Math: Leaderboard Calculation (Last 24 Hours)

### The Challenge

Calculate the top 5 users by karma earned in the **last 24 hours only**, where:
- 1 Post Like = 5 Karma
- 1 Comment Like = 1 Karma

**Constraint:** Do NOT store a `daily_karma` field on the User model. Calculate dynamically from the `Like` table.

### The Solution

We use **event-sourcing** from the `Like` table with Django ORM aggregation:

```python
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Sum, Case, When, IntegerField, F

def get(self, request):
    last_24h = now() - timedelta(hours=24)
    
    # Get all likes from the last 24 hours
    likes_qs = Like.objects.filter(created_at__gte=last_24h)
    
    # Annotate each like with:
    # 1. karma value (5 for post, 1 for comment)
    # 2. owner_id (the author who RECEIVED the like)
    # 3. owner_username
    leaderboard = (
        likes_qs.annotate(
            karma=Case(
                When(post__isnull=False, then=5),
                When(comment__isnull=False, then=1),
                output_field=IntegerField()
            ),
            owner_id=Case(
                When(post__isnull=False, then=F("post__author_id")),
                When(comment__isnull=False, then=F("comment__author_id"))
            ),
            owner_username=Case(
                When(post__isnull=False, then=F("post__author__username")),
                When(comment__isnull=False, then=F("comment__author__username"))
            )
        )
        .values("owner_id", "owner_username")
        .annotate(total_karma=Sum("karma"))
        .order_by("-total_karma")[:5]
    )
    
    return Response(list(leaderboard))
```

### SQL Generated (Approximate)

```sql
SELECT 
    CASE 
        WHEN post_id IS NOT NULL THEN post.author_id
        WHEN comment_id IS NOT NULL THEN comment.author_id
    END AS owner_id,
    CASE 
        WHEN post_id IS NOT NULL THEN user.username
        WHEN comment_id IS NOT NULL THEN user.username
    END AS owner_username,
    SUM(
        CASE 
            WHEN post_id IS NOT NULL THEN 5
            WHEN comment_id IS NOT NULL THEN 1
        END
    ) AS total_karma
FROM feed_like
LEFT JOIN feed_post ON feed_like.post_id = feed_post.id
LEFT JOIN feed_comment ON feed_like.comment_id = feed_comment.id
LEFT JOIN auth_user ON (post.author_id = auth_user.id OR comment.author_id = auth_user.id)
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY owner_id, owner_username
ORDER BY total_karma DESC
LIMIT 5;
```

**Why this approach?**
- ✅ Always accurate (no stale data)
- ✅ Handles time windows correctly
- ✅ No race conditions on karma updates
- ✅ Single query for the entire leaderboard

---

## The AI Audit: Where AI Failed and How I Fixed It

### The Bug: AI Suggested Storing `daily_karma` on User Model

**AI's Initial Approach:**

The AI (ChatGPT/Cursor) suggested adding a `daily_karma` field to the User model:

```python
# ❌ AI's WRONG suggestion
class User(AbstractUser):
    daily_karma = models.IntegerField(default=0)
    last_karma_reset = models.DateTimeField(auto_now_add=True)
```

And updating it on every like:

```python
# ❌ AI's WRONG approach
def like_post(request, post_id):
    like = Like.objects.create(user=request.user, post_id=post_id)
    post.author.daily_karma += 5  # Update karma
    post.author.save()
```

### Why This Is Wrong

1. **Race Conditions:** Two simultaneous likes could cause lost updates:
   ```
   Thread A: Read karma=10
   Thread B: Read karma=10
   Thread A: Write karma=15
   Thread B: Write karma=15  ❌ Should be 20!
   ```

2. **Time Window Issues:** How do you know when to reset `daily_karma`? 
   - Reset at midnight? What timezone?
   - What if a user earned karma at 11:59 PM yesterday? Should it count in "last 24 hours"?

3. **Data Integrity:** If the `save()` fails after creating the `Like`, karma is out of sync with reality.

4. **Inflexible:** What if we want "last 7 days" or "last hour"? We'd need multiple fields.

### The Fix: Event-Sourcing from Like Table

Instead of storing derived state, I **calculate karma dynamically** from the source of truth (the `Like` table):

```python
# ✅ CORRECT approach
def get_leaderboard(request):
    last_24h = now() - timedelta(hours=24)
    
    # Calculate karma from Like events
    leaderboard = (
        Like.objects
        .filter(created_at__gte=last_24h)  # Time window is precise
        .annotate(karma=Case(...))          # Calculate karma per like
        .values("owner_id", "owner_username")
        .annotate(total_karma=Sum("karma")) # Aggregate by user
        .order_by("-total_karma")[:5]
    )
    
    return Response(list(leaderboard))
```

**Benefits:**
- ✅ **No race conditions:** We're just reading data, not updating it
- ✅ **Precise time windows:** `created_at >= last_24h` is exact
- ✅ **Always correct:** Karma is calculated from the immutable event log
- ✅ **Flexible:** Change the time window to any value without schema changes

### Lesson Learned

AI tools are great for boilerplate, but they often suggest **naive solutions** for complex problems like:
- Concurrency control
- Time-based aggregations
- Data consistency

As an engineer, my job is to **recognize these patterns** and apply the right solution (event-sourcing, database constraints, atomic transactions) instead of blindly accepting AI suggestions.

