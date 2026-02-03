from rest_framework import serializers
from .models import Post, Comment
from django.contrib.auth.models import User


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")


class CommentTreeSerializer(serializers.ModelSerializer):
    author = SimpleUserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            "id",
            "author",
            "content",
            "created_at",
            "replies",
        )

    def get_replies(self, obj):
        children = getattr(obj, "children_list", [])
        return CommentTreeSerializer(children, many=True).data


class PostSerializer(serializers.ModelSerializer):
    author = SimpleUserSerializer(read_only=True)
    comments = serializers.SerializerMethodField()

    likes = serializers.IntegerField(
        source="likes_count",
        read_only=True
    )

    class Meta:
        model = Post
        fields = (
            "id",
            "author",
            "content",
            "created_at",
            "likes",
            "comments",
        )

    def get_comments(self, post):
        qs = getattr(post, "_prefetched_comments", None)
        if qs is None:
            qs = post.comments.select_related("author").all()

        lookup = {}
        for c in qs:
            lookup[c.id] = c
            c.children_list = []

        roots = []
        for c in qs:
            if c.parent_id:
                parent = lookup.get(c.parent_id)
                if parent:
                    parent.children_list.append(c)
                else:
                    roots.append(c)
            else:
                roots.append(c)

        return CommentTreeSerializer(roots, many=True).data
