from django.test import TestCase
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Transaction

class TransactionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)
        
    #Teste de (C) criação de transação
    def test_create_transaction(self):
        data = {
            'nome': 'Test Transaction',
            'valor': 100.00,
            'data': '2024-01-01',
            'tipo': 'entrada'
        }
        response = self.client.post('/api/transactions/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['user'], self.user.id)
        self.assertEqual(response.data['nome'], 'Test Transaction')
        self.assertEqual(response.data['valor'], '100.00')
        self.assertEqual(response.data['data'], '2024-01-01')
        self.assertEqual(response.data['tipo'], 'entrada')
        
    #Teste de (R) leitura de transação
    def test_read_transaction(self):
        Transaction.objects.create(user=self.user, nome='Test Transaction', valor=100.00, data='2024-01-01', tipo='entrada')
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
        
    #Teste de (U) atualização de transação
    def test_update_transaction(self):
        transaction = Transaction.objects.create(user=self.user, nome='Test Transaction', valor=100.00, data='2024-01-01', tipo='entrada')
        data = {
            'nome': 'Updated Transaction',
            'valor': 150.00,
            'data': '2024-01-02',
            'tipo': 'saida'
        }
        response = self.client.put(f'/api/transactions/{transaction.id}/', data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['nome'], 'Updated Transaction')
        self.assertEqual(response.data['valor'], '150.00')
        self.assertEqual(response.data['data'], '2024-01-02')
        self.assertEqual(response.data['tipo'], 'saida')
    
    #Teste de (D) exclusão de transação
    def test_delete_transaction(self):
        transaction = Transaction.objects.create(user=self.user, nome='Test Transaction', valor=100.00, data='2024-01-01', tipo='entrada')
        response = self.client.delete(f'/api/transactions/{transaction.id}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Transaction.objects.filter(id=transaction.id).exists())
        
    #Teste usuario não autenticado
    def test_usuario_nao_autenticado(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, 401)
        
    #Teste usuario A não pode acessar transações do usuario B
    def test_usuario_a_nao_pode_acessar_transacoes_usuario_b(self):
        user_b = User.objects.create_user(username='userb', password='testpass')
        Transaction.objects.create(user=user_b, nome='User B Transaction', valor=50.00, data='2024-01-01', tipo='entrada')
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 0)
        
    def test_nao_pode_criar_transacao_com_data_futura(self):
        data = {
            'nome': 'Future Transaction',
            'valor': 100.00,
            'data': '2028-05-08',
            'tipo': 'entrada',
        }
        response = self.client.post('/api/transactions/', data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data'][0], 'A data não pode ser futura.')

class DashboardTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)
        
    #Teste de dashboard resumo mensal
    def test_dashboard_resumo_mensal(self):
        Transaction.objects.create(user=self.user, nome='Entrada 1', valor=100.00, data='2024-01-01', tipo='entrada')
        Transaction.objects.create(user=self.user, nome='Saida 1', valor=50.00, data='2024-01-02', tipo='saida')
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_entradas'], float('100.0'))
        self.assertEqual(response.data['total_saidas'], float('50.0'))
        self.assertEqual(response.data['saldo'], float('50.0'))