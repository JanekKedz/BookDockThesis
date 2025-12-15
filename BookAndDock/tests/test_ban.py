from unittest.mock import patch
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model

class BanUserTests(TestCase):
    def setUp(self):
        self.client = Client()
        User = get_user_model()
        User.objects.create_user(username="admin", password="pass123")
        self.client.login(username="admin", password="pass123")

        s = self.client.session
        s["role"] = "ADMIN"
        s.save()

    @patch("BookAndDock.views.requests.delete")
    def test_ban_user_success_redirects(self, mock_delete):
        mock_delete.return_value.status_code = 200
        mock_delete.return_value.text = "true"

        url = reverse("ban_user", kwargs={"user_email": "user@test.com"})
        response = self.client.get(url)  # your view expects GET, not POST

        self.assertEqual(response.status_code, 302)
        mock_delete.assert_called_once()

    @patch("BookAndDock.views.requests.delete")
    def test_ban_user_backend_returns_false(self, mock_delete):
        mock_delete.return_value.status_code = 200
        mock_delete.return_value.text = "false"

        url = reverse("ban_user", kwargs={"user_email": "user@test.com"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 400)
        self.assertIn("could not be banned", response.content.decode().lower())

    @patch("BookAndDock.views.requests.delete")
    def test_ban_user_backend_fail_status(self, mock_delete):
        mock_delete.return_value.status_code = 500
        mock_delete.return_value.text = "error"

        url = reverse("ban_user", kwargs={"user_email": "user@test.com"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 500)

    @patch("BookAndDock.views.requests.delete")
    def test_ban_user_request_exception(self, mock_delete):
        import requests
        mock_delete.side_effect = requests.exceptions.RequestException("boom")

        url = reverse("ban_user", kwargs={"user_email": "user@test.com"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 500)
        self.assertIn("error banning user", response.content.decode().lower())
