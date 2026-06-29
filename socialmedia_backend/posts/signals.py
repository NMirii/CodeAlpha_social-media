"""
Django signals — auto-create Notification records when users interact.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Like, Comment, Notification
from users.models import Follow


# ── Post liked ────────────────────────────────────────────────────────────────
@receiver(post_save, sender=Like)
def notify_post_liked(sender, instance, created, **kwargs):
    if not created:
        return
    if instance.post is None:
        return
    post = instance.post
    # Don't notify yourself
    if post.author == instance.user:
        return
    Notification.objects.get_or_create(
        recipient=post.author,
        sender=instance.user,
        notif_type='like_post',
        post=post,
        defaults={'is_read': False},
    )


# ── Post un-liked → remove notification ──────────────────────────────────────
@receiver(post_delete, sender=Like)
def remove_post_like_notification(sender, instance, **kwargs):
    if instance.post is None:
        return
    Notification.objects.filter(
        recipient=instance.post.author,
        sender=instance.user,
        notif_type='like_post',
        post=instance.post,
    ).delete()


# ── Comment added ─────────────────────────────────────────────────────────────
@receiver(post_save, sender=Comment)
def notify_comment(sender, instance, created, **kwargs):
    if not created:
        return
    post = instance.post
    # Don't notify yourself
    if post.author == instance.author:
        return
    Notification.objects.create(
        recipient=post.author,
        sender=instance.author,
        notif_type='comment',
        post=post,
        is_read=False,
    )


# ── Follow ────────────────────────────────────────────────────────────────────
@receiver(post_save, sender=Follow)
def notify_follow(sender, instance, created, **kwargs):
    if not created:
        return
    Notification.objects.get_or_create(
        recipient=instance.following,
        sender=instance.follower,
        notif_type='follow',
        defaults={'is_read': False},
    )


# ── Unfollow → remove notification ───────────────────────────────────────────
@receiver(post_delete, sender=Follow)
def remove_follow_notification(sender, instance, **kwargs):
    Notification.objects.filter(
        recipient=instance.following,
        sender=instance.follower,
        notif_type='follow',
    ).delete()
