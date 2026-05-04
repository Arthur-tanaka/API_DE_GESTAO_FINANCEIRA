from django.urls import path
from rest_framework import routers
from .views import TransactionViewSet, DashboardView, CategoryViewSet

router = routers.DefaultRouter()
router.register('transactions', TransactionViewSet)
router.register('categories', CategoryViewSet)

urlpatterns = [
    path('dashboard/', DashboardView.as_view()),
] + router.urls
