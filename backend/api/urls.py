from django.urls import path, include

from . import views

urlpatterns = [
    path('health/', views.health_check),
    path('resumes/delete/', views.delete_resume),
    path('resumes/set-primary/', views.set_primary_resume),
    path('ai/', include('api.ai.urls')),
]