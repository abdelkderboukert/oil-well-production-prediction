from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WellViewSet, 
    WellProductionViewSet, 
    PredictView, 
    ForecastView, 
    AnalyzeView, 
    ExportDataView, 
    ImportDataView
)

# Initialize Router
router = DefaultRouter()

# Register ViewSets only
router.register(r'wells', WellViewSet, basename='well')
router.register(r'production', WellProductionViewSet, basename='production')

urlpatterns = [
    # Router-generated paths (standard CRUD)
    path('', include(router.urls)),
    
    # ML Inference Endpoints
    path('ml/predict/', PredictView.as_view(), name='predict'),
    path('ml/forecast/', ForecastView.as_view(), name='forecast'),
    path('ml/analyze/', AnalyzeView.as_view(), name='analyze'),
    
    # Data I/O Endpoints
    path('export/', ExportDataView.as_view(), name='export-csv'),
    path('import/', ImportDataView.as_view(), name='import-csv'),
]
