from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase


class RegisterViewTests(APITestCase):
    endpoint = '/api/register/'

    def test_registration_rejects_missing_or_empty_password(self):
        for password in ('', None):
            with self.subTest(password=password):
                response = self.client.post(
                    self.endpoint,
                    {'username': 'valid_user', 'password': password},
                    format='json',
                )
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertFalse(User.objects.filter(username='valid_user').exists())

    def test_registration_rejects_weak_password(self):
        response = self.client.post(
            self.endpoint,
            {'username': 'valid_user', 'password': 'password'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detalhes', response.data)
        self.assertFalse(User.objects.filter(username='valid_user').exists())

    def test_registration_creates_user_with_valid_password(self):
        password = 'a-long-unique-passphrase-4729'
        response = self.client.post(
            self.endpoint,
            {'username': 'valid_user', 'password': password},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='valid_user')
        self.assertTrue(user.check_password(password))

    @override_settings(CORS_ALLOWED_ORIGINS=['https://frontend.example'])
    def test_cors_preflight_allows_configured_frontend_origin(self):
        response = self.client.options(
            self.endpoint,
            HTTP_ORIGIN='https://frontend.example',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS='authorization,content-type',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response['Access-Control-Allow-Origin'],
            'https://frontend.example',
        )
