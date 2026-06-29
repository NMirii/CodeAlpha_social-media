from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import User, Follow
from .serializers import (
    UserSerializer, UserMiniSerializer, RegisterSerializer, LoginSerializer, FollowSerializer
)


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — Create a new user account."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user, context={'request': request}).data,
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """POST /api/auth/login/ — Authenticate and return token."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': UserSerializer(user, context={'request': request}).data,
    })


@api_view(['POST'])
def logout_view(request):
    """POST /api/auth/logout/ — Delete auth token."""
    request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully.'})


@api_view(['GET'])
def me_view(request):
    """GET /api/auth/me/ — Return current user profile."""
    serializer = UserSerializer(request.user, context={'request': request})
    return Response(serializer.data)


class UserDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/<username>/ — View or update a profile."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'username'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        # Only allow users to edit their own profile
        instance = self.get_object()
        if instance != request.user:
            return Response(
                {'error': 'You can only edit your own profile.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)


@api_view(['POST', 'DELETE'])
def follow_view(request, username):
    """
    POST   /api/users/<username>/follow/ — Follow a user.
    DELETE /api/users/<username>/follow/ — Unfollow a user.
    """
    target_user = get_object_or_404(User, username=username)

    if target_user == request.user:
        return Response(
            {'error': 'You cannot follow yourself.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if request.method == 'POST':
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=target_user
        )
        if not created:
            return Response({'error': 'Already following.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': f'Now following {username}.'}, status=status.HTTP_201_CREATED)

    elif request.method == 'DELETE':
        deleted, _ = Follow.objects.filter(
            follower=request.user, following=target_user
        ).delete()
        if not deleted:
            return Response({'error': 'Not following this user.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': f'Unfollowed {username}.'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def followers_list(request, username):
    """GET /api/users/<username>/followers/ — List followers."""
    user = get_object_or_404(User, username=username)
    follows = Follow.objects.filter(following=user).select_related('follower')
    serializer = FollowSerializer(follows, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def following_list(request, username):
    """GET /api/users/<username>/following/ — List accounts user follows."""
    user = get_object_or_404(User, username=username)
    follows = Follow.objects.filter(follower=user).select_related('following')
    serializer = FollowSerializer(follows, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_users(request):
    """GET /api/users/search/?q=<query> — Search users by username or name."""
    q = request.query_params.get('q', '').strip()
    if not q:
        return Response([])
    users = User.objects.filter(
        Q(username__icontains=q) |
        Q(first_name__icontains=q) |
        Q(last_name__icontains=q)
    )[:20]
    serializer = UserMiniSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)
