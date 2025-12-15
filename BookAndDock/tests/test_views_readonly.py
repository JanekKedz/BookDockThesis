from unittest.mock import patch
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model


class ReadOnlyViewsTests(TestCase):

    def setUp(self):
        self.client = Client()
        User = get_user_model()
        User.objects.create_user(username="user", password="pass123")
        self.client.login(username="user", password="pass123")

    @patch("BookAndDock.views.requests.get")
    def test_guide_detail_admin(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"title": "Test Guide"}

        url = reverse("guide_detail", kwargs={"guide_id": 1})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Test Guide")

    @patch("BookAndDock.views.requests.get")
    def test_dock_detail(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"name": "Dock X", "location": "Harbor"}

        url = reverse("dock_detail", kwargs={"dock_id": 1})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Dock X")

    @patch("BookAndDock.views.requests.get")
    def test_booking_detail(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"id": 5, "dockId": 1}

        url = reverse("booking_detail", kwargs={"booking_id": 5})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
