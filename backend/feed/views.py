from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db import IntegrityError, transaction
from django.db.models import Count, Sum, Case, When, IntegerField, F
from django.utils.timezone import now
from datetime import timedelta

from .models import Post, Comment, Like
from .serializers import PostSerializer


class FeedView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        posts = (
            Post.objects
            .annotate(likes_count=Count("likes"))
            .select_related("author")
            .order_by("-created_at")
        )

        posts = list(posts)
        post_ids = [p.id for p in posts]

        comments = (
            Comment.objects
            .filter(post_id__in=post_ids)
            .select_related("author")
        )

        comments_by_post = {}
        for c in comments:
            comments_by_post.setdefault(c.post_id, []).append(c)

        for p in posts:
            p._prefetched_comments = comments_by_post.get(p.id, [])

        return Response(PostSerializer(posts, many=True).data)


class CreatePostView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        content = request.data.get("content", "").strip()
        if not content:
            return Response(
                {"error": "content required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        post = Post.objects.create(
            author=request.user,
            content=content
        )

        return Response(
            {"id": post.id, "content": post.content},
            status=status.HTTP_201_CREATED
        )


class CreateCommentView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, post_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if request.user.is_authenticated:
            user = request.user
        else:
            user, _ = User.objects.get_or_create(
                username='demo_user',
                defaults={'email': 'demo@example.com'}
            )
        
        content = request.data.get("content", "").strip()
        parent_id = request.data.get("parent_id")

        if not content:
            return Response(
                {"error": "content required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response(
                {"error": "post not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        parent = None
        if parent_id:
            try:
                parent = Comment.objects.get(id=parent_id, post=post)
            except Comment.DoesNotExist:
                return Response(
                    {"error": "parent not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        comment = Comment.objects.create(
            post=post,
            author=user,
            parent=parent,
            content=content
        )

        return Response(
            {"id": comment.id, "content": comment.content},
            status=status.HTTP_201_CREATED
        )


class LikePostView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, post_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if request.user.is_authenticated:
            user = request.user
        else:
            user, _ = User.objects.get_or_create(
                username='demo_user',
                defaults={'email': 'demo@example.com'}
            )
        
        try:
            with transaction.atomic():
                Like.objects.create(
                    user=user,
                    post_id=post_id
                )
            return Response({"liked": True})
        except IntegrityError:
            return Response(
                {"error": "already liked"},
                status=status.HTTP_400_BAD_REQUEST
            )


class LikeCommentView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, comment_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if request.user.is_authenticated:
            user = request.user
        else:
            user, _ = User.objects.get_or_create(
                username='demo_user',
                defaults={'email': 'demo@example.com'}
            )
        
        try:
            with transaction.atomic():
                Like.objects.create(
                    user=user,
                    comment_id=comment_id
                )
            return Response({"liked": True})
        except IntegrityError:
            return Response(
                {"error": "already liked"},
                status=status.HTTP_400_BAD_REQUEST
            )


class LeaderboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        last_24h = now() - timedelta(hours=24)

        likes_qs = Like.objects.filter(created_at__gte=last_24h)

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
