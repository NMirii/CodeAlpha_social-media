from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.me_view, name='me'),

    # Profiles
    path('users/search/', views.search_users, name='user-search'),
    path('users/<str:username>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<str:username>/follow/', views.follow_view, name='follow'),
    path('users/<str:username>/followers/', views.followers_list, name='followers'),
    path('users/<str:username>/following/', views.following_list, name='following'),
]
