from django.test import TestCase
from django.contrib.auth.models import User
from django.utils.timezone import now
from datetime import timedelta
from .models import Post, Comment, Like

class LeaderboardTest(TestCase):
    def setUp(self):
        self.u1 = User.objects.create_user('u1','u1@example.com','pw')
        self.u2 = User.objects.create_user('u2','u2@example.com','pw')
        self.u3 = User.objects.create_user('u3','u3@example.com','pw')
        self.p1 = Post.objects.create(author=self.u1, content='p1')
        self.c1 = Comment.objects.create(post=self.p1, author=self.u3, content='c1')
        Like.objects.create(user=self.u2, post=self.p1)   # +5 to u1
        Like.objects.create(user=self.u3, post=self.p1)   # +5 to u1
        Like.objects.create(user=self.u1, comment=self.c1) # +1 to u3
    def test_leaderboard(self):
        last_24h = now() - timedelta(hours=24)
        qs = Like.objects.filter(created_at__gte=last_24h)
        from django.db.models import Sum, Case, When, IntegerField, F
        res = qs.annotate(
            karma=Case(When(post__isnull=False, then=5), When(comment__isnull=False, then=1), output_field=IntegerField()),
            owner_id=Case(When(post__isnull=False, then=F('post__author_id')), When(comment__isnull=False, then=F('comment__author_id')))
        ).values('owner_id').annotate(total_karma=Sum('karma')).order_by('-total_karma')
        self.assertEqual(res[0]['total_karma'], 10)
        self.assertEqual(res[1]['total_karma'], 1)
