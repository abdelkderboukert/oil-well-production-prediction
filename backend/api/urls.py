from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import *


urlpatterns = [
    # path('categories/', CategoryListView.as_view()),
    # path('categories/<int:pk>/', CategoryDetailView.as_view()),
    # path('plant/', PlantListView.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)