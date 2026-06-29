from django.urls import path
from . import views

urlpatterns = [
    # Feed
    path('feed/', views.FeedView.as_view(), name='feed'),

    # Posts
    path('posts/', views.PublicFeedView.as_view(), name='posts-list'),
    path('posts/create/', views.PostCreateView.as_view(), name='post-create'),
    path('posts/<int:pk>/', views.PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:pk>/like/', views.like_post, name='post-like'),
    path('posts/<int:pk>/comments/', views.CommentListCreateView.as_view(), name='comment-list'),

    # Comments
    path('comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
    path('comments/<int:pk>/like/', views.like_comment, name='comment-like'),

    # User posts
    path('users/<str:username>/posts/', views.UserPostsView.as_view(), name='user-posts'),
]
