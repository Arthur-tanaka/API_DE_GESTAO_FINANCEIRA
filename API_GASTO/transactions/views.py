from rest_framework import viewsets
from transactions.models import Transaction
from .serializers import TransactionSerializer
from django.db.models import Sum
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .permissions import IsOwnerOnly
from .models import Transaction
from rest_framework.views import APIView

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        queryset = Transaction.objects.all()
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
    
@api_view
def saldo(request):
    entradas = Transaction.objects.filter(tipo='entrada')
    saidas = Transaction.objects.filter(tipo='saida')
        
    data_inicio = request.query_params.get('data_inicio')
    data_fim = request.query_params.get('data_fim')
        
    if data_inicio and data_fim:
        entradas = entradas.filter(data__range=[data_inicio, data_fim])
        saidas = saidas.filter(data__range=[data_inicio, data_fim])
            
        total_entradas = entradas.aggregate(Sum('valor'))['valor__sum'] or 0
        total_saidas = saidas.aggregate(Sum('valor'))['valor__sum'] or 0

        saldo_total = total_entradas - total_saidas 
        
    return Response({
        'total_entradas': total_entradas,
        'total_saidas': total_saidas,
        'saldo': saldo_total
    })

@api_view(['GET'])
def saldo(request):
    Transaction.objects.all()
    entradas = Transaction.objects.filter(tipo='entrada')
    saidas = Transaction.objects.filter(tipo='saida')
    
    total_entradas = entradas.aggregate(Sum('valor'))['valor__sum'] or 0
    total_saidas = saidas.aggregate(Sum('valor'))['valor__sum'] or 0
    saldo_total = total_entradas - total_saidas
    
    return Response({
        'total_entradas': total_entradas,
        'total_saidas': total_saidas,
        'saldo': saldo_total
    })
    

class TransactionViewSet(ModelViewSet):
    queryset = Transaction.objects.all()
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, IsOwnerOnly]
    
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        queryset = Transaction.objects.filter(user=request.user)
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