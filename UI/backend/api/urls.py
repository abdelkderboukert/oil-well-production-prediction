from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WellViewSet, 
    WellProductionViewSet, 
    PredictView, 
    ForecastView, 
    AnalyzeView, 
    ExportDataView, 
    ImportDataView,
    BulkWellCreateView,
    reload_model_webhook
)

# Initialize Router
router = DefaultRouter()

# Register ViewSets only
router.register(r'wells', WellViewSet, basename='well')
urlpatterns = [
    # Custom Non-CRUD Well Endpoint MUST be above router to prevent PK interception
    path('wells/bulk-create/', BulkWellCreateView.as_view(), name='bulk-well-create'),

    # Router-generated paths (standard CRUD)
    path('', include(router.urls)),
    
    # ML Inference Endpoints
    path('ml/predict/', PredictView.as_view(), name='predict'),
    path('ml/forecast/', ForecastView.as_view(), name='forecast'),
    path('ml/analyze/', AnalyzeView.as_view(), name='analyze'),
    
    # Data I/O Endpoints
    path('export/', ExportDataView.as_view(), name='export-csv'),
    path('import/', ImportDataView.as_view(), name='import-csv'),
    path('webhooks/reload-models/', reload_model_webhook, name='ml_reload_webhook'),
    
]