from django.test import TestCase, Client, override_settings, tag
from django.urls import reverse
from django.contrib.auth import get_user_model
from BookAndDock.tests.integration_backend.utils_integration import require_backend
import requests


@tag("integration")
@override_settings(BACKEND_API_BASE="http://localhost:5000")
class ReadOnlyViewsIntegrationTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        require_backend(cls)

        User = get_user_model()
        User.objects.create_user(username="user", password="pass123")
        cls.username = "user"
        cls.password = "pass123"

    def setUp(self):
        self.client = Client()
        self.client.login(username=self.username, password=self.password)

        # If your views require role in session even for read-only pages, set it:
        s = self.client.session
        s["role"] = "ADMIN"  # safest for read-only pages that might be restricted
        s.save()

    def _get_first_id_from_backend(self, url):
        try:
            r = requests.get(url, timeout=5)
            r.raise_for_status()
            data = r.json()
            if isinstance(data, list) and len(data) > 0 and "id" in data[0]:
                return data[0]["id"]
            return None
        except Exception:
            return None

    def test_guide_detail_page_does_not_500(self):
        # 1) discover a real guide id from backend
        base = "http://localhost:5000"
        guide_id = self._get_first_id_from_backend(f"{base}/guides")

        if guide_id is None:
            self.skipTest("No guides available in real backend (or /guides not returning list with id).")

        # 2) open Django detail page for that id
        url = reverse("guide_detail", kwargs={"guide_id": guide_id})
        response = self.client.get(url)

        self.assertNotEqual(response.status_code, 500)

    def test_dock_detail_page_does_not_500(self):
        # 1) discover a real port id from backend
        base = "http://localhost:5000"
        dock_id = self._get_first_id_from_backend(f"{base}/ports")

        if dock_id is None:
            self.skipTest("No ports available in real backend (or /ports not returning list with id).")

        # 2) open Django detail page for that id
        url = reverse("dock_detail", kwargs={"dock_id": dock_id})
        response = self.client.get(url)

        self.assertNotEqual(response.status_code, 500)
