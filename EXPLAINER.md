# EXPLAINER
## The Tree
Comments model uses an adjacency-list. The feed view fetches all comments for visible posts in one query, attaches them to posts, and the serializer builds an in-memory tree. This avoids N+1 queries.

## Leaderboard Query (last 24 hours)
We derive karma from Like events. Post like = 5, Comment like = 1. The ORM query in the view annotates each Like with `karma` and `owner` (post.author or comment.author), groups by owner, and sums karma for the last 24 hours.

## AI Audit
The AI initially suggested storing daily_karma on the User model. That approach was rejected because it is error-prone under concurrency and time-window queries. We use event-sourcing (Like table) and runtime aggregation for correctness.
