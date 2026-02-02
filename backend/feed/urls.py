from django.urls import path
from .views import (
    FeedView,
    CreatePostView,
    CreateCommentView,
    LikePostView,
    LikeCommentView,
    LeaderboardView,
)

urlpatterns = [
    path("feed/", FeedView.as_view(), name="feed"),
    path("posts/", CreatePostView.as_view(), name="create-post"),
    path("posts/<int:post_id>/comments/", CreateCommentView.as_view(), name="create-comment"),
    path("like/post/<int:post_id>/", LikePostView.as_view(), name="like-post"),
    path("like/comment/<int:comment_id>/", LikeCommentView.as_view(), name="like-comment"),
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
]
