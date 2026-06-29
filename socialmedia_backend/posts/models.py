from django.db import models
from users.models import User


class Post(models.Model):
    """
    Represents a social media post created by a user.
    Supports text content and optional image attachments.
    """
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(max_length=2000)
    image = models.ImageField(upload_to='posts/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'posts'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.author.username}: {self.content[:50]}'

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def comments_count(self):
        return self.comments.count()


class Comment(models.Model):
    """
    Represents a comment on a Post. 
    Supports recursive nesting for threaded replies via the parent field.
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=500)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE,
        related_name='replies', null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'comments'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.author.username} on Post {self.post_id}'


class Like(models.Model):
    """A user can like a post or a comment (but not both at once)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE,
        related_name='likes', null=True, blank=True
    )
    comment = models.ForeignKey(
        Comment, on_delete=models.CASCADE,
        related_name='likes', null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'likes'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post'],
                condition=models.Q(post__isnull=False),
                name='unique_post_like'
            ),
            models.UniqueConstraint(
                fields=['user', 'comment'],
                condition=models.Q(comment__isnull=False),
                name='unique_comment_like'
            ),
        ]

    def __str__(self):
        target = f'Post {self.post_id}' if self.post else f'Comment {self.comment_id}'
        return f'{self.user.username} ♥ {target}'


class Notification(models.Model):
    """Notification sent to a user when someone likes/comments/follows."""
    NOTIF_TYPES = [
        ('like_post',    'Liked your post'),
        ('like_comment', 'Liked your comment'),
        ('comment',      'Commented on your post'),
        ('follow',       'Started following you'),
    ]

    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notifications'
    )
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_notifications'
    )
    notif_type = models.CharField(max_length=20, choices=NOTIF_TYPES)
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.sender.username} → {self.recipient.username}: {self.notif_type}'
