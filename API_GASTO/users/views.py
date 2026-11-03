from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is not None:
            return Response({"msg": "Login OK"}, status=status.HTTP_200_OK)
        
        return Response({"error": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
    
class RegisterView(APIView):
    permission_classes = []  # Permite acesso sem autenticação
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not isinstance(username, str) or not username.strip():
            return Response({"error": "Informe um usuário válido."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(password, str) or not password:
            return Response({"error": "A senha é obrigatória."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(password, user=User(username=username))
        except DjangoValidationError as error:
            return Response(
                {"error": "Senha inválida.", "detalhes": error.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response({"error": "Usuário já existe"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password)
        user.save()

        return Response({"msg": "Usuário criado com sucesso"}, status=status.HTTP_201_CREATED)
