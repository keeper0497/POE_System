from django.urls import path
from . import views

urlpatterns = [
    path('user-profile-create/', views.UserProfileCreateView.as_view(), name='api-create' ),
    path('user-profile-delete/', views.UserProfileDeleteView.as_view(), name='api-delete' ),
    path('user-profile-detail/', views.UserProfileDetailView.as_view(), name='api-detail' ),
    path('user-profile-update/', views.UserProfileUpdateView.as_view(), name='api-update' ),
    path('user/', views.CurrentUserView.as_view(), name='current-user'),
    path('users/', views.GetAllUsers.as_view(), name='api-get-all-users'),
    path('user/<int:user_id>/', views.GetUserDetails.as_view(), name='get-user-details'),
    path('notifications/', views.UserNotifications.as_view(), name='user-notifications'),
]
