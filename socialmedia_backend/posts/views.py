from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Post, Comment, Like, Notification
from .serializers import PostSerializer, PostCreateSerializer, CommentSerializer, NotificationSerializer
from users.models import Follow


class FeedView(generics.ListAPIView):
    """GET /api/feed/ — Posts from users you follow + your own."""
    serializer_class = PostSerializer

    def get_queryset(self):
        user = self.request.user
        following_ids = Follow.objects.filter(
            follower=user
        ).values_list('following_id', flat=True)
        return Post.objects.filter(
            author_id__in=[*following_ids, user.id]
        ).select_related('author').prefetch_related('likes', 'comments__author', 'comments__likes')


class PublicFeedView(generics.ListAPIView):
    """GET /api/posts/ — All posts (public, no auth needed)."""
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Post.objects.all().select_related('author').prefetch_related('likes', 'comments__author')


class PostCreateView(generics.CreateAPIView):
    """POST /api/posts/create/ — Create a new post."""
    serializer_class = PostCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user)
        return Response(
            PostSerializer(post, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/posts/<id>/"""
    queryset = Post.objects.all().select_related('author').prefetch_related('likes', 'comments__author')
    serializer_class = PostSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != request.user:
            return Response({'error': 'Not your post.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != request.user:
            return Response({'error': 'Not your post.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class UserPostsView(generics.ListAPIView):
    """GET /api/users/<username>/posts/ — All posts by a user."""
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Post.objects.filter(
            author__username=self.kwargs['username']
        ).select_related('author').prefetch_related('likes', 'comments')


@api_view(['POST', 'DELETE'])
def like_post(request, pk):
    """POST/DELETE /api/posts/<id>/like/ — Like or unlike a post."""
    post = get_object_or_404(Post, pk=pk)

    if request.method == 'POST':
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            return Response({'error': 'Already liked.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Post liked.', 'likes_count': post.likes_count})

    elif request.method == 'DELETE':
        deleted, _ = Like.objects.filter(user=request.user, post=post).delete()
        if not deleted:
            return Response({'error': 'Not liked.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Post unliked.', 'likes_count': post.likes_count})


class CommentListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/posts/<pk>/comments/"""
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Comment.objects.filter(
            post_id=self.kwargs['pk'], parent=None
        ).select_related('author').prefetch_related('replies__author', 'likes')

    def perform_create(self, serializer):
        post = get_object_or_404(Post, pk=self.kwargs['pk'])
        serializer.save(author=self.request.user, post=post)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/comments/<id>/"""
    queryset = Comment.objects.all().select_related('author')
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.author != request.user:
            return Response({'error': 'Not your comment.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.author != request.user:
            return Response({'error': 'Not your comment.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


@api_view(['POST', 'DELETE'])
def like_comment(request, pk):
    """POST/DELETE /api/comments/<id>/like/ — Like or unlike a comment."""
    comment = get_object_or_404(Comment, pk=pk)

    if request.method == 'POST':
        like, created = Like.objects.get_or_create(user=request.user, comment=comment)
        if not created:
            return Response({'error': 'Already liked.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Comment liked.', 'likes_count': comment.likes.count()})

    elif request.method == 'DELETE':
        deleted, _ = Like.objects.filter(user=request.user, comment=comment).delete()
        if not deleted:
            return Response({'error': 'Not liked.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Comment unliked.', 'likes_count': comment.likes.count()})


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/ — Return current user's notifications."""
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related('sender', 'post').order_by('-created_at')[:50]


@api_view(['POST'])
def mark_notifications_read(request):
    """POST /api/notifications/read/ — Mark all notifications as read."""
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read.'})


@api_view(['GET'])
def notification_count(request):
    """GET /api/notifications/count/ — Unread notification count."""
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({'unread_count': count})
