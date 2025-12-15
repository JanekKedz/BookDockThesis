from unittest.mock import patch
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model


class GuideAdminTests(TestCase):

    def setUp(self):
        self.client = Client()
        User = get_user_model()
        User.objects.create_user(username="admin", password="pass123")
        self.client.login(username="admin", password="pass123")

        session = self.client.session
        session["role"] = "ADMIN"
        session.save()

    @patch("BookAndDock.views.requests.get")
    def test_manage_guides_view(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"id": 1, "title": "Guide A", "guideStatus": "PUBLISHED", "guideCategory": "GUIDE"},
            {"id": 2, "title": "Guide B", "guideStatus": "TO_BE_ACCEPTED", "guideCategory": "GUIDE"},
        ]

        url = reverse("manage_guides")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Guide A")

    @patch("BookAndDock.views.requests.put")
    def test_accept_guide_success(self, mock_put):
        mock_put.return_value.status_code = 200

        url = reverse("accept_guide", kwargs={"guide_id": 1})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 302)  # redirect
        mock_put.assert_called_once()

    @patch("BookAndDock.views.requests.delete")
    def test_delete_guide_success(self, mock_delete):
        mock_delete.return_value.status_code = 200

        url = reverse("delete_guide", kwargs={"guide_id": 1})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 302)
        mock_delete.assert_called_once()
