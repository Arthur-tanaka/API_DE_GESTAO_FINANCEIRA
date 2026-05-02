from django.urls import path
from rest_framework import routers
from .views import TransactionViewSet, saldo, DashboardView

router = routers.DefaultRouter()
router.register('transactions', TransactionViewSet)

urlpatterns = [
    path('saldo/', saldo),
    path('dashboard/', DashboardView.as_view()),
] + router.urls
