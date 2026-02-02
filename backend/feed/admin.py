from django.contrib import admin
from .models import Post, Comment, Like

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id','author','created_at')
    search_fields = ('author__username','content')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id','author','post','parent','created_at')
    search_fields = ('author__username','content')

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('id','user','post','comment','created_at')
    search_fields = ('user__username',)
