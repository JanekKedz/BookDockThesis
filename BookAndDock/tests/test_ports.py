from unittest.mock import patch
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.test import tag

@tag("unit")
class DockAdminTests(TestCase):

    def setUp(self):
        self.client = Client()
        User = get_user_model()
        User.objects.create_user(username="admin", password="pass123")
        self.client.login(username="admin", password="pass123")

        session = self.client.session
        session["role"] = "ADMIN"
        session.save()

    @patch("BookAndDock.views.requests.get")
    def test_view_docks(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"id": 1, "name": "Dock A", "approved": True},
            {"id": 2, "name": "Dock B", "approved": False},
        ]

        url = reverse("docks")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Dock A")

    @patch("BookAndDock.views.requests.get")
    @patch("BookAndDock.views.requests.put")
    def test_accept_dock(self, mock_put, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"id": 1, "name": "Dock A", "is_approved": False}
        mock_put.return_value.status_code = 200

        url = reverse("accept_dock", kwargs={"dock_id": 1})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 302)
        mock_put.assert_called_once()

    @patch("BookAndDock.views.requests.delete")
    def test_delete_dock(self, mock_delete):
        mock_delete.return_value.status_code = 200

        url = reverse("delete_dock", kwargs={"dock_id": 1})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 302)
        mock_delete.assert_called_once()
