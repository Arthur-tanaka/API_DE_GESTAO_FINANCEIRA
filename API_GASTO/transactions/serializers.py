from rest_framework import serializers
from .models import Transaction, Category
from datetime import date


class TransactionSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(min_length=3, error_messages={
        'min_length': 'O nome deve ter pelo menos 3 caracteres.',
        'blank': 'O nome não pode estar vazio.'
    })
    valor = serializers.DecimalField(min_value=1, max_digits=15, decimal_places=2, error_messages={
        'min_value': 'O valor deve ser maior que zero',
        'invalid': 'Informe um número válido'
    })
    data = serializers.DateField(
        error_messages={
            'invalid': 'Data invalida, use o formato correto: DIA / MÊS / ANO',
            'required': 'A data é obrigatória'
    })
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), error_messages={
        'invalid': 'Categoria inválida',
        'required': 'A categoria é obrigatória',
        'does_not_exist': 'Categoria não encontrada para o usuário atual'
    })
    def validate_category(self, value):
        user = self.context['request'].user
        if not Category.objects.filter(id=value.id, user=user).exists():
            raise serializers.ValidationError('Categoria inválida para o usuário atual.')
        return value
    
    
    def validate_data(self, value):
        if value > date.today():
            raise serializers.ValidationError('A data não pode ser futura.')
        return value
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['user']
        
class CategorySerializer(serializers.ModelSerializer):
    nome = serializers.CharField(min_length=3, error_messages={
        'min_length': 'O nome deve ter pelo menos 3 caracteres.',
        'blank': 'O nome não pode estar vazio.'
    })
    class Meta:
        model = Category
        read_only_fields = ['user']
        fields = '__all__'
