from rest_framework import serializers
from .models import Transaction


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
        }
    )
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['user']