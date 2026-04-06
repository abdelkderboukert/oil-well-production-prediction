from django.shortcuts import render
<<<<<<< HEAD

# Create your views here.
=======
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from django.db.models import F,Q
from datetime import date
from rest_framework import viewsets, filters
import os
from django.http import HttpResponse
from datetime import datetime
from django.db.models import F
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *

class CategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        data = []
        for category in categories:
            plants = Plant.objects.filter(category=category)
            category_serializer = CategorySerializer(category)
            plants_serializer = PlantSerializer(plants, many=True)
            data.append({
                'category': category_serializer.data,
                'plants': plants_serializer.data
            })
        return Response(data)
>>>>>>> development
