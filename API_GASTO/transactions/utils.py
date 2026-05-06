from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        mensagens = {
            400: 'Requisição inválida',
            401: 'Não autorizado',
            403: 'Proibido',
            404: 'Não encontrado',
            405: 'Método não permitido',
            500: 'Erro interno do servidor',
        }
        response.data = {
            'status': response.status_code,
            'detalhes': response.data,
            'mensagem': mensagens.get(response.status_code, 'Erro inesperado')
        }
    return response