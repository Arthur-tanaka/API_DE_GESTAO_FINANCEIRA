from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from .serializers import TransactionSerializer, CategorySerializer
from django.db.models import Sum
from .permissions import IsOwnerOnly
from .models import Transaction, Category


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    permission_classes = [IsAuthenticated, IsOwnerOnly]
    filter_backends = [SearchFilter]
    search_fields = ['nome']
    
    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        tipo = self.request.query_params.get('tipo')
        data = self.request.query_params.get('data')
        data_inicio = self.request.query_params.get('data_inicio')
        data_fim = self.request.query_params.get('data_fim')
    
        if tipo:
            queryset = queryset.filter(tipo=tipo)
            
        if data:
            queryset = queryset.filter(data=data)
            
        if  data_inicio and data_fim:
            queryset = queryset.filter(data__range=[data_inicio, data_fim])
    
        return queryset  
    
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        queryset = Transaction.objects.filter(user=request.user)
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        # Dashboard: calcula entradas, saídas e saldo, com filtro opcional por período
        if data_inicio and data_fim:
            queryset = queryset.filter(data__range=[data_inicio, data_fim])
            
        entradas = queryset.filter(tipo='entrada')
        saidas = queryset.filter(tipo='saida')
        total_entradas = entradas.aggregate(Sum('valor'))['valor__sum'] or 0
        total_saidas = saidas.aggregate(Sum('valor'))['valor__sum'] or 0
        saldo_total = total_entradas - total_saidas
        
        return Response({
            'total_entradas': total_entradas,
            'total_saidas': total_saidas,
            'saldo': saldo_total
        })
        
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    permission_classes = [IsAuthenticated, IsOwnerOnly]