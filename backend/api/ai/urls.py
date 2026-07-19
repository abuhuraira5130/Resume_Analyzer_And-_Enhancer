from django.urls import path
from . import views

urlpatterns = [
    path('providers', views.get_providers, name='get_providers'),
    path('settings', views.get_user_settings, name='get_user_settings'),
    path('settings/save', views.save_user_settings, name='save_user_settings'),
    path('test-connection', views.test_connection, name='test_connection'),
    path('analyze', views.analyze_resume, name='analyze_resume'),
    path('optimization-questions', views.get_optimization_questions, name='get_optimization_questions'),
    path('optimize', views.optimize_resume, name='optimize_resume'),
    path('save-version', views.save_optimized_version, name='save_optimized_version'),
    path('validate-resume', views.validate_resume_integrity_view, name='validate_resume_integrity_view'),
    path('versions', views.get_resume_versions, name='get_resume_versions'),
    path('delete-version', views.delete_version, name='delete_version'),
]
